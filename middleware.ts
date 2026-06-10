import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const handleI18nRouting = createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
})

function hasNonAscii(value: string) {
  return /[^\x00-\x7F]/.test(value)
}

function sanitizeRequest(request: NextRequest) {
  const headers = new Headers(request.headers)
  let changed = false

  request.headers.forEach((value, key) => {
    if (hasNonAscii(value)) {
      headers.delete(key)
      changed = true
    }
  })

  return changed ? new NextRequest(request.url, { headers }) : request
}

// Vercel copies request headers onto x-middleware-request-* response headers.
// Non-ASCII geo values (e.g. cf-ipcity: Montréal) crash Edge middleware on Vercel.
function sanitizeResponse(response: NextResponse) {
  const keysToDelete: string[] = []
  response.headers.forEach((value, key) => {
    if (hasNonAscii(value)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => response.headers.delete(key))
  return response
}

export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(sanitizeRequest(request))
  return sanitizeResponse(response)
}

export const config = {
  matcher: [
    '/',
    '/(ru|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
