import type { ReactNode } from 'react'

export type PillTone = 'primary' | 'teal' | 'red' | 'neutral'

interface PillProps {
  tone: PillTone
  children: ReactNode
  dot?: boolean
}

const TONE_MAP: Record<PillTone, { bg: string; fg: string }> = {
  primary: { bg: 'var(--ts-primary-soft)', fg: 'var(--ts-primary)' },
  teal:    { bg: 'var(--ts-teal-soft)',    fg: 'var(--ts-teal)' },
  red:     { bg: 'var(--ts-red)',          fg: 'var(--ts-bg)' },
  neutral: { bg: 'var(--ts-card2)',        fg: 'var(--ts-muted)' },
}

export default function Pill({ tone, children, dot = false }: PillProps) {
  const t = TONE_MAP[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px',
        background: t.bg,
        color: t.fg,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  )
}
