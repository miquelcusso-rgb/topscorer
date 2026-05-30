interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  color?: 'primary' | 'teal'
}

export default function Sparkline({
  values,
  width = 88,
  height = 20,
  color = 'primary',
}: SparklineProps) {
  const safe = values.length > 0 ? values : [0]
  const max = Math.max(...safe, 1)
  const step = safe.length > 1 ? width / (safe.length - 1) : width
  const pts: Array<[number, number]> = safe.map((v, i) => [
    i * step,
    height - (v / max) * (height - 2) - 1,
  ])
  const d = pts
    .map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2))
    .join(' ')
  const fillD = d + ` L ${width} ${height} L 0 ${height} Z`
  const stroke = color === 'teal' ? 'var(--ts-teal)' : 'var(--ts-primary)'
  const fill = color === 'teal' ? 'var(--ts-teal-soft)' : 'var(--ts-primary-soft)'
  return (
    <svg width={width} height={height} style={{ display: 'block' }} aria-hidden>
      <path d={fillD} fill={fill} />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) =>
        safe[i] > 0 && safe[i] === max ? (
          <circle key={i} cx={p[0]} cy={p[1]} r={1.6} fill={stroke} />
        ) : null,
      )}
    </svg>
  )
}
