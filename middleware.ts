import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'

const handleI18nRouting = createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
})

// Vercel geo headers (e.g. cf-ipcity with accented names) can be forwarded as
// x-middleware-request-* response headers. Non-ASCII values break Edge middleware.
function stripNonAsciiResponseHeaders(response: NextResponse): NextResponse {
  const keysToDelete: string[] = []
  response.headers.forEach((value, key) => {
    if (/[^\x00-\x7F]/.test(value)) {
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
  matcher: ['/', '/(ru|en)/:path*'],
}
