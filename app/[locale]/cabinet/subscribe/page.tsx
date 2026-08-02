import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'cabinet.subscribe' })
  return { title: t('metaTitle') }
}

/** Legacy route: cabinet is free; send users to objects. */
export default async function CabinetSubscribePage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  redirect(locale === 'ru' ? '/ru/cabinet' : '/cabinet')
}
