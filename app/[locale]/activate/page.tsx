import { getTranslations, setRequestLocale } from 'next-intl/server'
import ActivateMachinePanel from '@/components/ActivateMachinePanel'
import DimensionRule from '@/components/DimensionRule'
import ContactCTA from '@/components/ContactCTA'
import ExistingLicensePanel from '@/components/ExistingLicensePanel'
import { getPluginBySlug } from '@/content/plugins'
import type { Locale } from '@/content/types'
import { Link } from '@/i18n/navigation'
import { isLicensePluginSlug, resolvePluginSlugForMachine } from '@/lib/license'
import { pickLocalized } from '@/lib/locale'
import { getPaidOrderByMachineAndPlugin } from '@/lib/orders'

type Props = {
  params: { locale: Locale }
  searchParams?: { machineId?: string; plugin?: string }
}

export async function generateMetadata({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: 'activate' })
  const pluginSlug = searchParams?.plugin?.trim().toLowerCase()
  const plugin = pluginSlug ? getPluginBySlug(pluginSlug) : undefined
  const pluginName = plugin ? pickLocalized(plugin.name, locale) : null

  return {
    title: pluginName ? t('titleNamed', { plugin: pluginName }) : t('titleGeneric'),
  }
}

export default async function ActivatePage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale)
  const t = await getTranslations('activate')
  const machineId = searchParams?.machineId?.trim()
  const urlPluginSlug = searchParams?.plugin?.trim().toLowerCase()
  const pluginSlug = machineId
    ? resolvePluginSlugForMachine(machineId, urlPluginSlug)
    : urlPluginSlug && isLicensePluginSlug(urlPluginSlug)
      ? urlPluginSlug
      : null
  const plugin = pluginSlug ? getPluginBySlug(pluginSlug) : undefined
  const pluginName = plugin ? pickLocalized(plugin.name, locale) : null

  const paidOrder =
    machineId && pluginSlug && isLicensePluginSlug(pluginSlug)
      ? await getPaidOrderByMachineAndPlugin(pluginSlug, machineId)
      : null

  const licenseChecked = Boolean(machineId && pluginSlug)

  const shopParams = new URLSearchParams()
  if (pluginSlug && plugin) shopParams.set('plugin', pluginSlug)
  if (machineId) shopParams.set('machineId', machineId)
  const shopQuery = shopParams.toString()
  const shopHref = shopQuery ? (`/shop?${shopQuery}#pay-form` as const) : '/shop#pay-form'

  const legalParams = new URLSearchParams()
  if (pluginSlug) legalParams.set('plugin', pluginSlug)
  if (machineId) legalParams.set('machineId', machineId)
  const legalQuery = legalParams.toString()
  const legalHref = legalQuery ? (`/legal-payment?${legalQuery}` as const) : '/legal-payment'

  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
        <h1 className="mt-3 text-display-xl text-ink">
          {pluginName ? t('titleNamed', { plugin: pluginName }) : t('titleGeneric')}
        </h1>
        <p className="mt-4 max-w-3xl text-lead text-graphite">
          {paidOrder
            ? t('leadPaidNamed', { plugin: pluginName ?? pluginSlug ?? '' })
            : pluginName
              ? t('leadNamed', { plugin: pluginName })
              : t('lead')}
        </p>
      </header>

      <DimensionRule label={locale === 'ru' ? 'активация' : 'activation'} className="max-w-4xl" />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-8">
          <div className="border border-hairline p-6 md:p-8">
            <h2 className="text-display text-ink">{t('machineTitle')}</h2>
            <p className="mt-2 text-graphite">{t('machineLead')}</p>
            <ActivateMachinePanel initialMachineId={machineId} />
            {licenseChecked && !paidOrder ? (
              <p className="mt-5 border border-hairline bg-paper p-4 font-mono text-sm text-graphite" role="status">
                {t('licenseNotFound')}
              </p>
            ) : null}
          </div>

          {!paidOrder ? (
            <div className="border border-hairline p-6 md:p-8">
              <h2 className="text-display text-ink">{t('nextTitle')}</h2>
              <ol className="mt-6 space-y-4 border-l border-hairline pl-5">
                {(t.raw('steps') as string[]).map((step) => (
                  <li key={step} className="text-ink">
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-6 border border-hairline bg-paper p-4">
                <p className="font-mono text-xs uppercase tracking-wide text-graphite">
                  {pluginName ? t('priceLabelNamed', { plugin: pluginName }) : t('priceLabel')}
                </p>
                <p className="mt-2 font-mono text-sm text-ink">
                  {plugin
                    ? `${plugin.price.rub.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽ / ${plugin.price.eur} EUR`
                    : t('priceFallback')}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-6">
          {paidOrder && pluginSlug && pluginName && machineId && paidOrder.licenseKey ? (
            <ExistingLicensePanel
              pluginSlug={pluginSlug}
              pluginName={pluginName}
              machineId={paidOrder.machineId}
              licenseKey={paidOrder.licenseKey}
              invoiceId={paidOrder.invId}
              defaultEmail={paidOrder.email}
            />
          ) : (
            <div className="border border-hairline p-6 md:p-8">
              <h2 className="text-display text-ink">{t('checkoutTitle')}</h2>
              <p className="mt-2 text-graphite">{t('checkoutLead')}</p>

              <div className="mt-6 grid gap-4">
                <Link
                  href={shopHref}
                  className="inline-flex items-center justify-center bg-pen px-6 py-3 font-mono text-sm text-paper no-underline transition-opacity duration-150 hover:opacity-90 hover:no-underline"
                >
                  {t('buyRu')}
                </Link>
                <Link
                  href={legalHref}
                  className="inline-flex items-center justify-center border border-hairline px-6 py-3 font-mono text-sm text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen hover:no-underline"
                >
                  {t('legalPayment')}
                </Link>
              </div>
            </div>
          )}

          <div className="border border-hairline p-6 md:p-8">
            <h2 className="text-display text-ink">{t('helpTitle')}</h2>
            <p className="mt-2 text-graphite">{t('helpLead')}</p>
            <div className="mt-5">
              <Link
                href="/custom"
                className="inline-flex items-center border border-hairline px-5 py-2.5 font-mono text-sm text-ink no-underline transition-colors duration-150 hover:border-pen hover:text-pen"
              >
                {t('helpCta')}
              </Link>
            </div>
          </div>

          <ContactCTA compact />
        </section>
      </div>
    </div>
  )
}
