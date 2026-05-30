import type { PlayerData } from '@/types'
import { avatarTintFor, initialsOf } from '@/lib/palette'

interface HoverCardProps {
  player: PlayerData
  mode?: 'light' | 'dark'
  position?: 'left' | 'right'
}

export default function HoverCard({ player, mode = 'light', position = 'right' }: HoverCardProps) {
  const tint = avatarTintFor(player.name, mode)
  const initials = initialsOf(player.name)
  return (
    <div
      style={{
        width: 240,
        background: 'var(--ts-card)',
        borderRadius: 8,
        border: '1px solid var(--ts-border)',
        boxShadow: '0 12px 40px rgba(0,0,0,.22), 0 2px 6px rgba(0,0,0,.08)',
        overflow: 'hidden',
        fontFamily: 'DM Sans, sans-serif',
        color: 'var(--ts-text)',
        pointerEvents: 'none',
        // hint about position; consumers can override placement
        marginLeft: position === 'right' ? 8 : 0,
        marginRight: position === 'left' ? 8 : 0,
      }}
    >
      <div
        style={{
          height: 130,
          position: 'relative',
          overflow: 'hidden',
          background: tint.bg,
          color: tint.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {initials}
        </span>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 60%)',
          }}
        />
        <div style={{ position: 'absolute', bottom: 8, left: 12, right: 12, color: '#fff' }}>
          <div
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.005em',
            }}
          >
            {player.name}
          </div>
          <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: '0.04em' }}>
            {player.club} {player.position ? `· ${player.position}` : ''}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 9,
            color: '#fff',
            background: 'rgba(0,0,0,.4)',
            padding: '2px 6px',
            borderRadius: 3,
            letterSpacing: '0.08em',
          }}
        >
          {player.flag ?? ''} {player.age}
        </div>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{player.league}</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid var(--ts-divider)',
          }}
        >
          {[
            { n: player.goles, l: 'G', c: 'var(--ts-primary)' },
            { n: player.asist, l: 'A', c: 'var(--ts-teal)' },
            { n: player.pj, l: 'PJ', c: 'var(--ts-text)' },
            { n: (player.minutes ?? 0).toString(), l: 'MIN', c: 'var(--ts-text)' },
          ].map(stat => (
            <div key={stat.l}>
              <div
                style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: stat.c,
                  lineHeight: 0.9,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stat.n}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'var(--ts-muted)',
                  letterSpacing: '0.08em',
                  marginTop: 2,
                }}
              >
                {stat.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
