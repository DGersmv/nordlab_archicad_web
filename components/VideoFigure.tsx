'use client'

import { useEffect, useRef, useState } from 'react'
import type { LocalizedText } from '@/content/types'
import { pickLocalized } from '@/lib/locale'
import type { Locale } from '@/content/types'

type VideoFigureProps = {
  src: string
  poster?: string
  caption?: LocalizedText
  locale: Locale
}

export default function VideoFigure({ src, poster, caption, locale }: VideoFigureProps) {
  const figureRef = useRef<HTMLElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const node = figureRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '120px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <figure ref={figureRef} className="border border-hairline bg-paper">
      <video
        className="block w-full"
        autoPlay={shouldLoad}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        aria-label={caption ? pickLocalized(caption, locale) : undefined}
      >
        {shouldLoad && <source src={src} type="video/mp4" />}
      </video>
      {caption && (
        <figcaption className="border-t border-hairline px-4 py-2 font-mono text-xs text-graphite">
          {pickLocalized(caption, locale)}
        </figcaption>
      )}
    </figure>
  )
}
