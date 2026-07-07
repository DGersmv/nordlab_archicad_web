import { NextRequest, NextResponse } from 'next/server'
import { generateLicenseKey } from '@/lib/license'
import { getOrderByInvId, markOrderPaid } from '@/lib/orders'
import { canSendLicenseEmail, sendLicenseEmail } from '@/lib/payment-email'
import {
  buildResultSignature,
  extractCustomParams,
  getRobokassaConfig,
  normalizeSignature,
} from '@/lib/robokassa'

export const runtime = 'nodejs'

async function readCallbackParams(request: NextRequest): Promise<URLSearchParams> {
  if (request.method === 'GET') {
    return request.nextUrl.searchParams
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const body = (await request.json()) as Record<string, string>
    return new URLSearchParams(body)
  }

  const formData = await request.formData()
  const params = new URLSearchParams()
  formData.forEach((value, key) => {
    if (typeof value === 'string') params.set(key, value)
  })
  return params
}

async function handleResult(request: NextRequest): Promise<NextResponse> {
  const config = getRobokassaConfig()
  if (!config) {
    return new NextResponse('config error', { status: 503 })
  }

  const params = await readCallbackParams(request)
  const outSum = params.get('OutSum')?.trim()
  const invIdRaw = params.get('InvId')?.trim()
  const signatureValue = params.get('SignatureValue')
  const customParams = extractCustomParams(params)

  if (!outSum || !invIdRaw || !signatureValue) {
    return new NextResponse('bad request', { status: 400 })
  }

  const expectedSignature = buildResultSignature(config, outSum, invIdRaw, customParams)
  if (normalizeSignature(signatureValue) !== normalizeSignature(expectedSignature)) {
    return new NextResponse('bad signature', { status: 403 })
  }

  const invId = Number(invIdRaw)
  if (!Number.isFinite(invId)) {
    return new NextResponse('bad invId', { status: 400 })
  }

  const order = await getOrderByInvId(invId)
  if (!order) {
    return new NextResponse('order not found', { status: 404 })
  }

  const paidAmount = Number(outSum)
  if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.amount) > 0.01) {
    return new NextResponse('amount mismatch', { status: 400 })
  }

  if (order.status !== 'paid') {
    const licenseKey = generateLicenseKey(order.pluginSlug, order.machineId)
    await markOrderPaid(invId, licenseKey)

    if (canSendLicenseEmail()) {
      try {
        await sendLicenseEmail({
          email: order.email,
          pluginSlug: order.pluginSlug,
          machineId: order.machineId,
          licenseKey,
          locale: 'ru',
        })
      } catch (error) {
        console.error('License email failed:', error)
      }
    }
  }

  return new NextResponse(`OK${invId}`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export async function GET(request: NextRequest) {
  return handleResult(request)
}

export async function POST(request: NextRequest) {
  return handleResult(request)
}
