import type { ObjectLifecycle, ProjectObject } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const GB = 1024 * 1024 * 1024

export function getObjectPriceRub(): number {
  const v = Number(process.env.CABINET_OBJECT_PRICE_RUB?.trim() ?? '2500')
  return Number.isFinite(v) && v > 0 ? v : 2500
}

export function getObjectRenewPriceRub(): number {
  const v = Number(process.env.CABINET_OBJECT_RENEW_PRICE_RUB?.trim() ?? '500')
  return Number.isFinite(v) && v > 0 ? v : 500
}

export function getObjectStorageMonths(): number {
  const v = Number(process.env.CABINET_OBJECT_STORAGE_MONTHS?.trim() ?? '12')
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 12
}

export function getObjectReadonlyMonths(): number {
  const v = Number(process.env.CABINET_OBJECT_READONLY_MONTHS?.trim() ?? '6')
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 6
}

export function getObjectDeleteWarnDays(): number {
  const v = Number(process.env.CABINET_OBJECT_DELETE_WARN_DAYS?.trim() ?? '30')
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 30
}

export function getObjectStorageLimitBytes(): bigint {
  const gb = Number(process.env.CABINET_OBJECT_STORAGE_GB?.trim() ?? '10')
  const safe = Number.isFinite(gb) && gb > 0 ? gb : 10
  return BigInt(Math.floor(safe * GB))
}

export function addMonths(from: Date, months: number): Date {
  const d = new Date(from)
  d.setMonth(d.getMonth() + months)
  return d
}

export function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
}

export async function nextInvoiceId(): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.invoiceSequence.findUnique({ where: { id: 1 } })
    if (!existing) {
      await tx.invoiceSequence.create({ data: { id: 1, nextInvId: 900000002 } })
      return 900000001
    }
    const invId = existing.nextInvId
    await tx.invoiceSequence.update({
      where: { id: 1 },
      data: { nextInvId: invId + 1 },
    })
    return invId
  })
}

export async function countArchitectObjects(architectId: string): Promise<number> {
  return prisma.projectObject.count({
    where: {
      architectId,
      lifecycle: { not: 'DELETED' },
    },
  })
}

export async function architectCanCreateFreeObject(architectId: string): Promise<boolean> {
  const count = await countArchitectObjects(architectId)
  return count === 0
}

export type ObjectAccessMode = 'full' | 'read_only' | 'gone'

export function resolveObjectLifecycle(object: Pick<ProjectObject, 'lifecycle' | 'paidUntil' | 'readOnlyAt' | 'deleteAt'>): {
  lifecycle: ObjectLifecycle
  access: ObjectAccessMode
  paidUntil: Date
  readOnlyAt: Date
  deleteAt: Date
} {
  const now = Date.now()
  const paidUntil = object.paidUntil
  const readOnlyAt =
    object.readOnlyAt ??
    (paidUntil.getTime() < now ? paidUntil : addMonths(paidUntil, 0))
  // After paidUntil → read-only starts at paidUntil
  const effectiveReadOnlyAt = paidUntil
  const effectiveDeleteAt =
    object.deleteAt ?? addMonths(effectiveReadOnlyAt, getObjectReadonlyMonths())

  if (object.lifecycle === 'DELETED' || (object.deleteAt && object.deleteAt.getTime() <= now)) {
    return {
      lifecycle: 'DELETED',
      access: 'gone',
      paidUntil,
      readOnlyAt: effectiveReadOnlyAt,
      deleteAt: effectiveDeleteAt,
    }
  }

  if (paidUntil.getTime() > now && object.lifecycle === 'ACTIVE') {
    return {
      lifecycle: 'ACTIVE',
      access: 'full',
      paidUntil,
      readOnlyAt: effectiveReadOnlyAt,
      deleteAt: effectiveDeleteAt,
    }
  }

  if (effectiveDeleteAt.getTime() <= now) {
    return {
      lifecycle: 'DELETED',
      access: 'gone',
      paidUntil,
      readOnlyAt: effectiveReadOnlyAt,
      deleteAt: effectiveDeleteAt,
    }
  }

  if (paidUntil.getTime() <= now) {
    const warnAt = addDays(effectiveDeleteAt, -getObjectDeleteWarnDays())
    return {
      lifecycle: warnAt.getTime() <= now ? 'PENDING_DELETE' : 'READ_ONLY',
      access: 'read_only',
      paidUntil,
      readOnlyAt: effectiveReadOnlyAt,
      deleteAt: effectiveDeleteAt,
    }
  }

  return {
    lifecycle: object.lifecycle,
    access: object.lifecycle === 'ACTIVE' ? 'full' : 'read_only',
    paidUntil,
    readOnlyAt: effectiveReadOnlyAt,
    deleteAt: effectiveDeleteAt,
  }
}

export async function createFreeTrialObject(input: {
  architectId: string
  title: string
  description?: string
  address?: string
}) {
  const canFree = await architectCanCreateFreeObject(input.architectId)
  if (!canFree) {
    throw new Error('free_trial_used')
  }

  const now = new Date()
  const paidUntil = addMonths(now, getObjectStorageMonths())

  return prisma.projectObject.create({
    data: {
      architectId: input.architectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      address: input.address?.trim() || null,
      lifecycle: 'ACTIVE',
      isFreeTrial: true,
      storageLimitBytes: getObjectStorageLimitBytes(),
      storageUsedBytes: BigInt(0),
      paidUntil,
      readOnlyAt: paidUntil,
      deleteAt: addMonths(paidUntil, getObjectReadonlyMonths()),
      deleteWarnAt: addDays(addMonths(paidUntil, getObjectReadonlyMonths()), -getObjectDeleteWarnDays()),
    },
  })
}

export async function createPaidObjectFromInvoice(input: {
  architectId: string
  title: string
}) {
  const now = new Date()
  const paidUntil = addMonths(now, getObjectStorageMonths())

  return prisma.projectObject.create({
    data: {
      architectId: input.architectId,
      title: input.title.trim(),
      lifecycle: 'ACTIVE',
      isFreeTrial: false,
      storageLimitBytes: getObjectStorageLimitBytes(),
      storageUsedBytes: BigInt(0),
      paidUntil,
      readOnlyAt: paidUntil,
      deleteAt: addMonths(paidUntil, getObjectReadonlyMonths()),
      deleteWarnAt: addDays(addMonths(paidUntil, getObjectReadonlyMonths()), -getObjectDeleteWarnDays()),
    },
  })
}

export async function renewObject(objectId: string) {
  const object = await prisma.projectObject.findUnique({ where: { id: objectId } })
  if (!object || object.lifecycle === 'DELETED') {
    throw new Error('object_not_found')
  }

  const base =
    object.paidUntil.getTime() > Date.now() ? object.paidUntil : new Date()
  const paidUntil = addMonths(base, getObjectStorageMonths())

  return prisma.projectObject.update({
    where: { id: objectId },
    data: {
      lifecycle: 'ACTIVE',
      paidUntil,
      readOnlyAt: paidUntil,
      deleteAt: addMonths(paidUntil, getObjectReadonlyMonths()),
      deleteWarnAt: addDays(addMonths(paidUntil, getObjectReadonlyMonths()), -getObjectDeleteWarnDays()),
    },
  })
}

export function serializeObject(object: ProjectObject) {
  const resolved = resolveObjectLifecycle(object)
  const limit = object.storageLimitBytes
  const used = object.storageUsedBytes
  return {
    id: object.id,
    title: object.title,
    description: object.description,
    address: object.address,
    isFreeTrial: object.isFreeTrial,
    lifecycle: resolved.lifecycle,
    access: resolved.access,
    paidUntil: object.paidUntil.toISOString(),
    readOnlyAt: resolved.readOnlyAt.toISOString(),
    deleteAt: resolved.deleteAt.toISOString(),
    storageLimitBytes: limit.toString(),
    storageUsedBytes: used.toString(),
    storageLimitGb: Number(limit) / GB,
    storageUsedGb: Number(used) / GB,
    createdAt: object.createdAt.toISOString(),
  }
}
