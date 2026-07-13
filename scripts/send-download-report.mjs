import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'

function loadEnv(filePath) {
  const env = {}
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1)
  }
  return env
}

const pluginNames = {
  openingmaster: 'OpeningMaster',
  tableset: 'TableSet',
  meshmaster: 'MeshMaster',
}

function getMoscowDayBounds(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'
  const label = `${year}-${month}-${day}`
  const since = new Date(`${label}T00:00:00+03:00`)
  const until = new Date(since.getTime() + 24 * 60 * 60 * 1000)
  return { since, until, label }
}

function getPreviousMoscowDayBounds(date = new Date()) {
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000)
  return getMoscowDayBounds(yesterday)
}

function inRange(iso, since, until) {
  const at = new Date(iso)
  return at >= since && at < until
}

function summarizeDownloads(events, since, until) {
  const filtered = events.filter((event) => inRange(event.at, since, until))
  const byPlugin = new Map()
  const byFile = new Map()

  for (const event of filtered) {
    byPlugin.set(event.pluginSlug, (byPlugin.get(event.pluginSlug) ?? 0) + 1)
    const key = `${event.pluginSlug}:${event.archicad}:${event.filename}`
    const current = byFile.get(key)
    if (current) {
      current.count += 1
    } else {
      byFile.set(key, {
        pluginSlug: event.pluginSlug,
        archicad: event.archicad,
        filename: event.filename,
        count: 1,
      })
    }
  }

  return {
    total: filtered.length,
    byPlugin: [...byPlugin.entries()]
      .map(([pluginSlug, count]) => ({ pluginSlug, count }))
      .sort((a, b) => b.count - a.count),
    byFile: [...byFile.values()].sort((a, b) => b.count - a.count || a.filename.localeCompare(b.filename)),
  }
}

function formatReport(dayLabel, summary, allTimeTotal) {
  const pluginLines =
    summary.byPlugin.length === 0
      ? ['— нет скачиваний']
      : summary.byPlugin.map((row) => `  • ${pluginNames[row.pluginSlug]}: ${row.count}`)

  const fileLines =
    summary.byFile.length === 0
      ? ['— нет скачиваний']
      : summary.byFile.map(
          (row) =>
            `  • ${pluginNames[row.pluginSlug]} AC${row.archicad} (${row.filename}): ${row.count}`,
        )

  return [
    'Nordlab — отчёт по скачиваниям trial .apx',
    `Дата (МСК): ${dayLabel}`,
    '',
    `Всего за день: ${summary.total}`,
    '',
    'По плагинам:',
    ...pluginLines,
    '',
    'По файлам:',
    ...fileLines,
    '',
    `Всего скачиваний за всё время (в базе): ${allTimeTotal}`,
    '',
    'Платежи в этот отчёт не входят.',
  ].join('\n')
}

async function main() {
  const root = process.cwd()
  const env = loadEnv(path.join(root, '.env'))
  const force = process.argv.includes('--force')
  const day = getPreviousMoscowDayBounds()

  const statsPath = path.join(root, 'data', 'download-stats.json')
  const statePath = path.join(root, 'data', 'download-report-state.json')

  let events = []
  if (fs.existsSync(statsPath)) {
    const parsed = JSON.parse(fs.readFileSync(statsPath, 'utf8'))
    events = Array.isArray(parsed.events) ? parsed.events : []
  }

  let lastReportedDay = null
  if (fs.existsSync(statePath)) {
    const parsed = JSON.parse(fs.readFileSync(statePath, 'utf8'))
    lastReportedDay = parsed.lastReportedDay ?? null
  }

  if (!force && lastReportedDay === day.label) {
    console.log(`SKIP already_reported day=${day.label}`)
    return
  }

  const host = env.SMTP_HOST || 'smtp.zoho.com'
  const port = Number(env.SMTP_PORT || '465')
  const user = env.SMTP_USER
  const pass = env.SMTP_PASS
  const from = env.SMTP_FROM?.trim() || user
  const to = env.SMTP_TO || 'admin@nordlab.net'

  if (!user || !pass || !from) {
    throw new Error('SMTP not configured')
  }

  const summary = summarizeDownloads(events, day.since, day.until)
  const text = formatReport(day.label, summary, events.length)
  const subject = `Nordlab — скачивания ${day.label}: ${summary.total}`

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    tls: { minVersion: 'TLSv1.2' },
  })

  await transporter.sendMail({ from, to, subject, text })

  fs.mkdirSync(path.dirname(statePath), { recursive: true })
  const tempFile = `${statePath}.tmp`
  fs.writeFileSync(tempFile, JSON.stringify({ lastReportedDay: day.label }, null, 2), 'utf8')
  fs.renameSync(tempFile, statePath)

  console.log(`EMAIL_SENT=${to} day=${day.label} total=${summary.total}`)
}

main().catch((error) => {
  console.error(String(error))
  process.exit(1)
})
