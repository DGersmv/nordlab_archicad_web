import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

// Vercel geo headers (e.g. cf-ipcity with accented names) can be forwarded as
// x-middleware-request-* response headers. Non-ASCII values break Edge middleware.
function stripNonAsciiResponseHeaders(response: NextResponse): NextResponse {
  const keysToDelete: string[] = []
  response.headers.forEach((value, key) => {
    if (key.startsWith('x-middleware-request-') && /[^\x00-\x7F]/.test(value)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => response.headers.delete(key))
  return response
}

export default function middleware(request: NextRequest) {
  return stripNonAsciiResponseHeaders(handleI18nRouting(request))
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
