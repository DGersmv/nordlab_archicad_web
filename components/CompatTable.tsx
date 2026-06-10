import type { CompatRow } from '@/content/types'
import { getTranslations } from 'next-intl/server'

type CompatTableProps = {
  rows: CompatRow[]
}

export default async function CompatTable({ rows }: CompatTableProps) {
  const t = await getTranslations('plugin')
  const c = await getTranslations('compat')

  return (
    <div className="overflow-x-auto border border-hairline">
      <table className="w-full min-w-[320px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-hairline bg-paper">
            <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wide text-graphite">
              {t('version')}
            </th>
            <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wide text-graphite">
              {t('windows')}
            </th>
            <th className="px-4 py-3 font-mono text-xs font-normal uppercase tracking-wide text-graphite">
              {t('mac')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.version} className="border-b border-hairline last:border-b-0">
              <td className="px-4 py-3 font-mono text-ink">AC {row.version}</td>
              <td className="px-4 py-3 font-mono">
                <CompatMark ok={row.windows} label={c('yes')} />
              </td>
              <td className="px-4 py-3 font-mono">
                <CompatMark ok={row.mac} label={c('yes')} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CompatMark({ ok, label }: { ok: boolean; label: string }) {
  if (ok) {
    return <span className="text-marker">{label}</span>
  }
  return <span className="text-graphite">—</span>
}
