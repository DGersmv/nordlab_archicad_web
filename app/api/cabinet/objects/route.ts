import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  architectCanCreateFreeObject,
  createFreeTrialObject,
  getObjectPriceRub,
  getObjectStorageLimitBytes,
  getObjectStorageMonths,
  serializeObject,
} from '@/lib/objects'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ARCHITECT' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const objects = await prisma.projectObject.findMany({
    where: {
      architectId: user.id,
      lifecycle: { not: 'DELETED' },
    },
    orderBy: { createdAt: 'desc' },
  })

  const canCreateFree = await architectCanCreateFreeObject(user.id)

  return NextResponse.json({
    objects: objects.map(serializeObject),
    canCreateFree,
    pricing: {
      newObjectRub: getObjectPriceRub(),
      storageMonths: getObjectStorageMonths(),
      storageGb: Number(getObjectStorageLimitBytes()) / (1024 * 1024 * 1024),
    },
  })
}

export async function POST(request: NextRequest) {
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

  const title =
    typeof (body as { title?: unknown }).title === 'string'
      ? (body as { title: string }).title.trim()
      : ''
  const description =
    typeof (body as { description?: unknown }).description === 'string'
      ? (body as { description: string }).description.trim()
      : ''
  const address =
    typeof (body as { address?: unknown }).address === 'string'
      ? (body as { address: string }).address.trim()
      : ''

  if (!title || title.length < 2) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  const canFree = await architectCanCreateFreeObject(user.id)
  if (!canFree) {
    return NextResponse.json(
      {
        error: 'payment_required',
        priceRub: getObjectPriceRub(),
        message: 'First object is free; next objects require payment',
      },
      { status: 402 },
    )
  }

  try {
    const object = await createFreeTrialObject({
      architectId: user.id,
      title,
      description,
      address,
    })
    return NextResponse.json({ success: true, object: serializeObject(object) })
  } catch (error) {
    if (error instanceof Error && error.message === 'free_trial_used') {
      return NextResponse.json({ error: 'payment_required' }, { status: 402 })
    }
    console.error('[objects] create failed', error)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
