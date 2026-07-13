import { createReadStream, promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { recordDownload, resolveTrackedDownload } from '@/lib/download-stats'

export const runtime = 'nodejs'

type RouteContext = {
  params: { path: string[] }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const resolved = resolveTrackedDownload(context.params.path)
  if (!resolved) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const absolutePath = path.join(process.cwd(), 'public', resolved.publicPath.replace(/^\//, ''))

  try {
    const stat = await fs.stat(absolutePath)
    if (!stat.isFile()) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    await recordDownload({
      pluginSlug: resolved.pluginSlug,
      archicad: resolved.archicad,
      filename: resolved.filename,
    })

    const stream = createReadStream(absolutePath)
    return new NextResponse(stream as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(stat.size),
        'Content-Disposition': `attachment; filename="${resolved.filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    console.error('download file error', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
