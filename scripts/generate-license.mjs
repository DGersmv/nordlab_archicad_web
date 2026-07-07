const [, , pluginSlugArg, machineIdArg] = process.argv

const OPENING_MASTER_KEY_SALT = 'OpeningMaster|AC27|Nordlab|2026'
const TABLESET_KEY_SALT = 'TableSet|AC27|Nordlab|2026'
const MESHMASTER_KEY_SALT = 'MeshDwgMaster|AC27|Nordlab|2026'

function normalizeMachineId(value) {
  return value.trim().toUpperCase()
}

function fnv1a64(text) {
  let hash = 0xcbf29ce484222325n
  for (let i = 0; i < text.length; i += 1) {
    hash ^= BigInt(text.charCodeAt(i))
    hash *= 0x100000001b3n
    hash &= 0xffffffffffffffffn
  }
  return hash
}

function toHex32(value) {
  return (value & 0xffffffffn).toString(16).toUpperCase().padStart(8, '0')
}

function generateOpeningMasterLicenseKey(machineId) {
  const normalizedMachineId = normalizeMachineId(machineId)
  const seedA = `${OPENING_MASTER_KEY_SALT}|${normalizedMachineId}|A`
  const seedB = `${OPENING_MASTER_KEY_SALT}|${normalizedMachineId}|B`
  const hashA = fnv1a64(seedA)
  const hashB = fnv1a64(seedB)
  return `OM27-${toHex32(hashA)}-${toHex32(hashB)}`
}

function generateTableSetLicenseKey(machineId) {
  const normalizedMachineId = normalizeMachineId(machineId)
  const seedA = `${TABLESET_KEY_SALT}|${normalizedMachineId}|A`
  const seedB = `${TABLESET_KEY_SALT}|${normalizedMachineId}|B`
  const hashA = fnv1a64(seedA)
  const hashB = fnv1a64(seedB)
  return `TS27-${toHex32(hashA)}-${toHex32(hashB)}`
}

function generateMeshMasterLicenseKey(machineId) {
  const normalizedMachineId = normalizeMachineId(machineId)
  const seedA = `${MESHMASTER_KEY_SALT}|${normalizedMachineId}|A`
  const seedB = `${MESHMASTER_KEY_SALT}|${normalizedMachineId}|B`
  const hashA = fnv1a64(seedA)
  const hashB = fnv1a64(seedB)
  return `MM27-${toHex32(hashA)}-${toHex32(hashB)}`
}

function usage() {
  console.log('Usage: npm run license:generate -- <pluginSlug> <machineId>')
  console.log('Example: npm run license:generate -- openingmaster OM1-E0C6-7737-78EA')
  console.log('Supported pluginSlug values: openingmaster, tableset, meshmaster')
}

if (!pluginSlugArg || !machineIdArg) {
  usage()
  process.exit(1)
}

const pluginSlug = pluginSlugArg.trim().toLowerCase()
const machineId = normalizeMachineId(machineIdArg)

let licenseKey

switch (pluginSlug) {
  case 'openingmaster':
    licenseKey = generateOpeningMasterLicenseKey(machineId)
    break
  case 'tableset':
    licenseKey = generateTableSetLicenseKey(machineId)
    break
  case 'meshmaster':
    licenseKey = generateMeshMasterLicenseKey(machineId)
    break
  default:
    console.error(`Unsupported plugin slug: ${pluginSlug}`)
    console.error('Supported pluginSlug values: openingmaster, tableset, meshmaster')
    process.exit(1)
}

console.log(JSON.stringify({
  pluginSlug,
  machineId,
  price: { rub: 3000, eur: 30 },
  licenseKey,
}, null, 2))
