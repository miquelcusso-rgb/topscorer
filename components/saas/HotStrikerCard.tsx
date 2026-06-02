import type { HotStriker } from '@/lib/home-insights'
import Avatar from './Avatar'

interface Props {
  hot: HotStriker
  lang: 'es' | 'en'
}

// "Jugador en racha / Hot striker" highlight — gold-accented form card.
// Real data: form = season rating + goals-per-game.
export default function HotStrikerCard({ hot, lang }: Props) {
  const en = lang === 'en'
  const title = en ? 'Hot striker' : 'Jugador en racha'
  const formLabel = en ? 'form' : 'racha'
  const ratingLabel = en ? 'rating' : 'nota'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 18px',
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border-hot)',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, var(--ts-primary-soft) 0%, transparent 55%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <Avatar name={hot.name} size={56} photo={hot.photo} />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ts-primary)',
          }}
        >
          <span aria-hidden>🔥</span> {title}
        </div>
        <div
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--ts-text)',
            marginTop: 3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {hot.flag ? `${hot.flag} ` : ''}
          {hot.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--ts-muted)',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {hot.club} · {hot.goles} {en ? 'goals' : 'goles'} · {hot.pj} {en ? 'apps' : 'PJ'}
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 18, textAlign: 'right' }}>
        <div>
          <div
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              fontSize: 30,
              lineHeight: 1,
              color: 'var(--ts-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {hot.form.toFixed(2)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ts-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {formLabel}
          </div>
        </div>
        {hot.rating != null && (
          <div>
            <div
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700,
                fontSize: 30,
                lineHeight: 1,
                color: 'var(--ts-teal)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {hot.rating.toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--ts-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {ratingLabel}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
