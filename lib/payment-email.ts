import nodemailer from 'nodemailer'
import type { LicensePluginSlug } from '@/lib/license'

function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM?.trim() || user
  return Boolean(user && pass && from)
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST || 'smtp.zoho.com'
  const port = Number(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM?.trim() || user

  if (!user || !pass || !from) {
    throw new Error('SMTP not configured')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' },
  })

  await transporter.sendMail({ from, to, subject, text })
}

const pluginNames: Record<LicensePluginSlug, string> = {
  openingmaster: 'OpeningMaster',
  tableset: 'TableSet',
  meshmaster: 'MeshMaster',
}

export async function sendLicenseEmail(input: {
  email: string
  pluginSlug: LicensePluginSlug
  machineId: string
  licenseKey: string
  locale?: 'ru' | 'en'
}): Promise<void> {
  if (!isSmtpConfigured()) return

  const pluginName = pluginNames[input.pluginSlug]
  const isRu = input.locale !== 'en'

  const subject = isRu
    ? `Nordlab — лицензия ${pluginName}`
    : `Nordlab — ${pluginName} license key`

  const text = isRu
    ? [
        'Спасибо за оплату!',
        '',
        `Плагин: ${pluginName}`,
        `Machine ID: ${input.machineId}`,
        `Ключ лицензии: ${input.licenseKey}`,
        '',
        'Откройте палитру плагина в Archicad и вставьте ключ в поле активации.',
        '',
        'Если нужна помощь: admin@nordlab.net',
      ].join('\n')
    : [
        'Thank you for your purchase!',
        '',
        `Plugin: ${pluginName}`,
        `Machine ID: ${input.machineId}`,
        `License key: ${input.licenseKey}`,
        '',
        'Open the plugin palette in Archicad and paste the key into the activation field.',
        '',
        'Need help? admin@nordlab.net',
      ].join('\n')

  await sendEmail(input.email, subject, text)

  const adminTo = process.env.SMTP_TO || 'admin@nordlab.net'
  await sendEmail(
    adminTo,
    `Nordlab paid order — ${pluginName}`,
    [
      `Plugin: ${pluginName}`,
      `Email: ${input.email}`,
      `Machine ID: ${input.machineId}`,
      `License key: ${input.licenseKey}`,
    ].join('\n'),
  )
}

export function canSendLicenseEmail(): boolean {
  return isSmtpConfigured()
}
