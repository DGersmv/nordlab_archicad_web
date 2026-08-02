import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  attachSessionCookie,
  createSessionToken,
} from '@/lib/auth'
import { consumeOtp } from '@/lib/email-otp'

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
  const code =
    typeof (body as { code?: unknown }).code === 'string'
      ? (body as { code: string }).code.trim()
      : ''
  const purposeRaw = (body as { purpose?: unknown }).purpose
  const purpose = purposeRaw === 'REGISTER' ? 'REGISTER' : purposeRaw === 'LOGIN' ? 'LOGIN' : null

  if (!EMAIL_RE.test(email) || !purpose || !code) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  let payload
  try {
    ;({ payload } = await consumeOtp({ email, purpose, code }))
  } catch {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 })
  }

  if (purpose === 'REGISTER') {
    if (!payload?.name || !payload.passwordHash) {
      return NextResponse.json({ error: 'invalid_code' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'email_taken' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: payload.passwordHash,
        name: payload.name,
        phone: payload.phone || null,
        role: 'ARCHITECT',
      },
    })

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? undefined,
    })

    const response = NextResponse.json({
      success: true,
      next: '/cabinet',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
    attachSessionCookie(response, token)
    return response
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? undefined,
  })

  const response = NextResponse.json({
    success: true,
    next: '/cabinet',
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  })
  attachSessionCookie(response, token)
  return response
}
