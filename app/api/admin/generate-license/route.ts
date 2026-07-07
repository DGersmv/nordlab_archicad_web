import { NextRequest, NextResponse } from 'next/server'
import { generateLicenseKey, isLicensePluginSlug, LICENSE_PRICES } from '@/lib/license'

export const runtime = 'nodejs'

function getAdminSecret(request: NextRequest): string {
  const bearer = request.headers.get('authorization')
  if (bearer?.startsWith('Bearer ')) {
    return bearer.slice('Bearer '.length).trim()
  }

  return request.headers.get('x-license-admin-secret')?.trim() || ''
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.LICENSE_ADMIN_SECRET?.trim()
  if (!configuredSecret) {
    return NextResponse.json(
      { error: 'not_configured', message: 'LICENSE_ADMIN_SECRET is not configured.' },
      { status: 503 },
    )
  }

  const providedSecret = getAdminSecret(request)
  if (!providedSecret || providedSecret !== configuredSecret) {
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
