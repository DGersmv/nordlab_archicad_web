import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getFeatureBlocks } from '@/content/plugins'
import Hero from '@/components/Hero'
import DimensionRule from '@/components/DimensionRule'
import PluginCard from '@/components/PluginCard'
import ContactCTA from '@/components/ContactCTA'
import RevealSection from '@/components/RevealSection'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export default async function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('home')

  return (
    <>
      <Hero />

      <RevealSection id="plugins" className="site-container py-16 md:py-20">
        <DimensionRule label={locale === 'ru' ? 'каталог' : 'catalog'} />
        <h2 className="text-display text-ink">{t('catalogTitle')}</h2>
        <p className="mt-3 max-w-2xl text-graphite">{t('catalogLead')}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {getFeatureBlocks().map((block) => (
            <PluginCard key={block.slug} block={block} locale={locale} />
          ))}
        </div>
      </RevealSection>

      <RevealSection className="site-container py-16 md:py-20">
        <DimensionRule label={locale === 'ru' ? 'автор' : 'author'} />
        <h2 className="text-display text-ink">{t('whoTitle')}</h2>
        <p className="mt-3 max-w-2xl text-graphite">{t('whoLead')}</p>
      </RevealSection>

      <RevealSection id="contact" className="site-container pb-20 pt-4">
        <DimensionRule label={locale === 'ru' ? 'контакт' : 'contact'} />
        <h2 className="mb-8 text-display text-ink">{t('contactTitle')}</h2>
        <div className="max-w-3xl">
          <ContactCTA />
        </div>
      </RevealSection>
    </>
  )
}
