import { createHmac, timingSafeEqual } from 'crypto'

export type CloudPaymentsConfig = {
  publicId: string
  apiSecret: string
  isTest: boolean
}

export type CloudPaymentsPayNotification = {
  TransactionId?: number | string
  Amount?: number | string
  Currency?: string
  InvoiceId?: string
  AccountId?: string
  Email?: string
  Status?: string
  TestMode?: number | boolean | string
  Data?: Record<string, unknown> | string
}

export function getCloudPaymentsConfig(): CloudPaymentsConfig | null {
  const publicId = process.env.CLOUDPAYMENTS_PUBLIC_ID?.trim()
  const apiSecret = process.env.CLOUDPAYMENTS_API_SECRET?.trim()

  if (!publicId || !apiSecret) return null

  const forceTest = process.env.CLOUDPAYMENTS_FORCE_TEST === '1'

  return {
    publicId,
    apiSecret,
    isTest: forceTest || publicId.startsWith('test_api_'),
  }
}

export function isCloudPaymentsConfigured(): boolean {
  return getCloudPaymentsConfig() !== null
}

export function verifyNotificationHmac(body: string, header: string | null, apiSecret: string): boolean {
  if (!header?.trim()) return false

  const expected = createHmac('sha256', apiSecret).update(body, 'utf8').digest('base64')
  const received = header.trim()

  try {
    const expectedBuffer = Buffer.from(expected)
    const receivedBuffer = Buffer.from(received)
    if (expectedBuffer.length !== receivedBuffer.length) return false
    return timingSafeEqual(expectedBuffer, receivedBuffer)
  } catch {
    return false
  }
}

export function isNotificationHmacValid(
  rawBody: string,
  contentHmac: string | null,
  xContentHmac: string | null,
  apiSecret: string,
): boolean {
  return (
    verifyNotificationHmac(rawBody, contentHmac, apiSecret) ||
    verifyNotificationHmac(rawBody, xContentHmac, apiSecret)
  )
}

function paramsToNotification(params: URLSearchParams): CloudPaymentsPayNotification {
  const notification: CloudPaymentsPayNotification = {}
  for (const [key, value] of params.entries()) {
    if (!value) continue
    if (key === 'Amount' || key === 'TransactionId') {
      notification[key] = value
      continue
    }
    if (key === 'Data') {
      try {
        notification.Data = JSON.parse(value) as Record<string, unknown>
      } catch {
        notification.Data = value
      }
      continue
    }
    ;(notification as Record<string, unknown>)[key] = value
  }
  return notification
}

export function parsePayNotification(rawBody: string, contentType?: string | null): CloudPaymentsPayNotification | null {
  const trimmed = rawBody.trim()
  if (!trimmed) return null

  const type = contentType?.toLowerCase() ?? ''

  if (type.includes('application/json') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed) as CloudPaymentsPayNotification
    } catch {
      return null
    }
  }

  return paramsToNotification(new URLSearchParams(trimmed))
}

export function parsePayNotificationFromSearchParams(
  params: URLSearchParams,
): CloudPaymentsPayNotification {
  return paramsToNotification(params)
}

export function buildNotificationRawBodyFromSearchParams(params: URLSearchParams): string {
  return params.toString()
}

export function isSuccessfulPaymentStatus(status: string | undefined): boolean {
  return status === 'Completed' || status === 'Authorized'
}
