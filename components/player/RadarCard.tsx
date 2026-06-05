export interface RadarAxis {
  label: string
  value: string | number
  pct: number // 0-100
}

interface RadarCardProps {
  title: string
  subtitle: string
  axes: RadarAxis[]
  stats: Array<{ value: string | number; label: string; tone?: 'primary' | 'teal' | 'text' }>
  size?: number
}

function toneColor(tone: 'primary' | 'teal' | 'text'): string {
  if (tone === 'primary') return 'var(--ts-primary)'
  if (tone === 'teal') return 'var(--ts-teal)'
  return 'var(--ts-text)'
}

export default function RadarCard({ title, subtitle, axes, stats, size = 340 }: RadarCardProps) {
  const n = axes.length
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  // Horizontal/vertical padding around the chart so the edge labels (e.g.
  // "P. CLAVE", "ON TARGET") are never clipped at the SVG bounds, for every
  // position's axis set.
  const PAD_X = 64
  const PAD_Y = 22
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const pt = (i: number, t: number): [number, number] => [
    cx + Math.cos(angle(i)) * r * t,
    cy + Math.sin(angle(i)) * r * t,
  ]
  const polygon = (t: number) =>
    Array.from({ length: n }, (_, i) => pt(i, t).join(',')).join(' ')
  const dataPts = axes.map((v, i) => pt(i, v.pct / 100).join(',')).join(' ')

  return (
    <div
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)' }}>
        {title}
      </h3>
      <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2 }}>{subtitle}</div>
      <div style={{ marginTop: 10 }}>
        <svg
          viewBox={`${-PAD_X} ${-PAD_Y} ${size + PAD_X * 2} ${size + PAD_Y * 2}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {[0.25, 0.5, 0.75, 1].map((t, i) => (
            <polygon
              key={i}
              points={polygon(t)}
              fill="none"
              stroke="var(--ts-divider)"
              strokeWidth={i === 3 ? 1 : 0.6}
            />
          ))}
          {axes.map((_, i) => {
            const [x, y] = pt(i, 1)
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="var(--ts-divider)"
                strokeWidth={0.6}
              />
            )
          })}
          <polygon
            points={dataPts}
            fill="var(--ts-primary)"
            fillOpacity={0.22}
            stroke="var(--ts-primary)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {axes.map((v, i) => {
            const [x, y] = pt(i, v.pct / 100)
            return <circle key={i} cx={x} cy={y} r={3} fill="var(--ts-primary)" />
          })}
          {axes.map((v, i) => {
            const [lx, ly] = pt(i, 1.18)
            const anchor =
              Math.abs(lx - cx) < 5 ? 'middle' : lx < cx ? 'end' : 'start'
            return (
              <g key={i}>
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fill="var(--ts-muted)"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                  fontSize={11.5}
                  letterSpacing="0.04em"
                >
                  {v.label.toUpperCase()}
                </text>
                <text
                  x={lx}
                  y={ly + 14}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fill="var(--ts-primary)"
                  fontFamily="Barlow Condensed, sans-serif"
                  fontWeight={700}
                  fontSize={15}
                >
                  {v.value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid var(--ts-divider)',
          display: 'grid',
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          gap: 10,
        }}
      >
        {stats.map(s => (
          <div key={s.label}>
            <div
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 20,
                fontWeight: 700,
                color: toneColor(s.tone ?? 'text'),
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
