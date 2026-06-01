'use client'

// Overlapping comparison radar — two players' polygons on ONE hexagon.
// Pure SVG (no deps). Values are RELATIVE: each axis is normalized by the max
// of the two players on that axis, so the leader on an axis reaches the outer
// edge (100%) and the other is drawn proportionally. Palette-only colours via
// --ts-* vars → works light + dark.

export interface ComparisonAxis {
  label: string
  aPct: number // 0-100 (relative to the other player on this axis)
  bPct: number // 0-100
  aVal: string | number // real display value
  bVal: string | number
}

interface ComparisonRadarProps {
  axes: ComparisonAxis[]
  colorA: string
  colorB: string
  labelA: string
  labelB: string
  size?: number
}

export default function ComparisonRadar({
  axes,
  colorA,
  colorB,
  labelA,
  labelB,
  size = 340,
}: ComparisonRadarProps) {
  const n = axes.length
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.34
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const pt = (i: number, t: number): [number, number] => [
    cx + Math.cos(angle(i)) * r * t,
    cy + Math.sin(angle(i)) * r * t,
  ]
  const gridPolygon = (t: number) =>
    Array.from({ length: n }, (_, i) => pt(i, t).join(',')).join(' ')

  const aPoints = axes
    .map((v, i) => pt(i, Math.max(0, Math.min(100, v.aPct)) / 100).join(','))
    .join(' ')
  const bPoints = axes
    .map((v, i) => pt(i, Math.max(0, Math.min(100, v.bPct)) / 100).join(','))
    .join(' ')

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: colorA, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: colorA, opacity: 0.85, display: 'inline-block' }} />
          {labelA}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: colorB, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: colorB, opacity: 0.85, display: 'inline-block' }} />
          {labelB}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '100%', height: 'auto', display: 'block', maxWidth: size, margin: '0 auto' }}
      >
        {/* grid rings */}
        {[0.25, 0.5, 0.75, 1].map((t, i) => (
          <polygon
            key={`ring-${i}`}
            points={gridPolygon(t)}
            fill="none"
            stroke="var(--ts-divider)"
            strokeWidth={i === 3 ? 1 : 0.6}
          />
        ))}
        {/* spokes */}
        {axes.map((_, i) => {
          const [x, y] = pt(i, 1)
          return (
            <line
              key={`spoke-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="var(--ts-divider)"
              strokeWidth={0.6}
            />
          )
        })}

        {/* Player B polygon (drawn first so A reads on top) */}
        <polygon
          points={bPoints}
          fill={colorB}
          fillOpacity={0.22}
          stroke={colorB}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Player A polygon */}
        <polygon
          points={aPoints}
          fill={colorA}
          fillOpacity={0.22}
          stroke={colorA}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* vertex dots */}
        {axes.map((v, i) => {
          const [bx, by] = pt(i, Math.max(0, Math.min(100, v.bPct)) / 100)
          return <circle key={`bd-${i}`} cx={bx} cy={by} r={3} fill={colorB} />
        })}
        {axes.map((v, i) => {
          const [ax, ay] = pt(i, Math.max(0, Math.min(100, v.aPct)) / 100)
          return <circle key={`ad-${i}`} cx={ax} cy={ay} r={3} fill={colorA} />
        })}

        {/* axis labels + per-player values */}
        {axes.map((v, i) => {
          const [lx, ly] = pt(i, 1.16)
          const anchor =
            Math.abs(lx - cx) < 6 ? 'middle' : lx < cx ? 'end' : 'start'
          return (
            <g key={`lbl-${i}`}>
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="var(--ts-muted)"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontSize={9}
                letterSpacing="0.05em"
              >
                {v.label.toUpperCase()}
              </text>
              <text
                x={lx}
                y={ly + 12}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontFamily="Barlow Condensed, sans-serif"
                fontWeight={700}
                fontSize={12}
              >
                <tspan fill={colorA}>{v.aVal}</tspan>
                <tspan fill="var(--ts-faint)"> · </tspan>
                <tspan fill={colorB}>{v.bVal}</tspan>
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
