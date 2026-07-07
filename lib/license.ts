export const LICENSE_PRICES = {
  meshmaster: { rub: 3000, eur: 30 },
  tableset: { rub: 3000, eur: 30 },
  openingmaster: { rub: 3000, eur: 30 },
} as const

export type LicensePluginSlug = keyof typeof LICENSE_PRICES

const OPENING_MASTER_KEY_SALT = 'OpeningMaster|AC27|Nordlab|2026'
const TABLESET_KEY_SALT = 'TableSet|AC27|Nordlab|2026'
const MESHMASTER_KEY_SALT = 'MeshDwgMaster|AC27|Nordlab|2026'

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

export function generateOpeningMasterLicenseKey(machineId: string): string {
  const normalizedMachineId = normalizeMachineId(machineId)
  const seedA = `${OPENING_MASTER_KEY_SALT}|${normalizedMachineId}|A`
  const seedB = `${OPENING_MASTER_KEY_SALT}|${normalizedMachineId}|B`
  const hashA = fnv1a64(seedA)
  const hashB = fnv1a64(seedB)
  return `OM27-${toHex32(hashA)}-${toHex32(hashB)}`
}

export function generateTableSetLicenseKey(machineId: string): string {
  const normalizedMachineId = normalizeMachineId(machineId)
  const seedA = `${TABLESET_KEY_SALT}|${normalizedMachineId}|A`
  const seedB = `${TABLESET_KEY_SALT}|${normalizedMachineId}|B`
  const hashA = fnv1a64(seedA)
  const hashB = fnv1a64(seedB)
  return `TS27-${toHex32(hashA)}-${toHex32(hashB)}`
}

export function generateMeshMasterLicenseKey(machineId: string): string {
  const normalizedMachineId = normalizeMachineId(machineId)
  const seedA = `${MESHMASTER_KEY_SALT}|${normalizedMachineId}|A`
  const seedB = `${MESHMASTER_KEY_SALT}|${normalizedMachineId}|B`
  const hashA = fnv1a64(seedA)
  const hashB = fnv1a64(seedB)
  return `MM27-${toHex32(hashA)}-${toHex32(hashB)}`
}

export function generateLicenseKey(pluginSlug: LicensePluginSlug, machineId: string): string {
  switch (pluginSlug) {
    case 'openingmaster':
      return generateOpeningMasterLicenseKey(machineId)
    case 'meshmaster':
      return generateMeshMasterLicenseKey(machineId)
    case 'tableset':
      return generateTableSetLicenseKey(machineId)
    default:
      throw new Error(`Unsupported plugin slug: ${pluginSlug satisfies never}`)
  }
}
