import sharp from '../node_modules/sharp/lib/index.js'
import { mkdirSync } from 'fs'

mkdirSync('./public/logos', { recursive: true })

const S = 512
const C = S / 2

function penta(cx, cy, r, rotDeg = 0) {
  return Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72) + rotDeg - 90) * Math.PI / 180
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const toXY = (deg) => ({
    x: +(cx + r * Math.cos((deg - 90) * Math.PI / 180)).toFixed(2),
    y: +(cy + r * Math.sin((deg - 90) * Math.PI / 180)).toFixed(2),
  })
  const s = toXY(startDeg), e = toXY(endDeg)
  const large = (endDeg - startDeg) > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

// ── Logo 1: SPLIT ─────────────────────────────────────────────────────────
const L1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <clipPath id="circ"><circle cx="${C}" cy="${C}" r="228"/></clipPath>
    <clipPath id="lft"><rect x="0" y="0" width="${C}" height="${S}"/></clipPath>
    <clipPath id="rgt"><rect x="${C}" y="0" width="${C}" height="${S}"/></clipPath>
  </defs>
  <circle cx="${C}" cy="${C}" r="228" fill="#07070f"/>

  <!-- Left: football -->
  <g clip-path="url(#circ)"><g clip-path="url(#lft)">
    <rect x="0" y="0" width="${C}" height="${S}" fill="#0c0c1e"/>
    <polygon points="${penta(195, 215, 42)}"    fill="#12122a" stroke="rgba(240,192,64,.55)" stroke-width="1.5"/>
    <polygon points="${penta(120, 165, 38, 36)}" fill="#12122a" stroke="rgba(240,192,64,.4)"  stroke-width="1.5"/>
    <polygon points="${penta(100, 290, 38, 72)}" fill="#12122a" stroke="rgba(240,192,64,.4)"  stroke-width="1.5"/>
    <polygon points="${penta(185, 340, 34, 18)}" fill="#12122a" stroke="rgba(240,192,64,.35)" stroke-width="1.5"/>
    <polygon points="${penta(195, 105, 30, 0)}"  fill="#12122a" stroke="rgba(240,192,64,.3)"  stroke-width="1.5"/>
    <polygon points="${penta(60,  225, 28, 54)}" fill="#12122a" stroke="rgba(240,192,64,.25)" stroke-width="1.5"/>
    <!-- Subtle radial lines suggesting ball curvature -->
    <circle cx="${C}" cy="${C}" r="160" fill="none" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
    <circle cx="${C}" cy="${C}" r="105" fill="none" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
  </g></g>

  <!-- Right: stats arcs -->
  <g clip-path="url(#circ)"><g clip-path="url(#rgt)">
    <rect x="${C}" y="0" width="${C}" height="${S}" fill="#080814"/>
    <path d="${arcPath(C, C, 158, 0, 86)}"  fill="none" stroke="#00c9a7" stroke-width="18" stroke-linecap="round" opacity=".92"/>
    <path d="${arcPath(C, C, 116, 0, 72)}"  fill="none" stroke="#4a9eff" stroke-width="18" stroke-linecap="round" opacity=".88"/>
    <path d="${arcPath(C, C,  76, 0, 58)}"  fill="none" stroke="#f0c040" stroke-width="18" stroke-linecap="round" opacity=".94"/>
    <!-- End dots -->
    <circle cx="${C}"     cy="${C-158}" r="9" fill="#00c9a7"/>
    <circle cx="${C+158}" cy="${C}"     r="9" fill="#00c9a7"/>
    <circle cx="${C}"     cy="${C-116}" r="8" fill="#4a9eff"/>
    <circle cx="${C}"     cy="${C-76}"  r="7" fill="#f0c040"/>
    <!-- Faint grid -->
    <line x1="${C}" y1="${C-190}" x2="${C+190}" y2="${C}" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
    <line x1="${C}" y1="${C-140}" x2="${C+140}" y2="${C}" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
  </g></g>

  <!-- Divider -->
  <line x1="${C}" y1="${C-228}" x2="${C}" y2="${C+228}" stroke="#f0c040" stroke-width="2" opacity=".55"/>

  <!-- Center badge -->
  <circle cx="${C}" cy="${C}" r="54" fill="#07070f" stroke="#f0c040" stroke-width="2.5"/>
  <text x="${C}" y="${C-7}"  text-anchor="middle" font-family="Arial Black,sans-serif" font-size="26" font-weight="900" fill="#f0c040" letter-spacing="-1">TOP</text>
  <text x="${C}" y="${C+18}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="17" font-weight="900" fill="#e5e5f2" letter-spacing="3">SCR</text>

  <!-- Outer ring -->
  <circle cx="${C}" cy="${C}" r="228" fill="none" stroke="rgba(240,192,64,.45)" stroke-width="2.5"/>
</svg>`

// ── Logo 2: ORBIT ────────────────────────────────────────────────────────
const L2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="45%">
      <stop offset="0%"   stop-color="#0f0f25"/>
      <stop offset="100%" stop-color="#07070f"/>
    </radialGradient>
  </defs>
  <circle cx="${C}" cy="${C}" r="230" fill="url(#bg2)"/>

  <!-- Outer orbit rings -->
  <circle cx="${C}" cy="${C}" r="195" fill="none" stroke="rgba(0,201,167,.12)"  stroke-width="1" stroke-dasharray="6 4"/>
  <circle cx="${C}" cy="${C}" r="155" fill="none" stroke="rgba(74,158,255,.12)" stroke-width="1" stroke-dasharray="6 4"/>

  <!-- Stat arc segments (full arcs, suggesting orbit paths with data) -->
  <path d="${arcPath(C, C, 195, -30, 120)}" fill="none" stroke="#00c9a7" stroke-width="14" stroke-linecap="round" opacity=".85"/>
  <path d="${arcPath(C, C, 155, 40, 210)}"  fill="none" stroke="#4a9eff" stroke-width="14" stroke-linecap="round" opacity=".80"/>
  <path d="${arcPath(C, C, 115, 110, 290)}" fill="none" stroke="#a060ff" stroke-width="14" stroke-linecap="round" opacity=".75"/>

  <!-- Orbit dots (data points) -->
  ${[[-30,'#00c9a7',195],[120,'#00c9a7',195],[40,'#4a9eff',155],[210,'#4a9eff',155],[110,'#a060ff',115],[290,'#a060ff',115]].map(([deg,col,r]) => {
    const a = (deg - 90) * Math.PI / 180
    const x = (C + r * Math.cos(a)).toFixed(1)
    const y = (C + r * Math.sin(a)).toFixed(1)
    return `<circle cx="${x}" cy="${y}" r="9" fill="${col}" opacity=".9"/>`
  }).join('\n  ')}

  <!-- Center football -->
  <circle cx="${C}" cy="${C}" r="70" fill="#0e0e22" stroke="rgba(240,192,64,.6)" stroke-width="2.5"/>
  <polygon points="${penta(C, C, 28)}"         fill="#1a1a34" stroke="rgba(240,192,64,.7)" stroke-width="1.5"/>
  <polygon points="${penta(C-28, C-20, 18, 36)}" fill="#1a1a34" stroke="rgba(240,192,64,.5)" stroke-width="1.5"/>
  <polygon points="${penta(C+28, C-20, 18, 72)}" fill="#1a1a34" stroke="rgba(240,192,64,.5)" stroke-width="1.5"/>
  <polygon points="${penta(C, C+32, 18, 18)}"    fill="#1a1a34" stroke="rgba(240,192,64,.5)" stroke-width="1.5"/>

  <!-- Brand text below -->
  <text x="${C}" y="${C+185}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="36" font-weight="900" fill="#f0c040" letter-spacing="2">TOP</text>
  <text x="${C}" y="${C+210}" text-anchor="middle" font-family="Arial,sans-serif"       font-size="16" font-weight="700" fill="#5a5a8a" letter-spacing="8">SCORERS</text>

  <circle cx="${C}" cy="${C}" r="230" fill="none" stroke="rgba(240,192,64,.3)" stroke-width="2"/>
</svg>`

// ── Logo 3: RING BADGE ────────────────────────────────────────────────────
const L3 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bg3" cx="50%" cy="40%">
      <stop offset="0%"   stop-color="#0e0e22"/>
      <stop offset="100%" stop-color="#07070f"/>
    </radialGradient>
  </defs>
  <circle cx="${C}" cy="${C}" r="230" fill="url(#bg3)"/>

  <!-- Outer stat ring: 4 colored segments -->
  <path d="${arcPath(C, C, 210, 0,   82)}"  fill="none" stroke="#00c9a7" stroke-width="20" stroke-linecap="round"/>
  <path d="${arcPath(C, C, 210, 92,  172)}" fill="none" stroke="#4a9eff" stroke-width="20" stroke-linecap="round"/>
  <path d="${arcPath(C, C, 210, 182, 252)}" fill="none" stroke="#f0c040" stroke-width="20" stroke-linecap="round"/>
  <path d="${arcPath(C, C, 210, 262, 352)}" fill="none" stroke="#a060ff" stroke-width="20" stroke-linecap="round"/>

  <!-- Inner ring labels -->
  <path d="${arcPath(C, C, 170, 10,  80)}"  fill="none" stroke="rgba(0,201,167,.2)"  stroke-width="8" stroke-linecap="round"/>
  <path d="${arcPath(C, C, 170, 100, 170)}" fill="none" stroke="rgba(74,158,255,.2)" stroke-width="8" stroke-linecap="round"/>
  <path d="${arcPath(C, C, 170, 190, 250)}" fill="none" stroke="rgba(240,192,64,.2)" stroke-width="8" stroke-linecap="round"/>
  <path d="${arcPath(C, C, 170, 270, 350)}" fill="none" stroke="rgba(160,96,255,.2)" stroke-width="8" stroke-linecap="round"/>

  <!-- Center circle: football -->
  <circle cx="${C}" cy="${C}" r="118" fill="#09091a" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
  <circle cx="${C}" cy="${C}" r="80" fill="none" stroke="rgba(240,192,64,.1)" stroke-width="1" stroke-dasharray="4 3"/>
  <polygon points="${penta(C, C-18, 38)}"       fill="#131330" stroke="rgba(240,192,64,.6)" stroke-width="1.5"/>
  <polygon points="${penta(C-42, C+22, 28, 36)}" fill="#131330" stroke="rgba(240,192,64,.45)" stroke-width="1.5"/>
  <polygon points="${penta(C+42, C+22, 28, 72)}" fill="#131330" stroke="rgba(240,192,64,.45)" stroke-width="1.5"/>

  <!-- TS monogram -->
  <text x="${C}" y="${C+82}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="22" font-weight="900" fill="rgba(240,192,64,.7)" letter-spacing="5">SCORERS</text>

  <circle cx="${C}" cy="${C}" r="230" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
</svg>`

// ── Logo 4: DIAGONAL MERGE ───────────────────────────────────────────────
const L4 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <clipPath id="circ4"><circle cx="${C}" cy="${C}" r="225"/></clipPath>
    <clipPath id="tl4">
      <polygon points="0,0 ${S},0 0,${S}"/>
    </clipPath>
    <clipPath id="br4">
      <polygon points="${S},0 ${S},${S} 0,${S}"/>
    </clipPath>
    <linearGradient id="divLine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#f0c040" stop-opacity=".8"/>
      <stop offset="50%"  stop-color="#00c9a7" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#4a9eff" stop-opacity=".8"/>
    </linearGradient>
  </defs>

  <circle cx="${C}" cy="${C}" r="225" fill="#07070f"/>

  <!-- Top-left: football -->
  <g clip-path="url(#circ4)"><g clip-path="url(#tl4)">
    <polygon points="0,0 ${S},0 0,${S}" fill="#0d0d20"/>
    <polygon points="${penta(155, 155, 45)}"      fill="#161630" stroke="rgba(240,192,64,.6)"  stroke-width="2"/>
    <polygon points="${penta(80,  220, 38, 36)}"  fill="#161630" stroke="rgba(240,192,64,.45)" stroke-width="1.5"/>
    <polygon points="${penta(220, 80,  38, 72)}"  fill="#161630" stroke="rgba(240,192,64,.45)" stroke-width="1.5"/>
    <polygon points="${penta(55,  110, 30, 18)}"  fill="#161630" stroke="rgba(240,192,64,.3)"  stroke-width="1.5"/>
    <polygon points="${penta(110, 55,  30, 54)}"  fill="#161630" stroke="rgba(240,192,64,.3)"  stroke-width="1.5"/>
    <!-- Subtle concentric arcs suggesting ball curve -->
    <circle cx="${C}" cy="${C}" r="200" fill="none" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
    <circle cx="${C}" cy="${C}" r="140" fill="none" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
  </g></g>

  <!-- Bottom-right: data pixels dissolving in -->
  <g clip-path="url(#circ4)"><g clip-path="url(#br4)">
    <polygon points="${S},0 ${S},${S} 0,${S}" fill="#07071a"/>
    <!-- Stat arcs -->
    <path d="${arcPath(C, C, 170, 90, 250)}" fill="none" stroke="#00c9a7" stroke-width="16" stroke-linecap="round" opacity=".9"/>
    <path d="${arcPath(C, C, 125, 90, 220)}" fill="none" stroke="#4a9eff" stroke-width="16" stroke-linecap="round" opacity=".85"/>
    <path d="${arcPath(C, C,  82, 90, 195)}" fill="none" stroke="#f0c040" stroke-width="16" stroke-linecap="round" opacity=".9"/>
    <!-- Scatter data points near diagonal -->
    ${Array.from({length: 12}, (_, i) => {
      const x = (310 + (i % 4) * 38 + Math.sin(i) * 12).toFixed(0)
      const y = (310 + Math.floor(i/4) * 38 + Math.cos(i) * 12).toFixed(0)
      const op = (0.15 + i * 0.05).toFixed(2)
      const cols = ['#00c9a7','#4a9eff','#f0c040','#a060ff']
      return `<rect x="${x}" y="${y}" width="8" height="8" rx="1" fill="${cols[i%4]}" opacity="${op}"/>`
    }).join('\n    ')}
  </g></g>

  <!-- Diagonal divider (gradient line) -->
  <line x1="28" y1="28" x2="${S-28}" y2="${S-28}" stroke="url(#divLine)" stroke-width="2.5"/>

  <!-- Center badge -->
  <circle cx="${C}" cy="${C}" r="60" fill="#07070f" stroke="rgba(240,192,64,.5)" stroke-width="2"/>
  <text x="${C}" y="${C+8}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="38" font-weight="900" fill="#f0c040" letter-spacing="-2">TS</text>

  <circle cx="${C}" cy="${C}" r="225" fill="none" stroke="rgba(240,192,64,.35)" stroke-width="2"/>
</svg>`

const logos = [
  { name: 'logo-1-split.png',    svg: L1, label: 'SPLIT — Mitad fútbol / mitad arcos de datos' },
  { name: 'logo-2-orbit.png',    svg: L2, label: 'ORBIT — Fútbol central con anillos orbitales de datos' },
  { name: 'logo-3-ringbadge.png',svg: L3, label: 'RING BADGE — Anillo de estadísticas exterior + fútbol interior' },
  { name: 'logo-4-diagonal.png', svg: L4, label: 'DIAGONAL — Split diagonal fútbol/datos con monograma TS' },
]

for (const { name, svg, label } of logos) {
  await sharp(Buffer.from(svg)).png().toFile(`./public/logos/${name}`)
  console.log(`✓ ${name}  —  ${label}`)
}
