import { getTranslations } from 'next-intl/server'
import { siteLinks } from '@/content/site'

type ContactCTAProps = {
  compact?: boolean
}

export default async function ContactCTA({ compact = false }: ContactCTAProps) {
  const t = await getTranslations('contact')

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4 border border-hairline p-6 md:p-8'}>
      {!compact && (
        <>
          <h2 className="text-display text-ink">{t('cta')}</h2>
          <p className="max-w-prose text-graphite">{t('ctaLead')}</p>
        </>
      )}
      <div className="flex flex-wrap gap-4">
        <a
          href={`mailto:${siteLinks.email}`}
          className="inline-flex items-center gap-2 border border-hairline px-5 py-2.5 font-mono text-sm text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen"
        >
          {t('email')}
          <span className="text-graphite">{siteLinks.email}</span>
        </a>
        <a
          href={siteLinks.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-pen px-5 py-2.5 font-mono text-sm text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
        >
          {t('telegram')}
          <span>{siteLinks.telegram}</span>
        </a>
      </div>
    </div>
  )
}
