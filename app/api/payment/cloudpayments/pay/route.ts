import { NextRequest, NextResponse } from 'next/server'
import {
  buildNotificationRawBodyFromSearchParams,
  getCloudPaymentsConfig,
  isNotificationHmacValid,
  isSuccessfulPaymentStatus,
  parsePayNotification,
  parsePayNotificationFromSearchParams,
} from '@/lib/cloudpayments'
import { generateLicenseKey } from '@/lib/license'
import { getOrderByInvId, markOrderPaid } from '@/lib/orders'
import { canSendLicenseEmail, sendLicenseEmail } from '@/lib/payment-email'

export const runtime = 'nodejs'

async function fulfillOrder(invId: number, paidAmount: number): Promise<NextResponse> {
  const order = await getOrderByInvId(invId)
  if (!order) {
    console.error('[cloudpayments/pay] order not found:', invId)
    return NextResponse.json({ code: 13 }, { status: 404 })
  }

  if (Math.abs(paidAmount - order.amount) > 0.01) {
    console.error('[cloudpayments/pay] amount mismatch:', invId, paidAmount, order.amount)
    return NextResponse.json({ code: 13 }, { status: 400 })
  }

  if (order.status !== 'paid') {
    const licenseKey = generateLicenseKey(order.pluginSlug, order.machineId)
    await markOrderPaid(invId, licenseKey)
    console.info('[cloudpayments/pay] order paid:', invId, order.pluginSlug)

    if (canSendLicenseEmail()) {
      try {
        await sendLicenseEmail({
          email: order.email,
          pluginSlug: order.pluginSlug,
          machineId: order.machineId,
          licenseKey,
          locale: 'ru',
        })
        console.info('[cloudpayments/pay] license email sent:', order.email)
      } catch (error) {
        console.error('[cloudpayments/pay] license email failed:', error)
      }
    } else {
      console.error('[cloudpayments/pay] SMTP not configured, email skipped')
    }
  }

  return NextResponse.json({ code: 0 })
}

async function handleNotification(rawBody: string, contentType: string | null, request: NextRequest) {
  const config = getCloudPaymentsConfig()
  if (!config) {
    return NextResponse.json({ code: 13 }, { status: 503 })
  }

  const contentHmac = request.headers.get('Content-HMAC')
  const xContentHmac = request.headers.get('X-Content-HMAC')

  if (!isNotificationHmacValid(rawBody, contentHmac, xContentHmac, config.apiSecret)) {
    console.error('[cloudpayments/pay] invalid HMAC')
    return NextResponse.json({ code: 13 }, { status: 403 })
  }

  const notification = parsePayNotification(rawBody, contentType)
  if (!notification) {
    console.error('[cloudpayments/pay] invalid notification body')
    return NextResponse.json({ code: 13 }, { status: 400 })
  }

  if (!isSuccessfulPaymentStatus(notification.Status)) {
    return NextResponse.json({ code: 0 })
  }

  const invIdRaw = notification.InvoiceId?.trim()
  const amountRaw = notification.Amount
  if (!invIdRaw || amountRaw === undefined || amountRaw === null) {
    console.error('[cloudpayments/pay] missing InvoiceId or Amount')
    return NextResponse.json({ code: 13 }, { status: 400 })
  }

  const invId = Number(invIdRaw)
  const paidAmount = Number(amountRaw)
  if (!Number.isFinite(invId) || !Number.isFinite(paidAmount)) {
    return NextResponse.json({ code: 13 }, { status: 400 })
  }

  return fulfillOrder(invId, paidAmount)
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const rawBody = buildNotificationRawBodyFromSearchParams(params)
  const notification = parsePayNotificationFromSearchParams(params)

  if (!notification.InvoiceId) {
    return NextResponse.json({ code: 13 }, { status: 400 })
  }

  return handleNotification(rawBody, 'application/x-www-form-urlencoded', request)
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type')
  const rawBody = await request.text()
  return handleNotification(rawBody, contentType, request)
}
