import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import DimensionRule from '@/components/DimensionRule'
import PluginPurchaseForm from '@/components/PluginPurchaseForm'
import ContactCTA from '@/components/ContactCTA'
import { getFeatureBlocks } from '@/content/plugins'
import type { Locale } from '@/content/types'
import { pickLocalized } from '@/lib/locale'

type Props = {
  params: { locale: Locale }
  searchParams?: { plugin?: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'shop' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function ShopPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('shop')
  const plugins = getFeatureBlocks().map((block) => ({
    slug: block.slug,
    name: pickLocalized(block.name, locale),
    tagline: pickLocalized(block.tagline, locale),
    isFree: Boolean(block.download),
    downloadUrl: block.download?.url,
  }))

  const selectedPluginSlug =
    searchParams?.plugin && plugins.some((plugin) => plugin.slug === searchParams.plugin)
      ? searchParams.plugin
      : plugins[0]?.slug

  const highlights = t.raw('highlights') as string[]

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-4xl">
        <h1 className="text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 max-w-3xl text-lead text-graphite">{t('lead')}</p>
      </header>

      <DimensionRule label={locale === 'ru' ? 'покупка' : 'purchase'} className="max-w-4xl" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {plugins.map((plugin) => (
              <article key={plugin.slug} className="border border-hairline p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lead font-semibold text-ink">{plugin.name}</h2>
                  <span className="font-mono text-xs uppercase text-pen">
                    {plugin.isFree ? t('freeBadge') : t('manualBadge')}
                  </span>
                </div>
                <p className="mt-3 text-sm text-graphite">{plugin.tagline}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={`?plugin=${encodeURIComponent(plugin.slug)}#order-form`}
                    className="inline-flex items-center border border-hairline px-4 py-2 font-mono text-xs text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen"
                  >
                    {plugin.isFree ? t('selectFree') : t('selectPaid')}
                  </a>
                  {plugin.downloadUrl ? (
                    <a
                      href={plugin.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-pen px-4 py-2 font-mono text-xs text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
                    >
                      {t('downloadNow')}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <section className="max-w-3xl">
            <h2 className="text-display text-ink">{t('howItWorksTitle')}</h2>
            <ul className="mt-6 space-y-4 border-l border-hairline pl-5">
              {highlights.map((item) => (
                <li key={item} className="text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </section>

        <div id="order-form" className="space-y-8">
          <PluginPurchaseForm plugins={plugins} initialPluginSlug={selectedPluginSlug} />
          <ContactCTA compact />
        </div>
      </div>
    </div>
  )
}
