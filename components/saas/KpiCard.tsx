interface KpiCardProps {
  label: string
  value: string | number
  subline: string
  tone: 'primary' | 'teal'
  trend?: { delta: string; tone: 'primary' | 'teal' | 'red' }
}

const TONE_DOT: Record<'primary' | 'teal', string> = {
  primary: 'var(--ts-primary)',
  teal: 'var(--ts-teal)',
}

const TREND_FG: Record<'primary' | 'teal' | 'red', string> = {
  primary: 'var(--ts-primary)',
  teal: 'var(--ts-teal)',
  red: 'var(--ts-red)',
}

export default function KpiCard({ label, value, subline, tone, trend }: KpiCardProps) {
  return (
    <div
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--ts-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--ts-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: 11,
              color: TREND_FG[trend.tone],
              marginLeft: 'auto',
              padding: '2px 7px',
              background: 'var(--ts-card2)',
              borderRadius: 999,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {trend.delta}
          </span>
        )}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: 'var(--ts-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: TONE_DOT[tone],
            display: 'inline-block',
          }}
        />
        {subline}
      </div>
    </div>
  )
}
