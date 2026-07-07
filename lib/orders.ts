import { promises as fs } from 'fs'
import path from 'path'
import type { LicensePluginSlug } from '@/lib/license'

export type OrderStatus = 'pending' | 'paid'

export type PaymentOrder = {
  invId: number
  pluginSlug: LicensePluginSlug
  machineId: string
  email: string
  amount: number
  status: OrderStatus
  isTest: boolean
  licenseKey?: string
  createdAt: string
  paidAt?: string
}

type OrdersFile = {
  nextInvId: number
  orders: PaymentOrder[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

async function readOrdersFile(): Promise<OrdersFile> {
  await ensureDataDir()
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf8')
    const parsed = JSON.parse(raw) as OrdersFile
    if (!Array.isArray(parsed.orders) || typeof parsed.nextInvId !== 'number') {
      throw new Error('Invalid orders file')
    }
    return parsed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const initial: OrdersFile = {
        nextInvId: Number(String(Date.now()).slice(-9)),
        orders: [],
      }
      await writeOrdersFile(initial)
      return initial
    }
    throw error
  }
}

async function writeOrdersFile(data: OrdersFile): Promise<void> {
  await ensureDataDir()
  const tempFile = `${ORDERS_FILE}.tmp`
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tempFile, ORDERS_FILE)
}

export async function createOrder(input: {
  pluginSlug: LicensePluginSlug
  machineId: string
  email: string
  amount: number
  isTest: boolean
}): Promise<PaymentOrder> {
  const file = await readOrdersFile()
  const invId = file.nextInvId
  file.nextInvId += 1

  const order: PaymentOrder = {
    invId,
    pluginSlug: input.pluginSlug,
    machineId: input.machineId.trim().toUpperCase(),
    email: input.email.trim().toLowerCase(),
    amount: input.amount,
    status: 'pending',
    isTest: input.isTest,
    createdAt: new Date().toISOString(),
  }

  file.orders.push(order)
  await writeOrdersFile(file)
  return order
}

export async function getOrderByInvId(invId: number): Promise<PaymentOrder | null> {
  const file = await readOrdersFile()
  return file.orders.find((order) => order.invId === invId) ?? null
}

export async function markOrderPaid(invId: number, licenseKey: string): Promise<PaymentOrder | null> {
  const file = await readOrdersFile()
  const order = file.orders.find((entry) => entry.invId === invId)
  if (!order) return null

  order.status = 'paid'
  order.licenseKey = licenseKey
  order.paidAt = new Date().toISOString()
  await writeOrdersFile(file)
  return order
}
