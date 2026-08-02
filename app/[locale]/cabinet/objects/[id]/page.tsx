import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound, redirect } from 'next/navigation'
import LogoutLink from '@/components/LogoutLink'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveObjectLifecycle, serializeObject } from '@/lib/objects'
import type { Locale } from '@/content/types'
import { Link } from '@/i18n/navigation'

type Props = {
  params: { locale: Locale; id: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'cabinet.objectDetail' })
  return { title: t('metaTitle') }
}

export default async function CabinetObjectDetailPage({ params: { locale, id } }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('cabinet.objectDetail')
  const user = await getCurrentUser()
  if (!user) {
    redirect(locale === 'ru' ? '/ru/login' : '/login')
  }

  const object = await prisma.projectObject.findFirst({
    where: { id, architectId: user.id, lifecycle: { not: 'DELETED' } },
  })
  if (!object) notFound()

  const view = serializeObject(object)
  const resolved = resolveObjectLifecycle(object)

  return (
    <section className="site-container py-12 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/cabinet" className="font-mono text-xs text-graphite no-underline hover:text-pen">
          {t('back')}
        </Link>
        <LogoutLink label={t('logout')} />
      </div>

      <h1 className="mt-6 text-3xl font-semibold text-ink">{object.title}</h1>
      <p className="mt-2 font-mono text-xs text-graphite">
        {t('status', {
          lifecycle: t(`lifecycle.${resolved.lifecycle}`),
          access: t(`access.${resolved.access}`),
          date: object.paidUntil.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US'),
        })}
      </p>

      {resolved.access === 'read_only' ? (
        <p className="mt-4 border border-hairline bg-paper p-4 text-sm text-graphite">{t('readOnlyNotice')}</p>
      ) : null}

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(['photos', 'panoramas', 'documents', 'files', 'messages', 'clients'] as const).map((key) => (
          <div key={key} className="border border-hairline p-5">
            <h2 className="font-semibold text-ink">{t(`tabs.${key}`)}</h2>
            <p className="mt-2 text-sm text-graphite">{t('tabsSoon')}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 font-mono text-xs text-graphite">
        {t('storage', {
          used: view.storageUsedGb.toFixed(2),
          limit: view.storageLimitGb,
        })}
      </p>
    </section>
  )
}
