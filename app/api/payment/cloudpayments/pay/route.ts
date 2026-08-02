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
import { prisma } from '@/lib/prisma'
import { createPaidObjectFromInvoice, renewObject } from '@/lib/objects'
import { activateSubscriptionFromPayment } from '@/lib/subscription'

export const runtime = 'nodejs'

async function fulfillObjectInvoice(invId: number, paidAmount: number): Promise<NextResponse | null> {
  const invoice = await prisma.objectInvoice.findUnique({ where: { invId } })
  if (!invoice) return null

  if (Math.abs(paidAmount - invoice.amount) > 0.01) {
    console.error('[cloudpayments/pay] object amount mismatch:', invId, paidAmount, invoice.amount)
    return NextResponse.json({ code: 13 }, { status: 400 })
  }

  if (invoice.status !== 'PAID') {
    try {
      if (invoice.kind === 'NEW_OBJECT') {
        if (!invoice.title) {
          throw new Error('missing title for new object')
        }
        const object = await createPaidObjectFromInvoice({
          architectId: invoice.userId,
          title: invoice.title,
        })
        await prisma.objectInvoice.update({
          where: { invId },
          data: { status: 'PAID', paidAt: new Date(), objectId: object.id },
        })
        console.info('[cloudpayments/pay] object created:', invId, object.id)
      } else if (invoice.kind === 'RENEWAL') {
        if (!invoice.objectId) {
          throw new Error('missing objectId for renewal')
        }
        await renewObject(invoice.objectId)
        await prisma.objectInvoice.update({
          where: { invId },
          data: { status: 'PAID', paidAt: new Date() },
        })
        console.info('[cloudpayments/pay] object renewed:', invId, invoice.objectId)
      }
    } catch (error) {
      console.error('[cloudpayments/pay] object fulfill failed:', error)
      return NextResponse.json({ code: 13 }, { status: 400 })
    }
  }

  return NextResponse.json({ code: 0 })
}

async function fulfillSubscriptionInvoice(invId: number, paidAmount: number): Promise<NextResponse | null> {
  const invoice = await prisma.subscriptionInvoice.findUnique({ where: { invId } })
  if (!invoice) return null

  if (Math.abs(paidAmount - invoice.amount) > 0.01) {
    console.error('[cloudpayments/pay] subscription amount mismatch:', invId, paidAmount, invoice.amount)
    return NextResponse.json({ code: 13 }, { status: 400 })
  }

  if (invoice.status !== 'PAID') {
    try {
      await activateSubscriptionFromPayment(invoice.userId, paidAmount)
      await prisma.subscriptionInvoice.update({
        where: { invId },
        data: { status: 'PAID', paidAt: new Date() },
      })
      console.info('[cloudpayments/pay] subscription paid:', invId, invoice.userId)
    } catch (error) {
      console.error('[cloudpayments/pay] subscription activate failed:', error)
      return NextResponse.json({ code: 13 }, { status: 400 })
    }
  }

  return NextResponse.json({ code: 0 })
}

async function fulfillOrder(invId: number, paidAmount: number): Promise<NextResponse> {
  const objectResult = await fulfillObjectInvoice(invId, paidAmount)
  if (objectResult) return objectResult

  const subscriptionResult = await fulfillSubscriptionInvoice(invId, paidAmount)
  if (subscriptionResult) return subscriptionResult

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
