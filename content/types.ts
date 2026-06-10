export type Locale = 'en' | 'ru'

export type LocalizedText = Record<Locale, string>

export type LocalizedList = Record<Locale, string[]>

export type SolutionId =
  | 'dwg-mesh'
  | 'gdl-to-mesh'
  | 'shellset'
  | 'tableset'
  | 'landscape-helper'
  | 'gh-dimensioning'

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

export interface PluginImage {
  src: string
  alt?: LocalizedText
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
  /** Still previews; cycles on the plugin page and catalog card when no video. */
  images?: PluginImage[]
  /** Shown when no videos or images are available yet. */
  mediaPlaceholder?: LocalizedText
  download?: {
    url: string
    label: LocalizedText
  }
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
