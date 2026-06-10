import type { ChangelogEntry, SolutionId } from './types'

export interface SolutionMeta {
  id: SolutionId
  name: string
  changelog: Omit<ChangelogEntry, 'pluginSlug'>[]
}

export const solutions: Record<SolutionId, SolutionMeta> = {
  'dwg-mesh': {
    id: 'dwg-mesh',
    name: 'DWG-mesh',
    changelog: [
      {
        date: '2025-11-12',
        version: '1.2.0',
        text: {
          en: 'Improved text mark parsing for mixed-layer DWG imports.',
          ru: 'Улучшен разбор текстовых отметок при импорте DWG со смешанными слоями.',
        },
      },
    ],
  },
  'gdl-to-mesh': {
    id: 'gdl-to-mesh',
    name: 'GDL to Mesh',
    changelog: [],
  },
  shellset: {
    id: 'shellset',
    name: 'ShellSet',
    changelog: [
      {
        date: '2025-09-03',
        version: '2.0.1',
        text: {
          en: 'Fixed ruled shell closure on open spline paths.',
          ru: 'Исправлено замыкание ruled shell на открытых сплайнах.',
        },
      },
    ],
  },
  tableset: {
    id: 'tableset',
    name: 'TableSet',
    changelog: [],
  },
  'landscape-helper': {
    id: 'landscape-helper',
    name: 'LandscapeHelper',
    changelog: [
      {
        date: '2025-10-20',
        version: '3.1.0',
        text: {
          en: 'Distribution: multiple paths in one run.',
          ru: 'Распределение: несколько трасс за одну операцию.',
        },
      },
    ],
  },
}

export function getSolution(id: SolutionId): SolutionMeta {
  return solutions[id]
}
