import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import ContactCTA from '@/components/ContactCTA'
import DimensionRule from '@/components/DimensionRule'
import LegalEntityOrderForm from '@/components/LegalEntityOrderForm'
import { getFeatureBlocks } from '@/content/plugins'
import type { Locale } from '@/content/types'
import { isLicensePluginSlug } from '@/lib/license'
import { pickLocalized } from '@/lib/locale'

type Props = {
  params: { locale: Locale }
  searchParams?: { machineId?: string; plugin?: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legalPayment' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function LegalPaymentPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('legalPayment')
  const steps = t.raw('steps') as string[]

  const pluginSlug = searchParams?.plugin?.trim().toLowerCase()
  const machineId = searchParams?.machineId?.trim()

  const plugins = getFeatureBlocks().map((block) => ({
    slug: block.slug,
    name: pickLocalized(block.name, locale),
  }))

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
        <h1 className="mt-3 text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 text-lead text-graphite">{t('lead')}</p>
      </header>

      <DimensionRule label={locale === 'ru' ? 'оплата' : 'payment'} className="max-w-3xl" />

      <section className="max-w-3xl border border-hairline p-6 md:p-8">
        <h2 className="text-display text-ink">{t('processTitle')}</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-ink">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-graphite">{t('feedbackLead')}</p>
      </section>

      <div className="mt-10 max-w-3xl">
        <LegalEntityOrderForm
          plugins={plugins}
          initialPluginSlug={pluginSlug && isLicensePluginSlug(pluginSlug) ? pluginSlug : undefined}
          initialMachineId={machineId}
        />
      </div>

      <div className="mt-16 max-w-3xl">
        <ContactCTA compact />
      </div>
    </div>
  )
}
