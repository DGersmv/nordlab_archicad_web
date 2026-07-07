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
  searchParams?: { plugin?: string; machineId?: string }
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
    highlights: block.whatItDoes[locale],
    isFree: Boolean(block.download),
    downloadUrl: block.download?.url,
  }))

  const selectedPluginSlug =
    searchParams?.plugin && plugins.some((plugin) => plugin.slug === searchParams.plugin)
      ? searchParams.plugin
      : plugins[0]?.slug

  const highlights = t.raw('highlights') as string[]
  const trustPoints = t.raw('trustPoints') as string[]
  const machineId = searchParams?.machineId?.trim()

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
        <h1 className="text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 max-w-3xl text-lead text-graphite">{t('lead')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#order-form"
            className="inline-flex items-center bg-pen px-6 py-3 font-mono text-sm text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
          >
            {t('primaryCta')}
          </a>
          <a
            href="/activate"
            className="inline-flex items-center border border-hairline px-6 py-3 font-mono text-sm text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen hover:no-underline"
          >
            {t('secondaryCta')}
          </a>
        </div>
      </header>

      <DimensionRule label={locale === 'ru' ? 'покупка' : 'purchase'} className="max-w-4xl" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-8">
          <div className="grid gap-5">
            {plugins.map((plugin) => (
              <article key={plugin.slug} className="border border-hairline p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-display text-ink">{plugin.name}</h2>
                      <span className="font-mono text-xs uppercase text-pen">{t('manualBadge')}</span>
                    </div>
                    <p className="mt-3 text-lead text-graphite">{plugin.tagline}</p>
                  </div>
                </div>

                <ul className="mt-6 grid gap-3 md:grid-cols-2">
                  {plugin.highlights.slice(0, 4).map((item) => (
                    <li key={item} className="border-l border-hairline pl-4 text-sm text-ink">
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`?plugin=${encodeURIComponent(plugin.slug)}${machineId ? `&machineId=${encodeURIComponent(machineId)}` : ''}#order-form`}
                    className="inline-flex items-center bg-pen px-5 py-2.5 font-mono text-xs text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
                  >
                    {t('selectPaid')}
                  </a>
                  <a
                    href={`/plugins/${plugin.slug}`}
                    className="inline-flex items-center border border-hairline px-5 py-2.5 font-mono text-xs text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen hover:no-underline"
                  >
                    {t('detailsCta')}
                  </a>
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

          <section className="max-w-3xl border border-hairline p-6 md:p-8">
            <h2 className="text-display text-ink">{t('trustTitle')}</h2>
            <ul className="mt-6 space-y-4 border-l border-hairline pl-5">
              {trustPoints.map((item) => (
                <li key={item} className="text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </section>

        <div id="order-form" className="space-y-8">
          {machineId ? (
            <div className="border border-hairline p-5">
              <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('machineLabel')}</p>
              <p className="mt-2 break-all font-mono text-sm text-ink">{machineId}</p>
            </div>
          ) : null}
          <PluginPurchaseForm
            plugins={plugins}
            initialPluginSlug={selectedPluginSlug}
            machineId={machineId}
          />
          <ContactCTA compact />
        </div>
      </div>
    </div>
  )
}
