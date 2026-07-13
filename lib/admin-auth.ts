import type { NextRequest } from 'next/server'

export function getAdminSecret(request: NextRequest): string {
  const bearer = request.headers.get('authorization')
  if (bearer?.startsWith('Bearer ')) {
    return bearer.slice('Bearer '.length).trim()
  }

  return request.headers.get('x-license-admin-secret')?.trim() || ''
}

export function isAdminAuthorized(request: NextRequest): boolean {
  const configuredSecret = process.env.LICENSE_ADMIN_SECRET?.trim()
  if (!configuredSecret) return false

  const providedSecret = getAdminSecret(request)
  return Boolean(providedSecret && providedSecret === configuredSecret)
}
