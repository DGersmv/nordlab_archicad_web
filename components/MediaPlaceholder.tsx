import type { Locale, LocalizedText } from '@/content/types'
import { pickLocalized } from '@/lib/locale'

type MediaPlaceholderProps = {
  text: LocalizedText
  locale: Locale
  variant?: 'page' | 'card'
}

export default function MediaPlaceholder({
  text,
  locale,
  variant = 'page',
}: MediaPlaceholderProps) {
  if (variant === 'card') {
    return (
      <span className="font-mono text-xs text-graphite">{pickLocalized(text, locale)}</span>
    )
  }

  return (
    <div className="flex aspect-video max-w-4xl items-center justify-center border border-hairline font-mono text-sm text-graphite">
      {pickLocalized(text, locale)}
    </div>
  )
}
