import { createHash, randomInt } from 'crypto'
import type { OtpPurpose } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendVerificationCodeEmail } from '@/lib/payment-email'

const RECENT_SEND_MS = 15 * 60 * 1000

export type RegisterOtpPayload = {
  name: string
  phone?: string
  passwordHash: string
}

function getOtpSecret(): string {
  const secret = process.env.EMAIL_OTP_SECRET?.trim() || process.env.JWT_SECRET?.trim()
  if (!secret || secret.length < 16) {
    throw new Error('EMAIL_OTP_SECRET (or JWT_SECRET) must be set')
  }
  return secret
}

export function getOtpTtlSeconds(): number {
  const v = Number(process.env.EMAIL_OTP_TTL_SECONDS?.trim() ?? '300')
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 300
}

export function hashOtpCode(code: string): string {
  return createHash('sha256').update(`${getOtpSecret()}:${code}`).digest('hex')
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000))
}

export async function hasRecentOtpSend(email: string, purpose: OtpPurpose): Promise<boolean> {
  const since = new Date(Date.now() - RECENT_SEND_MS)
  const count = await prisma.emailOtp.count({
    where: { email, purpose, createdAt: { gte: since } },
  })
  return count > 0
}

export async function countOtpSendsLastHour(email: string): Promise<number> {
  const since = new Date(Date.now() - 60 * 60 * 1000)
  return prisma.emailOtp.count({
    where: { email, createdAt: { gte: since } },
  })
}

export async function createAndSendOtp(input: {
  email: string
  purpose: OtpPurpose
  locale?: 'ru' | 'en'
  payload?: RegisterOtpPayload
}): Promise<void> {
  const email = input.email.trim().toLowerCase()
  const sends = await countOtpSendsLastHour(email)
  if (sends >= 5) {
    throw new Error('rate_limited')
  }

  await prisma.emailOtp.updateMany({
    where: { email, purpose: input.purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  })

  const code = generateOtpCode()
  const expiresAt = new Date(Date.now() + getOtpTtlSeconds() * 1000)

  await prisma.emailOtp.create({
    data: {
      email,
      purpose: input.purpose,
      codeHash: hashOtpCode(code),
      payloadJson: input.payload ? JSON.stringify(input.payload) : null,
      expiresAt,
    },
  })

  await sendVerificationCodeEmail({
    email,
    code,
    locale: input.locale ?? 'ru',
  })
}

export async function consumeOtp(input: {
  email: string
  purpose: OtpPurpose
  code: string
}): Promise<{ payload: RegisterOtpPayload | null }> {
  const email = input.email.trim().toLowerCase()
  const code = input.code.trim()
  if (!/^\d{6}$/.test(code)) {
    throw new Error('invalid_code')
  }

  const row = await prisma.emailOtp.findFirst({
    where: {
      email,
      purpose: input.purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!row || row.codeHash !== hashOtpCode(code)) {
    throw new Error('invalid_code')
  }

  await prisma.emailOtp.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  })

  let payload: RegisterOtpPayload | null = null
  if (row.payloadJson) {
    try {
      payload = JSON.parse(row.payloadJson) as RegisterOtpPayload
    } catch {
      payload = null
    }
  }

  return { payload }
}
