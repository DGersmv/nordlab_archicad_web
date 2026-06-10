type DimensionRuleProps = {
  label: string
  className?: string
}

export default function DimensionRule({ label, className = '' }: DimensionRuleProps) {
  return (
    <div
      className={`flex items-center gap-3 py-8 ${className}`}
      role="separator"
      aria-label={label}
    >
      <span className="h-px flex-1 bg-hairline" aria-hidden />
      <span
        className="relative shrink-0 font-mono text-xs uppercase tracking-wide text-graphite"
        aria-hidden
      >
        <span className="absolute -left-2 top-1/2 h-2 w-px -translate-y-1/2 bg-graphite" />
        <span className="absolute -right-2 top-1/2 h-2 w-px -translate-y-1/2 bg-graphite" />
        {label}
      </span>
      <span className="h-px flex-1 bg-hairline" aria-hidden />
    </div>
  )
}
