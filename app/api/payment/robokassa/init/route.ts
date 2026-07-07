import { NextRequest, NextResponse } from 'next/server'
import { getPluginBySlug } from '@/content/plugins'
import { isLicensePluginSlug } from '@/lib/license'
import { createOrder } from '@/lib/orders'
import { buildPaymentUrl, getRobokassaConfig } from '@/lib/robokassa'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const config = getRobokassaConfig()
  if (!config) {
    return NextResponse.json(
      {
        error: 'not_configured',
        message: 'Set ROBOKASSA_MERCHANT_LOGIN and test or production passwords in .env',
      },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
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
  const privacyConsent = (body as { privacyConsent?: unknown }).privacyConsent
  const locale =
    (body as { locale?: unknown }).locale === 'en' ? 'en' : 'ru'

  if (!isLicensePluginSlug(pluginSlug) || !machineId || !EMAIL_RE.test(email) || privacyConsent !== true) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const plugin = getPluginBySlug(pluginSlug)
  if (!plugin) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const amount = plugin.price.rub
  const pluginName = locale === 'ru' ? plugin.name.ru : plugin.name.en
  const description =
    locale === 'ru'
      ? `Лицензия ${pluginName} — Nordlab`
      : `${pluginName} license — Nordlab`

  const order = await createOrder({
    pluginSlug,
    machineId,
    email,
    amount,
    isTest: config.isTest,
  })

  const customParams = {
    Shp_email: email,
    Shp_machine: machineId.toUpperCase(),
    Shp_plugin: pluginSlug,
  }

  const redirectUrl = buildPaymentUrl({
    config,
    outSum: amount,
    invId: order.invId,
    description,
    email,
    customParams,
    culture: locale,
  })

  return NextResponse.json({
    success: true,
    redirectUrl,
    invId: order.invId,
    isTest: config.isTest,
  })
}
