import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getAllPluginSlugs, getPluginBySlug } from '@/content/plugins'
import PluginPage from '@/components/PluginPage'
import type { Locale } from '@/content/types'
import { pickLocalized } from '@/lib/locale'

type Props = {
  params: { locale: Locale; slug: string }
}

export function generateStaticParams() {
  return getAllPluginSlugs().flatMap((slug) =>
    ['en', 'ru'].map((locale) => ({ locale, slug })),
  )
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const block = getPluginBySlug(slug)
  if (!block) return {}

  const name = pickLocalized(block.name, locale)
  const tagline = pickLocalized(block.tagline, locale)

  return {
    title: `${name} — ${tagline}`,
    description: tagline.slice(0, 155),
    openGraph: {
      title: `${name} | Nordlab`,
      description: tagline,
    },
  }
}

export default async function PluginRoutePage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale)
  const block = getPluginBySlug(slug)
  if (!block) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: pickLocalized(block.name, locale),
    description: pickLocalized(block.tagline, locale),
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Windows',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PluginPage block={block} locale={locale} />
    </>
  )
}
