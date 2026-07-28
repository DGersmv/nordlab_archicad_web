export const LICENSE_PRICES = {
  meshmaster: { rub: 1000, eur: 10 },
  tableset: { rub: 1000, eur: 10 },
  openingmaster: { rub: 1000, eur: 10 },
} as const

export type LicensePluginSlug = keyof typeof LICENSE_PRICES

/** Archicad versions we ship plugins for. Salts must match LicenseManager.cpp. */
export const ARCHICAD_VERSIONS = [27, 28, 29] as const
export type ArchicadVersion = (typeof ARCHICAD_VERSIONS)[number]

export type LicenseKeysByArchicad = Record<ArchicadVersion, string>

/**
 * Key salts from plugin LicenseManager.cpp (kKeySalt).
 * OpeningMaster / MeshMaster currently use the AC27 salt on all builds;
 * TableSet uses a distinct salt per Archicad major version.
 */
const KEY_SALTS: Record<LicensePluginSlug, Record<ArchicadVersion, string>> = {
  openingmaster: {
    27: 'OpeningMaster|AC27|Nordlab|2026',
    28: 'OpeningMaster|AC27|Nordlab|2026',
    29: 'OpeningMaster|AC27|Nordlab|2026',
  },
  tableset: {
    27: 'TableSet|AC27|Nordlab|2026',
    28: 'TableSet|AC28|Nordlab|2026',
    29: 'TableSet|AC29|Nordlab|2026',
  },
  meshmaster: {
    27: 'MeshDwgMaster|AC27|Nordlab|2026',
    28: 'MeshDwgMaster|AC27|Nordlab|2026',
    29: 'MeshDwgMaster|AC27|Nordlab|2026',
  },
}

/** Prefix stays *27 in plugin builds even for AC28/AC29. */
const KEY_PREFIX: Record<LicensePluginSlug, string> = {
  openingmaster: 'OM27',
  tableset: 'TS27',
  meshmaster: 'MM27',
}

function normalizeMachineId(value: string): string {
  return value.trim().toUpperCase()
}

function fnv1a64(text: string): bigint {
  let hash = 0xcbf29ce484222325n
  for (let i = 0; i < text.length; i += 1) {
    hash ^= BigInt(text.charCodeAt(i))
    hash *= 0x100000001b3n
    hash &= 0xffffffffffffffffn
  }
  return hash
}

function toHex32(value: bigint): string {
  return (value & 0xffffffffn).toString(16).toUpperCase().padStart(8, '0')
}

export function isLicensePluginSlug(value: string): value is LicensePluginSlug {
  return value in LICENSE_PRICES
}

export function isArchicadVersion(value: unknown): value is ArchicadVersion {
  return value === 27 || value === 28 || value === 29
}

export function parseArchicadVersion(value: string | number | undefined): ArchicadVersion | null {
  if (value === undefined || value === null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(/^ac/i, ''))
  return isArchicadVersion(n) ? n : null
}

export function inferPluginSlugFromMachineId(machineId: string): LicensePluginSlug | null {
  const id = normalizeMachineId(machineId)
  if (id.startsWith('OM1-')) return 'openingmaster'
  if (id.startsWith('TS1-')) return 'tableset'
  if (id.startsWith('MM1-')) return 'meshmaster'
  return null
}

export function resolvePluginSlugForMachine(
  machineId: string,
  urlPluginSlug?: string,
): LicensePluginSlug | null {
  const inferred = inferPluginSlugFromMachineId(machineId)
  if (inferred) return inferred
  if (urlPluginSlug && isLicensePluginSlug(urlPluginSlug)) return urlPluginSlug
  return null
}

export function generateLicenseKeyForArchicad(
  pluginSlug: LicensePluginSlug,
  machineId: string,
  archicad: ArchicadVersion,
): string {
  const normalizedMachineId = normalizeMachineId(machineId)
  const salt = KEY_SALTS[pluginSlug][archicad]
  const prefix = KEY_PREFIX[pluginSlug]
  const hashA = fnv1a64(`${salt}|${normalizedMachineId}|A`)
  const hashB = fnv1a64(`${salt}|${normalizedMachineId}|B`)
  return `${prefix}-${toHex32(hashA)}-${toHex32(hashB)}`
}

export function generateAllLicenseKeys(
  pluginSlug: LicensePluginSlug,
  machineId: string,
): LicenseKeysByArchicad {
  return {
    27: generateLicenseKeyForArchicad(pluginSlug, machineId, 27),
    28: generateLicenseKeyForArchicad(pluginSlug, machineId, 28),
    29: generateLicenseKeyForArchicad(pluginSlug, machineId, 29),
  }
}

/** True when AC27/28/29 produce the same key (OpeningMaster / MeshMaster today). */
export function licenseKeysAreIdentical(keys: LicenseKeysByArchicad): boolean {
  return keys[27] === keys[28] && keys[28] === keys[29]
}

/**
 * Human-readable delivery text: one key when identical, otherwise labeled per AC version.
 */
export function formatLicenseKeysText(keys: LicenseKeysByArchicad): string {
  if (licenseKeysAreIdentical(keys)) return keys[27]
  return ARCHICAD_VERSIONS.map((version) => `AC${version}: ${keys[version]}`).join('\n')
}

/** @deprecated Prefer generateLicenseKeyForArchicad(..., 27) or generateAllLicenseKeys. */
export function generateOpeningMasterLicenseKey(machineId: string): string {
  return generateLicenseKeyForArchicad('openingmaster', machineId, 27)
}

/** @deprecated Prefer generateLicenseKeyForArchicad(..., archicad) or generateAllLicenseKeys. */
export function generateTableSetLicenseKey(machineId: string): string {
  return generateLicenseKeyForArchicad('tableset', machineId, 27)
}

/** @deprecated Prefer generateLicenseKeyForArchicad(..., 27) or generateAllLicenseKeys. */
export function generateMeshMasterLicenseKey(machineId: string): string {
  return generateLicenseKeyForArchicad('meshmaster', machineId, 27)
}

/**
 * Default single-key helper (AC27 salt). Prefer generateAllLicenseKeys for delivery
 * so TableSet AC28/AC29 customers get a matching key.
 */
export function generateLicenseKey(pluginSlug: LicensePluginSlug, machineId: string): string {
  return generateLicenseKeyForArchicad(pluginSlug, machineId, 27)
}
