import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { Schibsted_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { routing } from '@/i18n/routing'
import { siteLinks } from '@/content/site'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import '../globals.css'

const schibsted = Schibsted_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
  variable: '--font-schibsted',
  display: 'swap',
})

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

type Props = {
  children: ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })

  return {
    metadataBase: new URL(siteLinks.siteUrl),
    title: {
      default: t('siteName'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('siteDescription'),
    alternates: {
      canonical: '/',
      languages: {
        en: '/',
        ru: '/ru',
      },
    },
  }
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!routing.locales.includes(locale as 'en' | 'ru')) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${schibsted.variable} ${ibmMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
