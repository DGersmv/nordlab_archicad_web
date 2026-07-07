'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

type PrivacyConsentProps = {
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export default function PrivacyConsent({ checked, onChange }: PrivacyConsentProps = {}) {
  const t = useTranslations('consent')
  const isControlled = typeof checked === 'boolean' && typeof onChange === 'function'

  return (
    <label className="flex items-start gap-3 text-sm text-graphite">
      <input
        type="checkbox"
        name="privacyConsent"
        value="yes"
        required={!isControlled}
        checked={isControlled ? checked : undefined}
        onChange={
          isControlled
            ? (event) => {
                onChange(event.target.checked)
              }
            : undefined
        }
        className="mt-1 h-4 w-4 shrink-0 accent-pen"
      />
      <span>
        {t.rich('label', {
          privacy: (chunks) => (
            <Link href="/privacy" className="text-pen underline-offset-4 hover:underline">
              {chunks}
            </Link>
          ),
          offer: (chunks) => (
            <Link href="/offer" className="text-pen underline-offset-4 hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </span>
    </label>
  )
}
