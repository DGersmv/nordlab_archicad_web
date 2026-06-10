'use client'

import { useEffect, useRef, useState } from 'react'
import type { Locale, PluginImage } from '@/content/types'
import { pickLocalized } from '@/lib/locale'

const INTERVAL_MS = 4500
const FADE_MS = 700

type PluginImageCarouselProps = {
  images: PluginImage[]
  locale: Locale
  /** `figure` matches VideoFigure; `card` fills the catalog preview slot. */
  variant?: 'figure' | 'card'
  intervalMs?: number
}

export default function PluginImageCarousel({
  images,
  locale,
  variant = 'figure',
  intervalMs = INTERVAL_MS,
}: PluginImageCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: variant === 'card' ? '80px' : '120px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [variant])

  useEffect(() => {
    if (!shouldLoad || images.length < 2) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [shouldLoad, images.length, intervalMs])

  const isCard = variant === 'card'
  const imageFit = isCard ? 'object-cover' : 'object-contain'
  const sharedAlt = images.map((image) => altFor(image, locale)).join(' · ')

  const slides = (
    <div
      ref={rootRef}
      className={
        isCard
          ? 'relative h-full w-full overflow-hidden bg-paper'
          : 'relative aspect-video w-full overflow-hidden bg-paper'
      }
      role="img"
      aria-label={sharedAlt}
      aria-live="polite"
    >
      {images.map((image, imageIndex) => (
        <img
          key={image.src}
          src={shouldLoad ? image.src : undefined}
          alt={altFor(image, locale)}
          className={`absolute inset-0 h-full w-full ${imageFit} transition-opacity duration-700 ${
            imageIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ))}
    </div>
  )

  if (isCard) return slides

  return <figure className="border border-hairline bg-paper">{slides}</figure>
}

function altFor(image: PluginImage, locale: Locale): string {
  return image.alt ? pickLocalized(image.alt, locale) : ''
}
