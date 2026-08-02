import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import CabinetObjectsPanel from '@/components/CabinetObjectsPanel'
import LogoutLink from '@/components/LogoutLink'
import { getCurrentUser } from '@/lib/auth'
import type { Locale } from '@/content/types'
import { Link } from '@/i18n/navigation'
import {
  getObjectPriceRub,
  getObjectRenewPriceRub,
  getObjectStorageMonths,
} from '@/lib/objects'

type Props = {
  params: { locale: Locale }
  searchParams?: {
    objectPaid?: string
    objectRenewed?: string
    payment?: string
  }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'cabinet.home' })
  return { title: t('metaTitle') }
}

export default async function CabinetHomePage({
  params: { locale },
  searchParams,
}: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('cabinet.home')
  const user = await getCurrentUser()
  if (!user) {
    redirect(locale === 'ru' ? '/ru/login' : '/login')
  }

  return (
    <section className="site-container py-12 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">
            {t('welcome', { name: user.name || user.email })}
          </h1>
          <p className="mt-2 max-w-2xl text-graphite">
            {t('lead', {
              price: getObjectPriceRub(),
              renew: getObjectRenewPriceRub(),
              months: getObjectStorageMonths(),
            })}
          </p>
        </div>
        <LogoutLink label={t('logout')} />
      </div>

      <div className="mt-10">
        <CabinetObjectsPanel
          justPaid={searchParams?.objectPaid === '1' || searchParams?.objectRenewed === '1'}
          paymentFailed={searchParams?.payment === 'fail'}
        />
      </div>

      <p className="mt-10 text-sm text-graphite">
        <Link href="/shop" className="text-pen underline-offset-4 hover:underline">
          {t('shopLink')}
        </Link>
      </p>
    </section>
  )
}
