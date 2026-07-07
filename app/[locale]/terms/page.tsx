import { setRequestLocale } from 'next-intl/server'
import LegalPage from '@/components/LegalPage'
import { getTermsDoc } from '@/content/legal/terms'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export default function TermsPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const doc = getTermsDoc(locale)

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
