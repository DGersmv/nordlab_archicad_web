import { setRequestLocale } from 'next-intl/server'
import LegalPage from '@/components/LegalPage'
import { getPrivacyDoc } from '@/content/legal/privacy'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
}

export default function PrivacyPage({ params: { locale } }: Props) {
  setRequestLocale(locale)
  const doc = getPrivacyDoc(locale)

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
