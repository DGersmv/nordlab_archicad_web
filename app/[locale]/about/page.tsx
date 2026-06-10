import { getTranslations, setRequestLocale } from 'next-intl/server'
import ContactCTA from '@/components/ContactCTA'
import DimensionRule from '@/components/DimensionRule'
import ArchicadLogo from '@/components/ArchicadLogo'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export default async function AboutPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('about')

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-3xl">
        <h1 className="text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 text-lead text-graphite">{t('lead')}</p>
      </header>

      <DimensionRule label={locale === 'ru' ? 'статус' : 'status'} className="max-w-3xl" />

      <ArchicadLogo size="md" className="mb-8" />

      <p className="max-w-3xl text-ink">{t('body')}</p>
      <p className="mt-6 font-mono text-sm text-marker">{t('status')}</p>

      <div className="mt-16 max-w-3xl">
        <ContactCTA />
      </div>
    </div>
  )
}
