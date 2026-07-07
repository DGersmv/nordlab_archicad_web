import type { ReactNode } from 'react'
import type { Locale } from '@/content/types'

export type LegalSection = {
  heading?: string
  body: ReactNode
}

type LegalPageProps = {
  locale: Locale
  title: string
  subtitle?: string
  updated: string
  sections: LegalSection[]
}

export default function LegalPage({ title, subtitle, updated, sections }: LegalPageProps) {
  return (
    <div className="site-container py-12 md:py-16">
      <header className="max-w-3xl">
        <h1 className="text-display-xl text-ink">{title}</h1>
        {subtitle ? <p className="mt-3 text-lead text-graphite">{subtitle}</p> : null}
        <p className="mt-4 font-mono text-xs text-graphite">{updated}</p>
      </header>

      <div className="prose-nordlab mt-10 max-w-3xl space-y-8 text-ink">
        {sections.map((section, index) => (
          <section key={index}>
            {section.heading ? (
              <h2 className="mb-3 text-lg font-semibold text-ink">{section.heading}</h2>
            ) : null}
            <div className="space-y-3 text-graphite">{section.body}</div>
          </section>
        ))}
      </div>
    </div>
  )
}
