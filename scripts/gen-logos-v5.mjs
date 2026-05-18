/**
 * gen-logos-v5.mjs
 * Generates 4 TopScorer logo variants: football half (upper-left) + data sphere half (lower-right)
 * Split along diagonal x+y=512 (45° line through center)
 */

import sharp from '../node_modules/sharp/lib/index.js'
import { mkdirSync, writeFileSync } from 'fs'

mkdirSync('public/logos', { recursive: true })

// ─── LCG deterministic random ───────────────────────────────────────────────
function makeLCG(seed) {
  let s = seed >>> 0
  return function () {
    s = Math.imul(1664525, s) + 1013904223
    s = s >>> 0
    return s / 0xffffffff
  }
}

// ─── Geometry helpers ───────────────────────────────────────────────────────
const CX = 256, CY = 256, R = 220

function inCircle(x, y) {
  return (x - CX) ** 2 + (y - CY) ** 2 <= R * R
}

// ─── FOOTBALL HALF ──────────────────────────────────────────────────────────
// Truncated icosahedron: 12 pentagon centers in spherical coords (theta from N pole, phi azimuth)
// theta values: 0, ~31.7°, ~58.3°, 180° (in radians)
const DEG = Math.PI / 180
const PENT_THETA = [
  [0, [0]],
  [31.7 * DEG, [0, 72, 144, 216, 288].map(d => d * DEG)],
  [58.3 * DEG, [36, 108, 180, 252, 324].map(d => d * DEG)],
  [180 * DEG, [0]],
]

function sphereToXYZ(theta, phi) {
  return [
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
  ]
}

// Rotate around Z axis by angle
function rotZ(x, y, z, a) {
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z]
}

// Rotate around X axis by angle
function rotX(x, y, z, a) {
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
}

// Project 3D point to 2D (orthographic, x→x, z→y)
function project(x, y, z) {
  // slight perspective (depth scale)
  const depth = 1 + z * 0.18
  return [CX + R * x / depth, CY - R * z / depth]
}

// Pentagon polygon path given center 2D and radius, rotated by angleOffset
function pentagonPath(px, py, r, angleOffset = 0) {
  const pts = []
  for (let i = 0; i < 5; i++) {
    const a = angleOffset + (i * 72 - 90) * DEG
    pts.push([px + r * Math.cos(a), py + r * Math.sin(a)])
  }
  return 'M' + pts.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('L') + 'Z'
}

// Build pentagon data: project all 12 pentagons
function buildPentagons() {
  const pentagons = []
  // Rotation: -45° around Z (pole north toward upper-left), then -15° around X (tilt)
  const rotZangle = -45 * DEG
  const rotXangle = -15 * DEG

  for (const [theta, phis] of PENT_THETA) {
    for (const phi of phis) {
      let [sx, sy, sz] = sphereToXYZ(theta, phi)
      // Apply rotations
      ;[sx, sy, sz] = rotZ(sx, sy, sz, rotZangle)
      ;[sx, sy, sz] = rotX(sx, sy, sz, rotXangle)
      const [px, py] = project(sx, sy, sz)
      // depth for sorting (sz after rotation) – higher sz = closer to viewer
      const depth = sz
      // Radius on 2D: ~38px base, scaled by depth factor
      const depthScale = 0.85 + sz * 0.2
      const r = 38 * Math.max(0.5, depthScale)
      // Pentagon orientation: rotate based on phi
      const angleOffset = phi + rotZangle

      // Opacity: fade pentagons that touch the diagonal (x+y near 512)
      // and pentagons behind the sphere (sz < -0.3)
      let op = 1.0
      if (sz < -0.1) op *= Math.max(0, 1 + sz * 2)
      // Fade near diagonal
      const diagDist = (px + py - 512) / 60
      if (diagDist > -1 && diagDist < 1) {
        // near diagonal: fade out on data side
        if (diagDist > 0) op *= Math.max(0, 1 - diagDist)
        else op *= Math.max(0.3, 1 + diagDist * 0.5)
      }
      if (diagDist > 1) op = 0 // fully on data side

      pentagons.push({ px, py, r, angleOffset, depth: sz, op })
    }
  }
  // Sort by depth (back to front)
  pentagons.sort((a, b) => a.depth - b.depth)
  return pentagons
}

// ─── FOOTBALL SVG ELEMENTS ──────────────────────────────────────────────────
function footballHalfSVG(strokeColor) {
  const pentagons = buildPentagons()
  let svg = ''

  // Clip to upper-left half of circle (x+y <= 512) with soft edge
  svg += `
  <defs>
    <clipPath id="circleClip">
      <circle cx="${CX}" cy="${CY}" r="${R}"/>
    </clipPath>
    <clipPath id="footballClip">
      <polygon points="${CX - R},${CY - R} ${CX + R},${CY - R} ${CX + R},${512 - (CX + R)} ${512 - (CY - R)},${CY - R}"/>
    </clipPath>
    <radialGradient id="ballBg" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#f8f8f0"/>
      <stop offset="70%" stop-color="#ededde"/>
      <stop offset="100%" stop-color="#d8d8c8"/>
    </radialGradient>
    <radialGradient id="poleGlow" cx="30%" cy="30%" r="40%">
      <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0"/>
    </radialGradient>
    <filter id="ballShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="3" dy="3" stdDeviation="8" flood-color="#0008"/>
    </filter>
    <linearGradient id="diagFade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="60%" stop-color="white" stop-opacity="1"/>
      <stop offset="85%" stop-color="white" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
    <mask id="footballMask">
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#diagFade)"/>
    </mask>
  </defs>

  <g clip-path="url(#circleClip)" mask="url(#footballMask)">
    <!-- Ball background -->
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#ballBg)" filter="url(#ballShadow)"/>

    <!-- Pole glow (upper-left) -->
    <circle cx="${CX - 60}" cy="${CY - 60}" r="100" fill="url(#poleGlow)"/>
  `

  // Draw pentagons
  for (const { px, py, r, angleOffset, op } of pentagons) {
    if (op <= 0.01) continue
    // Only draw if any part might be in the football half
    if (px + py > 512 + r * 1.5) continue
    const d = pentagonPath(px, py, r, angleOffset)
    svg += `
    <path d="${d}" fill="#1a1a1a" fill-opacity="${(op).toFixed(3)}"
          stroke="${strokeColor}" stroke-width="2" stroke-opacity="${(op * 0.9).toFixed(3)}"
          stroke-linejoin="round"/>`
  }

  svg += `\n  </g>`
  return svg
}

// ─── DATA SPHERE SVG ELEMENTS ───────────────────────────────────────────────
function dataSphereHalfSVG(colors, particleColors) {
  const { arc1, arc2, arc3 } = colors
  const rng = makeLCG(0xdeadbeef)
  let svg = ''

  svg += `
  <defs>
    <clipPath id="dataClip">
      <circle cx="${CX}" cy="${CY}" r="${R}"/>
    </clipPath>
    <radialGradient id="dataBg" cx="65%" cy="65%" r="70%">
      <stop offset="0%" stop-color="#0a0f1e"/>
      <stop offset="50%" stop-color="#06080f"/>
      <stop offset="100%" stop-color="#03040a"/>
    </radialGradient>
    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${arc1}" stop-opacity="1"/>
      <stop offset="40%" stop-color="${arc1}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${arc1}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="dataFade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="20%" stop-color="black" stop-opacity="0.15"/>
      <stop offset="40%" stop-color="black" stop-opacity="1"/>
    </linearGradient>
    <mask id="dataMask">
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="white"/>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#dataFade)"/>
    </mask>
    <filter id="nodeBlur">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>

  <g clip-path="url(#dataClip)">
    <!-- Background -->
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#dataBg)"/>
  `

  // Arcs: only in lower-right half (approx angles 45°→225°)
  // Arcs are centered at CX,CY, drawn from ~45° to ~225° clockwise
  const arcRadii = [55, 85, 115, 145, 175, 200]
  const arcColors = [arc1, arc2, arc3, arc1, arc2, arc3]
  const arcStartAngle = 45 * DEG   // start (upper-right edge of diagonal)
  const arcEndAngle = 225 * DEG    // end (lower-left edge of diagonal)

  for (let i = 0; i < arcRadii.length; i++) {
    const rad = arcRadii[i]
    const col = arcColors[i]
    const startX = CX + rad * Math.cos(arcStartAngle)
    const startY = CY + rad * Math.sin(arcStartAngle)
    const endX = CX + rad * Math.cos(arcEndAngle)
    const endY = CY + rad * Math.sin(arcEndAngle)

    // Arc path (large arc = 1, clockwise = 1)
    svg += `
    <path d="M${startX.toFixed(2)},${startY.toFixed(2)} A${rad},${rad} 0 1,1 ${endX.toFixed(2)},${endY.toFixed(2)}"
          fill="none" stroke="${col}" stroke-width="1.2" stroke-opacity="0.55" stroke-linecap="round"/>`

    // Dots along arc
    const numDots = Math.floor(rad * 0.18)
    for (let d = 0; d < numDots; d++) {
      const t = d / (numDots - 1)
      // angle: from arcStartAngle going clockwise 180° + a bit
      const angle = arcStartAngle + t * (Math.PI + 0.3)
      const dx = CX + rad * Math.cos(angle)
      const dy = CY + rad * Math.sin(angle)
      // Only draw if in lower-right half
      if (dx + dy < 512 - 10) continue
      if (!inCircle(dx, dy)) continue
      const distFromCenter = Math.sqrt((dx - CX) ** 2 + (dy - CY) ** 2)
      const fadeOp = Math.max(0, 1 - distFromCenter / (R * 0.95)) * 0.7 + 0.2
      const dotR = 1.5 + rng() * 1.5
      svg += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${dotR.toFixed(1)}" fill="${col}" fill-opacity="${(fadeOp * (0.5 + rng() * 0.5)).toFixed(2)}"/>`
    }
  }

  // Particles scattered in lower-right half
  const numParticles = 140
  for (let i = 0; i < numParticles; i++) {
    // Random position in lower-right half of circle
    let px, py, attempts = 0
    do {
      px = CX + (rng() * 2 - 0.3) * R
      py = CY + (rng() * 2 - 0.3) * R
      attempts++
    } while ((px + py < 512 + 15 || !inCircle(px, py)) && attempts < 20)
    if (px + py < 512 + 15 || !inCircle(px, py)) continue

    const r = 0.5 + rng() * 2.5
    const op = 0.2 + rng() * 0.7
    const colorChoice = rng()
    const col = colorChoice < 0.4 ? particleColors[0] : colorChoice < 0.75 ? particleColors[1] : particleColors[2]
    svg += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r.toFixed(1)}" fill="${col}" fill-opacity="${op.toFixed(2)}"/>`
  }

  // Bokeh circles
  for (let i = 0; i < 8; i++) {
    let bx, by, attempts = 0
    do {
      bx = CX + (rng() * 1.5 + 0.2) * R * 0.8
      by = CY + (rng() * 1.5 + 0.2) * R * 0.8
      attempts++
    } while ((bx + by < 512 + 30 || !inCircle(bx, by)) && attempts < 15)
    if (bx + by < 512 + 30 || !inCircle(bx, by)) continue
    const br = 10 + rng() * 20
    const bop = 0.04 + rng() * 0.07
    const bcol = rng() < 0.5 ? arc1 : arc2
    svg += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${br.toFixed(1)}" fill="${bcol}" fill-opacity="${bop.toFixed(3)}"/>`
  }

  // Central node glow
  svg += `
    <circle cx="${CX}" cy="${CY}" r="28" fill="url(#nodeGlow)" filter="url(#nodeBlur)"/>
    <circle cx="${CX}" cy="${CY}" r="14" fill="${arc1}" fill-opacity="0.4"/>
    <circle cx="${CX}" cy="${CY}" r="7" fill="${arc1}" fill-opacity="0.8"/>
    <circle cx="${CX}" cy="${CY}" r="4" fill="white" fill-opacity="0.9"/>
  `

  svg += `\n  </g>`
  return svg
}

// ─── TRANSITION PARTICLES ───────────────────────────────────────────────────
function transitionParticlesSVG(transColors) {
  const rng = makeLCG(0xdeadbeef)
  let svg = '<g id="transition">'

  const numParticles = 300
  const diagLen = 310   // total length along diagonal inside circle
  const bandHalf = 50   // ±50px perpendicular

  // Direction vectors
  const dirAlong = { x: -1 / Math.SQRT2, y: 1 / Math.SQRT2 }   // along diagonal (upper-right to lower-left... wait: x+y=512 goes from (512,0) to (0,512), direction (-1,1)/sqrt2
  const dirPerp  = { x:  1 / Math.SQRT2, y: 1 / Math.SQRT2 }   // perpendicular to diagonal

  for (let i = 0; i < numParticles; i++) {
    const t = rng()
    const along = -diagLen / 2 + t * diagLen
    const perp = (rng() * 2 - 1) * bandHalf

    const px = CX + along * dirAlong.x + perp * dirPerp.x
    const py = CY + along * dirAlong.y + perp * dirPerp.y

    if (!inCircle(px, py)) continue

    // opacity: gaussian on perp axis, max at perp=0
    const opBase = Math.exp(-(perp * perp) / (2 * 20 * 20))
    const op = opBase * (0.3 + rng() * 0.65)

    // color by which side
    const side = px + py - 512
    let col
    if (side < -5) {
      col = rng() < 0.6 ? transColors.football : '#fffff0'
    } else {
      col = rng() < 0.6 ? transColors.data1 : transColors.data2
    }

    // size
    const r = 0.5 + rng() * 2.5
    svg += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r.toFixed(1)}" fill="${col}" fill-opacity="${op.toFixed(2)}"/>`

    // Occasional bokeh particles
    if (rng() < 0.08) {
      const br = 3 + rng() * 4
      const bop = 0.05 + rng() * 0.08
      svg += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${br.toFixed(1)}" fill="${col}" fill-opacity="${bop.toFixed(3)}"/>`
    }
  }

  svg += '</g>'
  return svg
}

// ─── OUTER RING & FINISH ───────────────────────────────────────────────────
function outerRingSVG(strokeColor) {
  return `
  <!-- Outer ring -->
  <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-opacity="0.7"/>
  <circle cx="${CX}" cy="${CY}" r="${R - 4}" fill="none" stroke="${strokeColor}" stroke-width="0.8" stroke-opacity="0.3"/>
  `
}

// ─── MAIN SVG BUILDER ───────────────────────────────────────────────────────
function buildSVG(variant) {
  const { arcColors, particleColors, strokeColor, transColors } = variant

  const svgParts = []
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">`)

  // Master clip for entire logo
  svgParts.push(`
  <defs>
    <clipPath id="masterClip">
      <circle cx="${CX}" cy="${CY}" r="${R}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#masterClip)">`)

  // 1. Data sphere (lower-right half)
  svgParts.push(dataSphereHalfSVG(arcColors, particleColors))

  // 2. Football (upper-left half) — drawn on top so its mask fades into data sphere
  svgParts.push(footballHalfSVG(strokeColor))

  // 3. Transition particles
  svgParts.push(transitionParticlesSVG(transColors))

  svgParts.push(`</g>`)

  // 4. Outer ring (outside master clip g, but still in SVG)
  svgParts.push(outerRingSVG(strokeColor))

  svgParts.push(`</svg>`)
  return svgParts.join('\n')
}

// ─── VARIANTS ───────────────────────────────────────────────────────────────
const VARIANTS = [
  {
    id: 'v1',
    name: 'Midnight Gold + Teal',
    desc: 'Clásico teal profundo con dorado suave',
    arcColors: { arc1: '#00c8a8', arc2: '#4a9eff', arc3: '#0060cc' },
    particleColors: ['#00c8a8', '#4a9eff', '#80d8ff'],
    strokeColor: '#f0c040',
    transColors: { football: '#f0c040', data1: '#00c8a8', data2: '#4a9eff' },
  },
  {
    id: 'v2',
    name: 'Gold + Electric Cyan',
    desc: 'Cyan eléctrico vibrante y azul intenso',
    arcColors: { arc1: '#00e5ff', arc2: '#0080ff', arc3: '#003fa0' },
    particleColors: ['#00e5ff', '#0080ff', '#80f0ff'],
    strokeColor: '#f0c040',
    transColors: { football: '#f0c040', data1: '#00e5ff', data2: '#0080ff' },
  },
  {
    id: 'v3',
    name: 'Gold + Ocean',
    desc: 'Azul océano profundo y marino oscuro',
    arcColors: { arc1: '#00b8d4', arc2: '#0055aa', arc3: '#003377' },
    particleColors: ['#00b8d4', '#0055aa', '#40c0e0'],
    strokeColor: '#f0c040',
    transColors: { football: '#f0c040', data1: '#00b8d4', data2: '#0055aa' },
  },
  {
    id: 'v4',
    name: 'Gold + Aurora',
    desc: 'Verde aurora boreal y azul violeta',
    arcColors: { arc1: '#00dda0', arc2: '#4060ff', arc3: '#1030bb' },
    particleColors: ['#00dda0', '#4060ff', '#80ffcc'],
    strokeColor: '#f0c040',
    transColors: { football: '#f0c040', data1: '#00dda0', data2: '#4060ff' },
  },
]

// ─── GENERATE & SAVE ────────────────────────────────────────────────────────
const generated = []

for (const variant of VARIANTS) {
  const svgStr = buildSVG(variant)
  const svgPath = `public/logos/topscorer-${variant.id}.svg`
  const pngPath = `public/logos/topscorer-${variant.id}.png`

  writeFileSync(svgPath, svgStr)

  await sharp(Buffer.from(svgStr))
    .resize(512, 512)
    .png()
    .toFile(pngPath)

  console.log(`✓ Generated ${pngPath}`)
  generated.push({ ...variant, svgPath, pngPath })
}

// ─── PREVIEW HTML ───────────────────────────────────────────────────────────
const previewHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TopScorer Logo v5 — Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #07070f;
      color: #e0e0f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      gap: 40px;
    }
    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #f0c040, #00c8a8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle {
      color: #6070a0;
      font-size: 0.95rem;
      margin-top: -28px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      max-width: 680px;
      width: 100%;
    }
    .card {
      background: #0e0f1e;
      border: 1.5px solid #1c2040;
      border-radius: 20px;
      padding: 28px 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
      position: relative;
    }
    .card:hover {
      border-color: #2a3060;
      transform: translateY(-3px);
      box-shadow: 0 8px 32px #00050a80;
    }
    .card.selected {
      border-color: #f0c040;
      box-shadow: 0 0 0 2px #f0c04040, 0 8px 40px #f0c01020;
    }
    .card.selected::after {
      content: '✓';
      position: absolute;
      top: 14px; right: 14px;
      width: 24px; height: 24px;
      background: #f0c040;
      color: #07070f;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
    }
    .logo-wrap {
      width: 180px; height: 180px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 20px #00000080, 0 0 0 1.5px #ffffff08;
    }
    .logo-wrap img {
      width: 100%; height: 100%;
      display: block;
    }
    .card-name {
      font-size: 1rem;
      font-weight: 700;
      color: #d0d8f8;
      letter-spacing: -0.01em;
      text-align: center;
    }
    .card-desc {
      font-size: 0.82rem;
      color: #5060a0;
      text-align: center;
      line-height: 1.4;
    }
    .card-id {
      font-size: 0.72rem;
      color: #3040708;
      font-family: monospace;
      color: #304070;
    }
    .btn {
      margin-top: 4px;
      padding: 8px 20px;
      border-radius: 20px;
      border: 1.5px solid #2030508;
      border-color: #203050;
      background: transparent;
      color: #6080c0;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.15s;
      letter-spacing: 0.01em;
    }
    .btn:hover { background: #1a2040; color: #a0b8e8; border-color: #3050a0; }
    .card.selected .btn { background: #f0c040; color: #07070f; border-color: #f0c040; font-weight: 700; }
    .selection-info {
      padding: 16px 28px;
      background: #0e0f1e;
      border: 1.5px solid #1c2040;
      border-radius: 12px;
      font-size: 0.9rem;
      color: #7080b0;
      min-width: 280px;
      text-align: center;
    }
    .selection-info span {
      color: #f0c040;
      font-weight: 700;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>TopScorer — Logo v5</h1>
  <p class="subtitle">Fútbol × Datos — 4 variantes de color</p>

  <div class="grid">
${generated.map(v => `    <div class="card" id="card-${v.id}" onclick="selectVariant('${v.id}')">
      <div class="logo-wrap">
        <img src="topscorer-${v.id}.png" alt="${v.name}" loading="lazy">
      </div>
      <div class="card-name">${v.name}</div>
      <div class="card-desc">${v.desc}</div>
      <div class="card-id">${v.id}</div>
      <button class="btn" onclick="event.stopPropagation();selectVariant('${v.id}')">Seleccionar →</button>
    </div>`).join('\n')}
  </div>

  <div class="selection-info" id="selInfo">Haz click en una variante para seleccionarla</div>

  <script>
    let selected = null;
    function selectVariant(id) {
      if (selected) document.getElementById('card-' + selected)?.classList.remove('selected');
      selected = id;
      document.getElementById('card-' + id)?.classList.add('selected');
      document.getElementById('selInfo').innerHTML = 'Variante seleccionada: <span>' + id + '</span>';
    }
  </script>
</body>
</html>`

writeFileSync('public/logos/preview.html', previewHTML)
console.log('✓ Generated public/logos/preview.html')
console.log('\nDone! Files in public/logos/:')
generated.forEach(v => console.log(`  - topscorer-${v.id}.png  (${v.name})`))
console.log('  - preview.html')
