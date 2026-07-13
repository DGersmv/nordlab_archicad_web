import type { LocalizedText } from './types'

export type PluginDownloadSlug = 'meshmaster' | 'tableset' | 'openingmaster'

export type ArchicadBuild = '27' | '28' | '29'

export interface PluginBuildFile {
  archicad: ArchicadBuild
  filename: string
  /** Download URL tracked by /api/downloads (records stats). */
  href: string
}

export interface PluginDownloadEntry {
  slug: PluginDownloadSlug
  name: LocalizedText
  builds: PluginBuildFile[]
}

const ac = (version: ArchicadBuild, filename: string): PluginBuildFile => ({
  archicad: version,
  filename,
  href: `/api/downloads/ac${version}/${filename}`,
})

export const pluginDownloads: PluginDownloadEntry[] = [
  {
    slug: 'meshmaster',
    name: { en: 'MeshMaster', ru: 'MeshMaster' },
    builds: [
      ac('29', 'MeshMaster_AC29.apx'),
      ac('28', 'MeshMaster_AC28.apx'),
      ac('27', 'MeshMaster_AC27.apx'),
    ],
  },
  {
    slug: 'tableset',
    name: { en: 'TableSet', ru: 'TableSet' },
    builds: [
      ac('29', 'TableSet_AC29.apx'),
      ac('28', 'TableSet_AC28.apx'),
      ac('27', 'TableSet_AC27.apx'),
    ],
  },
  {
    slug: 'openingmaster',
    name: { en: 'OpeningMaster', ru: 'OpeningMaster' },
    builds: [
      ac('29', 'OpeningMaster_AC29.apx'),
      ac('28', 'OpeningMaster_AC28.apx'),
      ac('27', 'OpeningMaster_AC27.apx'),
    ],
  },
]

export function getPluginDownload(slug: string): PluginDownloadEntry | undefined {
  return pluginDownloads.find((entry) => entry.slug === slug)
}
