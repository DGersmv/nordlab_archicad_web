import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthorized } from '@/lib/admin-auth'
import {
  getAllDownloadEvents,
  getLastReportedDay,
  getMoscowDayBounds,
  getPreviousMoscowDayBounds,
  markReportedDay,
  summarizeDownloads,
} from '@/lib/download-stats'
import { canSendDownloadReportEmail, sendDownloadReportEmail } from '@/lib/download-report-email'

export const runtime = 'nodejs'

function parseDays(value: string | null): number {
  const parsed = Number(value ?? '30')
  if (!Number.isFinite(parsed) || parsed < 1) return 30
  return Math.min(Math.floor(parsed), 365)
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const days = parseDays(request.nextUrl.searchParams.get('days'))
  const until = new Date()
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000)
  const events = await getAllDownloadEvents()
  const summary = summarizeDownloads(events, since, until)

  const today = getMoscowDayBounds()
  const yesterday = getPreviousMoscowDayBounds()
  const todaySummary = summarizeDownloads(events, today.since, today.until)
  const yesterdaySummary = summarizeDownloads(events, yesterday.since, yesterday.until)

  return NextResponse.json({
    success: true,
    allTimeTotal: events.length,
    range: summary,
    today: {
      label: today.label,
      ...todaySummary,
    },
    yesterday: {
      label: yesterday.label,
      ...yesterdaySummary,
    },
    lastReportedDay: await getLastReportedDay(),
    emailConfigured: canSendDownloadReportEmail(),
  })
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  if (!canSendDownloadReportEmail()) {
    return NextResponse.json(
      { error: 'not_configured', message: 'SMTP is not configured.' },
      { status: 503 },
    )
  }

  const force = request.nextUrl.searchParams.get('force') === '1'
  const day = getPreviousMoscowDayBounds()
  const lastReportedDay = await getLastReportedDay()

  if (!force && lastReportedDay === day.label) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: 'already_reported',
      dayLabel: day.label,
    })
  }

  const events = await getAllDownloadEvents()
  const summary = summarizeDownloads(events, day.since, day.until)

  await sendDownloadReportEmail({
    dayLabel: day.label,
    summary,
    allTimeTotal: events.length,
  })
  await markReportedDay(day.label)

  return NextResponse.json({
    success: true,
    skipped: false,
    dayLabel: day.label,
    summary,
    allTimeTotal: events.length,
  })
}
