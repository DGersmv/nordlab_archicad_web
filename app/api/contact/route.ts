import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp']
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
])

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

function isAllowedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && ALLOWED_EXTENSIONS.includes(ext)) return true
  return file.type ? ALLOWED_MIME_TYPES.has(file.type) : false
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
  // Zoho only allows relay from the authenticated mailbox or verified aliases.
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

type SmtpError = Error & { code?: string; responseCode?: number; response?: string }

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
    let hint = message
    if (
      err.responseCode === 553 ||
      message.includes('relay') ||
      message.includes('Sender is not allowed')
    ) {
      hint =
        'SMTP_FROM must be an authorized Zoho mailbox (use SMTP_USER or a verified alias). Remove SMTP_FROM to default to SMTP_USER.'
    } else if (err.code === 'EAUTH' || message.includes('Invalid login') || message.includes('authentication')) {
      hint = 'SMTP authentication failed. Use a Zoho app-specific password for SMTP_PASS.'
    } else if (err.code === 'ECONNECTION' || err.code === 'ESOCKET') {
      hint = `SMTP connection failed. Check SMTP_HOST/SMTP_PORT (465: secure, 587: STARTTLS).`
    }
    return { code: 'smtp_failed', status: 502, message: hint }
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

async function sendTelegramDocument(file: File, caption: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const body = new FormData()
  body.append('chat_id', chatId)
  body.append('document', file, file.name)
  body.append('caption', caption)

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    throw new Error(`Telegram sendDocument failed: ${await res.text()}`)
  }
}

async function sendEmail(
  subject: string,
  text: string,
  attachment?: { filename: string; content: Buffer },
): Promise<void> {
  const host = process.env.SMTP_HOST || 'smtp.zoho.com'
  const port = Number(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  // Zoho only allows relay from the authenticated mailbox or verified aliases.
  const from = process.env.SMTP_FROM?.trim() || user
  const to = process.env.SMTP_TO || 'admin@nordlab.net'

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
    attachments: attachment
      ? [{ filename: attachment.filename, content: attachment.content }]
      : undefined,
  })
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

    const name = formData.get('name')?.toString().trim()
    const contact = formData.get('contact')?.toString().trim()
    const task = formData.get('task')?.toString().trim()
    const fileEntry = formData.get('file')
    const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null
    const turnstileToken = formData.get('cf-turnstile-response')?.toString()

    if (!name || !contact || !task) {
      return NextResponse.json({ error: 'validation' }, { status: 400 })
    }

    const smtpReady = isSmtpConfigured()
    const telegramReady = isTelegramConfigured()
    if (!smtpReady && !telegramReady) {
      return errorResponse(
        'not_configured',
        503,
        'No delivery channel configured. Set SMTP_USER/SMTP_PASS (and optionally SMTP_FROM) or TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID in .env',
      )
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      if (!turnstileToken || !(await verifyTurnstile(turnstileToken, turnstileSecret))) {
        return NextResponse.json({ error: 'turnstile' }, { status: 400 })
      }
    }

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'file_size' }, { status: 400 })
      }
      if (!isAllowedFile(file)) {
        return NextResponse.json({ error: 'file_type' }, { status: 400 })
      }
    }

    const telegramText = [
      '<b>New contact — Custom development</b>',
      '',
      `<b>Name / bureau:</b> ${escapeHtml(name)}`,
      `<b>Contact:</b> ${escapeHtml(contact)}`,
      `<b>Task:</b>`,
      escapeHtml(task),
    ].join('\n')

    const emailText = [
      'New contact form submission (Custom Development)',
      '',
      `Name / bureau: ${name}`,
      `Contact: ${contact}`,
      '',
      'Task:',
      task,
    ].join('\n')

    if (telegramReady) {
      await sendTelegramMessage(telegramText)
      if (file) {
        await sendTelegramDocument(file, `Attachment from ${name}`)
      }
    }

    if (smtpReady) {
      const attachmentBuffer = file ? Buffer.from(await file.arrayBuffer()) : undefined
      await sendEmail(
        'Nordlab — Custom development inquiry',
        emailText,
        attachmentBuffer && file
          ? { filename: file.name, content: attachmentBuffer }
          : undefined,
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const { code, status, message } = classifyError(error)
    console.error('Contact form error:', message, error)
    return errorResponse(code, status, message)
  }
}
