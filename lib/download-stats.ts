import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { ArchicadBuild, PluginDownloadSlug } from '@/content/downloads'
import { pluginDownloads } from '@/content/downloads'

export type DownloadEvent = {
  id: string
  pluginSlug: PluginDownloadSlug
  archicad: ArchicadBuild
  filename: string
  at: string
}

type DownloadStatsFile = {
  events: DownloadEvent[]
}

export type DownloadFileStats = {
  pluginSlug: PluginDownloadSlug
  archicad: ArchicadBuild
  filename: string
  count: number
}

export type DownloadPluginStats = {
  pluginSlug: PluginDownloadSlug
  count: number
}

export type DownloadDayStats = {
  date: string
  count: number
}

export type DownloadStatsSummary = {
  total: number
  since: string
  until: string
  byPlugin: DownloadPluginStats[]
  byFile: DownloadFileStats[]
  byDay: DownloadDayStats[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const STATS_FILE = path.join(DATA_DIR, 'download-stats.json')
const REPORT_STATE_FILE = path.join(DATA_DIR, 'download-report-state.json')

const ALLOWED_AC = new Set<ArchicadBuild>(['27', '28', '29'])
const FILENAME_RE = /^[A-Za-z0-9._-]+\.apx$/

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

async function readStatsFile(): Promise<DownloadStatsFile> {
  await ensureDataDir()
  try {
    const raw = await fs.readFile(STATS_FILE, 'utf8')
    const parsed = JSON.parse(raw) as DownloadStatsFile
    if (!Array.isArray(parsed.events)) {
      throw new Error('Invalid download stats file')
    }
    return parsed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const initial: DownloadStatsFile = { events: [] }
      await writeStatsFile(initial)
      return initial
    }
    throw error
  }
}

async function writeStatsFile(data: DownloadStatsFile): Promise<void> {
  await ensureDataDir()
  const tempFile = `${STATS_FILE}.tmp`
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tempFile, STATS_FILE)
}

function parseDownloadPath(segments: string[]): { archicad: ArchicadBuild; filename: string } | null {
  if (segments.length !== 2) return null

  const [acFolder, filename] = segments
  const match = /^ac(27|28|29)$/.exec(acFolder)
  if (!match || !FILENAME_RE.test(filename)) return null

  const archicad = match[1] as ArchicadBuild
  if (!ALLOWED_AC.has(archicad)) return null

  const allowed = pluginDownloads.some((entry) =>
    entry.builds.some((build) => build.archicad === archicad && build.filename === filename),
  )
  if (!allowed) return null

  return { archicad, filename }
}

function pluginSlugFromFilename(filename: string): PluginDownloadSlug | null {
  const entry = pluginDownloads.find((plugin) =>
    plugin.builds.some((build) => build.filename === filename),
  )
  return entry?.slug ?? null
}

export function resolveTrackedDownload(segments: string[]): {
  archicad: ArchicadBuild
  filename: string
  pluginSlug: PluginDownloadSlug
  publicPath: string
} | null {
  const parsed = parseDownloadPath(segments)
  if (!parsed) return null

  const pluginSlug = pluginSlugFromFilename(parsed.filename)
  if (!pluginSlug) return null

  return {
    ...parsed,
    pluginSlug,
    publicPath: `/downloads/ac${parsed.archicad}/${parsed.filename}`,
  }
}

export async function recordDownload(input: {
  pluginSlug: PluginDownloadSlug
  archicad: ArchicadBuild
  filename: string
}): Promise<DownloadEvent> {
  const file = await readStatsFile()
  const event: DownloadEvent = {
    id: randomUUID(),
    pluginSlug: input.pluginSlug,
    archicad: input.archicad,
    filename: input.filename,
    at: new Date().toISOString(),
  }

  file.events.push(event)

  const maxEvents = Number(process.env.DOWNLOAD_STATS_MAX_EVENTS || '20000')
  if (file.events.length > maxEvents) {
    file.events = file.events.slice(file.events.length - maxEvents)
  }

  await writeStatsFile(file)
  return event
}

function inRange(iso: string, since: Date, until: Date): boolean {
  const at = new Date(iso)
  return at >= since && at < until
}

export function summarizeDownloads(events: DownloadEvent[], since: Date, until: Date): DownloadStatsSummary {
  const filtered = events.filter((event) => inRange(event.at, since, until))

  const byPluginMap = new Map<PluginDownloadSlug, number>()
  const byFileMap = new Map<string, DownloadFileStats>()

  for (const event of filtered) {
    byPluginMap.set(event.pluginSlug, (byPluginMap.get(event.pluginSlug) ?? 0) + 1)

    const key = `${event.pluginSlug}:${event.archicad}:${event.filename}`
    const current = byFileMap.get(key)
    if (current) {
      current.count += 1
    } else {
      byFileMap.set(key, {
        pluginSlug: event.pluginSlug,
        archicad: event.archicad,
        filename: event.filename,
        count: 1,
      })
    }
  }

  const byDayMap = new Map<string, number>()
  for (const event of filtered) {
    const day = event.at.slice(0, 10)
    byDayMap.set(day, (byDayMap.get(day) ?? 0) + 1)
  }

  return {
    total: filtered.length,
    since: since.toISOString(),
    until: until.toISOString(),
    byPlugin: [...byPluginMap.entries()]
      .map(([pluginSlug, count]) => ({ pluginSlug, count }))
      .sort((a, b) => b.count - a.count),
    byFile: [...byFileMap.values()].sort((a, b) => b.count - a.count || a.filename.localeCompare(b.filename)),
    byDay: [...byDayMap.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

export async function getAllDownloadEvents(): Promise<DownloadEvent[]> {
  const file = await readStatsFile()
  return file.events
}

export async function getDownloadStatsSummary(input?: {
  since?: Date
  until?: Date
}): Promise<DownloadStatsSummary> {
  const events = await getAllDownloadEvents()
  const until = input?.until ?? new Date()
  const since = input?.since ?? new Date(until.getTime() - 30 * 24 * 60 * 60 * 1000)
  return summarizeDownloads(events, since, until)
}

export function getMoscowDayBounds(date = new Date()): { since: Date; until: Date; label: string } {
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

export function getPreviousMoscowDayBounds(date = new Date()): { since: Date; until: Date; label: string } {
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000)
  return getMoscowDayBounds(yesterday)
}

type ReportStateFile = {
  lastReportedDay?: string
}

export async function getLastReportedDay(): Promise<string | null> {
  await ensureDataDir()
  try {
    const raw = await fs.readFile(REPORT_STATE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as ReportStateFile
    return parsed.lastReportedDay ?? null
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

export async function markReportedDay(dayLabel: string): Promise<void> {
  await ensureDataDir()
  const tempFile = `${REPORT_STATE_FILE}.tmp`
  const payload: ReportStateFile = { lastReportedDay: dayLabel }
  await fs.writeFile(tempFile, JSON.stringify(payload, null, 2), 'utf8')
  await fs.rename(tempFile, REPORT_STATE_FILE)
}
