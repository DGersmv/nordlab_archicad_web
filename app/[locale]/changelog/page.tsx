import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getGlobalChangelog } from '@/content/changelog'
import ChangelogList from '@/components/ChangelogList'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export default async function ChangelogPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('changelog')
  const entries = getGlobalChangelog()

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-3xl">
        <h1 className="text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 text-lead text-graphite">{t('lead')}</p>
      </header>

      <div className="mt-12 max-w-3xl">
        <ChangelogList entries={entries} locale={locale} showPlugin />
      </div>
    </div>
  )
}
