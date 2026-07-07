'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function PrivacyConsent() {
  const t = useTranslations('consent')

  return (
    <label className="flex items-start gap-3 text-sm text-graphite">
      <input
        type="checkbox"
        name="privacyConsent"
        value="yes"
        required
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
