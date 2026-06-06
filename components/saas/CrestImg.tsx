'use client'
import { useState } from 'react'

interface CrestImgProps {
  src?: string
  alt?: string
  size?: number
  radius?: number
  /** 'contain' for crests/logos, 'cover' for square badges. */
  fit?: 'contain' | 'cover'
}

/** Club crest / logo image that simply disappears if the source 404s (no broken
 *  image icon). Use for hot-linked team crests in transfers, rumours, etc. */
export default function CrestImg({ src, alt = '', size = 16, radius = 2, fit = 'contain' }: CrestImgProps) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setBroken(true)}
      style={{ width: size, height: size, objectFit: fit, borderRadius: radius, flexShrink: 0 }}
    />
  )
}
