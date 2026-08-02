'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

type SmartCaptchaApi = {
  render: (
    container: HTMLElement | string,
    params: {
      sitekey: string
      callback?: (token: string) => void
      'expired-callback'?: () => void
      hl?: string
    },
  ) => number
  reset: (widgetId?: number) => void
}

function getSmartCaptchaApi(): SmartCaptchaApi | undefined {
  return (window as unknown as { smartCaptcha?: SmartCaptchaApi }).smartCaptcha
}

const SCRIPT_SRC =
  'https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=onSmartCaptchaLoad'

type Props = {
  sitekey: string
  onToken: (token: string | null) => void
  remountKey?: number
}

export default function SmartCaptcha({ sitekey, onToken, remountKey = 0 }: Props) {
  const t = useTranslations('auth.captcha')
  const locale = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sitekey) return
    let cancelled = false
    widgetIdRef.current = null
    setReady(false)
    setError(null)
    onToken(null)

    function renderWidget() {
      if (cancelled || !containerRef.current) return
      const api = getSmartCaptchaApi()
      if (!api) return
      if (widgetIdRef.current != null) return
      try {
        containerRef.current.innerHTML = ''
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey,
          hl: locale === 'ru' ? 'ru' : 'en',
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
        })
        setReady(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('loadError'))
      }
    }

    ;(window as unknown as { onSmartCaptchaLoad?: () => void }).onSmartCaptchaLoad = () => {
      renderWidget()
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="smartcaptcha"][src*="captcha.js"]',
    )
    if (getSmartCaptchaApi()) {
      renderWidget()
    } else if (!existing) {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.defer = true
      script.onerror = () => setError(t('loadError'))
      document.head.appendChild(script)
    } else {
      existing.addEventListener('load', renderWidget)
    }

    return () => {
      cancelled = true
      widgetIdRef.current = null
    }
    // remountKey forces remount after successful send / error
  }, [sitekey, locale, remountKey, onToken, t])

  if (!sitekey) return null

  return (
    <div className="space-y-2">
      <div ref={containerRef} style={{ minHeight: 100 }} />
      {!ready && !error ? (
        <p className="font-mono text-xs text-graphite">{t('loading')}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-marker" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function getPublicSmartCaptchaSitekey(): string {
  return process.env.NEXT_PUBLIC_SMARTCAPTCHA_SITEKEY?.trim() ?? ''
}
