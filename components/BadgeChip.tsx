'use client'

import { BADGES, type BadgeTier, type BadgeDef } from '@/lib/badges'
import type { Lang } from '@/lib/i18n'

interface Props {
  tier: BadgeTier
  lang?: Lang
  /** Compact = icon-only (24px), false = pill with label */
  compact?: boolean
  /** Override displayed points (default: don't show points) */
  points?: number
}

/**
 * Visual chip for a user's badge tier. Used next to comment authors,
 * in profile cards and on the leaderboard.
 */
export default function BadgeChip({ tier, lang = 'es', compact = false, points }: Props) {
  const def: BadgeDef = BADGES.find(b => b.tier === tier) ?? BADGES[0]
  const label = def.label[lang]
  const blurb = def.blurb[lang]
  const tooltip = points != null ? `${label} · ${points} pts — ${blurb}` : `${label} — ${blurb}`

  if (compact) {
    return (
      <span
        title={tooltip}
        aria-label={tooltip}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 999,
          fontSize: 11,
          background: def.bg,
          border: `1px solid ${def.color}55`,
          cursor: 'help',
          flexShrink: 0,
        }}
      >
        {def.icon}
      </span>
    )
  }

  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 999,
        background: def.bg,
        border: `1px solid ${def.color}66`,
        color: def.color,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
        cursor: 'help',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 10 }}>{def.icon}</span>
      {label}
    </span>
  )
}
