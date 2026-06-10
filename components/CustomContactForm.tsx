'use client'

import { useTranslations } from 'next-intl'
import { FormEvent, useEffect, useRef, useState } from 'react'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type FormStatus = 'idle' | 'loading' | 'success' | 'error'
type ErrorCode =
  | 'validation'
  | 'file_size'
  | 'file_type'
  | 'turnstile'
  | 'rate_limit'
  | 'not_configured'
  | 'smtp_failed'
  | 'telegram_failed'
  | 'server'

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

export default function CustomContactForm() {
  const t = useTranslations('custom.form')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const turnstileTokenRef = useRef('')

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
      const res = await fetch('/api/contact', { method: 'POST', body: formData })
      const data = (await res.json()) as { success?: boolean; error?: ErrorCode }

      if (!res.ok) {
        setErrorCode(data.error ?? 'server')
        setStatus('error')
        resetTurnstile()
        return
      }

      setStatus('success')
      form.reset()
      resetTurnstile()
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
    <div className="max-w-3xl border border-hairline p-6 md:p-8">
      <h2 className="text-display text-ink">{t('title')}</h2>
      <p className="mt-2 max-w-prose text-graphite">{t('lead')}</p>

      {status === 'success' ? (
        <p className="mt-6 font-mono text-sm text-marker" role="status">
          {t('success')}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="relative mt-6 space-y-5" noValidate>
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

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

          <div>
            <label htmlFor="task" className={labelClass}>
              {t('taskLabel')}
            </label>
            <textarea id="task" name="task" required rows={5} className={`${inputClass} resize-y`} />
          </div>

          <div>
            <label htmlFor="file" className={labelClass}>
              {t('fileLabel')}
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
              className="block w-full font-mono text-sm text-graphite file:mr-4 file:border file:border-hairline file:bg-paper file:px-4 file:py-2 file:font-mono file:text-sm file:text-ink"
            />
            <p className="mt-1 font-mono text-xs text-graphite">{t('fileHint')}</p>
          </div>

          {TURNSTILE_SITE_KEY && <div ref={turnstileRef} />}

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
