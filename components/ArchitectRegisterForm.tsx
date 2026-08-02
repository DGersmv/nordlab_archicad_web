'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import PrivacyConsent from '@/components/PrivacyConsent'
import SmartCaptcha, { getPublicSmartCaptchaSitekey } from '@/components/SmartCaptcha'
import { Link, useRouter } from '@/i18n/navigation'

type ErrorCode =
  | 'validation'
  | 'email_taken'
  | 'invalid_code'
  | 'captcha_required'
  | 'captcha_failed'
  | 'rate_limited'
  | 'email_failed'
  | 'restart_register'
  | 'server'

export default function ArchitectRegisterForm() {
  const t = useTranslations('auth.register')
  const locale = useLocale()
  const router = useRouter()
  const sitekey = useMemo(() => getPublicSmartCaptchaSitekey(), [])
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [privacyConsent, setPrivacyConsent] = useState(false)
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
      'email_taken',
      'invalid_code',
      'captcha_required',
      'captcha_failed',
      'rate_limited',
      'email_failed',
      'restart_register',
    ]
    return known.includes(error as ErrorCode) ? (error as ErrorCode) : 'server'
  }

  async function handleForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorCode(null)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          privacyConsent,
          captchaToken,
          locale,
        }),
      })
      const data = (await response.json()) as { error?: string }
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
        body: JSON.stringify({ email, code, purpose: 'REGISTER' }),
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
        body: JSON.stringify({ email, purpose: 'REGISTER', locale }),
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
          <label className={labelClass} htmlFor="reg-code">
            {t('code')}
          </label>
          <input
            id="reg-code"
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
            onClick={() => setStep('form')}
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
    <form onSubmit={handleForm} className="mx-auto max-w-md space-y-4">
      <div>
        <label className={labelClass} htmlFor="reg-name">
          {t('name')}
        </label>
        <input
          id="reg-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="reg-email">
          {t('email')}
        </label>
        <input
          id="reg-email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="reg-phone">
          {t('phone')}
        </label>
        <input
          id="reg-phone"
          type="tel"
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="reg-password">
          {t('password')}
        </label>
        <input
          id="reg-password"
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="mt-1 font-mono text-xs text-graphite">{t('passwordHint')}</p>
      </div>

      <PrivacyConsent checked={privacyConsent} onChange={setPrivacyConsent} />

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
        disabled={loading || !privacyConsent || (Boolean(sitekey) && !captchaToken)}
        className="w-full bg-pen px-4 py-3 font-mono text-sm text-paper disabled:opacity-50"
      >
        {loading ? t('submitting') : t('submit')}
      </button>

      <p className="text-center text-sm text-graphite">
        {t('hasAccount')}{' '}
        <Link href="/login" className="text-pen underline-offset-4 hover:underline">
          {t('loginLink')}
        </Link>
      </p>
    </form>
  )
}
