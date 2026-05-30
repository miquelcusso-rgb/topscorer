export interface ValuationPoint {
  date: string
  value: number // numeric millions for chart
  label: string // formatted label like "€180M"
  width: number // 0-100
}

interface ValuationCardProps {
  title?: string
  source?: string
  big: string
  delta: string
  history: ValuationPoint[]
}

export default function ValuationCard({
  title = 'Valoración de mercado',
  source = 'Fuente: Transfermarkt · TS Index',
  big,
  delta,
  history,
}: ValuationCardProps) {
  return (
    <div
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)' }}>
          {title}
        </h3>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ts-muted)', marginBottom: 12 }}>{source}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 36,
            fontWeight: 700,
            color: 'var(--ts-primary)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {big}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ts-teal)', fontWeight: 600 }}>{delta}</span>
      </div>
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          maxHeight: 220,
          overflowY: 'auto',
          paddingRight: 4,
        }}
      >
        {history.map(h => (
          <div
            key={h.date}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
          >
            <span
              style={{
                color: 'var(--ts-muted)',
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                width: 50,
                letterSpacing: '0.04em',
              }}
            >
              {h.date}
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                background: 'var(--ts-card2)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, h.width))}%`,
                  height: '100%',
                  background: 'var(--ts-primary)',
                  opacity: 0.7,
                }}
              />
            </div>
            <span
              style={{
                color: 'var(--ts-text)',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                width: 56,
                textAlign: 'right',
              }}
            >
              {h.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
