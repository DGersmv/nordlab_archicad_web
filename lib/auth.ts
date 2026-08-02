import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const SESSION_COOKIE = 'nordlab_session'
const SESSION_DAYS = 30

export type SessionPayload = {
  sub: string
  email: string
  role: UserRole
  name?: string
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET must be set (min 16 characters)')
  }
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getJwtSecret())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    const sub = typeof payload.sub === 'string' ? payload.sub : null
    const email = typeof payload.email === 'string' ? payload.email : null
    const role = payload.role as UserRole | undefined
    if (!sub || !email || !role) return null
    return {
      sub,
      email,
      role,
      name: typeof payload.name === 'string' ? payload.name : undefined,
    }
  } catch {
    return null
  }
}

export function attachSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { subscription: true },
  })

  if (!user || user.status !== 'ACTIVE') return null
  return user
}

export function isSubscriptionActive(paidUntil: Date | null | undefined, status?: string): boolean {
  if (!paidUntil) return false
  if (status && status !== 'ACTIVE') return false
  return paidUntil.getTime() > Date.now()
}
