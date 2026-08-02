import type { NextRequest } from 'next/server'

export type SmartCaptchaConfig = {
  enabled: boolean
  serverKey: string
  failOpen: boolean
  sitekey: string
}

export function getSmartCaptchaConfig(): SmartCaptchaConfig {
  const serverKey = process.env.SMARTCAPTCHA_SERVER_KEY?.trim() ?? ''
  return {
    enabled: Boolean(serverKey),
    serverKey,
    failOpen: process.env.SMARTCAPTCHA_FAIL_OPEN === 'true',
    sitekey: process.env.NEXT_PUBLIC_SMARTCAPTCHA_SITEKEY?.trim() ?? '',
  }
}

export function clientIpFromRequest(request: NextRequest): string | undefined {
  const xf = request.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real.trim()
  return undefined
}

/**
 * Yandex SmartCaptcha validation.
 * https://yandex.cloud/ru/docs/smartcaptcha/concepts/validation
 */
export async function verifySmartCaptchaToken(opts: {
  token: string
  ip?: string
  serverKey: string
  failOpen: boolean
}): Promise<boolean> {
  if (!opts.token.trim()) return false

  const body = new URLSearchParams({
    secret: opts.serverKey,
    token: opts.token,
  })
  if (opts.ip) body.set('ip', opts.ip)

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    const res = await fetch('https://smartcaptcha.cloud.yandex.ru/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: controller.signal,
    })
    clearTimeout(timer)

    const text = await res.text()
    if (!res.ok) {
      console.warn('[smartcaptcha] HTTP', res.status, text.slice(0, 200))
      return opts.failOpen
    }

    const parsed = JSON.parse(text) as { status?: string }
    return parsed.status === 'ok'
  } catch (error) {
    console.warn('[smartcaptcha] validate failed', error)
    return opts.failOpen
  }
}

export async function requireSmartCaptcha(
  request: NextRequest,
  captchaToken: unknown,
): Promise<{ ok: true } | { ok: false; error: 'captcha_required' | 'captcha_failed' }> {
  const config = getSmartCaptchaConfig()
  if (!config.enabled) return { ok: true }

  const token = typeof captchaToken === 'string' ? captchaToken.trim() : ''
  if (!token) return { ok: false, error: 'captcha_required' }

  const valid = await verifySmartCaptchaToken({
    token,
    ip: clientIpFromRequest(request),
    serverKey: config.serverKey,
    failOpen: config.failOpen,
  })

  return valid ? { ok: true } : { ok: false, error: 'captcha_failed' }
}
