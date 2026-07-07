import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { company } from '@/content/company'
import { siteLinks } from '@/content/site'
import ArchicadLogo from './ArchicadLogo'

export default async function Footer() {
  const t = await getTranslations('footer')
  const nav = await getTranslations('nav')

  return (
    <footer className="border-t border-hairline">
      <div className="site-container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold text-ink">Nordlab</p>
          <p className="mt-2 text-sm text-graphite">{t('tagline')}</p>
          <div className="mt-5">
            <ArchicadLogo size="sm" />
          </div>
          <p className="mt-4 font-mono text-xs text-marker">{t('developer')}</p>
          <div className="mt-6 space-y-1 text-xs text-graphite">
            <p className="font-mono text-ink">{company.legalName}</p>
            <p>
              {t('inn')}: {company.inn} · {t('ogrn')}: {company.ogrn}
            </p>
            <p>{company.address}</p>
            <p>
              {t('payment')}: {company.paymentProvider}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Link href="/about" className="text-graphite no-underline hover:text-pen">
            {nav('about')}
          </Link>
          <Link href="/download" className="text-graphite no-underline hover:text-pen">
            {nav('download')}
          </Link>
          <Link href="/shop" className="text-graphite no-underline hover:text-pen">
            {nav('shop')}
          </Link>
          <Link href="/changelog" className="text-graphite no-underline hover:text-pen">
            {nav('changelog')}
          </Link>
          <Link href="/for-manufacturers" className="text-graphite no-underline hover:text-pen">
            {nav('manufacturers')}
          </Link>
          <Link href="/custom" className="text-graphite no-underline hover:text-pen">
            {nav('custom')}
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-mono text-xs uppercase text-graphite">{t('legalTitle')}</p>
          <Link href="/privacy" className="text-graphite no-underline hover:text-pen">
            {t('privacy')}
          </Link>
          <Link href="/offer" className="text-graphite no-underline hover:text-pen">
            {t('offer')}
          </Link>
          <Link href="/refund" className="text-graphite no-underline hover:text-pen">
            {t('refund')}
          </Link>
          <Link href="/terms" className="text-graphite no-underline hover:text-pen">
            {t('terms')}
          </Link>
          <a href={`mailto:${siteLinks.email}`} className="mt-2 font-mono text-sm text-graphite no-underline hover:text-pen">
            {siteLinks.email}
          </a>
          <a
            href={siteLinks.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-graphite no-underline hover:text-pen"
          >
            {siteLinks.telegram}
          </a>
        </div>
      </div>
      <div className="border-t border-hairline">
        <p className="site-container py-4 font-mono text-xs text-graphite">{t('rights')}</p>
      </div>
    </footer>
  )
}
