'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type ObjectRow = {
  id: string
  title: string
  description: string | null
  address: string | null
  isFreeTrial: boolean
  lifecycle: string
  access: string
  paidUntil: string
  storageLimitGb: number
  storageUsedGb: number
}

type Pricing = {
  newObjectRub: number
  storageMonths: number
  storageGb: number
}

type CloudPaymentsWidget = {
  pay: (
    method: 'charge' | 'auth',
    options: Record<string, unknown>,
    callbacks?: {
      onSuccess?: string | ((options: unknown) => void)
      onFail?: string | ((reason: string, options: unknown) => void)
    },
  ) => void
}

const WIDGET_SCRIPT_ID = 'cloudpayments-widget'
const WIDGET_SCRIPT_SRC = 'https://widget.cloudpayments.ru/bundles/cloudpayments'

function getCp(): { CloudPayments: new (options?: { language?: string }) => CloudPaymentsWidget } | undefined {
  return (window as unknown as { cp?: { CloudPayments: new (options?: { language?: string }) => CloudPaymentsWidget } }).cp
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

export default function CabinetObjectsPanel({
  justPaid,
  paymentFailed,
}: {
  justPaid?: boolean
  paymentFailed?: boolean
}) {
  const t = useTranslations('cabinet.objects')
  const locale = useLocale()
  const [objects, setObjects] = useState<ObjectRow[]>([])
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [canCreateFree, setCanCreateFree] = useState(true)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/cabinet/objects')
    if (!res.ok) return
    const data = (await res.json()) as {
      objects: ObjectRow[]
      canCreateFree: boolean
      pricing: Pricing
    }
    setObjects(data.objects)
    setCanCreateFree(data.canCreateFree)
    setPricing(data.pricing)
  }, [])

  useEffect(() => {
    load().catch(() => {})
    loadCloudPaymentsScript().catch(() => {})
  }, [load])

  async function openWidget(payload: Record<string, unknown>) {
    await loadCloudPaymentsScript()
    const cp = getCp()
    if (!cp?.CloudPayments) {
      setError('server')
      return
    }
    const widget = new cp.CloudPayments({
      language: locale === 'ru' ? 'ru-RU' : 'en-US',
    })
    widget.pay(
      'charge',
      {
        publicId: payload.publicId,
        description: payload.description,
        amount: payload.amount,
        currency: payload.currency ?? 'RUB',
        invoiceId: payload.invoiceId,
        accountId: payload.accountId,
        email: payload.email,
        skin: 'mini',
        data: payload.data,
      },
      {
        onSuccess: payload.successRedirectUrl as string,
        onFail: payload.failRedirectUrl as string,
      },
    )
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (canCreateFree) {
        const res = await fetch('/api/cabinet/objects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        })
        const data = (await res.json()) as { error?: string }
        if (!res.ok) {
          setError(data.error ?? 'server')
          return
        }
        setTitle('')
        await load()
        return
      }

      const res = await fetch('/api/cabinet/objects/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'NEW_OBJECT', title, locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'server')
        return
      }
      await openWidget(data)
    } catch {
      setError('server')
    } finally {
      setLoading(false)
    }
  }

  async function handleRenew(objectId: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cabinet/objects/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'RENEWAL', objectId, locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'server')
        return
      }
      await openWidget(data)
    } catch {
      setError('server')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-hairline bg-paper px-4 py-2.5 text-ink focus:border-pen focus:outline-none'

  return (
    <div className="space-y-8">
      {justPaid ? <p className="text-sm text-pen">{t('justPaid')}</p> : null}
      {paymentFailed ? (
        <p className="text-sm text-marker" role="alert">
          {t('paymentFailed')}
        </p>
      ) : null}

      <form onSubmit={handleCreate} className="max-w-lg space-y-3 border border-hairline p-5">
        <h2 className="text-lg font-semibold text-ink">{t('createTitle')}</h2>
        <p className="text-sm text-graphite">
          {canCreateFree
            ? t('createFreeLead')
            : t('createPaidLead', {
                price: pricing?.newObjectRub ?? 2500,
                months: pricing?.storageMonths ?? 12,
                gb: pricing?.storageGb ?? 10,
              })}
        </p>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          required
          minLength={2}
        />
        {error ? (
          <p className="text-sm text-marker" role="alert">
            {t(`errors.${error}`, { default: t('errors.server') })}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading || title.trim().length < 2}
          className="bg-pen px-4 py-2.5 font-mono text-sm text-paper disabled:opacity-50"
        >
          {loading
            ? t('working')
            : canCreateFree
              ? t('createFree')
              : t('payAndCreate', { price: pricing?.newObjectRub ?? 2500 })}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-ink">{t('listTitle')}</h2>
        {objects.length === 0 ? (
          <p className="mt-3 text-sm text-graphite">{t('empty')}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {objects.map((object) => (
              <li key={object.id} className="border border-hairline p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{object.title}</h3>
                    <p className="mt-1 font-mono text-xs text-graphite">
                      {object.isFreeTrial ? t('badgeFree') : t('badgePaid')} · {t(`lifecycle.${object.lifecycle}`)} ·{' '}
                      {t('until', {
                        date: new Date(object.paidUntil).toLocaleDateString(
                          locale === 'ru' ? 'ru-RU' : 'en-US',
                        ),
                      })}
                    </p>
                    <p className="mt-1 font-mono text-xs text-graphite">
                      {t('storage', {
                        used: object.storageUsedGb.toFixed(2),
                        limit: object.storageLimitGb,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/cabinet/objects/${object.id}`}
                      className="border border-hairline px-3 py-1.5 font-mono text-xs text-ink no-underline hover:border-pen"
                    >
                      {t('open')}
                    </Link>
                    {object.access !== 'full' || object.lifecycle !== 'ACTIVE' ? (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleRenew(object.id)}
                        className="bg-pen px-3 py-1.5 font-mono text-xs text-paper disabled:opacity-50"
                      >
                        {t('renew')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleRenew(object.id)}
                        className="border border-hairline px-3 py-1.5 font-mono text-xs text-graphite hover:border-pen hover:text-pen"
                      >
                        {t('renewEarly')}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
