import { NextRequest, NextResponse } from 'next/server'

const HEADER_LOCALE_NAME = 'X-NEXT-INTL-LOCALE'
const LOCALE_COOKIE = 'NEXT_LOCALE'
const locales = ['en', 'ru'] as const
const defaultLocale = 'en'

type Locale = (typeof locales)[number]

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

function hasNonAscii(value: string) {
  return /[^\x00-\x7F]/.test(value)
}

function sanitizeHeaders(headers: Headers) {
  const keysToDelete: string[] = []
  headers.forEach((value, key) => {
    if (hasNonAscii(value)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => headers.delete(key))
}

function withSanitizedRequest(request: NextRequest) {
  const headers = new Headers(request.headers)
  sanitizeHeaders(headers)
  return headers
}

export default function middleware(request: NextRequest) {
  const requestHeaders = withSanitizedRequest(request)
  const { pathname } = request.nextUrl
  const segment = pathname.split('/')[1]
  const host = request.headers.get('host') ?? ''

  if (host === 'pay.nordlab.net') {
    if (pathname === '/' || pathname === '/en') {
      const url = request.nextUrl.clone()
      url.pathname = '/activate'
      const response = NextResponse.redirect(url)
      sanitizeHeaders(response.headers)
      return response
    }

    if (pathname === '/ru') {
      const url = request.nextUrl.clone()
      url.pathname = '/ru/activate'
      const response = NextResponse.redirect(url)
      sanitizeHeaders(response.headers)
      return response
    }
  }

  if (isLocale(segment)) {
    if (segment === defaultLocale) {
      const stripped =
        pathname === `/${defaultLocale}`
          ? '/'
          : pathname.slice(`/${defaultLocale}`.length) || '/'
      const url = request.nextUrl.clone()
      url.pathname = stripped
      const response = NextResponse.redirect(url)
      sanitizeHeaders(response.headers)
      return response
    }

    requestHeaders.set(HEADER_LOCALE_NAME, segment)
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.cookies.set(LOCALE_COOKIE, segment, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    sanitizeHeaders(response.headers)
    return response
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookieLocale === 'ru') {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? '/ru' : `/ru${pathname}`
    const response = NextResponse.redirect(url)
    sanitizeHeaders(response.headers)
    return response
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`
  requestHeaders.set(HEADER_LOCALE_NAME, defaultLocale)
  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  response.cookies.set(LOCALE_COOKIE, defaultLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  sanitizeHeaders(response.headers)
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
