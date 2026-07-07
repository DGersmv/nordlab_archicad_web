import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'payment.fail' })
  return {
    title: t('metaTitle'),
  }
}

export default async function PaymentFailPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('payment.fail')

  return (
    <div className="site-container py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
        <h1 className="mt-3 text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 text-lead text-graphite">{t('lead')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center bg-pen px-6 py-3 font-mono text-sm text-paper no-underline transition-opacity duration-150 hover:opacity-90"
          >
            {t('retryCta')}
          </Link>
          <Link
            href="/custom"
            className="inline-flex items-center border border-hairline px-6 py-3 font-mono text-sm text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen"
          >
            {t('helpCta')}
          </Link>
        </div>
      </div>
    </div>
  )
}
