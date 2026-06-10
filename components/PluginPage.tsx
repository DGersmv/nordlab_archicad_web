import { getTranslations } from 'next-intl/server'
import type { FeatureBlock, Locale } from '@/content/types'
import { pickLocalized, pickLocalizedList } from '@/lib/locale'
import CompatTable from './CompatTable'
import ContactCTA from './ContactCTA'
import VideoFigure from './VideoFigure'
import PluginImageCarousel from './PluginImageCarousel'
import MediaPlaceholder from './MediaPlaceholder'
import DimensionRule from './DimensionRule'
import ArchicadLogo from './ArchicadLogo'
import SolutionBadge from './SolutionBadge'

function showMediaPlaceholder(block: FeatureBlock): boolean {
  return !block.videos?.length && !block.images?.length && !!block.mediaPlaceholder
}

function showDemoPlaceholder(block: FeatureBlock): boolean {
  return !block.videos?.length && !block.images?.length && !block.download && !block.mediaPlaceholder
}

function mediaRuleLabel(block: FeatureBlock, locale: Locale): string {
  if (block.images?.length && !block.videos?.length) {
    return locale === 'ru' ? 'превью' : 'preview'
  }
  return locale === 'ru' ? 'демо' : 'demo'
}

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

      {(block.videos?.length ||
        block.images?.length ||
        showMediaPlaceholder(block) ||
        showDemoPlaceholder(block)) && (
        <DimensionRule label={mediaRuleLabel(block, locale)} className="max-w-3xl" />
      )}

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
      ) : block.images?.length ? (
        <div className="max-w-4xl">
          <PluginImageCarousel images={block.images} locale={locale} />
        </div>
      ) : showMediaPlaceholder(block) ? (
        <MediaPlaceholder text={block.mediaPlaceholder!} locale={locale} />
      ) : showDemoPlaceholder(block) ? (
        <div className="flex aspect-video max-w-4xl items-center justify-center border border-hairline font-mono text-sm text-graphite">
          [CONTENT: demo video]
        </div>
      ) : null}

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

      {block.download ? (
        <div className="mt-16 max-w-3xl">
          <a
            href={block.download.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-pen px-6 py-3 font-mono text-sm text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
          >
            {pickLocalized(block.download.label, locale)}
          </a>
        </div>
      ) : null}

      <div className="mt-16 max-w-3xl">
        <ContactCTA />
      </div>
    </article>
  )
}
