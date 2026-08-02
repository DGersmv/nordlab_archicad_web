import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import ArchitectLoginForm from '@/components/ArchitectLoginForm'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth.login' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function LoginPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('auth.login')

  return (
    <section className="site-container py-12 md:py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink md:text-4xl">{t('title')}</h1>
        <p className="mt-3 text-graphite">{t('lead')}</p>
      </div>
      <div className="mt-10">
        <ArchitectLoginForm />
      </div>
    </section>
  )
}
