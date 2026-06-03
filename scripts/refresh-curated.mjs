/**
 * refresh-curated.mjs
 *
 * Durable fix for "obsolete player versions". Every hand-curated player is
 * pinned to their CURRENT API-Football id, and their current-season (2526) row
 * is fetched fresh so the most up-to-date version always wins.
 *
 * Resolves each distinct curated player → apiId (via the search index, with a
 * special-letter-aware normalizer + a manual override map for edge cases), then:
 *   - writes data/curated-ids.ts  (normName → apiId; consulted by lib/player-identity)
 *   - writes data/players-current.ts (current 2526 PlayerData for ids missing from
 *     data/players-generated.ts, so movers like Isak→Liverpool show correctly)
 *
 * Run:  node scripts/refresh-curated.mjs --dry   |   node scripts/refresh-curated.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { setTimeout as sleep } from 'timers/promises'

function loadEnv(path) {
  try { for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  } } catch {}
}
loadEnv('.env.local')
const KEY = process.env.API_FOOTBALL_KEY
if (!KEY) { console.error('Missing API_FOOTBALL_KEY'); process.exit(1) }
const BASE = 'https://v3.football.api-sports.io'
const DRY = process.argv.includes('--dry')

function loadGen(f) { const m = readFileSync(f, 'utf8'); return JSON.parse(JSON.parse(m.slice(m.indexOf('JSON.parse(') + 11, m.lastIndexOf(') as')))) }
const gen = loadGen('data/players-generated.ts')
const idx = loadGen('data/search-index.ts')

// Normalizer aware of special letters NFD doesn't decompose (ø, æ, ł, ð, þ, ı…).
const SPECIAL = { 'ø': 'o', 'œ': 'oe', 'æ': 'ae', 'ł': 'l', 'ð': 'd', 'þ': 'th', 'ı': 'i', 'ß': 'ss', 'đ': 'd', 'ħ': 'h' }
const norm = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[øœæłðþıßđħ]/g, c => SPECIAL[c] ?? c).replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
const il = s => { const t = norm(s).split(' ').filter(Boolean); return t.length >= 2 ? `${t[0][0]} ${t[t.length - 1]}` : norm(s) }

// Manual overrides for players in leagues we don't index (e.g. Saudi) or tricky names.
const MANUAL = {
  'mateo retegui': 6420,    // Al-Qadisiyah FC (Saudi) — not in our indexed leagues
  'luis diaz': 2489,        // Bayern München (Colombian); index has homonyms
  'nicolas gonzalez': 26315,// Atlético Madrid (Argentine winger)
}

// Index lookup tables.
const byName = new Map(), byIl = new Map(), ilAmbig = new Set()
for (const p of idx) {
  for (const nm of [norm(p.name), norm(p.fullName)]) if (nm && !byName.has(nm)) byName.set(nm, p.id)
  const k = il(p.name)
  if (byIl.has(k) && byIl.get(k) !== p.id) ilAmbig.add(k)
  else if (!byIl.has(k)) byIl.set(k, p.id)
}
const genIds = new Set(gen.map(p => p.apiId).filter(Boolean))

// Distinct curated player names from data/players.ts.
const src = readFileSync('data/players.ts', 'utf8')
const names = new Set()
const rowRe = /\{\s*name:\s*'([^']+)'[^}]*?season:\s*'\d{4}'[^}]*?\}/g
let mm; while ((mm = rowRe.exec(src))) names.add(mm[1])

function resolveId(name) {
  const n = norm(name)
  if (MANUAL[n]) return MANUAL[n]
  if (byName.has(n)) return byName.get(n)
  const k = il(name)
  if (!ilAmbig.has(k) && byIl.has(k)) return byIl.get(k)
  return null
}

const idMap = {}        // normName → apiId
const unresolved = []
const needFetch = new Set()
for (const name of names) {
  const id = resolveId(name)
  if (!id) { unresolved.push(name); continue }
  idMap[norm(name)] = id
  if (!genIds.has(id)) needFetch.add(id)
}

console.error(`Curated names: ${names.size} · resolved: ${Object.keys(idMap).length} · unresolved: ${unresolved.length}`)
console.error(`Need current-season fetch (id not in generated): ${needFetch.size}`)
if (unresolved.length) console.error('UNRESOLVED:', unresolved.join(', '))

// ── Fetch current (season 2025 → '2526') full stats for the missing ids ──
async function apiGet(path) {
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`${BASE}${path}`, { headers: { 'x-apisports-key': KEY } })
    if (res.status === 429) { await sleep(2000); continue }
    if (!res.ok) throw new Error(`${res.status} on ${path}`); return res.json()
  }
  throw new Error(`retries on ${path}`)
}
const POS = { Goalkeeper: 'GK', Defender: 'DF', Midfielder: 'MF', Attacker: 'FW' }
const dec = s => (s ?? '').replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')
const n2 = v => (v == null ? undefined : Number(v))
const r2 = v => (v == null ? undefined : Math.round(Number(v) * 100) / 100)

const isFriendly = s => /friendl|club friendlies/i.test(s.league?.name ?? '')
function mapDetail(d) {
  const stats = (d.statistics ?? []).filter(s => s.games?.appearences)
  if (!stats.length) return null
  // Prefer a real competition (domestic league/cup) over pre-season "Friendlies",
  // then the one with the most minutes.
  const st = stats.sort((a, b) =>
    (isFriendly(a) ? 1 : 0) - (isFriendly(b) ? 1 : 0)
    || (b.games.minutes ?? 0) - (a.games.minutes ?? 0)
  )[0]
  const p = d.player
  const full = [p.firstname, p.lastname].filter(Boolean).join(' ').trim()
  const fullName = full && norm(full) !== norm(p.name) ? dec(full) : undefined
  const o = {
    name: dec(p.name), fullName, apiId: p.id, club: st.team?.name ?? '', league: st.league?.name ?? '',
    age: n2(p.age) ?? 0, pj: n2(st.games?.appearences) ?? 0, goles: n2(st.goals?.total) ?? 0, asist: n2(st.goals?.assists) ?? 0,
    season: '2526', src: 'live', tab: 's', nationality: p.nationality, photo: p.photo,
    position: POS[st.games?.position] ?? undefined, height: p.height || undefined, weight: p.weight || undefined,
    birthDate: p.birth?.date || undefined, birthPlace: [p.birth?.place, p.birth?.country].filter(Boolean).join(', ') || undefined,
    minutes: n2(st.games?.minutes), lineups: n2(st.games?.lineups), rating: r2(st.games?.rating),
    shotsTotal: n2(st.shots?.total), shotsOn: n2(st.shots?.on), passes: n2(st.passes?.total), keyPasses: n2(st.passes?.key),
    passAccuracy: n2(st.passes?.accuracy), tacklesTotal: n2(st.tackles?.total), blocks: n2(st.tackles?.blocks),
    interceptions: n2(st.tackles?.interceptions), duelsTotal: n2(st.duels?.total), duelsWon: n2(st.duels?.won),
    dribblesAttempts: n2(st.dribbles?.attempts), dribblesSuccess: n2(st.dribbles?.success),
    foulsDrawn: n2(st.fouls?.drawn), foulsCommitted: n2(st.fouls?.committed), yellowCards: n2(st.cards?.yellow),
    redCards: n2(st.cards?.red), goalsConceded: n2(st.goals?.conceded), saves: n2(st.goals?.saves), penaltiesScored: n2(st.penalty?.scored),
  }
  for (const k in o) if (o[k] === undefined || o[k] === null) delete o[k]
  return o
}

const current = []
for (const id of needFetch) {
  try {
    const d = await apiGet(`/players?id=${id}&season=2025`)
    const row = mapDetail(d.response?.[0])
    if (row) { current.push(row); console.error(`  ✓ ${row.name} → ${row.club} [${row.league}]`) }
    else console.error(`  ✗ id ${id}: no current stats`)
  } catch (e) { console.error(`  ✗ id ${id}: ${e.message}`) }
  await sleep(220)
}

if (DRY) { console.error('[dry] no write'); process.exit(0) }

writeFileSync('data/curated-ids.ts',
`// AUTO-GENERATED by scripts/refresh-curated.mjs — do not edit by hand.
// Pins each hand-curated player to their CURRENT API-Football id so old curated
// rows merge into the same identity and the most up-to-date version wins.
export const CURATED_IDS: Record<string, number> = ${JSON.stringify(idMap, null, 0)}
`)
writeFileSync('data/players-current.ts',
`// AUTO-GENERATED by scripts/refresh-curated.mjs — do not edit by hand.
// Current-season (2526) rows for curated players missing from the minutes-capped
// generated dataset (e.g. rotated stars, mid-season movers). These carry an apiId
// so identity prefers them as the player's current/primary entry.
import type { PlayerData } from '@/types'
export const PLAYERS_CURRENT: PlayerData[] = JSON.parse(${JSON.stringify(JSON.stringify(current))}) as PlayerData[]
`)
console.error(`\n✓ wrote data/curated-ids.ts (${Object.keys(idMap).length}) + data/players-current.ts (${current.length})`)
