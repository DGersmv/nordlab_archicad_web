import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'notFound' })

  return (
    <div className="site-container py-20 text-center">
      <h1 className="text-display text-ink">404</h1>
      <p className="mt-4 text-graphite">{t('message')}</p>
      <Link href="/" className="mt-8 inline-block font-mono text-sm">
        {t('home')}
      </Link>
    </div>
  )
}
