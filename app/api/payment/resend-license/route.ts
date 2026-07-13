import { NextRequest, NextResponse } from 'next/server'
import { isLicensePluginSlug } from '@/lib/license'
import { getPaidOrderByMachineAndPlugin } from '@/lib/orders'
import { canSendLicenseEmail, sendLicenseEmail } from '@/lib/payment-email'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  if (!canSendLicenseEmail()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const pluginSlug =
    typeof (body as { pluginSlug?: unknown }).pluginSlug === 'string'
      ? (body as { pluginSlug: string }).pluginSlug.trim().toLowerCase()
      : ''
  const machineId =
    typeof (body as { machineId?: unknown }).machineId === 'string'
      ? (body as { machineId: string }).machineId.trim()
      : ''
  const email =
    typeof (body as { email?: unknown }).email === 'string'
      ? (body as { email: string }).email.trim().toLowerCase()
      : ''
  const locale = (body as { locale?: unknown }).locale === 'en' ? 'en' : 'ru'

  if (!isLicensePluginSlug(pluginSlug) || !machineId || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const order = await getPaidOrderByMachineAndPlugin(pluginSlug, machineId)
  if (!order?.licenseKey) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  try {
    await sendLicenseEmail({
      email,
      pluginSlug: order.pluginSlug,
      machineId: order.machineId,
      licenseKey: order.licenseKey,
      locale,
    })
  } catch (error) {
    console.error('[resend-license] email failed:', error)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
