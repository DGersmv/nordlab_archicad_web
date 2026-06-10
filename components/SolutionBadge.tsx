import type { SolutionId } from '@/content/types'
import { getSolution } from '@/content/solutions'

type SolutionBadgeProps = {
  id: SolutionId
}

export default function SolutionBadge({ id }: SolutionBadgeProps) {
  const solution = getSolution(id)

  return (
    <span className="inline-block border border-hairline px-2 py-0.5 font-mono text-xs text-ink">
      {solution.name}
    </span>
  )
}
