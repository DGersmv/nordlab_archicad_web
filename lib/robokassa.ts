import { createHash } from 'crypto'

export type RobokassaCustomParams = Record<string, string>

export type RobokassaConfig = {
  merchantLogin: string
  password1: string
  password2: string
  isTest: boolean
}

const PAYMENT_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx'

function md5(value: string): string {
  return createHash('md5').update(value, 'utf8').digest('hex')
}

function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

function buildCustomSuffix(params: RobokassaCustomParams): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== '')
    .sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) return ''

  return entries.map(([key, value]) => `:${key}=${value}`).join('')
}

export function getRobokassaConfig(): RobokassaConfig | null {
  const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN?.trim()
  const productionPassword1 = process.env.ROBOKASSA_PASSWORD_1?.trim()
  const productionPassword2 = process.env.ROBOKASSA_PASSWORD_2?.trim()
  const testPassword1 = process.env.ROBOKASSA_TEST_PASSWORD_1?.trim()
  const testPassword2 = process.env.ROBOKASSA_TEST_PASSWORD_2?.trim()
  const forceTest = process.env.ROBOKASSA_FORCE_TEST === '1'

  if (!merchantLogin) return null

  const useTest = forceTest || !productionPassword1 || !productionPassword2
  const password1 = useTest ? testPassword1 : productionPassword1
  const password2 = useTest ? testPassword2 : productionPassword2

  if (!password1 || !password2) return null

  return {
    merchantLogin,
    password1,
    password2,
    isTest: useTest,
  }
}

export function isRobokassaConfigured(): boolean {
  return getRobokassaConfig() !== null
}

export function buildPaymentSignature(
  config: RobokassaConfig,
  outSum: number,
  invId: number,
  customParams: RobokassaCustomParams = {},
): string {
  const base = `${config.merchantLogin}:${formatAmount(outSum)}:${invId}:${config.password1}`
  return md5(`${base}${buildCustomSuffix(customParams)}`)
}

export function buildResultSignature(
  config: RobokassaConfig,
  outSum: string,
  invId: string,
  customParams: RobokassaCustomParams = {},
): string {
  const base = `${outSum}:${invId}:${config.password2}`
  return md5(`${base}${buildCustomSuffix(customParams)}`)
}

export function buildPaymentUrl(input: {
  config: RobokassaConfig
  outSum: number
  invId: number
  description: string
  email: string
  customParams?: RobokassaCustomParams
  culture?: 'ru' | 'en'
}): string {
  const customParams = input.customParams ?? {}
  const signature = buildPaymentSignature(input.config, input.outSum, input.invId, customParams)
  const params = new URLSearchParams({
    MerchantLogin: input.config.merchantLogin,
    OutSum: formatAmount(input.outSum),
    InvId: String(input.invId),
    Description: input.description,
    SignatureValue: signature,
    Email: input.email,
    Culture: input.culture ?? 'ru',
  })

  if (input.config.isTest) {
    params.set('IsTest', '1')
  }

  for (const [key, value] of Object.entries(customParams)) {
    if (value) params.set(key, value)
  }

  return `${PAYMENT_URL}?${params.toString()}`
}

export function extractCustomParams(
  source: URLSearchParams | Record<string, string | undefined>,
): RobokassaCustomParams {
  const custom: RobokassaCustomParams = {}
  const entries =
    source instanceof URLSearchParams
      ? Array.from(source.entries())
      : Object.entries(source).filter((entry): entry is [string, string] => typeof entry[1] === 'string')

  for (const [key, value] of entries) {
    if (key.startsWith('Shp_') && value) {
      custom[key] = value
    }
  }

  return custom
}

export function normalizeSignature(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}
