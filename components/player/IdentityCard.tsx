import type { PlayerData } from '@/types'
import { avatarTintFor, initialsOf } from '@/lib/palette'
import { shortName, fullNameIfDifferent } from '@/lib/player-name'
import { CURRENT_SEASON_SHORT } from '@/lib/season'
import MarketValuePill from '@/components/player/MarketValuePill'

interface IdentityCardProps {
  player: PlayerData
  mode?: 'light' | 'dark'
  goldenBootLabel?: string
  goalsLabel?: string
  liveText?: string
  /** Gold IIG pill shown next to the badge row (e.g. "IIG 38.4"). */
  iigBadge?: { value: number; title?: string }
}

export default function IdentityCard({
  player,
  mode = 'light',
  goldenBootLabel,
  goalsLabel = `Goles ${CURRENT_SEASON_SHORT}`,
  liveText,
  iigBadge,
}: IdentityCardProps) {
  const tint = avatarTintFor(player.name, mode)
  const initials = initialsOf(player.name)
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
        className="saas-identity-photo"
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
        {player.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photo}
            alt={shortName(player)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initials
        )}
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Golden Boot pill: ONLY when a real rank label is passed (e.g. the
              player is the league's top scorer). No hardcoded default — it used
              to show "#1 · Bota de Oro" on every player, which was false. */}
          {goldenBootLabel && (
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
          )}
          {iigBadge && (
            <div
              title={iigBadge.title}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 9px',
                background: 'var(--ts-primary)',
                color: 'var(--ts-bg)',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              IIG {iigBadge.value.toFixed(1)}
            </div>
          )}
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
          <MarketValuePill name={player.fullName || player.name} fallback={player.marketValue} />
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
            <strong style={{ color: 'var(--ts-text)', fontSize: 18 }}>{player.shotsTotal ?? '—'}</strong> Tiros
          </span>
          <span>
            <strong style={{ color: 'var(--ts-teal)', fontSize: 18 }}>{player.rating != null ? player.rating.toFixed(2) : '—'}</strong> Nota
          </span>
        </div>
      </div>
    </div>
  )
}
