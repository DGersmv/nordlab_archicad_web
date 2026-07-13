import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getPluginBySlug } from '@/content/plugins'
import {
  formatLegalPaymentAdminEmail,
  formatLegalPaymentCustomerEmail,
} from '@/lib/legal-payment-email'
import { isLicensePluginSlug } from '@/lib/license'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM?.trim() || user
  return Boolean(user && pass && from)
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST || 'smtp.zoho.com'
  const port = Number(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM?.trim() || user

  if (!user || !pass || !from) throw new Error('SMTP not configured')

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' },
  })

  await transporter.sendMail({ from, to, subject, text })
}

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(getClientIp(request))) {
      return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
    }

    if (!isSmtpConfigured()) {
      return NextResponse.json({ error: 'not_configured' }, { status: 503 })
    }

    const formData = await request.formData()
    const honeypot = formData.get('website')?.toString() ?? ''
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    const pluginSlug = formData.get('pluginSlug')?.toString().trim().toLowerCase() ?? ''
    const machineId = formData.get('machineId')?.toString().trim().toUpperCase() ?? ''
    const company = formData.get('company')?.toString().trim() ?? ''
    const inn = formData.get('inn')?.toString().trim() ?? ''
    const contactName = formData.get('contactName')?.toString().trim() ?? ''
    const email = formData.get('email')?.toString().trim().toLowerCase() ?? ''
    const phone = formData.get('phone')?.toString().trim() ?? ''
    const notes = formData.get('notes')?.toString().trim() ?? ''
    const locale = formData.get('locale')?.toString() === 'en' ? 'en' : 'ru'
    const privacyConsent = formData.get('privacyConsent')?.toString()

    const plugin = getPluginBySlug(pluginSlug)

    if (
      !plugin ||
      !isLicensePluginSlug(pluginSlug) ||
      !machineId ||
      !company ||
      !contactName ||
      !EMAIL_RE.test(email) ||
      privacyConsent !== 'yes'
    ) {
      return NextResponse.json({ error: 'validation' }, { status: 400 })
    }

    const pluginName = locale === 'ru' ? plugin.name.ru : plugin.name.en
    const payload = {
      locale: locale as 'ru' | 'en',
      pluginName,
      machineId,
      company,
      inn: inn || undefined,
      contactName,
      email,
      phone: phone || undefined,
      notes: notes || undefined,
    }

    const adminTo = process.env.SMTP_TO || 'admin@nordlab.net'
    const customerMail = formatLegalPaymentCustomerEmail(payload)

    await sendEmail(
      adminTo,
      `Nordlab — оплата юр. лица — ${pluginName}`,
      formatLegalPaymentAdminEmail(payload),
    )
    await sendEmail(email, customerMail.subject, customerMail.text)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Legal payment error:', error)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
