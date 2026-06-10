import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import ArchicadLogo from './ArchicadLogo'
import RuledSurfaceHero from './hero/RuledSurfaceHero'

export default async function Hero() {
  const t = await getTranslations('home')

  return (
    <section className="site-container grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
      <div>
        <h1 className="text-display-xl text-ink">{t('heroTitle')}</h1>
        <p className="mt-5 max-w-prose text-lead text-graphite">{t('heroSubtitle')}</p>
        <div className="mt-6">
          <ArchicadLogo size="sm" />
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/#plugins"
            className="bg-pen px-6 py-3 font-mono text-sm text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
          >
            {t('browsePlugins')}
          </Link>
          <Link
            href="/custom"
            className="border border-hairline px-6 py-3 font-mono text-sm text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen hover:no-underline"
          >
            {t('customDev')}
          </Link>
        </div>
      </div>
      <div>
        <RuledSurfaceHero />
        <p className="mt-2 text-center font-mono text-xs text-graphite">
          {t('heroInteractiveCaption')}
        </p>
      </div>
    </section>
  )
}
