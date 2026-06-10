'use client'

import type { ReactNode } from 'react'
import { useReveal } from '@/lib/useReveal'

type RevealSectionProps = {
  children: ReactNode
  className?: string
  id?: string
}

export default function RevealSection({ children, className = '', id }: RevealSectionProps) {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id={id} className={`reveal ${className}`}>
      {children}
    </section>
  )
}
