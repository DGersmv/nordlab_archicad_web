import type { ChangelogEntry, SolutionId } from './types'
import { solutions } from './solutions'

export function getGlobalChangelog(): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []

  for (const solution of Object.values(solutions)) {
    for (const entry of solution.changelog) {
      entries.push({ ...entry, pluginSlug: solution.id })
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

export function getSolutionName(id: string): string {
  const sol = solutions[id as SolutionId]
  return sol?.name ?? id
}
