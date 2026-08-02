import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
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
  const captchaToken = (body as { captchaToken?: unknown }).captchaToken
  const locale = (body as { locale?: unknown }).locale === 'en' ? 'en' : 'ru'

  if (!EMAIL_RE.test(email) || !password) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const needCaptcha = !(await hasRecentOtpSend(email, 'LOGIN'))
  if (needCaptcha) {
    const captcha = await requireSmartCaptcha(request, captchaToken)
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 })
    }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
  }

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
  }

  try {
    await createAndSendOtp({ email, purpose: 'LOGIN', locale })
  } catch (error) {
    if (error instanceof Error && error.message === 'rate_limited') {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    if (error instanceof Error && error.message.includes('SMTP')) {
      console.error('[auth/login] SMTP', error)
      return NextResponse.json({ error: 'email_failed' }, { status: 503 })
    }
    console.error('[auth/login] send otp', error)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, next: 'otp', email })
}
