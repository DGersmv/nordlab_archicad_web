'use client'

import { useEffect, useRef, useState } from 'react'

type PluginCardPreviewProps = {
  src: string
  poster?: string
}

export default function PluginCardPreview({ src, poster }: PluginCardPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          loadObserver.disconnect()
        }
      },
      { rootMargin: '80px' },
    )

    loadObserver.observe(video)

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (!shouldLoad) return
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined)
        } else {
          video.pause()
        }
      },
      { threshold: 0.35 },
    )

    playObserver.observe(video)

    return () => {
      loadObserver.disconnect()
      playObserver.disconnect()
    }
  }, [shouldLoad, src])

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
    >
      {shouldLoad && <source src={src} type="video/mp4" />}
    </video>
  )
}
