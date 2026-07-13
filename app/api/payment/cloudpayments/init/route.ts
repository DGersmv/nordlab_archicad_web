import { NextRequest, NextResponse } from 'next/server'
import { company } from '@/content/company'
import { getPluginBySlug } from '@/content/plugins'
import { isLicensePluginSlug } from '@/lib/license'
import { createOrder, getPaidOrderByMachineAndPlugin } from '@/lib/orders'
import { getCloudPaymentsConfig } from '@/lib/cloudpayments'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function paymentRedirectPath(
  locale: 'ru' | 'en',
  path: '/payment/success' | '/payment/fail',
  query?: Record<string, string>,
): string {
  const prefix = locale === 'ru' ? '/ru' : ''
  const qs = query ? `?${new URLSearchParams(query).toString()}` : ''
  return `${company.siteUrl}${prefix}${path}${qs}`
}

export async function POST(request: NextRequest) {
  const config = getCloudPaymentsConfig()
  if (!config) {
    return NextResponse.json(
      {
        error: 'not_configured',
        message: 'Set CLOUDPAYMENTS_PUBLIC_ID and CLOUDPAYMENTS_API_SECRET in .env',
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
  const locale = (body as { locale?: unknown }).locale === 'en' ? 'en' : 'ru'

  if (!isLicensePluginSlug(pluginSlug) || !machineId || !EMAIL_RE.test(email) || privacyConsent !== true) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const existingPaid = await getPaidOrderByMachineAndPlugin(pluginSlug, machineId)
  if (existingPaid?.licenseKey) {
    return NextResponse.json({ error: 'already_paid' }, { status: 409 })
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

  const invoiceId = String(order.invId)

  return NextResponse.json({
    success: true,
    publicId: config.publicId,
    amount,
    currency: 'RUB',
    description,
    invoiceId,
    accountId: email,
    email,
    data: {
      plugin: pluginSlug,
      machine: machineId.toUpperCase(),
      email,
    },
    successRedirectUrl: paymentRedirectPath(locale, '/payment/success', {
      InvoiceId: invoiceId,
      email,
    }),
    failRedirectUrl: paymentRedirectPath(locale, '/payment/fail'),
    isTest: config.isTest,
  })
}
