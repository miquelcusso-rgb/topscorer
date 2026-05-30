'use client'
import { avatarTintFor, initialsOf } from '@/lib/palette'
import { useTheme } from '@/contexts/ThemeContext'

interface AvatarProps {
  name: string
  size?: number
}

export default function Avatar({ name, size = 36 }: AvatarProps) {
  const { theme } = useTheme()
  const tint = avatarTintFor(name, theme)
  const initials = initialsOf(name)
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
