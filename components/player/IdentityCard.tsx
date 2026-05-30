import type { PlayerData } from '@/types'
import { avatarTintFor, initialsOf } from '@/lib/palette'
import { shortName, fullNameIfDifferent } from '@/lib/player-name'

interface IdentityCardProps {
  player: PlayerData
  mode?: 'light' | 'dark'
  goldenBootLabel?: string
  goalsLabel?: string
  liveText?: string
}

export default function IdentityCard({
  player,
  mode = 'light',
  goldenBootLabel = '#1 · Bota de Oro 25/26',
  goalsLabel = 'Goles 25/26',
  liveText,
}: IdentityCardProps) {
  const tint = avatarTintFor(player.name, mode)
  const initials = initialsOf(player.name)
  const xg = Math.max(0, player.goles - 1)
  return (
    <div
      className="saas-identity-card"
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 12,
        padding: 24,
        display: 'grid',
        gridTemplateColumns: '140px 1fr auto',
        gap: 24,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 16,
          background: tint.bg,
          color: tint.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          overflow: 'hidden',
        }}
      >
        {initials}
      </div>

      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            background: 'var(--ts-primary-soft)',
            color: 'var(--ts-primary)',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <svg width={11} height={11} viewBox="0 0 11 11" fill="currentColor" aria-hidden>
            <path d="M5.5 1L7 4l3 .4-2.2 2 .5 3-2.8-1.5L2.7 9.4l.5-3L1 4.4 4 4z" />
          </svg>
          {goldenBootLabel}
        </div>
        <h1
          style={{
            margin: '8px 0 2px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 36,
            fontWeight: 700,
            color: 'var(--ts-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {shortName(player)}
        </h1>
        {fullNameIfDifferent(player) && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--ts-muted)',
              fontStyle: 'italic',
              marginBottom: 4,
            }}
          >
            {fullNameIfDifferent(player)}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: 18,
            fontSize: 13,
            color: 'var(--ts-muted)',
            flexWrap: 'wrap',
          }}
        >
          <span>
            {player.flag ?? ''} {player.nationality ?? ''} · {player.age} · {player.height ?? '—'}
          </span>
          <span>
            {player.club} {player.position ? `· ${player.position}` : ''}
          </span>
          {player.marketValue && (
            <span>
              Valor: <strong style={{ color: 'var(--ts-text)' }}>{player.marketValue}</strong>
            </span>
          )}
        </div>
        {liveText && (
          <div
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: 'var(--ts-teal-soft)',
              color: 'var(--ts-teal)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--ts-teal)',
                boxShadow: '0 0 8px var(--ts-teal)',
                display: 'inline-block',
              }}
            />
            {liveText}
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '0 12px',
          borderLeft: '1px solid var(--ts-divider)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--ts-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {goalsLabel}
        </div>
        <div
          style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 96,
            fontWeight: 700,
            color: 'var(--ts-primary)',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums',
            marginTop: 6,
          }}
        >
          {player.goles}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            marginTop: 10,
            justifyContent: 'center',
            fontSize: 13,
            color: 'var(--ts-muted)',
          }}
        >
          <span>
            <strong style={{ color: 'var(--ts-teal)', fontSize: 18 }}>{player.asist}</strong> AST
          </span>
          <span>
            <strong style={{ color: 'var(--ts-text)', fontSize: 18 }}>{xg.toFixed(1)}</strong> xG
          </span>
          <span>
            <strong style={{ color: 'var(--ts-teal)', fontSize: 18 }}>+1.6</strong> vs xG
          </span>
        </div>
      </div>
    </div>
  )
}
