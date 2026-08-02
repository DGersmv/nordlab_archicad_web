'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

type CloudPaymentsWidget = {
  pay: (
    method: 'charge' | 'auth',
    options: Record<string, unknown>,
    callbacks?: {
      onSuccess?: string | ((options: unknown) => void)
      onFail?: string | ((reason: string, options: unknown) => void)
      onComplete?: (paymentResult: unknown, options: unknown) => void
    },
  ) => void
}

const WIDGET_SCRIPT_ID = 'cloudpayments-widget'
const WIDGET_SCRIPT_SRC = 'https://widget.cloudpayments.ru/bundles/cloudpayments'

function getCp() {
  return (window as unknown as { cp?: { CloudPayments: new (o?: { language?: string }) => CloudPaymentsWidget } }).cp
}

function loadCloudPaymentsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (getCp()?.CloudPayments) return Promise.resolve()

  const existing = document.getElementById(WIDGET_SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('widget_load_failed')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = WIDGET_SCRIPT_ID
    script.src = WIDGET_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('widget_load_failed'))
    document.head.appendChild(script)
  })
}

type Props = {
  priceRub: number
  days: number
  email: string
  paymentFailed?: boolean
}

type ErrorCode = 'not_configured' | 'server' | 'unauthorized'

export default function CabinetSubscribeForm({ priceRub, days, email, paymentFailed }: Props) {
  const t = useTranslations('cabinet.subscribe')
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)

  useEffect(() => {
    loadCloudPaymentsScript().catch(() => {})
  }, [])

  async function handlePay() {
    setLoading(true)
    setErrorCode(null)

    try {
      await loadCloudPaymentsScript()
      const response = await fetch('/api/cabinet/subscription/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
      const data = (await response.json()) as {
        error?: ErrorCode
        publicId?: string
        amount?: number
        currency?: string
        description?: string
        invoiceId?: string
        accountId?: string
        email?: string
        data?: Record<string, string>
        successRedirectUrl?: string
        failRedirectUrl?: string
      }

      if (!response.ok) {
        setErrorCode(
          data.error === 'not_configured' || data.error === 'unauthorized'
            ? data.error
            : 'server',
        )
        return
      }

      const cp = getCp()
      if (!cp?.CloudPayments || !data.publicId) {
        setErrorCode('server')
        return
      }

      const widget = new cp.CloudPayments({
        language: locale === 'ru' ? 'ru-RU' : 'en-US',
      })

      widget.pay(
        'charge',
        {
          publicId: data.publicId,
          description: data.description,
          amount: data.amount,
          currency: data.currency ?? 'RUB',
          invoiceId: data.invoiceId,
          accountId: data.accountId,
          email: data.email,
          skin: 'mini',
          data: data.data,
        },
        {
          onSuccess: data.successRedirectUrl,
          onFail: data.failRedirectUrl,
        },
      )
    } catch {
      setErrorCode('server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 border border-hairline bg-paper p-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('eyebrow')}</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">{t('title')}</h2>
        <p className="mt-2 text-sm text-graphite">{t('lead', { days, email })}</p>
      </div>

      <p className="text-3xl font-semibold text-ink">
        {priceRub.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
        <span className="ml-2 font-mono text-sm font-normal text-graphite">
          / {t('period', { days })}
        </span>
      </p>

      {paymentFailed ? (
        <p className="text-sm text-marker" role="alert">
          {t('paymentFailed')}
        </p>
      ) : null}

      {errorCode ? (
        <p className="text-sm text-marker" role="alert">
          {t(`errors.${errorCode}`)}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-pen px-4 py-3 font-mono text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? t('paying') : t('pay')}
      </button>
    </div>
  )
}
