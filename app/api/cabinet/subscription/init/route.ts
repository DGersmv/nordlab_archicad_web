import { NextRequest, NextResponse } from 'next/server'
import { company } from '@/content/company'
import { getCurrentUser } from '@/lib/auth'
import { getCloudPaymentsConfig } from '@/lib/cloudpayments'
import { prisma } from '@/lib/prisma'
import {
  getCabinetSubscriptionDays,
  getCabinetSubscriptionPriceRub,
  nextSubscriptionInvId,
  userHasActiveCabinetAccess,
} from '@/lib/subscription'

export const runtime = 'nodejs'

function paymentRedirectPath(
  locale: 'ru' | 'en',
  path: '/cabinet/subscribe' | '/cabinet',
  query?: Record<string, string>,
): string {
  const prefix = locale === 'ru' ? '/ru' : ''
  const qs = query ? `?${new URLSearchParams(query).toString()}` : ''
  return `${company.siteUrl}${prefix}${path}${qs}`
}

export async function POST(request: NextRequest) {
  const config = getCloudPaymentsConfig()
  if (!config) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const user = await getCurrentUser()
  if (!user || user.role !== 'ARCHITECT') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const locale = (body as { locale?: unknown }).locale === 'en' ? 'en' : 'ru'
  const amount = getCabinetSubscriptionPriceRub()
  const days = getCabinetSubscriptionDays()
  const invId = await nextSubscriptionInvId()

  await prisma.subscriptionInvoice.create({
    data: {
      invId,
      userId: user.id,
      amount,
      currency: 'RUB',
      status: 'PENDING',
      isTest: config.isTest,
    },
  })

  const description =
    locale === 'ru'
      ? `Подписка на кабинет архитектора Nordlab (${days} дн.)`
      : `Nordlab architect cabinet subscription (${days} days)`

  const alreadyActive = userHasActiveCabinetAccess(user)

  return NextResponse.json({
    success: true,
    publicId: config.publicId,
    amount,
    currency: 'RUB',
    description,
    invoiceId: String(invId),
    accountId: user.email,
    email: user.email,
    days,
    data: {
      type: 'cabinet_subscription',
      userId: user.id,
      email: user.email,
    },
    successRedirectUrl: paymentRedirectPath(locale, '/cabinet', {
      subscribed: '1',
      InvoiceId: String(invId),
    }),
    failRedirectUrl: paymentRedirectPath(locale, '/cabinet/subscribe', {
      payment: 'fail',
    }),
    isTest: config.isTest,
    renewing: alreadyActive,
  })
}
