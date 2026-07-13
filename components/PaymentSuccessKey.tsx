'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

type ReceiptState = {
  status: 'paid' | 'pending'
  licenseKey: string | null
  pluginName: string
  machineId: string
  invoiceId: number
}

type PaymentSuccessKeyProps = {
  invoiceId: string
  email: string
  locale: string
  initial?: ReceiptState | null
}

const POLL_MS = 2000
const POLL_TIMEOUT_MS = 90000

export default function PaymentSuccessKey({
  invoiceId,
  email,
  locale,
  initial,
}: PaymentSuccessKeyProps) {
  const t = useTranslations('payment.success')
  const [receipt, setReceipt] = useState<ReceiptState | null>(
    initial?.status === 'paid' && initial.licenseKey ? initial : null,
  )
  const [waiting, setWaiting] = useState(initial?.status === 'pending')
  const [timedOut, setTimedOut] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (receipt?.licenseKey) return

    let cancelled = false
    const startedAt = Date.now()
    setWaiting(true)
    setTimedOut(false)

    async function poll() {
      try {
        const params = new URLSearchParams({
          invoiceId,
          email,
          locale,
        })
        const response = await fetch(`/api/payment/order-status?${params.toString()}`)
        if (!response.ok || cancelled) return

        const data = (await response.json()) as {
          status?: string
          licenseKey?: string | null
          pluginName?: string
          machineId?: string
          invoiceId?: number
        }

        if (data.status === 'paid' && data.licenseKey) {
          setReceipt({
            status: 'paid',
            licenseKey: data.licenseKey,
            pluginName: data.pluginName ?? '',
            machineId: data.machineId ?? '',
            invoiceId: data.invoiceId ?? Number(invoiceId),
          })
          setWaiting(false)
          return
        }
      } catch {
        // Keep polling until timeout.
      }

      if (!cancelled && Date.now() - startedAt < POLL_TIMEOUT_MS) {
        window.setTimeout(poll, POLL_MS)
      } else if (!cancelled) {
        setTimedOut(true)
        setWaiting(false)
      }
    }

    if (initial?.status === 'paid' && initial.licenseKey) {
      setReceipt(initial)
      setWaiting(false)
      return
    }

    poll()

    return () => {
      cancelled = true
    }
  }, [email, initial, invoiceId, locale, receipt?.licenseKey])

  async function copyKey() {
    if (!receipt?.licenseKey) return
    try {
      await navigator.clipboard.writeText(receipt.licenseKey)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be blocked; user can copy manually.
    }
  }

  if (receipt?.status === 'paid' && receipt.licenseKey) {
    return (
      <section className="mt-8 border border-marker/30 bg-paper p-6 md:p-7">
        <p className="font-mono text-xs uppercase tracking-wide text-marker">{t('keyTitle')}</p>
        <p className="mt-2 text-sm text-graphite">{t('keyLead')}</p>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="font-mono text-xs uppercase text-graphite">{t('pluginLabel')}</dt>
            <dd className="mt-1 text-ink">{receipt.pluginName}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase text-graphite">{t('machineLabel')}</dt>
            <dd className="mt-1 break-all font-mono text-ink">{receipt.machineId}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase text-graphite">{t('keyLabel')}</dt>
            <dd className="mt-2 break-all border border-hairline bg-paper px-4 py-3 font-mono text-sm text-ink">
              {receipt.licenseKey}
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

        <p className="mt-4 text-xs text-graphite">{t('emailHint')}</p>
      </section>
    )
  }

  if (waiting) {
    return (
      <section className="mt-8 border border-hairline p-6 md:p-7">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('waitingTitle')}</p>
        <p className="mt-2 text-sm text-graphite">{t('waitingLead')}</p>
      </section>
    )
  }

  if (timedOut) {
    return (
      <section className="mt-8 border border-hairline p-6 md:p-7">
        <p className="font-mono text-xs uppercase tracking-wide text-graphite">{t('waitingTitle')}</p>
        <p className="mt-2 text-sm text-graphite">{t('waitingTimeout')}</p>
      </section>
    )
  }

  return null
}
