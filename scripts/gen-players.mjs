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
import { fixMojibake } from './lib/fix-mojibake.mjs'

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

// 30 leagues × 2 endpoints = 60 API calls (well within Pro budget of 7.5k/day).
// MUST stay in sync with lib/api-football.ts + SMALL_LEAGUE_NAMES sets in
// app/[lang]/descubrir/DiscubrirClient.tsx and components/PlayerRow.tsx.
const LEAGUE_IDS = [
  // Europe 1st div (Big-5 + PT/TR/GR + rest of Europe)
  140, 39, 78, 135, 61, 94, 203, 197,
   88, 144, 179, 207, 218, 106, 119, 113, 103,
  // Europe 2nd divs (Big-5 + PT/TR/GR/NL/SCO)
   40,  79, 136,  62, 141,  95, 204, 199,  89, 180,
  // Americas
  253, 262,  71, 128, 265, 239, 268,
  // Asia / Oceania
   98, 292, 169, 188,
  // Middle East
  307,
]

const LEAGUE_NAME = {
  // Europe 1st
  140: 'La Liga', 39: 'Premier League', 78: 'Bundesliga', 135: 'Serie A',
   61: 'Ligue 1', 94: 'Primeira Liga', 203: 'Süper Lig', 197: 'Super League',
   88: 'Eredivisie', 144: 'Belgian Pro League', 179: 'Scottish Premiership',
  207: 'Swiss Super League', 218: 'Austrian Bundesliga', 106: 'Ekstraklasa',
  119: 'Superligaen', 113: 'Allsvenskan', 103: 'Eliteserien',
  // Europe 2nd
   40: 'Championship', 79: '2. Bundesliga', 136: 'Serie B', 62: 'Ligue 2',
  141: 'Segunda División', 95: 'Liga Portugal 2', 204: '1. Lig',
  199: 'Super League 2', 89: 'Eerste Divisie', 180: 'Scottish Championship',
  // Americas
  253: 'MLS', 262: 'Liga MX', 71: 'Brasileirão Serie A',
  128: 'Liga Profesional', 265: 'Primera División (Chile)',
  239: 'Categoría Primera A', 268: 'Primera División (Uruguay)',
  // Asia / Oceania
   98: 'J1 League', 292: 'K League 1', 169: 'Super League (China)', 188: 'A-League',
  // Middle East
  307: 'Pro League (Saudi Arabia)',
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
  return fixMojibake(full || player.name)
}

function transform(res, tab) {
  const stat = res.statistics?.[0]
  if (!stat) return null
  const leagueName = LEAGUE_NAME[stat.league.id]
  if (!leagueName) return null
  const season = SEASON_MAP[stat.league.season] ?? '2526'
  const out = {
    name: fullName(res.player),
    club: fixMojibake(stat.team.name),
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

  // Real photo (API-Football CDN)
  if (res.player.photo) out.photo = res.player.photo

  // Real advanced stats — available in the /topscorers & /topassists payloads.
  const num = v => (typeof v === 'number' ? v : null)
  const shots = stat.shots ?? {}
  const passes = stat.passes ?? {}
  const tackles = stat.tackles ?? {}
  const duels = stat.duels ?? {}
  const dribbles = stat.dribbles ?? {}
  const goals = stat.goals ?? {}
  const cards = stat.cards ?? {}

  if (num(shots.total) != null) out.shotsTotal = shots.total
  if (num(shots.on) != null) out.shotsOn = shots.on
  if (num(passes.total) != null) out.passes = passes.total
  if (num(passes.key) != null) out.keyPasses = passes.key
  if (num(passes.accuracy) != null) out.passAccuracy = passes.accuracy
  if (num(tackles.total) != null) out.tacklesTotal = tackles.total
  if (num(tackles.interceptions) != null) out.interceptions = tackles.interceptions
  if (num(duels.total) != null) out.duelsTotal = duels.total
  if (num(duels.won) != null) out.duelsWon = duels.won
  if (num(dribbles.success) != null) out.dribblesSuccess = dribbles.success
  if (num(goals.conceded) != null) out.goalsConceded = goals.conceded
  if (num(goals.saves) != null) out.saves = goals.saves
  if (num(cards.yellow) != null) out.yellowCards = cards.yellow
  if (num(cards.red) != null) out.redCards = cards.red
  const rating = parseFloat(stat.games?.rating)
  if (!Number.isNaN(rating)) out.rating = Math.round(rating * 100) / 100

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
