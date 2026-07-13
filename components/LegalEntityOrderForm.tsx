'use client'

import { FormEvent, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import PrivacyConsent from '@/components/PrivacyConsent'

type PluginOption = {
  slug: string
  name: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'
type ErrorCode = 'validation' | 'not_configured' | 'rate_limit' | 'server'

type LegalEntityOrderFormProps = {
  plugins: PluginOption[]
  initialPluginSlug?: string
  initialMachineId?: string
}

export default function LegalEntityOrderForm({
  plugins,
  initialPluginSlug,
  initialMachineId,
}: LegalEntityOrderFormProps) {
  const t = useTranslations('legalPayment.form')
  const locale = useLocale()
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [pluginSlug, setPluginSlug] = useState(
    initialPluginSlug && plugins.some((plugin) => plugin.slug === initialPluginSlug)
      ? initialPluginSlug
      : plugins[0]?.slug ?? '',
  )
  const [machineId, setMachineId] = useState(initialMachineId ?? '')

  const inputClass =
    'w-full border border-hairline bg-paper px-4 py-2.5 text-ink placeholder:text-graphite focus:border-pen focus:outline-none'
  const labelClass = 'mb-1.5 block font-mono text-xs text-graphite'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setErrorCode(null)

    const formData = new FormData(event.currentTarget)
    formData.set('pluginSlug', pluginSlug)
    formData.set('machineId', machineId.trim().toUpperCase())
    formData.set('locale', locale)

    try {
      const response = await fetch('/api/legal-payment', { method: 'POST', body: formData })
      const data = (await response.json()) as { success?: boolean; error?: ErrorCode }

      if (!response.ok || !data.success) {
        setErrorCode(data.error ?? 'server')
        setStatus('error')
        return
      }

      setStatus('success')
      event.currentTarget.reset()
      setPluginSlug(
        initialPluginSlug && plugins.some((plugin) => plugin.slug === initialPluginSlug)
          ? initialPluginSlug
          : plugins[0]?.slug ?? '',
      )
      setMachineId(initialMachineId ?? '')
    } catch {
      setErrorCode('server')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-marker/30 bg-paper p-6 md:p-8">
        <p className="font-mono text-sm text-marker" role="status">
          {t('successTitle')}
        </p>
        <p className="mt-3 text-sm text-graphite">{t('successLead')}</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink">
          {(t.raw('successSteps') as string[]).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative border border-hairline p-6 md:p-8" noValidate>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="legal-plugin" className={labelClass}>
            {t('pluginLabel')}
          </label>
          <select
            id="legal-plugin"
            value={pluginSlug}
            onChange={(event) => setPluginSlug(event.target.value)}
            className={inputClass}
            required
          >
            {plugins.map((plugin) => (
              <option key={plugin.slug} value={plugin.slug}>
                {plugin.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="legal-machine-id" className={labelClass}>
            {t('machineLabel')}
          </label>
          <input
            id="legal-machine-id"
            name="machineId"
            type="text"
            value={machineId}
            onChange={(event) => setMachineId(event.target.value)}
            className={`${inputClass} font-mono text-sm`}
            placeholder={t('machinePlaceholder')}
            required
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="legal-company" className={labelClass}>
            {t('companyLabel')}
          </label>
          <input id="legal-company" name="company" type="text" required className={inputClass} />
        </div>

        <div>
          <label htmlFor="legal-inn" className={labelClass}>
            {t('innLabel')}
          </label>
          <input id="legal-inn" name="inn" type="text" className={inputClass} placeholder={t('innPlaceholder')} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="legal-contact-name" className={labelClass}>
            {t('contactNameLabel')}
          </label>
          <input id="legal-contact-name" name="contactName" type="text" required className={inputClass} />
        </div>

        <div>
          <label htmlFor="legal-email" className={labelClass}>
            {t('emailLabel')}
          </label>
          <input id="legal-email" name="email" type="email" required className={inputClass} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="legal-phone" className={labelClass}>
          {t('phoneLabel')}
        </label>
        <input id="legal-phone" name="phone" type="text" className={inputClass} />
      </div>

      <div className="mt-5">
        <label htmlFor="legal-notes" className={labelClass}>
          {t('notesLabel')}
        </label>
        <textarea
          id="legal-notes"
          name="notes"
          rows={4}
          className={`${inputClass} resize-y`}
          placeholder={t('notesPlaceholder')}
        />
      </div>

      <div className="mt-5">
        <PrivacyConsent />
      </div>

      {status === 'error' && errorCode ? (
        <p className="mt-4 font-mono text-sm text-red-600" role="alert">
          {t(`errors.${errorCode}`)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-5 bg-pen px-6 py-3 font-mono text-sm text-paper transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading' ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
