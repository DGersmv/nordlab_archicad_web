import type { CompatRow } from './types'

/** All Nordlab plugins target Archicad 27–29 (Windows). */
export const pluginCompatibility: CompatRow[] = [
  { version: '29', windows: true, mac: false },
  { version: '28', windows: true, mac: false },
  { version: '27', windows: true, mac: false },
]
