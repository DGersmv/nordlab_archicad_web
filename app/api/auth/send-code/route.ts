import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAndSendOtp, hasRecentOtpSend } from '@/lib/email-otp'
import { requireSmartCaptcha } from '@/lib/smartcaptcha'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Resend OTP. Captcha required unless a recent send exists for this email+purpose. */
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
  const purposeRaw = (body as { purpose?: unknown }).purpose
  const purpose = purposeRaw === 'REGISTER' ? 'REGISTER' : purposeRaw === 'LOGIN' ? 'LOGIN' : null
  const captchaToken = (body as { captchaToken?: unknown }).captchaToken
  const locale = (body as { locale?: unknown }).locale === 'en' ? 'en' : 'ru'

  if (!EMAIL_RE.test(email) || !purpose) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const recent = await hasRecentOtpSend(email, purpose)
  if (!recent) {
    const captcha = await requireSmartCaptcha(request, captchaToken)
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 })
    }
  }

  if (purpose === 'LOGIN') {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.status !== 'ACTIVE') {
      // Same opaque response — do not leak existence; still pretend ok after delay? Keep simple 401.
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }
  }

  if (purpose === 'REGISTER') {
    // Resend for register requires an unconsumed REGISTER otp with payload
    const pending = await prisma.emailOtp.findFirst({
      where: {
        email,
        purpose: 'REGISTER',
        consumedAt: null,
        expiresAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (!pending?.payloadJson) {
      return NextResponse.json({ error: 'restart_register' }, { status: 400 })
    }

    let payload: { name: string; phone?: string; passwordHash: string }
    try {
      payload = JSON.parse(pending.payloadJson) as typeof payload
    } catch {
      return NextResponse.json({ error: 'restart_register' }, { status: 400 })
    }

    try {
      await createAndSendOtp({ email, purpose: 'REGISTER', locale, payload })
    } catch (error) {
      if (error instanceof Error && error.message === 'rate_limited') {
        return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
      }
      return NextResponse.json({ error: 'email_failed' }, { status: 503 })
    }

    return NextResponse.json({ ok: true })
  }

  try {
    await createAndSendOtp({ email, purpose: 'LOGIN', locale })
  } catch (error) {
    if (error instanceof Error && error.message === 'rate_limited') {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    return NextResponse.json({ error: 'email_failed' }, { status: 503 })
  }

  return NextResponse.json({ ok: true })
}
