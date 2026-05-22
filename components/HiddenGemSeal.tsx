'use client'

/**
 * HiddenGemSeal — "SELLO" visual para jugadores infravalorados / hidden gems.
 *
 * Sizes:
 *  - 'lg'  (72px) — overlay en cards de /descubrir
 *  - 'md'  (52px) — ficha de jugador /jugadores/[slug]
 *  - 'sm'  (32px) — inline en tablas / PlayerRow
 *
 * Variantes:
 *  - 'gem'       teal — hidden gem (liga pequeña, alto G/90)
 *  - 'prospect'  purple — joven promesa (sub-21 con buen ratio)
 *  - 'elite'     gold — elite performer (score > 8)
 */

type SealVariant = 'gem' | 'prospect' | 'elite'
type SealSize = 'lg' | 'md' | 'sm'

const VARIANTS: Record<SealVariant, { color: string; bg: string; label: string; labelEN: string }> = {
  gem:      { color: '#00c8b0', bg: 'rgba(0,200,176,.12)',   label: 'JOYA OCULTA',  labelEN: 'HIDDEN GEM'  },
  prospect: { color: '#a060ff', bg: 'rgba(160,96,255,.12)',  label: 'PROMESA',      labelEN: 'PROSPECT'    },
  elite:    { color: '#f0c040', bg: 'rgba(240,192,64,.12)',  label: 'ÉLITE',        labelEN: 'ELITE'       },
}

const SIZES: Record<SealSize, { outer: number; inner: number; fontSize: number; badge: number; strokeWidth: number }> = {
  lg: { outer: 72, inner: 58, fontSize: 6.2, badge: 18, strokeWidth: 1.5 },
  md: { outer: 52, inner: 41, fontSize: 5.4, badge: 13, strokeWidth: 1.2 },
  sm: { outer: 32, inner: 25, fontSize: 4.2, badge: 8,  strokeWidth: 1   },
}

interface Props {
  variant?: SealVariant
  size?: SealSize
  lang?: 'es' | 'en'
  rotate?: number   // degrees, default varies by size
  className?: string
  style?: React.CSSProperties
}

export default function HiddenGemSeal({
  variant = 'gem',
  size = 'md',
  lang = 'es',
  rotate,
  className = '',
  style,
}: Props) {
  const v = VARIANTS[variant]
  const s = SIZES[size]
  const deg = rotate ?? (size === 'lg' ? -18 : size === 'md' ? -15 : -12)

  const center = s.outer / 2
  const r = s.inner / 2       // radius for text path
  const rOuter = (s.outer - s.strokeWidth) / 2

  // Text along arc
  const label = lang === 'es' ? v.label : v.labelEN
  const arcId = `arc-${variant}-${size}`

  // Dashed border count — more dashes on larger seals
  const dashCount = size === 'lg' ? 24 : size === 'md' ? 18 : 12
  const dashLen = (2 * Math.PI * rOuter) / (dashCount * 2)

  // Inner icon (gem ◆, star ★, lightning ⚡)
  const icons: Record<SealVariant, string> = { gem: '◆', prospect: '★', elite: '⚡' }
  const icon = icons[variant]
  const iconSize = s.badge

  return (
    <svg
      width={s.outer}
      height={s.outer}
      viewBox={`0 0 ${s.outer} ${s.outer}`}
      className={className}
      style={{ transform: `rotate(${deg}deg)`, flexShrink: 0, ...style }}
      aria-label={label}
    >
      {/* Dashed outer ring */}
      <circle
        cx={center}
        cy={center}
        r={rOuter}
        fill={v.bg}
        stroke={v.color}
        strokeWidth={s.strokeWidth}
        strokeDasharray={`${dashLen} ${dashLen}`}
        opacity={0.9}
      />

      {/* Solid inner ring */}
      <circle
        cx={center}
        cy={center}
        r={r - 2}
        fill="none"
        stroke={v.color}
        strokeWidth={s.strokeWidth * 0.6}
        opacity={0.5}
      />

      {/* Text arc path (top half) */}
      <defs>
        <path
          id={arcId}
          d={`M ${center - r + 2},${center} A ${r - 2},${r - 2} 0 0,1 ${center + r - 2},${center}`}
        />
      </defs>
      <text
        fill={v.color}
        fontSize={s.fontSize}
        fontFamily="'Barlow Condensed', sans-serif"
        fontWeight="700"
        letterSpacing={size === 'sm' ? '1' : '1.5'}
        textAnchor="middle"
        dominantBaseline="auto"
      >
        <textPath href={`#${arcId}`} startOffset="50%">
          {label}
        </textPath>
      </text>

      {/* Center icon */}
      <text
        x={center}
        y={center + iconSize * 0.3}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={iconSize}
        fill={v.color}
        fontFamily="sans-serif"
        style={{ userSelect: 'none' }}
      >
        {icon}
      </text>
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Determina qué variante aplicar según el score y datos del jugador */
export function getSealVariant(
  score: number,
  age: number,
  isSmallLeague: boolean
): SealVariant | null {
  if (score < 1.2) return null          // umbral mínimo — no todos son joyas
  if (score >= 4.0) return 'elite'       // top performers
  if (age <= 21) return 'prospect'       // jóvenes promesas
  if (isSmallLeague) return 'gem'        // hidden gems en ligas pequeñas
  if (score >= 2.5) return 'gem'         // alto ratio en cualquier liga
  return null
}
