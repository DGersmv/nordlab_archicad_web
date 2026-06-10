export type Locale = 'en' | 'ru'

export type LocalizedText = Record<Locale, string>

export type LocalizedList = Record<Locale, string[]>

export type SolutionId =
  | 'dwg-mesh'
  | 'gdl-to-mesh'
  | 'shellset'
  | 'tableset'
  | 'landscape-helper'

export interface CompatRow {
  version: string
  windows: boolean
  mac: boolean
}

export interface ChangelogEntry {
  date: string
  version: string
  pluginSlug: string
  text: LocalizedText
}

export interface PluginVideo {
  src: string
  poster?: string
  caption?: LocalizedText
}

/** Functional block in the catalog (one workflow / tool). */
export interface FeatureBlock {
  order: number
  slug: string
  name: LocalizedText
  tagline: LocalizedText
  whatItDoes: LocalizedList
  solutions: SolutionId[]
  compatibility: CompatRow[]
  /** Demo clips; first item is the catalog card preview. */
  videos?: PluginVideo[]
}

/** @deprecated Alias — routes still use /plugins/[slug] */
export type Plugin = FeatureBlock

export interface SiteLinks {
  siteUrl: string
  email: string
  telegram: string
  telegramUrl: string
  github?: string
}
