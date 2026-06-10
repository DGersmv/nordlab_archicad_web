import { getTranslations } from 'next-intl/server'
import type { FeatureBlock, Locale } from '@/content/types'
import { pickLocalized, pickLocalizedList } from '@/lib/locale'
import CompatTable from './CompatTable'
import ContactCTA from './ContactCTA'
import VideoFigure from './VideoFigure'
import DimensionRule from './DimensionRule'
import ArchicadLogo from './ArchicadLogo'
import SolutionBadge from './SolutionBadge'

type PluginPageProps = {
  block: FeatureBlock
  locale: Locale
}

export default async function PluginPage({ block, locale }: PluginPageProps) {
  const t = await getTranslations('plugin')

  return (
    <article className="site-container py-12 md:py-16">
      <header className="max-w-3xl">
        <div className="mb-6">
          <ArchicadLogo size="md" />
        </div>
        <p className="mb-2 font-mono text-xs text-graphite">
          {String(block.order).padStart(2, '0')}
        </p>
        <h1 className="text-display-xl text-ink">{pickLocalized(block.name, locale)}</h1>
        <p className="mt-4 text-lead text-graphite">{pickLocalized(block.tagline, locale)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {block.solutions.map((id) => (
            <SolutionBadge key={id} id={id} />
          ))}
        </div>
      </header>

      <DimensionRule label={locale === 'ru' ? 'демо' : 'demo'} className="max-w-3xl" />

      {block.videos?.length ? (
        <div className="max-w-4xl space-y-8">
          {block.videos.map((video) => (
            <VideoFigure
              key={video.src}
              src={video.src}
              poster={video.poster}
              caption={video.caption}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="flex aspect-video max-w-4xl items-center justify-center border border-hairline font-mono text-sm text-graphite">
          [CONTENT: demo video]
        </div>
      )}

      <section className="mt-16 max-w-3xl">
        <h2 className="mb-6 text-display text-ink">{t('whatItDoes')}</h2>
        <ul className="space-y-3 border-l border-hairline pl-5">
          {pickLocalizedList(block.whatItDoes, locale).map((item) => (
            <li key={item} className="text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 max-w-2xl">
        <h2 className="mb-6 text-display text-ink">{t('compatibility')}</h2>
        <CompatTable rows={block.compatibility} />
      </section>

      <div className="mt-16 max-w-3xl">
        <ContactCTA />
      </div>
    </article>
  )
}
