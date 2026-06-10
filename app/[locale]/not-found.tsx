import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="site-container py-20 text-center">
      <h1 className="text-display text-ink">404</h1>
      <p className="mt-4 text-graphite">Page not found.</p>
      <Link href="/" className="mt-8 inline-block font-mono text-sm">
        ← Home
      </Link>
    </div>
  )
}
