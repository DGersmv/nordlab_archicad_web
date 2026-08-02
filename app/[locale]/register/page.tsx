import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import ArchitectRegisterForm from '@/components/ArchitectRegisterForm'
import type { Locale } from '@/content/types'
import { getObjectPriceRub, getObjectStorageMonths } from '@/lib/objects'

type Props = {
  params: { locale: Locale }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.register' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function RegisterPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('auth.register')

  return (
    <section className="site-container py-12 md:py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">{t('title')}</h1>
        <p className="mt-3 text-graphite">
          {t('lead', {
            price: getObjectPriceRub(),
            months: getObjectStorageMonths(),
          })}
        </p>
      </div>
      <div className="mt-10">
        <ArchitectRegisterForm />
      </div>
    </section>
  )
}
