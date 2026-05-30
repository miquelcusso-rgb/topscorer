export interface MatchRow {
  j: number
  vs: string
  ha: 'H' | 'A'
  hs: number
  as: number
  min: number
  g: number
  a: number
  sht: number
  xg: number
  r: number // rating
  live?: boolean
}

interface MatchTableProps {
  title: string
  subtitle: string
  rows: MatchRow[]
  ctaLabel?: string
}

const GRID = '52px 1fr 90px 50px 36px 36px 36px 50px 50px'

export default function MatchTable({ title, subtitle, rows, ctaLabel = 'Ver todos →' }: MatchTableProps) {
  return (
    <div
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--ts-divider)',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)' }}>
            {title}
          </h3>
          <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2 }}>{subtitle}</div>
        </div>
        <button
          type="button"
          style={{
            padding: '4px 10px',
            fontSize: 11,
            color: 'var(--ts-teal)',
            background: 'var(--ts-teal-soft)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 600,
          }}
        >
          {ctaLabel}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 8,
          padding: '8px 18px',
          background: 'var(--ts-card2)',
          fontSize: 10,
          color: 'var(--ts-muted)',
          letterSpacing: '0.06em',
          fontWeight: 600,
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--ts-divider)',
        }}
      >
        <span>J</span>
        <span>Rival</span>
        <span>Resultado</span>
        <span style={{ textAlign: 'right' }}>Min</span>
        <span style={{ textAlign: 'right', color: 'var(--ts-primary)' }}>G</span>
        <span style={{ textAlign: 'right', color: 'var(--ts-teal)' }}>A</span>
        <span style={{ textAlign: 'right' }}>SHT</span>
        <span style={{ textAlign: 'right' }}>xG</span>
        <span style={{ textAlign: 'right' }}>Rating</span>
      </div>

      {rows.map(m => (
        <div
          key={m.j}
          style={{
            display: 'grid',
            gridTemplateColumns: GRID,
            gap: 8,
            padding: '10px 18px',
            alignItems: 'center',
            fontSize: 12,
            borderBottom: '1px solid var(--ts-hairline)',
            background: m.live ? 'var(--ts-teal-soft)' : 'transparent',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              color: 'var(--ts-muted)',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            J{m.j}
            {m.live && (
              <span style={{ marginLeft: 4, color: 'var(--ts-teal)', fontSize: 9 }}>● LIVE</span>
            )}
          </span>
          <span
            style={{
              color: 'var(--ts-text)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: 'var(--ts-muted)',
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                width: 12,
              }}
            >
              {m.ha}
            </span>
            {m.vs}
          </span>
          <span
            style={{
              color: 'var(--ts-text)',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 600,
            }}
          >
            <span style={{ color: m.hs > m.as ? 'var(--ts-teal)' : 'var(--ts-muted)' }}>
              {m.hs}
            </span>
            <span style={{ color: 'var(--ts-faint)', margin: '0 3px' }}>–</span>
            <span style={{ color: m.as > m.hs ? 'var(--ts-teal)' : 'var(--ts-muted)' }}>
              {m.as}
            </span>
          </span>
          <span
            style={{
              textAlign: 'right',
              color: 'var(--ts-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {m.min}&apos;
          </span>
          <span
            style={{
              textAlign: 'right',
              color: m.g > 0 ? 'var(--ts-primary)' : 'var(--ts-faint)',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {m.g || '·'}
          </span>
          <span
            style={{
              textAlign: 'right',
              color: m.a > 0 ? 'var(--ts-teal)' : 'var(--ts-faint)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {m.a || '·'}
          </span>
          <span
            style={{
              textAlign: 'right',
              color: 'var(--ts-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {m.sht}
          </span>
          <span
            style={{
              textAlign: 'right',
              color: 'var(--ts-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {m.xg.toFixed(1)}
          </span>
          <span
            style={{
              textAlign: 'right',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color:
                m.r >= 8.5
                  ? 'var(--ts-primary)'
                  : m.r >= 7.5
                    ? 'var(--ts-teal)'
                    : 'var(--ts-text)',
            }}
          >
            {m.r.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  )
}
