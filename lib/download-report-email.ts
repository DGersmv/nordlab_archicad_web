import nodemailer from 'nodemailer'
import type { DownloadStatsSummary } from '@/lib/download-stats'

const pluginNames = {
  openingmaster: 'OpeningMaster',
  tableset: 'TableSet',
  meshmaster: 'MeshMaster',
} as const

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

function formatPluginLines(summary: DownloadStatsSummary): string[] {
  if (summary.byPlugin.length === 0) {
    return ['— нет скачиваний']
  }

  return summary.byPlugin.map(
    (row) => `  • ${pluginNames[row.pluginSlug]}: ${row.count}`,
  )
}

function formatFileLines(summary: DownloadStatsSummary): string[] {
  if (summary.byFile.length === 0) {
    return ['— нет скачиваний']
  }

  return summary.byFile.map(
    (row) => `  • ${pluginNames[row.pluginSlug]} AC${row.archicad} (${row.filename}): ${row.count}`,
  )
}

export function formatDownloadReportText(input: {
  dayLabel: string
  summary: DownloadStatsSummary
  allTimeTotal: number
}): string {
  const { dayLabel, summary, allTimeTotal } = input

  return [
    `Nordlab — отчёт по скачиваниям trial .apx`,
    `Дата (МСК): ${dayLabel}`,
    '',
    `Всего за день: ${summary.total}`,
    '',
    'По плагинам:',
    ...formatPluginLines(summary),
    '',
    'По файлам:',
    ...formatFileLines(summary),
    '',
    `Всего скачиваний за всё время (в базе): ${allTimeTotal}`,
    '',
    'Платежи в этот отчёт не входят.',
  ].join('\n')
}

export async function sendDownloadReportEmail(input: {
  dayLabel: string
  summary: DownloadStatsSummary
  allTimeTotal: number
}): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP not configured')
  }

  const to = process.env.SMTP_TO || 'admin@nordlab.net'
  const subject = `Nordlab — скачивания ${input.dayLabel}: ${input.summary.total}`
  const text = formatDownloadReportText(input)

  await sendEmail(to, subject, text)
}

export function canSendDownloadReportEmail(): boolean {
  return isSmtpConfigured()
}
