import sharp from '../node_modules/sharp/lib/index.js'
import { mkdirSync, writeFileSync } from 'fs'

mkdirSync('./public/logos', { recursive: true })

const S = 512, C = S / 2

function penta(cx, cy, r, rot = 0) {
  return Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72) + rot - 90) * Math.PI / 180
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

function arc(cx, cy, r, a0, a1) {
  const pt = (deg) => {
    const rad = (deg - 90) * Math.PI / 180
    return [+(cx + r * Math.cos(rad)).toFixed(2), +(cy + r * Math.sin(rad)).toFixed(2)]
  }
  const [sx, sy] = pt(a0), [ex, ey] = pt(a1)
  return `M ${sx} ${sy} A ${r} ${r} 0 ${(a1 - a0) > 180 ? 1 : 0} 1 ${ex} ${ey}`
}

function dot(cx, cy, r, deg, size, fill) {
  const a = (deg - 90) * Math.PI / 180
  return `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${size}" fill="${fill}"/>`
}

// ════════════════════════════════════════════════════════════════════════════
// SPLIT  v1 — vertical, gold divider, "TOP SCR" badge
// ════════════════════════════════════════════════════════════════════════════
const SPLIT_1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <clipPath id="circ"><circle cx="${C}" cy="${C}" r="228"/></clipPath>
    <clipPath id="L"><rect x="0"   y="0" width="${C}" height="${S}"/></clipPath>
    <clipPath id="R"><rect x="${C}" y="0" width="${C}" height="${S}"/></clipPath>
  </defs>
  <circle cx="${C}" cy="${C}" r="228" fill="#07070f"/>
  <g clip-path="url(#circ)">
    <g clip-path="url(#L)">
      <rect x="0" y="0" width="${C}" height="${S}" fill="#0c0c1e"/>
      <polygon points="${penta(192,210,44)}"      fill="#13132c" stroke="rgba(240,192,64,.6)" stroke-width="1.5"/>
      <polygon points="${penta(118,158,36,36)}"   fill="#13132c" stroke="rgba(240,192,64,.4)" stroke-width="1.5"/>
      <polygon points="${penta(100,292,36,72)}"   fill="#13132c" stroke="rgba(240,192,64,.4)" stroke-width="1.5"/>
      <polygon points="${penta(183,345,30,18)}"   fill="#13132c" stroke="rgba(240,192,64,.3)" stroke-width="1.5"/>
      <polygon points="${penta(192,100,28,0)}"    fill="#13132c" stroke="rgba(240,192,64,.28)" stroke-width="1.5"/>
      <polygon points="${penta(58,224,26,54)}"    fill="#13132c" stroke="rgba(240,192,64,.22)" stroke-width="1.5"/>
    </g>
    <g clip-path="url(#R)">
      <rect x="${C}" y="0" width="${C}" height="${S}" fill="#080818"/>
      <path d="${arc(C,C,158,0,86)}"  fill="none" stroke="#00c9a7" stroke-width="17" stroke-linecap="round" opacity=".93"/>
      <path d="${arc(C,C,116,0,72)}"  fill="none" stroke="#4a9eff" stroke-width="17" stroke-linecap="round" opacity=".88"/>
      <path d="${arc(C,C, 76,0,58)}"  fill="none" stroke="#f0c040" stroke-width="17" stroke-linecap="round" opacity=".94"/>
      ${dot(C,C,158, 0, 9,'#00c9a7')} ${dot(C,C,158,86, 9,'#00c9a7')}
      ${dot(C,C,116, 0, 8,'#4a9eff')} ${dot(C,C, 76, 0, 7,'#f0c040')}
    </g>
  </g>
  <line x1="${C}" y1="${C-228}" x2="${C}" y2="${C+228}" stroke="#f0c040" stroke-width="2" opacity=".55"/>
  <circle cx="${C}" cy="${C}" r="52" fill="#07070f" stroke="#f0c040" stroke-width="2.5"/>
  <text x="${C}" y="${C-7}"  text-anchor="middle" font-family="Arial Black,sans-serif" font-size="25" font-weight="900" fill="#f0c040" letter-spacing="-1">TOP</text>
  <text x="${C}" y="${C+18}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="16" font-weight="900" fill="#e5e5f2" letter-spacing="3">SCR</text>
  <circle cx="${C}" cy="${C}" r="228" fill="none" stroke="rgba(240,192,64,.4)" stroke-width="2.5"/>
</svg>`

// ════════════════════════════════════════════════════════════════════════════
// SPLIT  v2 — teal divider, "TS" monogram, 4 arcs, glow effect
// ════════════════════════════════════════════════════════════════════════════
const SPLIT_2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <clipPath id="c2"><circle cx="${C}" cy="${C}" r="228"/></clipPath>
    <clipPath id="L2"><rect x="0"   y="0" width="${C}" height="${S}"/></clipPath>
    <clipPath id="R2"><rect x="${C}" y="0" width="${C}" height="${S}"/></clipPath>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#00c9a7" stop-opacity=".18"/>
      <stop offset="100%" stop-color="#00c9a7" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${C}" cy="${C}" r="228" fill="#06060e"/>
  <g clip-path="url(#c2)">
    <g clip-path="url(#L2)">
      <rect x="0" y="0" width="${C}" height="${S}" fill="#0a0a1c"/>
      <!-- Tinted football patches -->
      <polygon points="${penta(192,210,44)}"    fill="#0e1a24" stroke="rgba(0,201,167,.55)" stroke-width="1.5"/>
      <polygon points="${penta(118,158,36,36)}" fill="#0e1a24" stroke="rgba(0,201,167,.38)" stroke-width="1.5"/>
      <polygon points="${penta(100,292,36,72)}" fill="#0e1a24" stroke="rgba(0,201,167,.38)" stroke-width="1.5"/>
      <polygon points="${penta(183,345,30,18)}" fill="#0e1a24" stroke="rgba(0,201,167,.28)" stroke-width="1.5"/>
      <polygon points="${penta(192,100,28,0)}"  fill="#0e1a24" stroke="rgba(0,201,167,.25)" stroke-width="1.5"/>
      <polygon points="${penta(58,224,26,54)}"  fill="#0e1a24" stroke="rgba(0,201,167,.2)"  stroke-width="1.5"/>
      <!-- Glow on football side -->
      <ellipse cx="140" cy="${C}" rx="90" ry="100" fill="rgba(0,201,167,.04)"/>
    </g>
    <g clip-path="url(#R2)">
      <rect x="${C}" y="0" width="${C}" height="${S}" fill="#06060e"/>
      <!-- 4 arcs -->
      <path d="${arc(C,C,168,0,88)}"  fill="none" stroke="#00c9a7" stroke-width="14" stroke-linecap="round" opacity=".9"/>
      <path d="${arc(C,C,130,0,74)}"  fill="none" stroke="#38c47a" stroke-width="14" stroke-linecap="round" opacity=".82"/>
      <path d="${arc(C,C, 94,0,60)}"  fill="none" stroke="#4a9eff" stroke-width="14" stroke-linecap="round" opacity=".85"/>
      <path d="${arc(C,C, 58,0,46)}"  fill="none" stroke="#f0c040" stroke-width="14" stroke-linecap="round" opacity=".92"/>
      <!-- Glow arc -->
      <path d="${arc(C,C,168,0,88)}"  fill="none" stroke="#00c9a7" stroke-width="30" stroke-linecap="round" opacity=".08"/>
      ${dot(C,C,168, 0,10,'#00c9a7')} ${dot(C,C,168,88,10,'#00c9a7')}
      ${dot(C,C,130, 0, 8,'#38c47a')}
      ${dot(C,C, 94, 0, 7,'#4a9eff')}
      ${dot(C,C, 58, 0, 6,'#f0c040')}
    </g>
  </g>
  <!-- Teal divider -->
  <line x1="${C}" y1="${C-228}" x2="${C}" y2="${C+228}" stroke="#00c9a7" stroke-width="2.5" opacity=".6"/>
  <!-- "TS" badge -->
  <circle cx="${C}" cy="${C}" r="50" fill="#06060e" stroke="#00c9a7" stroke-width="2.5"/>
  <text x="${C}" y="${C+12}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="40" font-weight="900" fill="#00c9a7" letter-spacing="-2">TS</text>
  <circle cx="${C}" cy="${C}" r="228" fill="none" stroke="rgba(0,201,167,.35)" stroke-width="2.5"/>
</svg>`

// ════════════════════════════════════════════════════════════════════════════
// ORBIT  v1 — 3 rings (teal/blue/purple), football center, brand text
// ════════════════════════════════════════════════════════════════════════════
const ORBIT_1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bg01" cx="50%" cy="45%">
      <stop offset="0%"   stop-color="#0f0f28"/>
      <stop offset="100%" stop-color="#06060e"/>
    </radialGradient>
  </defs>
  <circle cx="${C}" cy="${C}" r="232" fill="url(#bg01)"/>
  <!-- Faint orbit tracks -->
  <circle cx="${C}" cy="${C}" r="196" fill="none" stroke="rgba(0,201,167,.08)"  stroke-width="1" stroke-dasharray="5 4"/>
  <circle cx="${C}" cy="${C}" r="154" fill="none" stroke="rgba(74,158,255,.08)" stroke-width="1" stroke-dasharray="5 4"/>
  <circle cx="${C}" cy="${C}" r="114" fill="none" stroke="rgba(160,96,255,.08)" stroke-width="1" stroke-dasharray="5 4"/>
  <!-- Data arcs -->
  <path d="${arc(C,C,196,-30,120)}"  fill="none" stroke="#00c9a7" stroke-width="15" stroke-linecap="round" opacity=".88"/>
  <path d="${arc(C,C,154, 50,210)}"  fill="none" stroke="#4a9eff" stroke-width="15" stroke-linecap="round" opacity=".83"/>
  <path d="${arc(C,C,114,130,295)}"  fill="none" stroke="#a060ff" stroke-width="15" stroke-linecap="round" opacity=".78"/>
  <!-- Orbit dots -->
  ${[[-30,'#00c9a7',196],[120,'#00c9a7',196],[50,'#4a9eff',154],[210,'#4a9eff',154],[130,'#a060ff',114],[295,'#a060ff',114]]
    .map(([d,c,r]) => dot(C,C,r,d,10,c)).join('\n  ')}
  <!-- Football center -->
  <circle cx="${C}" cy="${C}" r="72" fill="#0e0e24" stroke="rgba(240,192,64,.6)" stroke-width="2.5"/>
  <polygon points="${penta(C,C-18,32)}"          fill="#181836" stroke="rgba(240,192,64,.7)" stroke-width="1.5"/>
  <polygon points="${penta(C-30,C+20,22,36)}"    fill="#181836" stroke="rgba(240,192,64,.5)" stroke-width="1.5"/>
  <polygon points="${penta(C+30,C+20,22,72)}"    fill="#181836" stroke="rgba(240,192,64,.5)" stroke-width="1.5"/>
  <!-- Brand -->
  <text x="${C}" y="${C+185}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="36" font-weight="900" fill="#f0c040" letter-spacing="2">TOP</text>
  <text x="${C}" y="${C+210}" text-anchor="middle" font-family="Arial,sans-serif"       font-size="14" font-weight="700" fill="#5a5a8a" letter-spacing="8">SCORERS</text>
  <circle cx="${C}" cy="${C}" r="232" fill="none" stroke="rgba(240,192,64,.3)" stroke-width="2"/>
</svg>`

// ════════════════════════════════════════════════════════════════════════════
// ORBIT  v2 — 2 rings (teal + gold), big football, glowing dots, no text
// ════════════════════════════════════════════════════════════════════════════
const ORBIT_2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bg02" cx="45%" cy="40%">
      <stop offset="0%"   stop-color="#0e1a22"/>
      <stop offset="100%" stop-color="#06060e"/>
    </radialGradient>
    <filter id="glow02">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="${C}" cy="${C}" r="232" fill="url(#bg02)"/>
  <!-- Glow rings (back layer) -->
  <path d="${arc(C,C,190,-40,150)}"  fill="none" stroke="#00c9a7" stroke-width="28" stroke-linecap="round" opacity=".08"/>
  <path d="${arc(C,C,138, 60,280)}"  fill="none" stroke="#f0c040" stroke-width="28" stroke-linecap="round" opacity=".08"/>
  <!-- Crisp arcs (front layer) -->
  <path d="${arc(C,C,190,-40,150)}"  fill="none" stroke="#00c9a7" stroke-width="14" stroke-linecap="round" opacity=".92" filter="url(#glow02)"/>
  <path d="${arc(C,C,138, 60,280)}"  fill="none" stroke="#f0c040" stroke-width="14" stroke-linecap="round" opacity=".95" filter="url(#glow02)"/>
  <!-- Glowing dots -->
  ${[[-40,'#00c9a7',190],[150,'#00c9a7',190],[60,'#f0c040',138],[280,'#f0c040',138]]
    .map(([d,c,r]) => `<circle cx="${(C+r*Math.cos((d-90)*Math.PI/180)).toFixed(1)}" cy="${(C+r*Math.sin((d-90)*Math.PI/180)).toFixed(1)}" r="14" fill="${c}" opacity=".25"/>
  <circle cx="${(C+r*Math.cos((d-90)*Math.PI/180)).toFixed(1)}" cy="${(C+r*Math.sin((d-90)*Math.PI/180)).toFixed(1)}" r="8" fill="${c}" opacity=".95"/>`).join('\n  ')}
  <!-- Large football center -->
  <circle cx="${C}" cy="${C}" r="96" fill="#0a1018" stroke="rgba(0,201,167,.5)" stroke-width="2.5"/>
  <polygon points="${penta(C,C-22,42)}"          fill="#111d26" stroke="#00c9a7" stroke-width="1.5" opacity=".8"/>
  <polygon points="${penta(C-38,C+24,30,36)}"    fill="#111d26" stroke="#00c9a7" stroke-width="1.5" opacity=".65"/>
  <polygon points="${penta(C+38,C+24,30,72)}"    fill="#111d26" stroke="#00c9a7" stroke-width="1.5" opacity=".65"/>
  <polygon points="${penta(C,  C+62,22,18)}"     fill="#111d26" stroke="#00c9a7" stroke-width="1.5" opacity=".5"/>
  <!-- TS center text -->
  <circle cx="${C}" cy="${C}" r="232" fill="none" stroke="rgba(0,201,167,.25)" stroke-width="2"/>
</svg>`

// ════════════════════════════════════════════════════════════════════════════
// RING BADGE  v1 — 4 segments, football inner, "SCORERS"
// ════════════════════════════════════════════════════════════════════════════
const RING_1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bg31" cx="50%" cy="40%">
      <stop offset="0%"   stop-color="#0d0d22"/>
      <stop offset="100%" stop-color="#07070f"/>
    </radialGradient>
  </defs>
  <circle cx="${C}" cy="${C}" r="232" fill="url(#bg31)"/>
  <!-- Outer stat ring: 4 segments -->
  <path d="${arc(C,C,208,  2, 84)}"  fill="none" stroke="#00c9a7" stroke-width="22" stroke-linecap="round"/>
  <path d="${arc(C,C,208, 94,174)}"  fill="none" stroke="#4a9eff" stroke-width="22" stroke-linecap="round"/>
  <path d="${arc(C,C,208,184,254)}"  fill="none" stroke="#f0c040" stroke-width="22" stroke-linecap="round"/>
  <path d="${arc(C,C,208,264,356)}"  fill="none" stroke="#a060ff" stroke-width="22" stroke-linecap="round"/>
  <!-- Inner echo rings -->
  <path d="${arc(C,C,172,  5, 82)}"  fill="none" stroke="rgba(0,201,167,.2)"  stroke-width="9" stroke-linecap="round"/>
  <path d="${arc(C,C,172, 97,172)}"  fill="none" stroke="rgba(74,158,255,.2)" stroke-width="9" stroke-linecap="round"/>
  <path d="${arc(C,C,172,187,252)}"  fill="none" stroke="rgba(240,192,64,.2)" stroke-width="9" stroke-linecap="round"/>
  <path d="${arc(C,C,172,267,354)}"  fill="none" stroke="rgba(160,96,255,.2)" stroke-width="9" stroke-linecap="round"/>
  <!-- Football inner -->
  <circle cx="${C}" cy="${C}" r="120" fill="#09091c" stroke="rgba(255,255,255,.05)" stroke-width="1"/>
  <polygon points="${penta(C,C-18,40)}"          fill="#121230" stroke="rgba(240,192,64,.65)" stroke-width="1.5"/>
  <polygon points="${penta(C-44,C+22,30,36)}"    fill="#121230" stroke="rgba(240,192,64,.48)" stroke-width="1.5"/>
  <polygon points="${penta(C+44,C+22,30,72)}"    fill="#121230" stroke="rgba(240,192,64,.48)" stroke-width="1.5"/>
  <text x="${C}" y="${C+80}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="20" font-weight="900" fill="rgba(240,192,64,.65)" letter-spacing="5">SCORERS</text>
  <circle cx="${C}" cy="${C}" r="232" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1"/>
</svg>`

// ════════════════════════════════════════════════════════════════════════════
// RING BADGE  v2 — 3 gradient segments, "TS" monogram
// ════════════════════════════════════════════════════════════════════════════
const RING_2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bg32" cx="50%" cy="40%">
      <stop offset="0%"   stop-color="#0a1018"/>
      <stop offset="100%" stop-color="#06060e"/>
    </radialGradient>
  </defs>
  <circle cx="${C}" cy="${C}" r="232" fill="url(#bg32)"/>
  <!-- 3 wide segments -->
  <path d="${arc(C,C,208,  0,112)}" fill="none" stroke="#00c9a7" stroke-width="26" stroke-linecap="round" opacity=".9"/>
  <path d="${arc(C,C,208,122,234)}" fill="none" stroke="#4a9eff" stroke-width="26" stroke-linecap="round" opacity=".88"/>
  <path d="${arc(C,C,208,244,356)}" fill="none" stroke="#f0c040" stroke-width="26" stroke-linecap="round" opacity=".9"/>
  <!-- Glow -->
  <path d="${arc(C,C,208,  0,112)}" fill="none" stroke="#00c9a7" stroke-width="50" stroke-linecap="round" opacity=".06"/>
  <path d="${arc(C,C,208,122,234)}" fill="none" stroke="#4a9eff" stroke-width="50" stroke-linecap="round" opacity=".06"/>
  <path d="${arc(C,C,208,244,356)}" fill="none" stroke="#f0c040" stroke-width="50" stroke-linecap="round" opacity=".06"/>
  <!-- Segment labels (small dots at segment ends) -->
  ${[[0,'#00c9a7'],[112,'#00c9a7'],[122,'#4a9eff'],[234,'#4a9eff'],[244,'#f0c040'],[356,'#f0c040']]
    .map(([d,c]) => dot(C,C,208,d,10,c)).join('\n  ')}
  <!-- Inner football ring -->
  <circle cx="${C}" cy="${C}" r="130" fill="#07070f" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
  <circle cx="${C}" cy="${C}" r="85"  fill="none"    stroke="rgba(240,192,64,.08)"  stroke-width="1" stroke-dasharray="4 3"/>
  <polygon points="${penta(C,C-16,36)}"          fill="#0f1928" stroke="rgba(0,201,167,.6)" stroke-width="1.5"/>
  <polygon points="${penta(C-40,C+20,26,36)}"    fill="#0f1928" stroke="rgba(0,201,167,.4)" stroke-width="1.5"/>
  <polygon points="${penta(C+40,C+20,26,72)}"    fill="#0f1928" stroke="rgba(0,201,167,.4)" stroke-width="1.5"/>
  <!-- TS monogram -->
  <text x="${C}" y="${C+72}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="48" font-weight="900" fill="white" opacity=".12" letter-spacing="-2">TS</text>
  <circle cx="${C}" cy="${C}" r="232" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
</svg>`

// ════════════════════════════════════════════════════════════════════════════
// DIAGONAL  v1 — 45° split, football top-left, data bottom-right, "TS" badge
// ════════════════════════════════════════════════════════════════════════════
const DIAG_1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <clipPath id="c41"><circle cx="${C}" cy="${C}" r="226"/></clipPath>
    <clipPath id="tl41"><polygon points="0,0 ${S},0 0,${S}"/></clipPath>
    <clipPath id="br41"><polygon points="${S},0 ${S},${S} 0,${S}"/></clipPath>
    <linearGradient id="div41" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#f0c040" stop-opacity=".9"/>
      <stop offset="50%"  stop-color="#00c9a7" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#4a9eff" stop-opacity=".9"/>
    </linearGradient>
  </defs>
  <circle cx="${C}" cy="${C}" r="226" fill="#07070f"/>
  <g clip-path="url(#c41)">
    <g clip-path="url(#tl41)">
      <polygon points="0,0 ${S},0 0,${S}" fill="#0d0d20"/>
      <polygon points="${penta(155,155,44)}"       fill="#151532" stroke="rgba(240,192,64,.62)" stroke-width="2"/>
      <polygon points="${penta(80,220,36,36)}"     fill="#151532" stroke="rgba(240,192,64,.45)" stroke-width="1.5"/>
      <polygon points="${penta(218,82,36,72)}"     fill="#151532" stroke="rgba(240,192,64,.45)" stroke-width="1.5"/>
      <polygon points="${penta(55,110,28,18)}"     fill="#151532" stroke="rgba(240,192,64,.28)" stroke-width="1.5"/>
      <polygon points="${penta(108,52,28,54)}"     fill="#151532" stroke="rgba(240,192,64,.28)" stroke-width="1.5"/>
      <circle cx="${C}" cy="${C}" r="210" fill="none" stroke="rgba(255,255,255,.025)" stroke-width="1"/>
      <circle cx="${C}" cy="${C}" r="148" fill="none" stroke="rgba(255,255,255,.025)" stroke-width="1"/>
    </g>
    <g clip-path="url(#br41)">
      <polygon points="${S},0 ${S},${S} 0,${S}" fill="#060718"/>
      <path d="${arc(C,C,172, 90,248)}" fill="none" stroke="#00c9a7" stroke-width="16" stroke-linecap="round" opacity=".9"/>
      <path d="${arc(C,C,126, 90,220)}" fill="none" stroke="#4a9eff" stroke-width="16" stroke-linecap="round" opacity=".84"/>
      <path d="${arc(C,C, 82, 90,196)}" fill="none" stroke="#f0c040" stroke-width="16" stroke-linecap="round" opacity=".9"/>
      ${dot(C,C,172, 90,10,'#00c9a7')} ${dot(C,C,172,248,10,'#00c9a7')}
      ${dot(C,C,126, 90, 8,'#4a9eff')}
      ${dot(C,C, 82, 90, 7,'#f0c040')}
    </g>
  </g>
  <line x1="14" y1="14" x2="${S-14}" y2="${S-14}" stroke="url(#div41)" stroke-width="2.5"/>
  <circle cx="${C}" cy="${C}" r="56" fill="#07070f" stroke="url(#div41)" stroke-width="2.5"/>
  <text x="${C}" y="${C+13}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="42" font-weight="900" fill="white" letter-spacing="-2">TS</text>
  <circle cx="${C}" cy="${C}" r="226" fill="none" stroke="rgba(240,192,64,.3)" stroke-width="2"/>
</svg>`

// ════════════════════════════════════════════════════════════════════════════
// DIAGONAL  v2 — steeper split (⅓ / ⅔), inverted sides, teal badge
// ════════════════════════════════════════════════════════════════════════════
const DIAG_2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <clipPath id="c42"><circle cx="${C}" cy="${C}" r="226"/></clipPath>
    <!-- Steeper: data top-right, football bottom-left -->
    <clipPath id="tr42"><polygon points="${S*0.3},0 ${S},0 ${S},${S*0.7}"/></clipPath>
    <clipPath id="bl42"><polygon points="0,${S*0.3} ${S*0.7},${S} 0,${S}"/></clipPath>
    <clipPath id="mid42"><polygon points="${S*0.3},0 ${S},${S*0.7} ${S*0.7},${S} 0,${S*0.3}"/></clipPath>
  </defs>
  <circle cx="${C}" cy="${C}" r="226" fill="#07070f"/>
  <g clip-path="url(#c42)">
    <!-- Mid band (dark) -->
    <g clip-path="url(#mid42)">
      <polygon points="${S*0.3},0 ${S},${S*0.7} ${S*0.7},${S} 0,${S*0.3}" fill="#08081a"/>
    </g>
    <!-- Top-right: data arcs -->
    <g clip-path="url(#tr42)">
      <polygon points="${S*0.3},0 ${S},0 ${S},${S*0.7}" fill="#07071a"/>
      <path d="${arc(C,C,178,-60, 40)}"  fill="none" stroke="#00c9a7" stroke-width="16" stroke-linecap="round" opacity=".9"/>
      <path d="${arc(C,C,132,-50, 30)}"  fill="none" stroke="#4a9eff" stroke-width="16" stroke-linecap="round" opacity=".84"/>
      <path d="${arc(C,C, 88,-40, 20)}"  fill="none" stroke="#38c47a" stroke-width="16" stroke-linecap="round" opacity=".88"/>
      ${dot(C,C,178,-60,9,'#00c9a7')} ${dot(C,C,178,40,9,'#00c9a7')}
    </g>
    <!-- Bottom-left: football -->
    <g clip-path="url(#bl42)">
      <polygon points="0,${S*0.3} ${S*0.7},${S} 0,${S}" fill="#0d0d20"/>
      <polygon points="${penta(150,360,38)}"         fill="#151532" stroke="rgba(240,192,64,.5)"  stroke-width="1.5"/>
      <polygon points="${penta(80, 310,32,36)}"      fill="#151532" stroke="rgba(240,192,64,.38)" stroke-width="1.5"/>
      <polygon points="${penta(200,420,30,72)}"      fill="#151532" stroke="rgba(240,192,64,.35)" stroke-width="1.5"/>
      <polygon points="${penta(60, 420,26,18)}"      fill="#151532" stroke="rgba(240,192,64,.28)" stroke-width="1.5"/>
    </g>
  </g>
  <!-- Diagonal lines -->
  <line x1="${S*0.3}"  y1="0"      x2="${S}"     y2="${S*0.7}" stroke="rgba(0,201,167,.45)" stroke-width="1.5"/>
  <line x1="0"         y1="${S*0.3}" x2="${S*0.7}" y2="${S}"    stroke="rgba(0,201,167,.45)" stroke-width="1.5"/>
  <!-- Center circle badge -->
  <circle cx="${C}" cy="${C}" r="62" fill="#07070f" stroke="#00c9a7" stroke-width="2.5"/>
  <text x="${C}" y="${C-8}"  text-anchor="middle" font-family="Arial Black,sans-serif" font-size="20" font-weight="900" fill="#00c9a7" letter-spacing="2">TOP</text>
  <text x="${C}" y="${C+16}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="14" font-weight="900" fill="#e5e5f2" letter-spacing="4">SCR</text>
  <circle cx="${C}" cy="${C}" r="226" fill="none" stroke="rgba(0,201,167,.3)" stroke-width="2"/>
</svg>`

// ════════════════════════════════════════════════════════════════════════════
// RENDER ALL
// ════════════════════════════════════════════════════════════════════════════
const LOGOS = [
  { id:'split-v1',    label:'Split v1 · Vertical / Gold',   svg: SPLIT_1 },
  { id:'split-v2',    label:'Split v2 · Vertical / Teal',   svg: SPLIT_2 },
  { id:'orbit-v1',    label:'Orbit v1 · 3 anillos + texto', svg: ORBIT_1 },
  { id:'orbit-v2',    label:'Orbit v2 · 2 anillos glowing', svg: ORBIT_2 },
  { id:'ringbadge-v1',label:'Ring Badge v1 · 4 segmentos',  svg: RING_1  },
  { id:'ringbadge-v2',label:'Ring Badge v2 · 3 segmentos',  svg: RING_2  },
  { id:'diagonal-v1', label:'Diagonal v1 · 45° / TS badge', svg: DIAG_1  },
  { id:'diagonal-v2', label:'Diagonal v2 · Banda central',  svg: DIAG_2  },
]

for (const { id, svg } of LOGOS) {
  await sharp(Buffer.from(svg)).png().toFile(`./public/logos/${id}.png`)
  console.log(`✓ ${id}.png`)
}

// ── HTML Preview ──────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>TopScorers — Logo Proposals</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #07070f;
      color: #e5e5f2;
      min-height: 100vh;
      padding: 48px 24px;
    }
    h1 {
      text-align: center;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #f0c040;
      margin-bottom: 6px;
    }
    .subtitle {
      text-align: center;
      font-size: 11px;
      color: #5a5a7a;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 48px;
    }
    .section-title {
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #5a5a7a;
      margin-bottom: 20px;
      padding-top: 40px;
      border-top: 1px solid #1e1e34;
    }
    .section-title:first-of-type { border-top: none; }
    .pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      max-width: 780px;
      margin: 0 auto 56px;
    }
    .card {
      border: 1px solid #1e1e34;
      border-radius: 6px;
      padding: 28px 20px 20px;
      background: #0e0e1c;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: border-color .2s, box-shadow .2s;
      position: relative;
    }
    .card:hover {
      border-color: rgba(240,192,64,.4);
      box-shadow: 0 0 30px rgba(240,192,64,.06);
    }
    .card.teal:hover {
      border-color: rgba(0,201,167,.4);
      box-shadow: 0 0 30px rgba(0,201,167,.06);
    }
    .version-badge {
      position: absolute;
      top: 10px;
      right: 12px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #36364e;
    }
    .card img {
      width: 180px;
      height: 180px;
      border-radius: 28px;
      display: block;
    }
    .card-name {
      font-size: 13px;
      font-weight: 700;
      color: #e5e5f2;
      text-align: center;
    }
    .card-desc {
      font-size: 11px;
      color: #5a5a7a;
      text-align: center;
      line-height: 1.5;
    }
    .choose-btn {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 4px;
      border: 1px solid rgba(240,192,64,.3);
      background: rgba(240,192,64,.06);
      color: #f0c040;
      cursor: pointer;
      transition: background .15s;
    }
    .choose-btn:hover { background: rgba(240,192,64,.14); }
    @media (max-width: 500px) { .pair { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <h1>TopScorers</h1>
  <p class="subtitle">Logo proposals — 4 concepts × 2 variations</p>

  ${[
    { title:'01 · SPLIT', teal: false, items:[
      { id:'split-v1',    name:'Split v1',    desc:'Balón (izq.) + arcos de datos (dcha.)<br/>Divisor dorado · Badge "TOP SCR"' },
      { id:'split-v2',    name:'Split v2',    desc:'Mismo split con acento teal<br/>4 arcos · Monograma "TS"' },
    ]},
    { title:'02 · ORBIT', teal: false, items:[
      { id:'orbit-v1',    name:'Orbit v1',    desc:'Balón central · 3 anillos orbitales<br/>(teal, azul, púrpura) · Texto "TOPSCORERS"' },
      { id:'orbit-v2',    name:'Orbit v2',    desc:'Balón grande · 2 anillos (teal + gold)<br/>Efecto glow · Sin texto (puro icono)' },
    ]},
    { title:'03 · RING BADGE', teal: false, items:[
      { id:'ringbadge-v1',name:'Ring Badge v1',desc:'Anillo exterior con 4 segmentos de color<br/>Balón interior · "SCORERS" subtítulo' },
      { id:'ringbadge-v2',name:'Ring Badge v2',desc:'3 segmentos anchos (teal/azul/gold)<br/>Glow suave · Balón teal en centro' },
    ]},
    { title:'04 · DIAGONAL', teal: true, items:[
      { id:'diagonal-v1', name:'Diagonal v1', desc:'Split 45° · Balón (sup-izq) + datos (inf-dcha)<br/>Divisor degradado dorado→teal · Badge "TS"' },
      { id:'diagonal-v2', name:'Diagonal v2', desc:'Banda central + 2 franjas<br/>Datos (sup-dcha) · Balón (inf-izq) · Teal badge' },
    ]},
  ].map(sec => `
  <p class="section-title">${sec.title}</p>
  <div class="pair">
    ${sec.items.map(item => `
    <div class="card${sec.teal?' teal':''}">
      <span class="version-badge">${item.id.includes('v1') ? 'V1' : 'V2'}</span>
      <img src="${item.id}.png" alt="${item.name}"/>
      <div class="card-name">${item.name}</div>
      <div class="card-desc">${item.desc}</div>
      <button class="choose-btn">Seleccionar este →</button>
    </div>`).join('')}
  </div>`).join('')}

  <p style="text-align:center;font-size:11px;color:#2a2a48;margin-top:40px;">
    Dile a Claude qué número y versión prefieres para usarlo como icono, OG image y favicon
  </p>
</body>
</html>`

writeFileSync('./public/logos/preview.html', html)
console.log('\n✓ preview.html generado → abre http://localhost:3001/logos/preview.html')
