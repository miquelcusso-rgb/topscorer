/**
 * audit-players.mjs — read-only audit of player identity health.
 *
 * Cross-references the three sources:
 *   - curated rows in data/players.ts  (hand-entered; some old seasons / no apiId)
 *   - data/players-generated.ts        (API season 2526, all have apiId)
 *   - data/search-index.ts             (ALL first-division players, apiId + current club)
 *
 * Reports players whose "current" entry is STALE (an old curated season survives
 * because no newer entry exists in the dataset) and curated rows with no apiId.
 */
import { readFileSync } from 'fs'

function loadGen(f) {
  const m = readFileSync(f, 'utf8')
  return JSON.parse(JSON.parse(m.slice(m.indexOf('JSON.parse(') + 11, m.lastIndexOf(') as'))))
}
const gen = loadGen('data/players-generated.ts')
const idx = loadGen('data/search-index.ts')

// Parse curated rows out of data/players.ts: lines like `{ name:'..', club:'..', ... season:'2324' ..}`
const src = readFileSync('data/players.ts', 'utf8')
const curated = []
const rowRe = /\{\s*name:\s*'([^']+)'[^}]*?club:\s*'([^']+)'[^}]*?season:\s*'(\d{4})'[^}]*?\}/g
let mm
while ((mm = rowRe.exec(src))) curated.push({ name: mm[1], club: mm[2], season: mm[3] })

const norm = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
const il = s => { const t = norm(s).split(' ').filter(Boolean); return t.length >= 2 ? `${t[0][0]} ${t[t.length - 1]}` : norm(s) }

// Index lookups by name + initial-last (current club/apiId authority).
const idxByName = new Map(), idxByIl = new Map()
for (const p of idx) {
  if (!idxByName.has(norm(p.name))) idxByName.set(norm(p.name), p)
  if (p.fullName && !idxByName.has(norm(p.fullName))) idxByName.set(norm(p.fullName), p)
  const k = il(p.name); if (!idxByIl.has(k)) idxByIl.set(k, p)
}
const genIl = new Set(gen.map(p => il(p.name)))
const genName = new Set(gen.map(p => norm(p.name)))

// Distinct curated players (by name) and their newest curated season.
const curByName = new Map()
for (const c of curated) {
  const k = norm(c.name)
  const cur = curByName.get(k)
  if (!cur || Number(c.season) > Number(cur.season)) curByName.set(k, c)
}

let staleCurrent = 0, noApiId = 0, ok = 0
const staleList = []
for (const [k, c] of curByName) {
  const inGen2526 = genName.has(k) || genIl.has(il(c.name))
  const idxHit = idxByName.get(k) ?? idxByIl.get(il(c.name))
  if (inGen2526) { ok++; continue } // generated 2526 supersedes → fine
  if (Number(c.season) < 2526) {
    // newest curated entry is an old season AND not in generated 2526 → stale "current"
    staleCurrent++
    staleList.push({ name: c.name, curatedClub: c.club, curatedSeason: c.season,
      currentApiId: idxHit?.id, currentClub: idxHit?.club, currentLeague: idxHit?.league })
  }
  if (!idxHit) noApiId++
}

console.log(`Curated distinct players: ${curByName.size}`)
console.log(`  superseded by generated 2526 (OK): ${ok}`)
console.log(`  STALE current (old curated season, not in generated): ${staleCurrent}`)
console.log(`  of those, not findable in index either: ${noApiId}`)
console.log('\n=== STALE-CURRENT players (curated shows old, index has current) ===')
for (const s of staleList) {
  console.log(`  ${s.name.padEnd(24)} curated:${s.curatedClub} (${s.curatedSeason})  →  current:${s.currentClub ?? '??'} [${s.currentLeague ?? '-'}] id=${s.currentApiId ?? '-'}`)
}
