import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { createAndSendOtp, hasRecentOtpSend } from '@/lib/email-otp'
import { requireSmartCaptcha } from '@/lib/smartcaptcha'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email =
    typeof (body as { email?: unknown }).email === 'string'
      ? (body as { email: string }).email.trim().toLowerCase()
      : ''
  const password =
    typeof (body as { password?: unknown }).password === 'string'
      ? (body as { password: string }).password
      : ''
  const name =
    typeof (body as { name?: unknown }).name === 'string'
      ? (body as { name: string }).name.trim()
      : ''
  const phone =
    typeof (body as { phone?: unknown }).phone === 'string'
      ? (body as { phone: string }).phone.trim()
      : ''
  const privacyConsent = (body as { privacyConsent?: unknown }).privacyConsent
  const captchaToken = (body as { captchaToken?: unknown }).captchaToken
  const locale = (body as { locale?: unknown }).locale === 'en' ? 'en' : 'ru'

  if (!EMAIL_RE.test(email) || password.length < 8 || !name || privacyConsent !== true) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const needCaptcha = !(await hasRecentOtpSend(email, 'REGISTER'))
  if (needCaptcha) {
    const captcha = await requireSmartCaptcha(request, captchaToken)
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 })
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'email_taken' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  try {
    await createAndSendOtp({
      email,
      purpose: 'REGISTER',
      locale,
      payload: {
        name,
        phone: phone || undefined,
        passwordHash,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'rate_limited') {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    if (error instanceof Error && error.message.includes('SMTP')) {
      console.error('[auth/register] SMTP', error)
      return NextResponse.json({ error: 'email_failed' }, { status: 503 })
    }
    console.error('[auth/register] send otp', error)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, next: 'otp', email })
}
