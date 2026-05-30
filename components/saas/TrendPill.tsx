interface TrendPillProps {
  delta: number
  unit?: string
  tone?: 'primary' | 'teal'
}

export default function TrendPill({ delta, unit = '', tone = 'teal' }: TrendPillProps) {
  const positive = delta >= 0
  const fg = positive
    ? tone === 'teal'
      ? 'var(--ts-teal-hot)'
      : 'var(--ts-primary-hot)'
    : 'var(--ts-red)'
  const bg = positive ? 'var(--ts-card2)' : 'var(--ts-card2)'
  const arrow = positive ? '↑' : '↓'
  const sign = positive ? '+' : ''
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        background: bg,
        color: fg,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{arrow}</span>
      <span>{sign}{delta}{unit}</span>
    </span>
  )
}
