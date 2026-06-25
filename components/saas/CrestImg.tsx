'use client'
import { useState } from 'react'

interface CrestImgProps {
  src?: string
  alt?: string
  size?: number
  radius?: number
  /** 'contain' for crests/logos (default, never clipped), 'cover' for square badges. */
  fit?: 'contain' | 'cover'
  /** Optional neutral background behind the crest (helps odd-aspect badges read). */
  bg?: string
  className?: string
  title?: string
  /** Set 'anonymous' when the crest is captured to a canvas (e.g. comparador export). */
  crossOrigin?: 'anonymous' | 'use-credentials'
}

/**
 * CANONICAL club crest / team logo renderer.
 *
 * A crest MUST never look cropped: it is laid out inside a square box and the art
 * is rendered with `objectFit: 'contain'` plus a little internal padding, so badges
 * of any native aspect ratio fit whole, centered, and never touch/clip the edges.
 * The box keeps a fixed `size` (no layout shift / CLS), only the art inside scales.
 *
 * Disappears silently if the source 404s (no broken-image icon). Use everywhere a
 * club/team/league/nation crest is shown (tables, comparador, rumours, transfers,
 * news cards, mundial panels, hot strips, sidebar…). Do NOT use for player
 * headshots (round avatars use `cover`) or the brand ball logo.
 */
export default function CrestImg({
  src,
  alt = '',
  size = 16,
  radius = 2,
  fit = 'contain',
  bg,
  className,
  title,
  crossOrigin,
}: CrestImgProps) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) return null
  // Contain crests get a small internal padding (~12%) so the badge never touches the
  // box edges; cover badges fill the box edge-to-edge.
  const pad = fit === 'contain' ? Math.max(1, Math.round(size * 0.12)) : 0
  return (
    <span
      className={className}
      title={title}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: pad,
        boxSizing: 'border-box',
        borderRadius: radius,
        background: bg,
        overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        crossOrigin={crossOrigin}
        onError={() => setBroken(true)}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: fit === 'cover' ? '100%' : 'auto',
          height: fit === 'cover' ? '100%' : 'auto',
          objectFit: fit,
          display: 'block',
        }}
      />
    </span>
  )
}
