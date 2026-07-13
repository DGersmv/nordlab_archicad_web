import type { LicensePluginSlug } from '@/lib/license'
import { getOrderByInvId, type PaymentOrder } from '@/lib/orders'

export type OrderReceipt = {
  status: 'paid' | 'pending'
  invoiceId: number
  pluginSlug: LicensePluginSlug
  machineId: string
  email: string
  licenseKey?: string
}

export async function getOrderReceipt(
  invoiceId: number,
  email: string,
): Promise<OrderReceipt | 'not_found' | 'forbidden'> {
  if (!Number.isFinite(invoiceId) || !email.trim()) {
    return 'not_found'
  }

  const order = await getOrderByInvId(invoiceId)
  if (!order) return 'not_found'

  const normalizedEmail = email.trim().toLowerCase()
  if (order.email !== normalizedEmail) return 'forbidden'

  return toReceipt(order)
}

function toReceipt(order: PaymentOrder): OrderReceipt {
  return {
    status: order.status,
    invoiceId: order.invId,
    pluginSlug: order.pluginSlug,
    machineId: order.machineId,
    email: order.email,
    licenseKey: order.status === 'paid' ? order.licenseKey : undefined,
  }
}
