import { getTranslations, setRequestLocale } from 'next-intl/server'
import ContactCTA from '@/components/ContactCTA'
import DimensionRule from '@/components/DimensionRule'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export default async function ManufacturersPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('manufacturers')
  const bullets = t.raw('bullets') as string[]

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-3xl">
        <h1 className="text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 text-lead text-graphite">{t('lead')}</p>
      </header>

      <DimensionRule label="GDL" className="max-w-3xl" />

      <ul className="max-w-3xl space-y-4 border-l border-hairline pl-5">
        {bullets.map((item) => (
          <li key={item} className="text-ink">
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-12 flex aspect-video max-w-4xl items-center justify-center border border-dashed border-hairline font-mono text-sm text-graphite">
        [CONTENT: manufacturer cases / screenshots]
      </div>

      <div className="mt-16 max-w-3xl">
        <ContactCTA />
      </div>
    </div>
  )
}
