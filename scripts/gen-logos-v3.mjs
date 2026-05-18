import sharp from '../node_modules/sharp/lib/index.js'
import { mkdirSync, writeFileSync } from 'fs'

mkdirSync('./public/logos', { recursive: true })

const S = 512, C = S / 2, R = 220

// ─── helpers ────────────────────────────────────────────────────────────────

function pt(cx, cy, r, deg) {
  const rad = deg * Math.PI / 180
  return [+(cx + r * Math.cos(rad)).toFixed(2), +(cy + r * Math.sin(rad)).toFixed(2)]
}

function pentagon(cx, cy, r, rot = 0) {
  const pts = Array.from({ length: 5 }, (_, i) => pt(cx, cy, r, rot + i * 72).join(','))
  return `M${pts.join('L')}Z`
}

// Arc from angle a0 to a1 (degrees, 0=right, 90=down)
function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = pt(cx, cy, r, a0)
  const [x1, y1] = pt(cx, cy, r, a1)
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`
}

// Dot along a circle
function dotAt(cx, cy, r, deg, size = 3) {
  const [x, y] = pt(cx, cy, r, deg)
  return `<circle cx="${x}" cy="${y}" r="${size}" fill="currentColor"/>`
}

// ─── football patch data ─────────────────────────────────────────────────────
// Classic soccer ball: 12 black pentagons on white sphere
// Using approximate screen coords for a 512px ball at center 256,256

const PATCHES = [
  // top pentagon (facing viewer)
  { cx: 256, cy: 80,  r: 45, rot: 0   },
  // ring of 5 around it
  { cx: 138, cy: 152, r: 45, rot: 36  },
  { cx: 374, cy: 152, r: 45, rot: -36 },
  { cx: 100, cy: 300, r: 45, rot: 72  },
  { cx: 412, cy: 300, r: 45, rot: -72 },
  // lower ring of 5 (partially off-screen = realistic)
  { cx: 174, cy: 420, r: 45, rot: 0   },
  { cx: 338, cy: 420, r: 45, rot: 0   },
  { cx: 256, cy: 455, r: 45, rot: 0   },
  // two partially visible on sides
  { cx: 76,  cy: 430, r: 45, rot: 36  },
  { cx: 436, cy: 430, r: 45, rot: -36 },
]

// Seam lines between patches (curved)
const SEAMS = [
  // vertical seam down center
  arcPath(256, 256, 130, -100, 80),
  // diagonal seams
  arcPath(200, 200, 110, 30, 180),
  arcPath(312, 200, 110, 0, 160),
  arcPath(170, 340, 105, -60, 90),
  arcPath(342, 340, 105, -90, 60),
  arcPath(256, 150, 90, 100, 260),
]

// ─── SVG building blocks ─────────────────────────────────────────────────────

// Half-circle ball (left = football, right = data)
// divLine: 'vertical' | 'diagonal' | 'arc'

function makeLogoSVG({ variant, colors }) {
  const {
    bg,          // outer background
    ballBg,      // football side ball color
    patchFill,   // black patches
    patchStroke, // patch outline
    seamColor,   // seam lines
    dataBg,      // data side background
    ring1, ring2, ring3, ring4,  // ring colors inner→outer
    splitLine,   // divider color/glow
    textColor,
    accentColor,
  } = colors

  const seamW = 1.8
  const divX = C  // vertical split at center

  // ── football half (left) ──────────────────────────────────────────────────
  const footballHalf = `
    <clipPath id="leftClip">
      <path d="M${divX},${C - R - 10} A${R},${R} 0 0 0 ${divX},${C + R + 10} L${divX},${C - R - 10}Z"/>
    </clipPath>

    <g clip-path="url(#leftClip)">
      <!-- ball base -->
      <circle cx="${C}" cy="${C}" r="${R}" fill="${ballBg}"/>

      <!-- patches -->
      ${PATCHES.map(p => `<path d="${pentagon(p.cx, p.cy, p.r, p.rot)}" fill="${patchFill}" stroke="${patchStroke}" stroke-width="2"/>`).join('\n      ')}

      <!-- seam lines -->
      ${SEAMS.map(s => `<path d="${s}" fill="none" stroke="${seamColor}" stroke-width="${seamW}" stroke-linecap="round"/>`).join('\n      ')}

      <!-- subtle edge vignette on the ball -->
      <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${patchStroke}" stroke-width="0.5" opacity="0.3"/>
    </g>`

  // ── data half (right) ─────────────────────────────────────────────────────
  // Concentric rings with arc gaps and data dots
  const rings = [
    { r: 55,  color: ring1, w: 2.5, a0: -140, a1: 130,  dots: 7,  dotSize: 3.5 },
    { r: 88,  color: ring2, w: 2.2, a0: -120, a1: 110,  dots: 9,  dotSize: 3   },
    { r: 122, color: ring3, w: 2.0, a0: -105, a1: 95,   dots: 11, dotSize: 2.5 },
    { r: 156, color: ring4, w: 1.7, a0: -95,  a1: 82,   dots: 12, dotSize: 2   },
    { r: 190, color: ring1, w: 1.4, a0: -88,  a1: 70,   dots: 10, dotSize: 1.8 },
  ]

  const dataHalf = `
    <clipPath id="rightClip">
      <path d="M${divX},${C - R - 10} A${R},${R} 0 0 1 ${divX},${C + R + 10} L${divX},${C - R - 10}Z"/>
    </clipPath>

    <g clip-path="url(#rightClip)">
      <!-- data background -->
      <circle cx="${C}" cy="${C}" r="${R}" fill="${dataBg}"/>

      <!-- glowing center node -->
      <circle cx="${C}" cy="${C}" r="10" fill="${ring1}" opacity="0.9"/>
      <circle cx="${C}" cy="${C}" r="18" fill="${ring1}" opacity="0.2"/>
      <circle cx="${C}" cy="${C}" r="30" fill="${ring1}" opacity="0.07"/>

      <!-- rings with dots (right side only, starting from center) -->
      ${rings.map(({ r, color, w, a0, a1, dots, dotSize }) => `
        <path d="${arcPath(C, C, r, a0, a1)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>
        ${Array.from({ length: dots }, (_, i) => {
          const deg = a0 + (a1 - a0) * i / (dots - 1)
          const [x, y] = pt(C, C, r, deg)
          return `<circle cx="${x}" cy="${y}" r="${dotSize}" fill="${color}" opacity="0.85"/>`
        }).join('\n        ')}
        <!-- glow copy -->
        <path d="${arcPath(C, C, r, a0, a1)}" fill="none" stroke="${color}" stroke-width="${w * 4}" opacity="0.06" stroke-linecap="round"/>
      `).join('\n      ')}

      <!-- radial spokes (faint) -->
      ${[-60, -20, 20, 60].map(deg => {
        const [x1, y1] = pt(C, C, 20, deg)
        const [x2, y2] = pt(C, C, 195, deg)
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ring1}" stroke-width="0.7" opacity="0.18"/>`
      }).join('\n      ')}

      <!-- scatter dots -->
      ${Array.from({ length: 18 }, (_, i) => {
        const deg = -90 + i * 20
        const rr = 65 + (i % 5) * 28
        const [x, y] = pt(C, C, rr, deg)
        return `<circle cx="${x}" cy="${y}" r="${1 + (i%3)*0.7}" fill="${i%2===0 ? ring1 : ring2}" opacity="${0.3 + (i%4)*0.1}"/>`
      }).join('\n      ')}
    </g>`

  // ── divider line ──────────────────────────────────────────────────────────
  const [topX, topY] = pt(C, C, R, -90)
  const [botX, botY] = pt(C, C, R,  90)
  const divider = `
    <line x1="${topX}" y1="${topY}" x2="${botX}" y2="${botY}" stroke="${splitLine}" stroke-width="2.5"/>
    <line x1="${topX}" y1="${topY}" x2="${botX}" y2="${botY}" stroke="${splitLine}" stroke-width="8" opacity="0.15"/>
    <line x1="${topX}" y1="${topY}" x2="${botX}" y2="${botY}" stroke="${splitLine}" stroke-width="18" opacity="0.05"/>`

  // ── outer ring ────────────────────────────────────────────────────────────
  const outerRing = `
    <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${accentColor}" stroke-width="2.5"/>
    <circle cx="${C}" cy="${C}" r="${R + 7}" fill="none" stroke="${accentColor}" stroke-width="0.8" opacity="0.25"/>
    <circle cx="${C}" cy="${C}" r="${R - 5}" fill="none" stroke="${accentColor}" stroke-width="0.5" opacity="0.1"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.7"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- background -->
  <rect width="${S}" height="${S}" fill="${bg}"/>

  ${footballHalf}
  ${dataHalf}
  ${divider}
  ${outerRing}

  <!-- outer bg mask for circular crop feel -->
  <rect width="${S}" height="${S}" fill="url(#bgGrad)"/>
</svg>`
}

// ─── 4 CONCEPTS × 2 VARIANTS ────────────────────────────────────────────────

const LOGOS = [
  // ── CONCEPT 1: Gold & Night ────────────────────────────────────────────
  {
    id: 'gold-night-v1',
    label: 'Gold & Night — Clásico',
    desc: 'Fondo negro profundo. Parches gris oscuro con costuras doradas. Anillos de datos en azul eléctrico con nodo dorado central.',
    colors: {
      bg: '#07070f', ballBg: '#14141f', patchFill: '#1e1e30', patchStroke: '#f0c040',
      seamColor: 'rgba(240,192,64,0.5)', dataBg: '#0a0a18',
      ring1: '#f0c040', ring2: '#4a9eff', ring3: '#2070dd', ring4: '#1040aa',
      splitLine: '#f0c040', textColor: '#e5e5f2', accentColor: '#f0c040',
    },
  },
  {
    id: 'gold-night-v2',
    label: 'Gold & Night — Intenso',
    desc: 'Mismo concepto con contraste más alto. Parches negros puros con borde dorado brillante. Datos en teal eléctrico.',
    colors: {
      bg: '#050508', ballBg: '#ffffff', patchFill: '#111111', patchStroke: 'rgba(240,192,64,0.3)',
      seamColor: 'rgba(0,0,0,0.35)', dataBg: '#060c18',
      ring1: '#00e5ff', ring2: '#f0c040', ring3: '#0080ff', ring4: '#004488',
      splitLine: '#00e5ff', textColor: '#ffffff', accentColor: '#00e5ff',
    },
  },

  // ── CONCEPT 2: Teal Cyber ─────────────────────────────────────────────
  {
    id: 'teal-cyber-v1',
    label: 'Teal Cyber — Neon',
    desc: 'Pelota tradicional blanco/negro a la izquierda. Lado derecho en índigo oscuro con anillos teal neón y partículas dispersas.',
    colors: {
      bg: '#04090f', ballBg: '#f0f0f0', patchFill: '#1a1a1a', patchStroke: 'rgba(0,210,180,0.3)',
      seamColor: 'rgba(30,30,30,0.5)', dataBg: '#030a14',
      ring1: '#00d4b4', ring2: '#00a8e8', ring3: '#0060cc', ring4: '#003088',
      splitLine: '#00d4b4', textColor: '#e0f8f4', accentColor: '#00d4b4',
    },
  },
  {
    id: 'teal-cyber-v2',
    label: 'Teal Cyber — Deep Space',
    desc: 'Ambas mitades en fondo oscuro azul marino. Pelota con costuras cyan sutiles. Datos con anillos morados y azules estratificados.',
    colors: {
      bg: '#060810', ballBg: '#10122a', patchFill: '#1a1c38', patchStroke: 'rgba(100,180,255,0.4)',
      seamColor: 'rgba(100,180,255,0.3)', dataBg: '#080a1e',
      ring1: '#60c0ff', ring2: '#8060ff', ring3: '#4040cc', ring4: '#202088',
      splitLine: '#60c0ff', textColor: '#c0d8ff', accentColor: '#60c0ff',
    },
  },

  // ── CONCEPT 3: Crimson Tech ───────────────────────────────────────────
  {
    id: 'crimson-tech-v1',
    label: 'Crimson Tech — Rojo & Azul',
    desc: 'Pelota oscura con costuras rojo brillante. Datos en azul rey eléctrico. Divider en degradado rojo→azul.',
    colors: {
      bg: '#070508', ballBg: '#120810', patchFill: '#1e0a14', patchStroke: 'rgba(220,40,80,0.5)',
      seamColor: 'rgba(220,40,80,0.4)', dataBg: '#070510',
      ring1: '#ff4488', ring2: '#4488ff', ring3: '#2255cc', ring4: '#112288',
      splitLine: '#cc2255', textColor: '#ffe0ec', accentColor: '#ff4488',
    },
  },
  {
    id: 'crimson-tech-v2',
    label: 'Crimson Tech — Naranja Premium',
    desc: 'Pelota clásica blanco/negro. Datos en ámbar/naranja vibrante sobre negro. Sensación de marcador estadístico premium.',
    colors: {
      bg: '#060400', ballBg: '#f8f8f0', patchFill: '#111108', patchStroke: 'rgba(255,160,20,0.2)',
      seamColor: 'rgba(20,20,10,0.4)', dataBg: '#080600',
      ring1: '#ffaa00', ring2: '#ff6600', ring3: '#cc4400', ring4: '#882200',
      splitLine: '#ffaa00', textColor: '#fff8e0', accentColor: '#ffaa00',
    },
  },

  // ── CONCEPT 4: Pure White Ice ─────────────────────────────────────────
  {
    id: 'ice-blue-v1',
    label: 'Ice Blue — Frost',
    desc: 'Pelota en azul helado muy oscuro con costuras azul claro. Datos en azul cielo brillante con puntos blancos. Sensación premium fría.',
    colors: {
      bg: '#020810', ballBg: '#0a1828', patchFill: '#0f2240', patchStroke: 'rgba(140,200,255,0.5)',
      seamColor: 'rgba(140,200,255,0.35)', dataBg: '#020c1c',
      ring1: '#80d8ff', ring2: '#40a8ff', ring3: '#2060cc', ring4: '#103088',
      splitLine: '#80d8ff', textColor: '#e0f4ff', accentColor: '#80d8ff',
    },
  },
  {
    id: 'ice-blue-v2',
    label: 'Ice Blue — Monochrome',
    desc: 'Todo en escala de grises azulados. La pelota B&W clásica. Los datos en gris plata metálico. Ultrapremium y sobrio.',
    colors: {
      bg: '#070708', ballBg: '#e8e8e8', patchFill: '#111111', patchStroke: 'rgba(200,200,220,0.2)',
      seamColor: 'rgba(30,30,30,0.4)', dataBg: '#0a0a0e',
      ring1: '#c0c8e0', ring2: '#8090b0', ring3: '#506080', ring4: '#303850',
      splitLine: '#c0c8e0', textColor: '#d0d8f0', accentColor: '#c0c8e0',
    },
  },
]

// ─── render ──────────────────────────────────────────────────────────────────

const pngs = {}

for (const logo of LOGOS) {
  const svg = makeLogoSVG(logo)
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  writeFileSync(`./public/logos/${logo.id}.png`, buf)
  pngs[logo.id] = buf.toString('base64')
  console.log(`✓ ${logo.id}.png`)
}

// ─── HTML preview ─────────────────────────────────────────────────────────────

const CONCEPTS = [
  { name: 'Gold & Night', ids: ['gold-night-v1', 'gold-night-v2'] },
  { name: 'Teal Cyber', ids: ['teal-cyber-v1', 'teal-cyber-v2'] },
  { name: 'Crimson Tech', ids: ['crimson-tech-v1', 'crimson-tech-v2'] },
  { name: 'Ice Blue', ids: ['ice-blue-v1', 'ice-blue-v2'] },
]

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TopScorer — Logo Concepts</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #07070f;
    color: #e5e5f2;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100vh;
    padding: 40px 24px 80px;
  }
  h1 {
    text-align: center;
    font-family: 'Bebas Neue', Georgia, serif;
    font-size: 48px;
    letter-spacing: 4px;
    color: #f0c040;
    margin-bottom: 8px;
  }
  .subtitle {
    text-align: center;
    font-size: 13px;
    color: #5a5a7a;
    margin-bottom: 56px;
    letter-spacing: 1px;
  }
  .concept {
    max-width: 900px;
    margin: 0 auto 64px;
  }
  .concept-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #5a5a7a;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #1e1e34;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
  .card {
    background: #0e0e1c;
    border: 1px solid #1e1e34;
    border-radius: 4px;
    padding: 32px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    transition: border-color 0.15s, box-shadow 0.15s;
    cursor: pointer;
  }
  .card:hover {
    border-color: #f0c040;
    box-shadow: 0 0 40px rgba(240,192,64,.08);
  }
  .card img {
    width: 220px;
    height: 220px;
    border-radius: 50%;
    display: block;
  }
  .card-name {
    font-size: 13px;
    font-weight: 600;
    color: #e5e5f2;
    text-align: center;
  }
  .card-desc {
    font-size: 11px;
    color: #5a5a7a;
    line-height: 1.6;
    text-align: center;
    max-width: 260px;
  }
  .card-btn {
    margin-top: 4px;
    padding: 8px 20px;
    background: rgba(240,192,64,.08);
    border: 1px solid rgba(240,192,64,.25);
    border-radius: 2px;
    color: #f0c040;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s;
  }
  .card-btn:hover { background: rgba(240,192,64,.18); }
  .selected .card-btn {
    background: #f0c040;
    color: #07070f;
  }
  #selected-label {
    text-align: center;
    font-size: 12px;
    color: #38c47a;
    margin-top: 24px;
    min-height: 20px;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
<h1>TopScorer Logos</h1>
<p class="subtitle">4 conceptos × 2 variantes — Mitad pelota de fútbol · Mitad esfera de datos</p>

${CONCEPTS.map(concept => `
<section class="concept">
  <div class="concept-title">Concepto: ${concept.name}</div>
  <div class="grid">
    ${concept.ids.map(id => {
      const logo = LOGOS.find(l => l.id === id)
      return `
    <div class="card" id="card-${id}">
      <img src="${id}.png" alt="${logo.label}"/>
      <div class="card-name">${logo.label}</div>
      <div class="card-desc">${logo.desc}</div>
      <button class="card-btn" onclick="select('${id}')">Seleccionar este →</button>
    </div>`
    }).join('')}
  </div>
</section>`).join('')}

<div id="selected-label"></div>

<script>
function select(id) {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'))
  const card = document.getElementById('card-' + id)
  if (card) card.classList.add('selected')
  document.getElementById('selected-label').textContent = '✓ Seleccionado: ' + id
  navigator.clipboard?.writeText(id).catch(()=>{})
}
</script>
</body>
</html>`

writeFileSync('./public/logos/preview.html', html)
console.log('\n✓ preview.html → http://localhost:3001/logos/preview.html')
