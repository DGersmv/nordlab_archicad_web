'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import SmartCaptcha, { getPublicSmartCaptchaSitekey } from '@/components/SmartCaptcha'

type ErrorCode =
  | 'validation'
  | 'invalid_credentials'
  | 'invalid_code'
  | 'captcha_required'
  | 'captcha_failed'
  | 'rate_limited'
  | 'email_failed'
  | 'server'

export default function ArchitectLoginForm() {
  const t = useTranslations('auth.login')
  const locale = useLocale()
  const router = useRouter()
  const sitekey = useMemo(() => getPublicSmartCaptchaSitekey(), [])
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)

  const inputClass =
    'w-full border border-hairline bg-paper px-4 py-2.5 text-ink placeholder:text-graphite focus:border-pen focus:outline-none'
  const labelClass = 'mb-1.5 block font-mono text-xs text-graphite'

  function mapError(error?: string): ErrorCode {
    const known: ErrorCode[] = [
      'validation',
      'invalid_credentials',
      'invalid_code',
      'captcha_required',
      'captcha_failed',
      'rate_limited',
      'email_failed',
    ]
    return known.includes(error as ErrorCode) ? (error as ErrorCode) : 'server'
  }

  async function handleCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorCode(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken, locale }),
      })
      const data = (await response.json()) as { error?: string; next?: string }
      if (!response.ok) {
        setErrorCode(mapError(data.error))
        setCaptchaKey((k) => k + 1)
        setCaptchaToken(null)
        return
      }
      setStep('otp')
      setCode('')
    } catch {
      setErrorCode('server')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorCode(null)
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, purpose: 'LOGIN' }),
      })
      const data = (await response.json()) as { error?: string; next?: string }
      if (!response.ok) {
        setErrorCode(mapError(data.error))
        return
      }
      router.push((data.next as '/cabinet') || '/cabinet')
      router.refresh()
    } catch {
      setErrorCode('server')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setLoading(true)
    setErrorCode(null)
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'LOGIN', locale }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        setErrorCode(mapError(data.error))
        return
      }
    } catch {
      setErrorCode('server')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerify} className="mx-auto max-w-md space-y-4">
        <p className="text-sm text-graphite">{t('otpLead', { email })}</p>
        <div>
          <label className={labelClass} htmlFor="login-code">
            {t('code')}
          </label>
          <input
            id="login-code"
            className={inputClass}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            minLength={6}
            maxLength={6}
            pattern="\d{6}"
          />
        </div>
        {errorCode ? (
          <p className="text-sm text-marker" role="alert">
            {t(`errors.${errorCode}`)}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-pen px-4 py-3 font-mono text-sm text-paper disabled:opacity-50"
        >
          {loading ? t('verifying') : t('verify')}
        </button>
        <div className="flex justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={() => setStep('credentials')}
            className="text-graphite underline-offset-4 hover:text-pen hover:underline"
          >
            {t('back')}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleResend}
            className="text-pen underline-offset-4 hover:underline disabled:opacity-50"
          >
            {t('resend')}
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleCredentials} className="mx-auto max-w-md space-y-4">
      <div>
        <label className={labelClass} htmlFor="login-email">
          {t('email')}
        </label>
        <input
          id="login-email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="login-password">
          {t('password')}
        </label>
        <input
          id="login-password"
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {sitekey ? (
        <SmartCaptcha sitekey={sitekey} onToken={setCaptchaToken} remountKey={captchaKey} />
      ) : null}

      {errorCode ? (
        <p className="text-sm text-marker" role="alert">
          {t(`errors.${errorCode}`)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || (Boolean(sitekey) && !captchaToken)}
        className="w-full bg-pen px-4 py-3 font-mono text-sm text-paper disabled:opacity-50"
      >
        {loading ? t('submitting') : t('submit')}
      </button>

      <p className="text-center text-sm text-graphite">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-pen underline-offset-4 hover:underline">
          {t('registerLink')}
        </Link>
      </p>
    </form>
  )
}
