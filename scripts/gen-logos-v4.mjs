import sharp from '../node_modules/sharp/lib/index.js'
import { mkdirSync, writeFileSync } from 'fs'

mkdirSync('./public/logos', { recursive: true })

const S = 512, C = 256, R = 220

// ─── math helpers ────────────────────────────────────────────────────────────

function pt(cx, cy, r, deg) {
  const rad = deg * Math.PI / 180
  return [+(cx + r * Math.cos(rad)).toFixed(2), +(cy + r * Math.sin(rad)).toFixed(2)]
}

function pentagon(cx, cy, r, rot = 0) {
  const pts = Array.from({ length: 5 }, (_, i) => pt(cx, cy, r, rot + i * 72).join(','))
  return `M${pts.join('L')}Z`
}

function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = pt(cx, cy, r, a0)
  const [x1, y1] = pt(cx, cy, r, a1)
  return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`
}

// Seeded LCG for deterministic "random"
function mkRng(seed) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

// Check if point is inside circle
function inCircle(x, y) {
  return (x - C) ** 2 + (y - C) ** 2 < (R - 8) ** 2
}

// Diagonal: x + y = 512 (line from top-right to bottom-left through center)
// Football side: x+y < 512 (upper-left)
// Data side: x+y > 512 (lower-right)
// Signed distance from diagonal (positive = football side)
function diagDist(x, y) { return (512 - x - y) / Math.SQRT2 }

// ─── football patches ─────────────────────────────────────────────────────────
// Classic black pentagons on white ball, positioned in upper-left half
// (patches with cx+cy < 512 are in football territory)

const PATCHES = [
  { cx: 182, cy: 100, r: 46, rot: 0 },     // top center
  { cx:  86, cy: 180, r: 46, rot: 36 },    // upper left
  { cx: 278, cy:  88, r: 46, rot: -36 },   // upper right (partially visible)
  { cx:  72, cy: 300, r: 46, rot: 0 },     // left
  { cx: 190, cy: 210, r: 46, rot: 18 },    // center
  { cx: 100, cy: 408, r: 46, rot: 36 },    // lower left (partially visible)
  { cx: 316, cy: 178, r: 46, rot: -18 },   // right of center (near diagonal)
  { cx: 256, cy: 300, r: 46, rot: 0 },     // lower center (near diagonal, dissolves)
  { cx: 380, cy: 260, r: 46, rot: 0 },     // far right (data side, hidden)
  { cx: 256, cy: 430, r: 46, rot: 0 },     // bottom (data side, hidden)
]

// Seam lines
const SEAMS = [
  arcPath(256, 256, 135, -130,  10),
  arcPath(256, 256, 135,   50, 190),
  arcPath(190, 165, 100,  -30, 140),
  arcPath(180, 310, 110,  -80,  60),
  arcPath(310, 220,  90, 150, 300),
  arcPath(256, 100,  80,  80, 240),
]

// ─── make one logo SVG ────────────────────────────────────────────────────────

function makeLogo({ id, colors }) {
  const {
    ballBase, ballGrad,
    patchFill, patchStroke, patchStrokeW,
    seamColor, seamGlow,
    dataBg,
    r1, r2, r3, r4,        // ring colors inner→outer
    particleA, particleB,  // transition particle colors (football→data)
    outerRing,
    glowColor,
    bgColor,
  } = colors

  const rng = mkRng(0xdeadbeef)

  // ── clipPaths ──────────────────────────────────────────────────────────────
  // The diagonal is x+y=512. Football=upper-left, Data=lower-right.
  // We clip each half by a large triangle AND the circle.

  const defs = `
  <defs>
    <!-- football half: upper-left of x+y=512 -->
    <clipPath id="cfball">
      <path d="M -100,-100 L 612,-100 L -100,612 Z"/>
    </clipPath>
    <!-- data half: lower-right -->
    <clipPath id="cfdata">
      <path d="M 612,-100 L 612,612 L -100,612 Z"/>
    </clipPath>
    <!-- full ball circle -->
    <clipPath id="cfcircle">
      <circle cx="${C}" cy="${C}" r="${R}"/>
    </clipPath>
    <!-- football half clipped to circle -->
    <clipPath id="cfball_circ">
      <path d="M -100,-100 L 612,-100 L -100,612 Z" clip-path="url(#cfcircle)"/>
    </clipPath>
    <!-- data half clipped to circle -->
    <clipPath id="cfdata_circ">
      <path d="M 612,-100 L 612,612 L -100,612 Z" clip-path="url(#cfcircle)"/>
    </clipPath>

    <radialGradient id="ballSheen" cx="38%" cy="35%" r="55%">
      <stop offset="0%"   stop-color="${ballGrad}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${ballBase}"  stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="dataGlow" cx="70%" cy="70%" r="60%">
      <stop offset="0%"   stop-color="${glowColor}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${dataBg}"    stop-opacity="0"/>
    </radialGradient>
  </defs>`

  // ── football half ──────────────────────────────────────────────────────────
  // Patches near diagonal fade in opacity (dissolving effect)
  const footballHalf = `
  <g clip-path="url(#cfball)">
    <g clip-path="url(#cfcircle)">
      <!-- ball base -->
      <circle cx="${C}" cy="${C}" r="${R}" fill="${ballBase}"/>
      <circle cx="${C}" cy="${C}" r="${R}" fill="url(#ballSheen)"/>

      <!-- patches — opacity reduced near diagonal -->
      ${PATCHES.map(p => {
        const dist = diagDist(p.cx, p.cy)
        // If patch is on data side or very close, reduce opacity sharply
        const opacity = dist > 60 ? 1 : dist > 0 ? dist / 60 : 0
        if (opacity < 0.01) return ''
        return `<path d="${pentagon(p.cx, p.cy, p.r, p.rot)}" fill="${patchFill}" stroke="${patchStroke}" stroke-width="${patchStrokeW}" opacity="${opacity.toFixed(3)}"/>`
      }).join('\n      ')}

      <!-- seam lines -->
      ${SEAMS.map(s => `<path d="${s}" fill="none" stroke="${seamColor}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`).join('\n      ')}
      <!-- seam glow (gold shimmer) -->
      ${SEAMS.map(s => `<path d="${s}" fill="none" stroke="${seamGlow}" stroke-width="5" stroke-linecap="round" opacity="0.18"/>`).join('\n      ')}

      <!-- inner sphere shadow for 3D -->
      <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#000" stroke-width="30" opacity="0.12"/>
    </g>
  </g>`

  // ── data half ──────────────────────────────────────────────────────────────
  const ringData = [
    { r: 48,  color: r1, w: 2.8, a0: 35, a1: 145, dots: 6,  dotSize: 3.8 },
    { r: 78,  color: r2, w: 2.4, a0: 30, a1: 155, dots: 8,  dotSize: 3.2 },
    { r: 110, color: r3, w: 2.1, a0: 25, a1: 162, dots: 10, dotSize: 2.8 },
    { r: 143, color: r4, w: 1.8, a0: 22, a1: 168, dots: 12, dotSize: 2.3 },
    { r: 175, color: r1, w: 1.5, a0: 20, a1: 173, dots: 11, dotSize: 1.9 },
    { r: 206, color: r2, w: 1.2, a0: 18, a1: 178, dots: 9,  dotSize: 1.5 },
  ]

  // Scattered background particles on data side
  const bgParticles = []
  const rng2 = mkRng(0xcafebabe)
  for (let i = 0; i < 80; i++) {
    const angle = rng2() * 360
    const radius = 20 + rng2() * (R - 25)
    const x = +(C + radius * Math.cos(angle * Math.PI / 180)).toFixed(1)
    const y = +(C + radius * Math.sin(angle * Math.PI / 180)).toFixed(1)
    // Only on data side (x+y > 512) and inside circle
    if (x + y < 520) continue
    if (!inCircle(x, y)) continue
    const sz = 0.8 + rng2() * 2.2
    const op = (0.2 + rng2() * 0.55).toFixed(2)
    const col = rng2() > 0.5 ? r1 : r2
    bgParticles.push(`<circle cx="${x}" cy="${y}" r="${sz.toFixed(1)}" fill="${col}" opacity="${op}"/>`)
  }

  // Bokeh circles (large, very faint)
  const bokeh = []
  const rng3 = mkRng(0xfeedface)
  for (let i = 0; i < 8; i++) {
    const angle = 30 + rng3() * 100  // data-side angles
    const radius = 40 + rng3() * 140
    const x = +(C + radius * Math.cos(angle * Math.PI / 180)).toFixed(1)
    const y = +(C + radius * Math.sin(angle * Math.PI / 180)).toFixed(1)
    if (!inCircle(x, y) || x + y < 512) continue
    const sz = 8 + rng3() * 22
    bokeh.push(`<circle cx="${x}" cy="${y}" r="${sz.toFixed(1)}" fill="${r1}" opacity="${(0.04 + rng3() * 0.08).toFixed(3)}"/>`)
  }

  const dataHalf = `
  <g clip-path="url(#cfdata)">
    <g clip-path="url(#cfcircle)">
      <!-- data bg -->
      <circle cx="${C}" cy="${C}" r="${R}" fill="${dataBg}"/>
      <circle cx="${C}" cy="${C}" r="${R}" fill="url(#dataGlow)"/>

      <!-- bokeh -->
      ${bokeh.join('\n      ')}

      <!-- background scatter particles -->
      ${bgParticles.join('\n      ')}

      <!-- rings (angles 0°=right, going clockwise; clipped to right/lower half) -->
      ${ringData.map(({ r, color, w, a0, a1, dots, dotSize }) => `
        <!-- glow -->
        <path d="${arcPath(C, C, r, a0, a1)}" fill="none" stroke="${color}" stroke-width="${w * 4}" opacity="0.09" stroke-linecap="round"/>
        <!-- ring -->
        <path d="${arcPath(C, C, r, a0, a1)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>
        <!-- dots -->
        ${Array.from({ length: dots }, (_, i) => {
          const deg = a0 + (a1 - a0) * i / (dots - 1)
          const [x, y] = pt(C, C, r, deg)
          // Fade dot opacity near the diagonal (x+y close to 512)
          const distFromDiag = (parseFloat(x) + parseFloat(y) - 512) / Math.SQRT2
          const op = Math.min(1, Math.max(0.1, distFromDiag / 30)).toFixed(2)
          return `<circle cx="${x}" cy="${y}" r="${dotSize}" fill="${color}" opacity="${op}"/>`
        }).join('')}
      `).join('\n      ')}

      <!-- center glow node -->
      <circle cx="${C}" cy="${C}" r="12"  fill="${r1}" opacity="0.9"/>
      <circle cx="${C}" cy="${C}" r="22"  fill="${r1}" opacity="0.2"/>
      <circle cx="${C}" cy="${C}" r="38"  fill="${r1}" opacity="0.07"/>
      <circle cx="${C}" cy="${C}" r="58"  fill="${r1}" opacity="0.03"/>

      <!-- radial spokes (faint) -->
      ${[45, 70, 95, 120].map(deg => {
        const [x1, y1] = pt(C, C, 25, deg)
        const [x2, y2] = pt(C, C, R - 15, deg)
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${r1}" stroke-width="0.8" opacity="0.12"/>`
      }).join('\n      ')}
    </g>
  </g>`

  // ── particle transition strip ──────────────────────────────────────────────
  // Dense cloud of particles fading across the diagonal
  // Diagonal runs from approx (C + R*cos(135°), C + R*sin(135°)) = (100, 412)
  //                        to (C + R*cos(-45°),  C + R*sin(-45°)) = (412, 100)

  const transParticles = []
  const rng4 = mkRng(0xabcdef12)

  // Primary particle cloud along the diagonal
  for (let i = 0; i < 200; i++) {
    // Position along the diagonal (parametric: 0=lower-left edge, 1=upper-right edge)
    const t = rng4()
    const along = -155 + t * 310  // ±155 from center along diagonal axis
    // Perpendicular offset (positive = football side, negative = data side)
    const perp = (rng4() - 0.5) * 140  // ±70 from the diagonal

    // Convert to x,y (diagonal direction is 135°/−45°)
    // Along: direction (-1/√2, 1/√2) from center going toward lower-left
    // Perp: direction (1/√2, 1/√2) perpendicular (football = top-left)
    const x = +(C + along * (-1 / Math.SQRT2) + perp * (1 / Math.SQRT2)).toFixed(1)
    const y = +(C + along * (1 / Math.SQRT2)  + perp * (1 / Math.SQRT2)).toFixed(1)

    if (!inCircle(x, y)) continue

    // Color based on which side we're on
    const onFootball = (512 - parseFloat(x) - parseFloat(y)) > 0
    const perpAbs = Math.abs(perp)

    // Opacity: highest near center of band, fades to edges
    const bandOpacity = Math.max(0, 1 - perpAbs / 70)
    if (bandOpacity < 0.05) continue

    // Fade further based on distance along the diagonal from center
    const alongFade = Math.max(0.3, 1 - Math.abs(along) / 180)

    const opacity = (bandOpacity * alongFade * (0.4 + rng4() * 0.5)).toFixed(3)
    const size = (0.6 + rng4() * 2.8).toFixed(1)

    // Color: football side → particleA (gold/white), data side → particleB (blue)
    const color = onFootball
      ? (rng4() > 0.4 ? particleA : '#ffffff')
      : (rng4() > 0.3 ? particleB : r1)

    transParticles.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}"/>`)
  }

  // Slightly larger glowing particles at the transition edge
  for (let i = 0; i < 30; i++) {
    const t = rng4()
    const along = -130 + t * 260
    const perp = (rng4() - 0.5) * 60
    const x = +(C + along * (-1 / Math.SQRT2) + perp * (1 / Math.SQRT2)).toFixed(1)
    const y = +(C + along * (1 / Math.SQRT2)  + perp * (1 / Math.SQRT2)).toFixed(1)
    if (!inCircle(x, y)) continue
    const onFootball = (512 - parseFloat(x) - parseFloat(y)) > 0
    const color = onFootball ? particleA : particleB
    const sz = (2 + rng4() * 4).toFixed(1)
    transParticles.push(`<circle cx="${x}" cy="${y}" r="${sz}" fill="${color}" opacity="${(0.1 + rng4() * 0.25).toFixed(3)}"/>`)
  }

  const transition = `
  <g clip-path="url(#cfcircle)">
    ${transParticles.join('\n    ')}
  </g>`

  // ── outer ring + final frame ───────────────────────────────────────────────
  const frame = `
  <g clip-path="url(#cfcircle)">
    <!-- inner vignette -->
    <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#000" stroke-width="22" opacity="0.35"/>
  </g>
  <circle cx="${C}" cy="${C}" r="${R}"     fill="none" stroke="${outerRing}" stroke-width="2.2"/>
  <circle cx="${C}" cy="${C}" r="${R + 6}" fill="none" stroke="${outerRing}" stroke-width="0.8" opacity="0.3"/>
  <circle cx="${C}" cy="${C}" r="${R + 13}" fill="none" stroke="${outerRing}" stroke-width="0.4" opacity="0.12"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
${defs}
  <!-- background -->
  <rect width="${S}" height="${S}" fill="${bgColor}"/>

${footballHalf}
${dataHalf}
${transition}
${frame}
</svg>`
}

// ─── 4 proposals ─────────────────────────────────────────────────────────────

const LOGOS = [
  {
    id: 'prop-1-midnight-gold',
    label: 'Midnight Gold',
    desc: 'Pelota blanco puro con parches negros, costuras doradas. Datos en azul eléctrico profundo. Partículas de transición doradas y azules. El look más premium y reconocible.',
    colors: {
      bgColor: '#07070f',
      ballBase: '#f0eff0', ballGrad: '#ffffff',
      patchFill: '#111111', patchStroke: '#f0c040', patchStrokeW: 1.8,
      seamColor: 'rgba(240,192,64,0.55)', seamGlow: '#f0c040',
      dataBg: '#060818',
      r1: '#f0c040', r2: '#4a9eff', r3: '#1e60dd', r4: '#0a3088',
      particleA: '#f0c040', particleB: '#4a9eff',
      outerRing: '#f0c040', glowColor: '#f0c040',
    },
  },
  {
    id: 'prop-2-teal-cyber',
    label: 'Teal Cyber',
    desc: 'Pelota en gris oscuro azulado con costuras teal neón. Datos en teal/cyan vibrante sobre índigo profundo. Partículas en teal y blanco. Moderno y tech.',
    colors: {
      bgColor: '#05080f',
      ballBase: '#ddeef8', ballGrad: '#f0f8ff',
      patchFill: '#0e1a26', patchStroke: 'rgba(0,210,180,0.6)', patchStrokeW: 1.6,
      seamColor: 'rgba(0,210,180,0.5)', seamGlow: '#00d4b4',
      dataBg: '#040810',
      r1: '#00d4b4', r2: '#00a0e0', r3: '#0055bb', r4: '#003077',
      particleA: '#00d4b4', particleB: '#00a0e0',
      outerRing: '#00d4b4', glowColor: '#00c8a8',
    },
  },
  {
    id: 'prop-3-electric-blue',
    label: 'Electric Blue',
    desc: 'Pelota en navy oscuro con costuras azul eléctrico brillante. Datos en azul cielo + violeta. Partículas azul-blancas en la transición. Look deportivo premium.',
    colors: {
      bgColor: '#040610',
      ballBase: '#e8eef8', ballGrad: '#f4f8ff',
      patchFill: '#0a0f1e', patchStroke: 'rgba(80,160,255,0.7)', patchStrokeW: 1.8,
      seamColor: 'rgba(80,160,255,0.55)', seamGlow: '#60b0ff',
      dataBg: '#030510',
      r1: '#60b0ff', r2: '#a060ff', r3: '#4040cc', r4: '#201888',
      particleA: '#60b0ff', particleB: '#a060ff',
      outerRing: '#60b0ff', glowColor: '#5090ff',
    },
  },
  {
    id: 'prop-4-neon-green',
    label: 'Neon Green',
    desc: 'Pelota blanca clásica con costuras verde lima. Datos en verde neón / esmeralda sobre negro. Partículas verdes. El look más futurista y de alto contraste.',
    colors: {
      bgColor: '#040a06',
      ballBase: '#eef8ee', ballGrad: '#f8fff8',
      patchFill: '#0a1a0e', patchStroke: 'rgba(40,220,100,0.65)', patchStrokeW: 1.7,
      seamColor: 'rgba(40,220,100,0.5)', seamGlow: '#28dc64',
      dataBg: '#040a06',
      r1: '#28dc64', r2: '#00c090', r3: '#008855', r4: '#004433',
      particleA: '#28dc64', particleB: '#00c090',
      outerRing: '#28dc64', glowColor: '#20cc58',
    },
  },
]

// ─── render ──────────────────────────────────────────────────────────────────

for (const logo of LOGOS) {
  const svg = makeLogo(logo)
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  writeFileSync(`./public/logos/${logo.id}.png`, buf)
  console.log(`✓ ${logo.id}.png`)
}

// ─── HTML preview ─────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TopScorer — Logo v4</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#07070f;color:#e5e5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;padding:48px 24px 80px}
  h1{text-align:center;font-size:52px;letter-spacing:5px;color:#f0c040;margin-bottom:6px;font-weight:900;text-transform:uppercase}
  .sub{text-align:center;font-size:12px;color:#3a3a5a;letter-spacing:2px;margin-bottom:64px}
  .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:32px;max-width:860px;margin:0 auto}
  @media(max-width:620px){.grid{grid-template-columns:1fr}}
  .card{background:#0a0a18;border:1px solid #1a1a30;border-radius:6px;padding:36px 28px 28px;display:flex;flex-direction:column;align-items:center;gap:18px;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .15s}
  .card:hover{border-color:#f0c040;box-shadow:0 0 50px rgba(240,192,64,.1);transform:translateY(-3px)}
  .card img{width:240px;height:240px;border-radius:50%;display:block;box-shadow:0 8px 40px rgba(0,0,0,.6)}
  .card-num{font-size:10px;font-weight:700;letter-spacing:3px;color:#2a2a4a;text-transform:uppercase}
  .card-name{font-size:15px;font-weight:700;color:#e5e5f2;text-align:center;letter-spacing:.5px}
  .card-desc{font-size:11.5px;color:#4a4a6a;line-height:1.7;text-align:center;max-width:270px}
  .btn{margin-top:6px;padding:10px 24px;background:rgba(240,192,64,.08);border:1px solid rgba(240,192,64,.28);border-radius:3px;color:#f0c040;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:background .15s}
  .btn:hover{background:rgba(240,192,64,.2)}
  .card.picked .btn{background:#f0c040;color:#07070f;border-color:#f0c040}
  .card.picked{border-color:#f0c040;box-shadow:0 0 60px rgba(240,192,64,.15)}
  #msg{text-align:center;font-size:13px;color:#38c47a;letter-spacing:1px;margin-top:32px;min-height:22px}
</style>
</head>
<body>
<h1>TopScorer</h1>
<p class="sub">Propuestas de logo — mitad pelota · franja partículas diagonal · mitad esfera data</p>
<div class="grid">
${LOGOS.map((logo, i) => `
  <div class="card" id="c-${logo.id}">
    <div class="card-num">Propuesta ${i + 1}</div>
    <img src="${logo.id}.png" alt="${logo.label}"/>
    <div class="card-name">${logo.label}</div>
    <div class="card-desc">${logo.desc}</div>
    <button class="btn" onclick="pick('${logo.id}')">Seleccionar →</button>
  </div>`).join('')}
</div>
<div id="msg"></div>
<script>
function pick(id){
  document.querySelectorAll('.card').forEach(c=>c.classList.remove('picked'))
  document.getElementById('c-'+id).classList.add('picked')
  document.getElementById('msg').textContent='✓ Seleccionado: '+id
  navigator.clipboard?.writeText(id).catch(()=>{})
}
</script>
</body>
</html>`

writeFileSync('./public/logos/preview.html', html)
console.log('\n✓ preview.html → http://localhost:3001/logos/preview.html')
