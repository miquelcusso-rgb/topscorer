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
  const [broken, setBroken] = useState(false)

  if (photo && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setBroken(true)}
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
