import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/admin-auth'
import { generateLicenseKey, isLicensePluginSlug, LICENSE_PRICES } from '@/lib/license'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!process.env.LICENSE_ADMIN_SECRET?.trim()) {
    return NextResponse.json(
      { error: 'not_configured', message: 'LICENSE_ADMIN_SECRET is not configured.' },
      { status: 503 },
    )
  }

  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const pluginSlug = typeof (body as { pluginSlug?: unknown })?.pluginSlug === 'string'
    ? (body as { pluginSlug: string }).pluginSlug.trim().toLowerCase()
    : ''
  const machineId = typeof (body as { machineId?: unknown })?.machineId === 'string'
    ? (body as { machineId: string }).machineId.trim()
    : ''

  if (!isLicensePluginSlug(pluginSlug) || !machineId) {
    return NextResponse.json({ error: 'validation' }, { status: 400 })
  }

  try {
    const licenseKey = generateLicenseKey(pluginSlug, machineId)
    return NextResponse.json({
      success: true,
      pluginSlug,
      machineId: machineId.toUpperCase(),
      price: LICENSE_PRICES[pluginSlug],
      licenseKey,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'unsupported_plugin',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    )
  }
}
