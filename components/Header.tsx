'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'

const navItems = [
  { key: 'plugins', href: '/#plugins' as const },
  { key: 'manufacturers', href: '/for-manufacturers' as const },
  { key: 'custom', href: '/custom' as const },
  { key: 'about', href: '/about' as const },
  { key: 'changelog', href: '/changelog' as const },
]

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const otherLocale = locale === 'en' ? 'ru' : 'en'

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/95 backdrop-blur-sm">
      <div className="site-container flex h-14 items-center gap-6 md:h-16 md:gap-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink no-underline">
          Nordlab
        </Link>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm text-graphite no-underline transition-colors duration-150 hover:text-pen"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href={pathname}
            locale={otherLocale}
            className="border border-hairline px-2.5 py-1 font-mono text-xs uppercase text-graphite no-underline transition-colors duration-150 hover:border-pen hover:text-pen"
          >
            {otherLocale}
          </Link>
          <a
            href="#contact"
            className="hidden bg-pen px-4 py-2 font-mono text-xs text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline sm:inline-block"
          >
            {t('contact')}
          </a>
        </div>
      </div>
    </header>
  )
}
