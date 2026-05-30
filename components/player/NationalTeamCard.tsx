interface NationalTeamCardProps {
  title: string
  stats: Array<{ value: string | number; label: string; tone?: 'primary' | 'teal' | 'text' }>
  footer: string
}

function toneColor(tone: 'primary' | 'teal' | 'text'): string {
  if (tone === 'primary') return 'var(--ts-primary)'
  if (tone === 'teal') return 'var(--ts-teal)'
  return 'var(--ts-text)'
}

export default function NationalTeamCard({ title, stats, footer }: NationalTeamCardProps) {
  return (
    <div
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--ts-text)',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {stats.map(s => (
          <div key={s.label}>
            <div
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 22,
                fontWeight: 700,
                color: toneColor(s.tone ?? 'text'),
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--ts-divider)',
          fontSize: 11,
          color: 'var(--ts-muted)',
        }}
      >
        {footer}
      </div>
    </div>
  )
}
