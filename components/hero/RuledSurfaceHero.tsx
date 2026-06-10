'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import RuledSurfaceFallback from './RuledSurfaceFallback'

const RuledSurfaceCanvas = dynamic(() => import('./RuledSurfaceCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[240px] items-center justify-center md:min-h-[320px]">
      <RuledSurfaceFallback />
    </div>
  ),
})

export default function RuledSurfaceHero() {
  const [mode, setMode] = useState<'loading' | 'canvas' | 'fallback'>('loading')

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setMode('fallback')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setMode(gl ? 'canvas' : 'fallback')
    } catch {
      setMode('fallback')
    }
  }, [])

  return (
    <div className="border border-hairline bg-paper">
      {mode === 'loading' && (
        <div className="flex h-full min-h-[240px] items-center justify-center md:min-h-[320px]">
          <RuledSurfaceFallback />
        </div>
      )}
      {mode === 'fallback' && (
        <div className="h-full min-h-[240px] md:min-h-[320px]">
          <RuledSurfaceFallback />
        </div>
      )}
      {mode === 'canvas' && <RuledSurfaceCanvas />}
    </div>
  )
}
