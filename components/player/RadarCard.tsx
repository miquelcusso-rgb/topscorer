import type { ReactNode } from 'react'

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
  /** Optional control rendered top-right of the card header (e.g. profile selector). */
  toolbar?: ReactNode
}

// Split a label so it wraps across up to 2 SVG <tspan> lines when it's long,
// keeping each line short enough to fit inside the padded viewBox. Short labels
// stay on a single line.
function wrapLabel(label: string, maxChars = 11): string[] {
  if (label.length <= maxChars) return [label]
  const words = label.split(' ')
  if (words.length === 1) return [label] // single long token — let it ride (rare)
  const lines: string[] = ['', '']
  let li = 0
  for (const w of words) {
    if (lines[li] && (lines[li] + ' ' + w).length > maxChars && li === 0) li = 1
    lines[li] = lines[li] ? `${lines[li]} ${w}` : w
  }
  return lines.filter(Boolean)
}

function toneColor(tone: 'primary' | 'teal' | 'text'): string {
  if (tone === 'primary') return 'var(--ts-primary)'
  if (tone === 'teal') return 'var(--ts-teal)'
  return 'var(--ts-text)'
}

export default function RadarCard({ title, subtitle, axes, stats, size = 340, toolbar }: RadarCardProps) {
  const n = axes.length
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  // Horizontal/vertical padding around the chart so the edge labels (e.g.
  // "SHOT VOLUME", "CHANCE CREATION") are never clipped at the SVG bounds, for
  // every position's axis set. Labels render in a monospace ~6.7px/char at
  // fontSize 11; the longest single-line label we allow is ~11 chars (~74px),
  // and end/start anchoring pushes that fully outside the chart on the left/right
  // axes — so we need ≥ ~96px of horizontal breathing room.
  const PAD_X = 104
  const PAD_Y = 30
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)' }}>
            {title}
          </h3>
          <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2 }}>{subtitle}</div>
        </div>
        {toolbar}
      </div>
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
            const lines = wrapLabel(v.label.toUpperCase())
            // Vertical offset so a 2-line label stays centred on its vertex.
            const startDy = -((lines.length - 1) * 12) / 2
            return (
              <g key={i}>
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fill="var(--ts-muted)"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                  fontSize={11}
                  letterSpacing="0.02em"
                >
                  {lines.map((line, li) => (
                    <tspan key={li} x={lx} dy={li === 0 ? startDy : 12}>{line}</tspan>
                  ))}
                </text>
                <text
                  x={lx}
                  y={ly + startDy + (lines.length - 1) * 12 + 15}
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
