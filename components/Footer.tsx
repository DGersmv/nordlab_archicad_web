import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { siteLinks } from '@/content/site'
import ArchicadLogo from './ArchicadLogo'

export default async function Footer() {
  const t = await getTranslations('footer')
  const nav = await getTranslations('nav')

  return (
    <footer className="border-t border-hairline">
      <div className="site-container grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-ink">Nordlab</p>
          <p className="mt-2 text-sm text-graphite">{t('tagline')}</p>
          <div className="mt-5">
            <ArchicadLogo size="sm" />
          </div>
          <p className="mt-4 font-mono text-xs text-marker">{t('developer')}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Link href="/about" className="text-graphite no-underline hover:text-pen">
            {nav('about')}
          </Link>
          <Link href="/changelog" className="text-graphite no-underline hover:text-pen">
            {nav('changelog')}
          </Link>
          <Link href="/for-manufacturers" className="text-graphite no-underline hover:text-pen">
            {nav('manufacturers')}
          </Link>
          <Link href="/custom" className="text-graphite no-underline hover:text-pen">
            {nav('custom')}
          </Link>
        </div>

        <div className="flex flex-col gap-2 font-mono text-sm">
          <a href={`mailto:${siteLinks.email}`} className="text-graphite no-underline hover:text-pen">
            {siteLinks.email}
          </a>
          <a
            href={siteLinks.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-graphite no-underline hover:text-pen"
          >
            {siteLinks.telegram}
          </a>
          {siteLinks.github && (
            <a
              href={siteLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-graphite no-underline hover:text-pen"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-hairline">
        <p className="site-container py-4 font-mono text-xs text-graphite">{t('rights')}</p>
      </div>
    </footer>
  )
}
