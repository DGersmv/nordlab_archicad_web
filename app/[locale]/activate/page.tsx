import { getTranslations, setRequestLocale } from 'next-intl/server'
import DimensionRule from '@/components/DimensionRule'
import ContactCTA from '@/components/ContactCTA'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
  searchParams?: { machineId?: string }
}

export default async function ActivatePage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('activate')
  const machineId = searchParams?.machineId?.trim()
  const shopHref = machineId
    ? (`/shop?machineId=${encodeURIComponent(machineId)}#pay-form` as const)
    : '/shop#pay-form'

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
        <h1 className="mt-3 text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 max-w-3xl text-lead text-graphite">{t('lead')}</p>
      </header>

      <DimensionRule label={locale === 'ru' ? 'активация' : 'activation'} className="max-w-4xl" />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-8">
          <div className="border border-hairline p-6 md:p-8">
            <h2 className="text-display text-ink">{t('machineTitle')}</h2>
            <p className="mt-2 text-graphite">{t('machineLead')}</p>
            <div className="mt-5 border border-hairline bg-paper p-4">
              <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('machineLabel')}</p>
              <p className="mt-2 break-all font-mono text-sm text-ink">
                {machineId || t('machineMissing')}
              </p>
            </div>
          </div>

          <div className="border border-hairline p-6 md:p-8">
            <h2 className="text-display text-ink">{t('nextTitle')}</h2>
            <ol className="mt-6 space-y-4 border-l border-hairline pl-5">
              {(t.raw('steps') as string[]).map((step) => (
                <li key={step} className="text-ink">
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-6 border border-hairline bg-paper p-4">
              <p className="font-mono text-xs uppercase tracking-wide text-graphite">OpeningMaster price</p>
              <p className="mt-2 font-mono text-sm text-ink">3000 RUB / 30 EUR</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="border border-hairline p-6 md:p-8">
            <h2 className="text-display text-ink">{t('checkoutTitle')}</h2>
            <p className="mt-2 text-graphite">{t('checkoutLead')}</p>

            <div className="mt-6 grid gap-4">
              <Link
                href={shopHref}
                className="inline-flex items-center justify-center bg-pen px-6 py-3 font-mono text-sm text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
              >
                {t('buyRu')}
              </Link>
              <Link
                href="/custom"
                className="inline-flex items-center justify-center border border-hairline px-6 py-3 font-mono text-sm text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen hover:no-underline"
              >
                {t('needInvoice')}
              </Link>
            </div>
          </div>

          <div className="border border-hairline p-6 md:p-8">
            <h2 className="text-display text-ink">{t('helpTitle')}</h2>
            <p className="mt-2 text-graphite">{t('helpLead')}</p>
            <div className="mt-5">
              <Link
                href="/custom"
                className="inline-flex items-center border border-hairline px-5 py-2.5 font-mono text-sm text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen"
              >
                {t('helpCta')}
              </Link>
            </div>
          </div>

          <ContactCTA compact />
        </section>
      </div>
    </div>
  )
}
