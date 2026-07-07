import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getPluginBySlug } from '@/content/plugins'

export const runtime = 'nodejs'

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  })
  const data = (await res.json()) as { success?: boolean }
  return data.success === true
}

function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM?.trim() || user
  return Boolean(user && pass && from)
}

function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}

function errorResponse(code: string, status: number, message?: string) {
  const body: { error: string; message?: string } = { error: code }
  if (isDev() && message) body.message = message
  return NextResponse.json(body, { status })
}

type SmtpError = Error & { code?: string; responseCode?: number }

function classifyError(error: unknown): { code: string; status: number; message: string } {
  const err = error as SmtpError
  const message = err instanceof Error ? err.message : 'Unknown error'
  if (message === 'SMTP not configured') {
    return { code: 'not_configured', status: 503, message }
  }
  if (message.startsWith('Telegram')) {
    return { code: 'telegram_failed', status: 502, message }
  }

  const isSmtpError =
    message.includes('SMTP') ||
    message.includes('EAUTH') ||
    message.includes('ECONN') ||
    err.code === 'EAUTH' ||
    err.code === 'ECONNECTION' ||
    err.code === 'EMESSAGE' ||
    err.code === 'ESOCKET' ||
    (err.responseCode !== undefined && err.responseCode >= 400)

  if (isSmtpError) {
    return { code: 'smtp_failed', status: 502, message }
  }

  return { code: 'server', status: 500, message }
}

async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })

  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed: ${await res.text()}`)
  }
}

async function sendEmail(subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST || 'smtp.zoho.com'
  const port = Number(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM?.trim() || user
  const to = process.env.SMTP_TO || 'admin@nordlab.pro'

  if (!user || !pass || !from) throw new Error('SMTP not configured')

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' },
  })

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  })
}

function normalizeLicenseType(value: string): string {
  switch (value) {
    case 'team':
      return 'Team license'
    case 'enterprise':
      return 'Enterprise / bureau-wide'
    case 'edu':
      return 'Education / trial'
    default:
      return 'Single seat'
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(getClientIp(request))) {
      return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
    }

    const formData = await request.formData()

    const honeypot = formData.get('website')?.toString() ?? ''
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    const pluginSlug = formData.get('pluginSlug')?.toString().trim() ?? ''
    const name = formData.get('name')?.toString().trim() ?? ''
    const contact = formData.get('contact')?.toString().trim() ?? ''
    const company = formData.get('company')?.toString().trim() ?? ''
    const licenseType = formData.get('licenseType')?.toString().trim() ?? 'single'
    const seatsRaw = formData.get('seats')?.toString().trim() ?? '1'
    const notes = formData.get('notes')?.toString().trim() ?? ''
    const turnstileToken = formData.get('cf-turnstile-response')?.toString()

    const seats = Number(seatsRaw)
    const plugin = getPluginBySlug(pluginSlug)

    if (!plugin || !name || !contact || !Number.isFinite(seats) || seats < 1) {
      return NextResponse.json({ error: 'validation' }, { status: 400 })
    }

    const smtpReady = isSmtpConfigured()
    const telegramReady = isTelegramConfigured()
    if (!smtpReady && !telegramReady) {
      return errorResponse(
        'not_configured',
        503,
        'No delivery channel configured. Set SMTP_USER/SMTP_PASS or TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID in .env',
      )
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      if (!turnstileToken || !(await verifyTurnstile(turnstileToken, turnstileSecret))) {
        return NextResponse.json({ error: 'turnstile' }, { status: 400 })
      }
    }

    const pluginName = plugin.name.en
    const deliveryType = plugin.download ? 'Free download / assistance request' : 'Manual purchase inquiry'
    const normalizedLicenseType = normalizeLicenseType(licenseType)

    const telegramText = [
      '<b>New plugin order inquiry</b>',
      '',
      `<b>Plugin:</b> ${escapeHtml(pluginName)}`,
      `<b>Delivery:</b> ${escapeHtml(deliveryType)}`,
      `<b>License:</b> ${escapeHtml(normalizedLicenseType)}`,
      `<b>Seats:</b> ${escapeHtml(String(seats))}`,
      `<b>Name:</b> ${escapeHtml(name)}`,
      `<b>Contact:</b> ${escapeHtml(contact)}`,
      company ? `<b>Company:</b> ${escapeHtml(company)}` : '',
      notes ? `<b>Notes:</b>\n${escapeHtml(notes)}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const emailText = [
      'New plugin order inquiry',
      '',
      `Plugin: ${pluginName}`,
      `Delivery: ${deliveryType}`,
      `License: ${normalizedLicenseType}`,
      `Seats: ${seats}`,
      `Name: ${name}`,
      `Contact: ${contact}`,
      company ? `Company: ${company}` : '',
      notes ? '' : '',
      notes ? 'Notes:' : '',
      notes || '',
    ]
      .filter(Boolean)
      .join('\n')

    if (telegramReady) {
      await sendTelegramMessage(telegramText)
    }

    if (smtpReady) {
      await sendEmail(`Nordlab - Plugin order inquiry - ${pluginName}`, emailText)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const { code, status, message } = classifyError(error)
    console.error('Plugin order error:', message, error)
    return errorResponse(code, status, message)
  }
}
