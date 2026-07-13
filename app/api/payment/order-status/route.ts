import { NextRequest, NextResponse } from 'next/server'
import { getPluginBySlug } from '@/content/plugins'
import { getOrderReceipt } from '@/lib/order-receipt'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: NextRequest) {
  const invoiceIdRaw = request.nextUrl.searchParams.get('invoiceId')?.trim()
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? ''

  const invoiceId = Number(invoiceIdRaw)
  if (!invoiceIdRaw || !Number.isFinite(invoiceId) || !EMAIL_RE.test(email)) {
    return NextResponse.json({ status: 'not_found' }, { status: 400 })
  }

  const receipt = await getOrderReceipt(invoiceId, email)
  if (receipt === 'not_found') {
    return NextResponse.json({ status: 'not_found' }, { status: 404 })
  }
  if (receipt === 'forbidden') {
    return NextResponse.json({ status: 'forbidden' }, { status: 403 })
  }

  const plugin = getPluginBySlug(receipt.pluginSlug)
  const locale = request.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'ru'

  return NextResponse.json({
    status: receipt.status,
    invoiceId: receipt.invoiceId,
    pluginSlug: receipt.pluginSlug,
    pluginName: plugin ? (locale === 'ru' ? plugin.name.ru : plugin.name.en) : receipt.pluginSlug,
    machineId: receipt.machineId,
    licenseKey: receipt.licenseKey ?? null,
  })
}
