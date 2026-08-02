import { NextRequest, NextResponse } from 'next/server'
import { company } from '@/content/company'
import { getCurrentUser } from '@/lib/auth'
import { getCloudPaymentsConfig } from '@/lib/cloudpayments'
import {
  architectCanCreateFreeObject,
  getObjectPriceRub,
  getObjectRenewPriceRub,
  getObjectStorageMonths,
  nextInvoiceId,
} from '@/lib/objects'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

function redirectUrl(locale: 'ru' | 'en', path: string, query?: Record<string, string>) {
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const locale = (body as { locale?: unknown }).locale === 'en' ? 'en' : 'ru'
  const kindRaw = (body as { kind?: unknown }).kind
  const kind = kindRaw === 'RENEWAL' ? 'RENEWAL' : 'NEW_OBJECT'

  if (kind === 'NEW_OBJECT') {
    const canFree = await architectCanCreateFreeObject(user.id)
    if (canFree) {
      return NextResponse.json({ error: 'use_free_create' }, { status: 400 })
    }

    const title =
      typeof (body as { title?: unknown }).title === 'string'
        ? (body as { title: string }).title.trim()
        : ''
    if (!title || title.length < 2) {
      return NextResponse.json({ error: 'validation' }, { status: 400 })
    }

    const amount = getObjectPriceRub()
    const invId = await nextInvoiceId()
    await prisma.objectInvoice.create({
      data: {
        invId,
        userId: user.id,
        kind: 'NEW_OBJECT',
        title,
        amount,
        status: 'PENDING',
        isTest: config.isTest,
      },
    })

    const months = getObjectStorageMonths()
    const description =
      locale === 'ru'
        ? `Объект «${title}» — Nordlab кабинет (${months} мес., 10 ГБ)`
        : `Object "${title}" — Nordlab cabinet (${months} mo, 10 GB)`

    return NextResponse.json({
      success: true,
      publicId: config.publicId,
      amount,
      currency: 'RUB',
      description,
      invoiceId: String(invId),
      accountId: user.email,
      email: user.email,
      data: {
        type: 'cabinet_object',
        kind: 'NEW_OBJECT',
        userId: user.id,
      },
      successRedirectUrl: redirectUrl(locale, '/cabinet', {
        objectPaid: '1',
        InvoiceId: String(invId),
      }),
      failRedirectUrl: redirectUrl(locale, '/cabinet', { payment: 'fail' }),
      isTest: config.isTest,
    })
  }

  const objectId =
    typeof (body as { objectId?: unknown }).objectId === 'string'
      ? (body as { objectId: string }).objectId.trim()
      : ''
  const object = await prisma.projectObject.findFirst({
    where: { id: objectId, architectId: user.id, lifecycle: { not: 'DELETED' } },
  })
  if (!object) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const amount = getObjectRenewPriceRub()
  const invId = await nextInvoiceId()
  await prisma.objectInvoice.create({
    data: {
      invId,
      userId: user.id,
      objectId: object.id,
      kind: 'RENEWAL',
      title: object.title,
      amount,
      status: 'PENDING',
      isTest: config.isTest,
    },
  })

  const description =
    locale === 'ru'
      ? `Продление объекта «${object.title}» — Nordlab (+${getObjectStorageMonths()} мес.)`
      : `Renew object "${object.title}" — Nordlab (+${getObjectStorageMonths()} mo)`

  return NextResponse.json({
    success: true,
    publicId: config.publicId,
    amount,
    currency: 'RUB',
    description,
    invoiceId: String(invId),
    accountId: user.email,
    email: user.email,
    data: {
      type: 'cabinet_object',
      kind: 'RENEWAL',
      userId: user.id,
      objectId: object.id,
    },
    successRedirectUrl: redirectUrl(locale, '/cabinet', {
      objectRenewed: '1',
      InvoiceId: String(invId),
    }),
    failRedirectUrl: redirectUrl(locale, '/cabinet', { payment: 'fail' }),
    isTest: config.isTest,
  })
}
