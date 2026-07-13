'use client'

import { FormEvent, useState } from 'react'
import { useTranslations } from 'next-intl'

type ExistingLicensePanelProps = {
  pluginSlug: string
  pluginName: string
  machineId: string
  licenseKey: string
  invoiceId: number
  defaultEmail?: string
}

type ErrorCode = 'validation' | 'not_found' | 'not_configured' | 'server'

export default function ExistingLicensePanel({
  pluginSlug,
  pluginName,
  machineId,
  licenseKey,
  invoiceId,
  defaultEmail = '',
}: ExistingLicensePanelProps) {
  const t = useTranslations('license')
  const [email, setEmail] = useState(defaultEmail)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)

  const inputClass =
    'w-full border border-hairline bg-paper px-4 py-2.5 text-ink placeholder:text-graphite focus:border-pen focus:outline-none'
  const labelClass = 'mb-1.5 block font-mono text-xs text-graphite'

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(licenseKey)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // User can copy manually.
    }
  }

  async function handleSendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorCode(null)
    setSentTo(null)

    try {
      const response = await fetch('/api/payment/resend-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginSlug, machineId, email }),
      })

      const data = (await response.json()) as { success?: boolean; error?: ErrorCode }

      if (!response.ok || !data.success) {
        setErrorCode(data.error ?? 'server')
        setLoading(false)
        return
      }

      setSentTo(email.trim().toLowerCase())
      setLoading(false)
    } catch {
      setErrorCode('server')
      setLoading(false)
    }
  }

  return (
    <section className="border border-marker/30 bg-paper p-6 md:p-8">
      <p className="font-mono text-xs uppercase tracking-wide text-marker">{t('existingTitle')}</p>
      <p className="mt-2 text-sm text-graphite">{t('existingLead')}</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className={labelClass}>{t('pluginLabel')}</dt>
          <dd className="text-ink">{pluginName}</dd>
        </div>
        <div>
          <dt className={labelClass}>{t('machineLabel')}</dt>
          <dd className="break-all font-mono text-ink">{machineId}</dd>
        </div>
        <div>
          <dt className={labelClass}>{t('orderLabel')}</dt>
          <dd className="font-mono text-ink">{invoiceId}</dd>
        </div>
        <div>
          <dt className={labelClass}>{t('keyLabel')}</dt>
          <dd className="break-all border border-hairline bg-paper px-4 py-3 font-mono text-sm text-ink">
            {licenseKey}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={copyKey}
        className="mt-4 border border-hairline px-5 py-2.5 font-mono text-xs text-ink transition-colors duration-150 hover:border-pen hover:text-pen"
      >
        {copied ? t('copied') : t('copyKey')}
      </button>

      <form onSubmit={handleSendEmail} className="mt-6 space-y-4 border-t border-hairline pt-6" noValidate>
        <div>
          <label htmlFor="license-email" className={labelClass}>
            {t('emailLabel')}
          </label>
          <input
            id="license-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder={t('emailPlaceholder')}
            required
          />
        </div>

        {errorCode ? (
          <p className="font-mono text-sm text-red-600" role="alert">
            {t(`errors.${errorCode}`)}
          </p>
        ) : null}

        {sentTo ? (
          <p className="font-mono text-sm text-marker" role="status">
            {t('emailSent', { email: sentTo })}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="bg-pen px-6 py-3 font-mono text-sm text-paper transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t('sending') : t('sendEmail')}
        </button>
      </form>
    </section>
  )
}
