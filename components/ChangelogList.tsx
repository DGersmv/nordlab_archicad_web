import type { ChangelogEntry, Locale } from '@/content/types'
import { pickLocalized } from '@/lib/locale'
import { getSolutionName } from '@/content/changelog'

type ChangelogListProps = {
  entries: ChangelogEntry[]
  locale: Locale
  showPlugin?: boolean
}

export default function ChangelogList({
  entries,
  locale,
  showPlugin = false,
}: ChangelogListProps) {
  if (entries.length === 0) {
    return (
      <p className="font-mono text-sm text-graphite">[CONTENT]</p>
    )
  }

  return (
    <ul className="divide-y divide-hairline border border-hairline">
      {entries.map((entry) => (
        <li key={`${entry.pluginSlug}-${entry.date}-${entry.version}`} className="px-4 py-4">
          <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs text-graphite">
            <time dateTime={entry.date}>{entry.date}</time>
            <span>v{entry.version}</span>
            {showPlugin && (
              <span className="text-ink">{getSolutionName(entry.pluginSlug)}</span>
            )}
          </div>
          <p className="text-sm text-ink">{pickLocalized(entry.text, locale)}</p>
        </li>
      ))}
    </ul>
  )
}
