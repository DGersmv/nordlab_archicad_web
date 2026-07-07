'use client'

import { useTranslations } from 'next-intl'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { siteLinks } from '@/content/site'
import PrivacyConsent from '@/components/PrivacyConsent'
import { Link } from '@/i18n/navigation'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type PluginOption = {
  slug: string
  name: string
  tagline: string
  price: {
    rub: number
    eur: number
  }
  highlights: string[]
  isFree: boolean
  downloadUrl?: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'
type ErrorCode =
  | 'validation'
  | 'turnstile'
  | 'rate_limit'
  | 'not_configured'
  | 'smtp_failed'
  | 'telegram_failed'
  | 'server'

type PluginPurchaseFormProps = {
  plugins: PluginOption[]
  initialPluginSlug?: string
  machineId?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ) => string
      reset: (widgetId: string) => void
    }
  }
}

export default function PluginPurchaseForm({
  plugins,
  initialPluginSlug,
  machineId,
}: PluginPurchaseFormProps) {
  const t = useTranslations('shop.form')
  const router = useRouter()
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [selectedPluginSlug, setSelectedPluginSlug] = useState(
    initialPluginSlug && plugins.some((plugin) => plugin.slug === initialPluginSlug)
      ? initialPluginSlug
      : plugins[0]?.slug ?? '',
  )
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const turnstileTokenRef = useRef('')

  const selectedPlugin = useMemo(
    () => plugins.find((plugin) => plugin.slug === selectedPluginSlug),
    [plugins, selectedPluginSlug],
  )

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return

    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current) return
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          turnstileTokenRef.current = token
        },
      })
    }

    if (window.turnstile) {
      renderWidget()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.onload = renderWidget
    document.head.appendChild(script)
  }, [])

  function resetTurnstile() {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      turnstileTokenRef.current = ''
    }
  }

  function handlePluginChange(slug: string) {
    setSelectedPluginSlug(slug)
    setStatus('idle')
    setErrorCode(null)
    const params = new URLSearchParams()
    params.set('plugin', slug)
    if (machineId) params.set('machineId', machineId)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorCode(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    if (TURNSTILE_SITE_KEY) {
      formData.set('cf-turnstile-response', turnstileTokenRef.current)
    }

    try {
      const res = await fetch('/api/plugin-order', { method: 'POST', body: formData })
      const data = (await res.json()) as { success?: boolean; error?: ErrorCode }

      if (!res.ok) {
        setErrorCode(data.error ?? 'server')
        setStatus('error')
        resetTurnstile()
        return
      }

      setStatus('success')
      form.reset()
      const fallbackSlug = initialPluginSlug && plugins.some((plugin) => plugin.slug === initialPluginSlug)
        ? initialPluginSlug
        : plugins[0]?.slug ?? ''
      setSelectedPluginSlug(fallbackSlug)
      resetTurnstile()
      if (fallbackSlug) {
        const params = new URLSearchParams()
        params.set('plugin', fallbackSlug)
        if (machineId) params.set('machineId', machineId)
        router.replace(`?${params.toString()}`, { scroll: false })
      }
    } catch {
      setErrorCode('server')
      setStatus('error')
      resetTurnstile()
    }
  }

  const inputClass =
    'w-full border border-hairline bg-paper px-4 py-2.5 text-ink placeholder:text-graphite focus:border-pen focus:outline-none'
  const labelClass = 'mb-1.5 block font-mono text-xs text-graphite'

  return (
    <div className="border border-hairline p-6 md:p-8">
      <h2 className="text-display text-ink">{t('title')}</h2>
      <p className="mt-2 max-w-prose text-graphite">{t('lead')}</p>

      {status === 'success' ? (
        <div className="mt-6 space-y-3">
          <p className="font-mono text-sm text-marker" role="status">
            {t('success')}
          </p>
          <p className="text-sm text-graphite">
            {t.rich('fallback', {
              email: () => siteLinks.email,
              telegram: () => siteLinks.telegram,
            })}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative mt-6 space-y-5" noValidate>
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          {machineId ? <input type="hidden" name="machineId" value={machineId} /> : null}

          <div>
            <label htmlFor="pluginSlug" className={labelClass}>
              {t('pluginLabel')}
            </label>
            <select
              id="pluginSlug"
              name="pluginSlug"
              required
              value={selectedPluginSlug}
              onChange={(e) => handlePluginChange(e.target.value)}
              className={inputClass}
            >
              {plugins.map((plugin) => (
                <option key={plugin.slug} value={plugin.slug}>
                  {plugin.name}
                </option>
              ))}
            </select>
            {selectedPlugin && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-graphite">
                  {selectedPlugin.tagline}{' '}
                  {selectedPlugin.downloadUrl ? (
                    selectedPlugin.downloadUrl.startsWith('/') ? (
                      <Link
                        href={selectedPlugin.downloadUrl}
                        className="text-pen underline-offset-4 hover:underline"
                      >
                        {t('trialDownload')}
                      </Link>
                    ) : (
                      <a
                        href={selectedPlugin.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pen underline-offset-4 hover:underline"
                      >
                        {t('trialDownload')}
                      </a>
                    )
                  ) : null}{' '}
                  <span className="font-mono text-xs uppercase text-pen">{t('manualLabel')}</span>
                </p>
                <p className="font-mono text-xs uppercase text-ink">
                  {selectedPlugin.price.rub.toLocaleString()} ₽
                </p>
                <ul className="space-y-1 text-sm text-graphite">
                  {selectedPlugin.highlights.slice(0, 3).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>
                {t('nameLabel')}
              </label>
              <input type="text" id="name" name="name" required className={inputClass} />
            </div>

            <div>
              <label htmlFor="contact" className={labelClass}>
                {t('contactLabel')}
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                required
                className={inputClass}
                placeholder={t('contactPlaceholder')}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="company" className={labelClass}>
                {t('companyLabel')}
              </label>
              <input type="text" id="company" name="company" className={inputClass} />
            </div>

            <div>
              <label htmlFor="licenseType" className={labelClass}>
                {t('licenseTypeLabel')}
              </label>
              <select id="licenseType" name="licenseType" required defaultValue="single" className={inputClass}>
                <option value="single">{t('licenseTypes.single')}</option>
                <option value="team">{t('licenseTypes.team')}</option>
                <option value="enterprise">{t('licenseTypes.enterprise')}</option>
                <option value="edu">{t('licenseTypes.edu')}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[160px_1fr]">
            <div>
              <label htmlFor="seats" className={labelClass}>
                {t('seatsLabel')}
              </label>
              <input
                type="number"
                id="seats"
                name="seats"
                min={1}
                defaultValue={1}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="notes" className={labelClass}>
                {t('notesLabel')}
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={5}
                className={`${inputClass} resize-y`}
                placeholder={t('notesPlaceholder')}
              />
            </div>
          </div>

          {TURNSTILE_SITE_KEY && <div ref={turnstileRef} />}

          <PrivacyConsent />

          {status === 'error' && errorCode && (
            <p className="font-mono text-sm text-red-600" role="alert">
              {t(`errors.${errorCode}`)}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-pen px-6 py-3 font-mono text-sm text-paper transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' ? t('submitting') : t('submit')}
          </button>
        </form>
      )}
    </div>
  )
}
