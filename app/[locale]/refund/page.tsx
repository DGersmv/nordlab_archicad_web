import { setRequestLocale } from 'next-intl/server'
import LegalPage from '@/components/LegalPage'
import { getRefundDoc } from '@/content/legal/refund'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export default function RefundPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const doc = getRefundDoc(locale)

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
