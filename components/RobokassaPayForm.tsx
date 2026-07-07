'use client'

import { FormEvent, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import PrivacyConsent from '@/components/PrivacyConsent'
import { Link } from '@/i18n/navigation'

type RobokassaPayFormProps = {
  plugins: Array<{
    slug: string
    name: string
    priceRub: number
  }>
  initialPluginSlug?: string
  machineId?: string
}

type ErrorCode = 'validation' | 'not_configured' | 'server'

export default function RobokassaPayForm({
  plugins,
  initialPluginSlug,
  machineId: initialMachineId,
}: RobokassaPayFormProps) {
  const t = useTranslations('shop.pay')
  const locale = useLocale()
  const [pluginSlug, setPluginSlug] = useState(
    initialPluginSlug && plugins.some((plugin) => plugin.slug === initialPluginSlug)
      ? initialPluginSlug
      : plugins[0]?.slug ?? '',
  )
  const [machineId, setMachineId] = useState(initialMachineId ?? '')
  const [email, setEmail] = useState('')
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)

  const selectedPlugin = plugins.find((plugin) => plugin.slug === pluginSlug)
  const inputClass =
    'w-full border border-hairline bg-paper px-4 py-2.5 text-ink placeholder:text-graphite focus:border-pen focus:outline-none'
  const labelClass = 'mb-1.5 block font-mono text-xs text-graphite'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorCode(null)

    try {
      const response = await fetch('/api/payment/robokassa/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pluginSlug,
          machineId,
          email,
          privacyConsent,
          locale,
        }),
      })

      const data = (await response.json()) as {
        redirectUrl?: string
        error?: ErrorCode
      }

      if (!response.ok || !data.redirectUrl) {
        setErrorCode(data.error ?? 'server')
        setLoading(false)
        return
      }

      window.location.href = data.redirectUrl
    } catch {
      setErrorCode('server')
      setLoading(false)
    }
  }

  return (
    <div className="border border-hairline p-6 md:p-8">
      <h2 className="text-display text-ink">{t('title')}</h2>
      <p className="mt-2 max-w-prose text-graphite">{t('lead')}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div>
          <label htmlFor="pay-plugin" className={labelClass}>
            {t('pluginLabel')}
          </label>
          <select
            id="pay-plugin"
            value={pluginSlug}
            onChange={(event) => setPluginSlug(event.target.value)}
            className={inputClass}
            required
          >
            {plugins.map((plugin) => (
              <option key={plugin.slug} value={plugin.slug}>
                {plugin.name} — {plugin.priceRub.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pay-machine" className={labelClass}>
            {t('machineLabel')}
          </label>
          <input
            id="pay-machine"
            type="text"
            value={machineId}
            onChange={(event) => setMachineId(event.target.value)}
            className={inputClass}
            placeholder={t('machinePlaceholder')}
            required
          />
          <p className="mt-2 text-xs text-graphite">{t('machineHint')}</p>
        </div>

        <div>
          <label htmlFor="pay-email" className={labelClass}>
            {t('emailLabel')}
          </label>
          <input
            id="pay-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="you@example.com"
            required
          />
          <p className="mt-2 text-xs text-graphite">{t('emailHint')}</p>
        </div>

        {selectedPlugin ? (
          <p className="font-mono text-sm text-ink">
            {t('total')}: {selectedPlugin.priceRub.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
          </p>
        ) : null}

        <PrivacyConsent checked={privacyConsent} onChange={setPrivacyConsent} />

        {errorCode ? (
          <p className="font-mono text-sm text-red-600" role="alert">
            {t(`errors.${errorCode}`)}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !privacyConsent}
          className="bg-pen px-6 py-3 font-mono text-sm text-paper transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>

      <p className="mt-4 text-xs text-graphite">
        {t('manualFallback')}{' '}
        <Link href="/custom" className="text-pen underline-offset-4 hover:underline">
          {t('manualLink')}
        </Link>
      </p>
    </div>
  )
}
