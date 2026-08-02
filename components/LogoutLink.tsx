'use client'

import { useRouter } from '@/i18n/navigation'

export default function LogoutLink({ label }: { label: string }) {
  const router = useRouter()

  async function handleClick() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="font-mono text-xs text-graphite underline-offset-4 hover:text-pen hover:underline"
    >
      {label}
    </button>
  )
}
