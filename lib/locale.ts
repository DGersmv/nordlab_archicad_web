import type { Locale, LocalizedText } from '@/content/types'

export function pickLocalized<T extends LocalizedText>(
  text: T,
  locale: Locale,
): string {
  return text[locale]
}

export function pickLocalizedList(
  list: Record<Locale, string[]>,
  locale: Locale,
): string[] {
  return list[locale]
}
