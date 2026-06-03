'use client'
import { useState } from 'react'
import { avatarTintFor, initialsOf } from '@/lib/palette'
import { useTheme } from '@/contexts/ThemeContext'

interface AvatarProps {
  name: string
  size?: number
  /** Real player photo (API-Football CDN). Falls back to tinted initials. */
  photo?: string
}

export default function Avatar({ name, size = 36, photo }: AvatarProps) {
  const { theme } = useTheme()
  const tint = avatarTintFor(name, theme)
  const initials = initialsOf(name)
  // Photo load: try with crossOrigin (lets the radar export to canvas), then
  // retry without it if that fails (some edge responses miss CORS headers), and
  // only then fall back to tinted initials — maximizes real-photo coverage.
  const [step, setStep] = useState(0)

  if (photo && step < 2) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={step}
        src={photo}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        crossOrigin={step === 0 ? 'anonymous' : undefined}
        onError={() => setStep(s => s + 1)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          background: tint.bg,
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: tint.bg,
        color: tint.fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: Math.round(size * 0.4),
        fontWeight: 700,
        letterSpacing: '-0.01em',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
