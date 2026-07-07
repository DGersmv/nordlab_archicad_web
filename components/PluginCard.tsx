import { Link } from '@/i18n/navigation'
import type { FeatureBlock, Locale } from '@/content/types'
import { pickLocalized } from '@/lib/locale'
import PluginCardPreview from './PluginCardPreview'
import PluginImageCarousel from './PluginImageCarousel'
import MediaPlaceholder from './MediaPlaceholder'
import SolutionBadge from './SolutionBadge'

type PluginCardProps = {
  block: FeatureBlock
  locale: Locale
}

export default function PluginCard({ block, locale }: PluginCardProps) {
  const versions = block.compatibility.map((r) => r.version).join(' · ')
  const previewVideo = block.videos?.[0]
  const previewImages = !previewVideo ? block.images : undefined
  const ctaHref = block.download?.url ?? `/shop?plugin=${encodeURIComponent(block.slug)}`
  const ctaLabel = block.download
    ? locale === 'ru'
      ? 'Скачать'
      : 'Download'
    : locale === 'ru'
      ? 'Купить'
      : 'Buy'

  return (
    <article className="group flex flex-col border border-hairline bg-paper transition-colors duration-150 hover:border-pen">
      <Link
        href={`/plugins/${block.slug}`}
        className="flex flex-col no-underline"
      >
      <div className="flex aspect-video items-center justify-center overflow-hidden border-b border-hairline bg-paper">
        {previewVideo ? (
          <PluginCardPreview src={previewVideo.src} poster={previewVideo.poster} />
        ) : previewImages?.length ? (
          <PluginImageCarousel images={previewImages} locale={locale} variant="card" />
        ) : block.mediaPlaceholder ? (
          <MediaPlaceholder text={block.mediaPlaceholder} locale={locale} variant="card" />
        ) : (
          <span className="font-mono text-xs text-graphite">[CONTENT: poster]</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 font-mono text-xs text-graphite">
              {String(block.order).padStart(2, '0')}
            </p>
            <h3 className="text-lead font-semibold text-ink group-hover:text-pen">
              {pickLocalized(block.name, locale)}
            </h3>
          </div>
          <span className="shrink-0 font-mono text-lg text-pen" aria-hidden>
            →
          </span>
        </div>
        <p className="text-sm text-graphite">{pickLocalized(block.tagline, locale)}</p>
        <div className="flex flex-wrap gap-1.5">
          {block.solutions.map((id) => (
            <SolutionBadge key={id} id={id} />
          ))}
        </div>
        <p className="mt-auto font-mono text-xs text-graphite">AC {versions}</p>
      </div>
      </Link>
      <div className="px-5 pb-5">
        {block.download ? (
          block.download.url.startsWith('/') ? (
            <Link
              href={block.download.url}
              className="inline-flex items-center bg-pen px-4 py-2 font-mono text-xs text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
            >
              {ctaLabel}
            </Link>
          ) : (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-pen px-4 py-2 font-mono text-xs text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
            >
              {ctaLabel}
            </a>
          )
        ) : (
          <Link
            href={ctaHref}
            className="inline-flex items-center border border-hairline px-4 py-2 font-mono text-xs text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </article>
  )
}
