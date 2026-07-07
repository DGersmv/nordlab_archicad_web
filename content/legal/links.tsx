import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/content/types'
import { company } from '@/content/company'

const linkClass = 'text-pen underline-offset-4 hover:underline'

type AppHref = Parameters<typeof getPathname>[0]['href']

export function localizedSiteUrl(locale: Locale) {
  return `${company.siteUrl}${getPathname({ locale, href: '/' })}`
}

export function createLegalLink(locale: Locale) {
  return (href: string, text: string) => {
    if (href.startsWith('mailto:')) {
      return (
        <a href={href} className={linkClass}>
          {text}
        </a>
      )
    }

    if (href.startsWith('http')) {
      const homeUrl = localizedSiteUrl(locale)
      const target = href === company.siteUrl || href === `${company.siteUrl}/` ? homeUrl : href
      return (
        <a href={target} className={linkClass}>
          {text}
        </a>
      )
    }

    return (
      <Link href={href as AppHref} locale={locale} className={linkClass}>
        {text}
      </Link>
    )
  }
}
