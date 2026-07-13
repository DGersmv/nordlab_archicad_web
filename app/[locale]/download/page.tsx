import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getBlockBySlug } from '@/content/blocks'
import { company } from '@/content/company'
import { pluginDownloads } from '@/content/downloads'
import { pickLocalized } from '@/lib/locale'
import type { Locale } from '@/content/types'

type Props = {
  params: { locale: Locale }
  searchParams?: { plugin?: string }
}

export default async function DownloadPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('download')
  const focusSlug = searchParams?.plugin

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-3xl">
        <h1 className="text-display-xl text-ink">{t('title')}</h1>
        <p className="mt-4 text-lead text-graphite">{t('lead')}</p>
        <p className="mt-4 text-sm text-graphite">{t('trialNote')}</p>
      </header>

      <div className="mt-12 space-y-10">
        {pluginDownloads.map((entry) => {
          const block = getBlockBySlug(entry.slug)
          const description = block ? pickLocalized(block.tagline, locale) : null

          return (
          <section
            key={entry.slug}
            id={entry.slug}
            className={`border border-hairline p-6 md:p-8 ${focusSlug === entry.slug ? 'ring-1 ring-pen' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-display text-ink">{pickLocalized(entry.name, locale)}</h2>
                {description ? (
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-graphite">{description}</p>
                ) : null}
                <p className="mt-2 text-sm text-graphite">
                  <Link href={`/plugins/${entry.slug}`} className="text-pen no-underline hover:underline">
                    {t('productPage')}
                  </Link>
                  {' · '}
                  <Link href={`/shop?plugin=${entry.slug}`} className="text-pen no-underline hover:underline">
                    {t('buyLicense')}
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline font-mono text-xs uppercase text-graphite">
                    <th className="py-2 pr-4">{t('archicad')}</th>
                    <th className="py-2 pr-4">{t('file')}</th>
                    <th className="py-2">{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.builds.map((build) => (
                    <tr key={build.filename} className="border-b border-hairline">
                      <td className="py-3 pr-4 font-mono text-ink">AC {build.archicad}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-graphite">{build.filename}</td>
                      <td className="py-3">
                        <a
                          href={build.href}
                          download
                          className="inline-flex bg-pen px-4 py-2 font-mono text-xs text-paper no-underline transition-opacity hover:opacity-90"
                        >
                          {t('download')}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          )
        })}
      </div>

      <aside className="mt-12 max-w-3xl border border-hairline p-6 text-sm text-graphite">
        <p className="font-mono text-xs uppercase text-ink">{t('installTitle')}</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>{t('installSteps.0')}</li>
          <li>{t('installSteps.1')}</li>
          <li>{t('installSteps.2')}</li>
        </ol>
        <p className="mt-4">
          {t('seller')}: {company.legalName} · {t('inn')} {company.inn} · {t('ogrn')} {company.ogrn}
        </p>
      </aside>
    </div>
  )
}
