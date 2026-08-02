import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import type { Locale } from '@/content/types'

type Props = {
  children: ReactNode
  params: { locale: Locale }
}

export default async function CabinetLayout({ children, params: { locale } }: Props) {
  const user = await getCurrentUser()
  if (!user) {
    redirect(locale === 'ru' ? '/ru/login' : '/login')
  }

  return <>{children}</>
}
