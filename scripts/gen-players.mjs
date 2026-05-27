/**
 * gen-players.mjs
 * Pulls real top-scorer / top-assist leaderboards from API-Football for the big
 * European leagues and writes them to data/players-generated.ts as literal
 * PlayerData entries (no runtime API calls).
 *
 * - Excludes names already present in data/players.ts (RAW) so we never overwrite
 *   the hand-curated rich entries (marketValue, elo, fantasy, …).
 * - Dedups by name (prefers the scorer entry over the assist entry).
 * - Season 2025 (API) → '2526' (site).
 *
 * Run: node scripts/gen-players.mjs
 */

import { readFileSync, writeFileSync } from 'fs'

// ─── env ─────────────────────────────────────────────────────────────────────
function loadEnv(path) {
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
}
loadEnv('.env.local')

const KEY = process.env.API_FOOTBALL_KEY
if (!KEY) {
  console.error('Missing API_FOOTBALL_KEY (looked in .env.local and process.env)')
  process.exit(1)
}

const BASE = 'https://v3.football.api-sports.io'
const SEASON = 2025

// Big leagues only — keep API usage low. 7 leagues × 2 endpoints = 14 calls.
const LEAGUE_IDS = [140, 39, 78, 135, 61, 94, 203]

// ─── maps (mirror lib/api-to-players.ts) ──────────────────────────────────────
const LEAGUE_NAME = {
  140: 'La Liga', 39: 'Premier League', 78: 'Bundesliga', 135: 'Serie A',
  61: 'Ligue 1', 94: 'Primeira Liga', 203: 'Sueper Lig', 197: 'Super Liga Grecia',
}
const SEASON_MAP = { 2025: '2526', 2024: '2425', 2023: '2324', 2022: '2223', 2021: '2122', 2020: '2021' }
// API returns "Attacker" / "Midfielder" / "Defender" / "Goalkeeper".
const POS_MAP = {
  Attacker: 'FW', Forward: 'FW', Midfielder: 'MF', Defender: 'DF', Goalkeeper: 'GK',
}
// API `player.nationality` is the COUNTRY name (e.g. "Norway", "England").
const FLAG_MAP = {
  Spain: '🇪🇸', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', France: '🇫🇷', Germany: '🇩🇪',
  Brazil: '🇧🇷', Argentina: '🇦🇷', Portugal: '🇵🇹', Italy: '🇮🇹', Norway: '🇳🇴', Sweden: '🇸🇪',
  Egypt: '🇪🇬', Netherlands: '🇳🇱', Belgium: '🇧🇪', Croatia: '🇭🇷', Poland: '🇵🇱', Serbia: '🇷🇸',
  Slovenia: '🇸🇮', Czechia: '🇨🇿', 'Czech Republic': '🇨🇿', Morocco: '🇲🇦', Senegal: '🇸🇳',
  "Cote d'Ivoire": '🇨🇮', 'Ivory Coast': '🇨🇮', Ghana: '🇬🇭', Nigeria: '🇳🇬', Guinea: '🇬🇳',
  Colombia: '🇨🇴', Uruguay: '🇺🇾', Mexico: '🇲🇽', Canada: '🇨🇦', Australia: '🇦🇺',
  'South-Korea': '🇰🇷', 'South Korea': '🇰🇷', Korea: '🇰🇷', Japan: '🇯🇵', Turkey: '🇹🇷', 'Türkiye': '🇹🇷',
  Greece: '🇬🇷', Switzerland: '🇨🇭', Austria: '🇦🇹', Denmark: '🇩🇰', Finland: '🇫🇮',
  Slovakia: '🇸🇰', Hungary: '🇭🇺', Romania: '🇷🇴', Albania: '🇦🇱', Ukraine: '🇺🇦', Russia: '🇷🇺',
  'United-States': '🇺🇸', USA: '🇺🇸', 'United States': '🇺🇸', Cameroon: '🇨🇲', Mali: '🇲🇱',
  Algeria: '🇩🇿', Tunisia: '🇹🇳', Georgia: '🇬🇪', 'Bosnia and Herzegovina': '🇧🇦', Bosnia: '🇧🇦',
  Kosovo: '🇽🇰', 'North Macedonia': '🇲🇰', Iceland: '🇮🇸', Ireland: '🇮🇪', Paraguay: '🇵🇾',
  Chile: '🇨🇱', Ecuador: '🇪🇨', Venezuela: '🇻🇪', Peru: '🇵🇪', 'DR Congo': '🇨🇩', Congo: '🇨🇬',
  'Burkina Faso': '🇧🇫', Gabon: '🇬🇦', Angola: '🇦🇴', Zambia: '🇿🇲', Gambia: '🇬🇲',
  'Cape Verde Islands': '🇨🇻', 'Cape Verde': '🇨🇻', 'Guinea-Bissau': '🇬🇼',
  Montenegro: '🇲🇪', Israel: '🇮🇱', Armenia: '🇦🇲', Uzbekistan: '🇺🇿', Iran: '🇮🇷',
  Jamaica: '🇯🇲', Honduras: '🇭🇳', Panama: '🇵🇦', 'Costa Rica': '🇨🇷',
}

// ─── name-equality helpers (to exclude players already curated) ───────────────
const PARTICLES = new Set([
  'de', 'del', 'da', 'do', 'dos', 'das', 'der', 'van', 'von', 'el', 'al', 'la', 'le',
  'di', 'bin', 'jr', 'junior', 'júnior', 'the',
])
function normTokens(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/[\s-]+/)
    .filter(t => t && !PARTICLES.has(t))
}
function sameName(a, b) {
  const ta = normTokens(a), tb = normTokens(b)
  if (!ta.length || !tb.length) return false
  // 1) one token-set fully contained in the other — handles full legal names
  //    like "Luis Fernando Díaz Marulanda" ⊇ curated "Luis Diaz".
  const sa = new Set(ta), sb = new Set(tb)
  if (ta.every(t => sb.has(t)) || tb.every(t => sa.has(t))) return true
  // 2) same surname (last significant token) + shared first token / initial
  if (ta[ta.length - 1] !== tb[tb.length - 1]) return false
  return ta[0] === tb[0] || ta[0][0] === tb[0][0]
}

// ─── fetch ─────────────────────────────────────────────────────────────────--
async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-apisports-key': KEY, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`API-Football ${res.status} on ${path}`)
  const json = await res.json()
  if (json.errors && Object.keys(json.errors).length) {
    console.warn('  API errors on', path, JSON.stringify(json.errors))
  }
  return json.response ?? []
}

function fullName(player) {
  const fn = (player.firstname ?? '').trim()
  const ln = (player.lastname ?? '').trim()
  const full = `${fn} ${ln}`.trim()
  return full || player.name
}

function transform(res, tab) {
  const stat = res.statistics?.[0]
  if (!stat) return null
  const leagueName = LEAGUE_NAME[stat.league.id]
  if (!leagueName) return null
  const season = SEASON_MAP[stat.league.season] ?? '2526'
  const out = {
    name: fullName(res.player),
    club: stat.team.name,
    league: leagueName,
    age: res.player.age,
    pj: stat.games.appearences ?? 0,
    goles: stat.goals.total ?? 0,
    asist: stat.goals.assists ?? 0,
    season,
    src: 'live',
    tab,
    nationality: res.player.nationality,
  }
  const flag = FLAG_MAP[res.player.nationality]
  if (flag) out.flag = flag
  const pos = POS_MAP[stat.games.position]
  if (pos) out.position = pos
  if (typeof stat.games.minutes === 'number') out.minutes = stat.games.minutes
  return out
}

// ─── existing names (from RAW + EXT in data/players.ts) ───────────────────────
function existingNames() {
  const src = readFileSync('data/players.ts', 'utf8')
  const names = new Set()
  // RAW entries: name:'...'
  for (const m of src.matchAll(/name\s*:\s*'([^']+)'/g)) names.add(m[1])
  // EXT keys: 'Harry Kane': { ... }
  for (const m of src.matchAll(/^\s*'([^']+)'\s*:\s*\{/gm)) names.add(m[1])
  return [...names]
}

// ─── main ─────────────────────────────────────────────────────────────────--
async function main() {
  const curated = existingNames()
  console.log(`Curated names in data/players.ts (will skip matches): ${curated.length}`)
  const isCurated = name => curated.some(c => sameName(c, name))

  const byName = new Map() // name -> entry (scorer preferred)
  const skipped = []

  for (const id of LEAGUE_IDS) {
    const ln = LEAGUE_NAME[id]
    for (const [tab, ep] of [['s', 'topscorers'], ['a', 'topassists']]) {
      let rows = []
      try {
        rows = await apiFetch(`/players/${ep}?league=${id}&season=${SEASON}`)
      } catch (e) {
        console.warn(`  ${ln} ${ep}: ${e.message}`)
        continue
      }
      for (const r of rows) {
        const p = transform(r, tab)
        if (!p) continue
        if (isCurated(p.name)) { skipped.push(p.name); continue }
        const prev = byName.get(p.name)
        // prefer scorer entry; if both assist, keep first
        if (prev && (prev.tab === 's' || tab === 'a')) continue
        byName.set(p.name, p)
      }
    }
  }

  const uniqSkipped = [...new Set(skipped)]
  console.log(`Skipped (already curated): ${uniqSkipped.length} → ${uniqSkipped.join(', ')}`)

  const all = [...byName.values()].sort((a, b) =>
    a.league === b.league ? b.goles - a.goles : a.league.localeCompare(b.league),
  )

  // recount per league after dedup
  const counts = {}
  for (const p of all) counts[p.league] = (counts[p.league] ?? 0) + 1

  const header = `// AUTO-GENERATED by scripts/gen-players.mjs — do not edit by hand.
// Source: API-Football top scorers + top assists, season ${SEASON} (→ '2526').
// Generated: ${new Date().toISOString()}
// Players already curated in data/players.ts (RAW) are intentionally excluded.
import type { PlayerData } from '@/types'

export const GENERATED_PLAYERS: PlayerData[] = ${JSON.stringify(all, null, 2)} as PlayerData[]
`
  writeFileSync('data/players-generated.ts', header)

  console.log(`\nWrote data/players-generated.ts — ${all.length} new players`)
  for (const [lg, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${lg.padEnd(22)} ${n}`)
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
