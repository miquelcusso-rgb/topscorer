/**
 * TopScorers logo mark — inline SVG, always renders, zero loading risk.
 * Simplified from topscorer-v1.svg: football + data orbit arcs + gold ring.
 */
export default function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TopScorers"
    >
      {/* Outer gold ring */}
      <circle cx="32" cy="32" r="30" stroke="#f0c040" strokeWidth="2" strokeOpacity="0.85" />
      <circle cx="32" cy="32" r="28" stroke="#f0c040" strokeWidth="0.6" strokeOpacity="0.3" />

      {/* Dark background */}
      <circle cx="32" cy="32" r="29" fill="#06080f" />

      {/* Data orbit arcs — teal/blue (lower-right quadrant) */}
      <path
        d="M 44 44 A 17 17 0 1 1 20 20"
        stroke="#00c8b0" strokeWidth="1" strokeOpacity="0.6"
        strokeLinecap="round" fill="none"
      />
      <path
        d="M 49 49 A 24 24 0 1 1 15 15"
        stroke="#00c8b0" strokeWidth="1" strokeOpacity="0.4"
        strokeLinecap="round" fill="none"
      />

      {/* Center glow node */}
      <circle cx="32" cy="32" r="5" fill="#00c8b0" fillOpacity="0.25" />
      <circle cx="32" cy="32" r="2.5" fill="#00c8b0" fillOpacity="0.7" />
      <circle cx="32" cy="32" r="1.2" fill="white" fillOpacity="0.9" />

      {/* Football pentagon patches (upper-left) */}
      <polygon
        points="22,16 26,13 30,16 29,21 23,21"
        fill="#1a1a1a" fillOpacity="0.9"
        stroke="#f0c040" strokeWidth="1" strokeOpacity="0.8"
        strokeLinejoin="round"
      />
      <polygon
        points="13,22 10,18 13,14 18,15 18,21"
        fill="#1a1a1a" fillOpacity="0.9"
        stroke="#f0c040" strokeWidth="1" strokeOpacity="0.8"
        strokeLinejoin="round"
      />
      <polygon
        points="17,12 21,10 25,13 23,18 18,17"
        fill="#1a1a1a" fillOpacity="0.9"
        stroke="#f0c040" strokeWidth="1" strokeOpacity="0.8"
        strokeLinejoin="round"
      />

      {/* Orbit dots */}
      <circle cx="44" cy="44" r="1.5" fill="#00c8b0" fillOpacity="0.7" />
      <circle cx="36" cy="48" r="1" fill="#00c8b0" fillOpacity="0.5" />
      <circle cx="27" cy="47" r="1.2" fill="#00c8b0" fillOpacity="0.6" />
      <circle cx="49" cy="36" r="1" fill="#00c8b0" fillOpacity="0.5" />
    </svg>
  )
}
