import { setRequestLocale } from 'next-intl/server'
import LegalPage from '@/components/LegalPage'
import { getOfferDoc } from '@/content/legal/offer'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export default function OfferPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const doc = getOfferDoc(locale)

  return (
    <LegalPage
      locale={locale}
      title={doc.title}
      subtitle={doc.subtitle}
      updated={doc.updated}
      sections={doc.sections}
    />
  )
}
