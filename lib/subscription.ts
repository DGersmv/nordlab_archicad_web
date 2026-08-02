import { prisma } from '@/lib/prisma'

/** @deprecated Cabinet access is free; kept for legacy subscription invoices. */
export function getCabinetSubscriptionPriceRub(): number {
  const raw = process.env.CABINET_SUBSCRIPTION_PRICE_RUB?.trim()
  const value = raw ? Number(raw) : 1990
  return Number.isFinite(value) && value > 0 ? value : 1990
}

/** @deprecated */
export function getCabinetSubscriptionDays(): number {
  const raw = process.env.CABINET_SUBSCRIPTION_DAYS?.trim()
  const value = raw ? Number(raw) : 30
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 30
}

export async function nextSubscriptionInvId(): Promise<number> {
  const { nextInvoiceId } = await import('@/lib/objects')
  return nextInvoiceId()
}

export async function ensurePendingSubscription(userId: string) {
  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, status: 'PENDING' },
    update: {},
  })
}

export async function activateSubscriptionFromPayment(userId: string, paidAmount: number) {
  const days = getCabinetSubscriptionDays()
  const price = getCabinetSubscriptionPriceRub()
  if (Math.abs(paidAmount - price) > 0.01) {
    throw new Error(`subscription amount mismatch: paid ${paidAmount}, expected ${price}`)
  }

  const existing = await prisma.subscription.findUnique({ where: { userId } })
  const base =
    existing?.paidUntil && existing.paidUntil.getTime() > Date.now()
      ? existing.paidUntil
      : new Date()
  const paidUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)

  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: 'ACTIVE',
      paidUntil,
    },
    update: {
      status: 'ACTIVE',
      paidUntil,
    },
  })
}

/** Cabinet itself is free — architects enter without subscription. */
export function userHasActiveCabinetAccess(user: { role: string }): boolean {
  return user.role === 'ADMIN' || user.role === 'ARCHITECT' || user.role === 'CLIENT'
}
