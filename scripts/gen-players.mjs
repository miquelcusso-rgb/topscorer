/**
 * gen-players.mjs
 *
 * Ingests ALL players (every position — GK / DF / MF / FW), with full season
 * stats, for the leagues TopScorers displays, and writes them to
 * data/players-generated.ts as literal PlayerData entries (no runtime API
 * calls). This is the GLOBAL-player dataset: defenders, goalkeepers,
 * midfielders and national-team regulars are all present, not just scorers.
 *
 * Why a rewrite: the old generator pulled only /players/topscorers +
 * /players/topassists, so non-scoring regulars (Pau Cubarsí, squad
 * defenders, starting GKs…) were missing entirely. This version pages the
 * /players?league=<id>&season=<n>&page=<n> endpoint, which returns every
 * player with their FULL statistics block.
 *
 * Approach
 *  - For each displayed league (registry below — mirrors lib/api-football.ts
 *    LEAGUES + LEAGUES_EUROPE_OTHER + LEAGUES_2 + LEAGUES_AMERICAS +
 *    LEAGUES_ASIA_OCEANIA + LEAGUES_MIDDLE_EAST; LEAGUES_EURO cup comps are
 *    skipped to avoid duplicate club rows), page through every player.
 *  - For each player pick the statistics row with the MOST appearances (their
 *    main competition this season).
 *  - Bound the bundle: keep players with minutes >= MIN_MINUTES. If a league
 *    yields fewer than LEAGUE_FLOOR regulars, keep its top LEAGUE_FLOOR by
 *    minutes anyway (so small leagues still get coverage).
 *  - Dedup across leagues by API id (mid-season movers): keep the row with the
 *    most minutes (their main club this season).
 *  - Generate EVERYONE, curated stars included. The curated-only extras
 *    (marketValue, elo, fantasy…) are FIELD-MERGED onto this stats-rich row in
 *    lib/player-identity.ts, so generating curated names does not lose anything
 *    — it gives the stars their missing rating/shots/keyPasses.
 *  - Season 2025 (API) → '2526' (site). tab = 's' (scorer) when goals >=
 *    assists, else 'a' — preserves the existing dataset contract.
 *
 * Run: node scripts/gen-players.mjs
 *      node scripts/gen-players.mjs --dry     # ingest + report, no write
 */

import { readFileSync, writeFileSync } from 'fs'
import { setTimeout as sleep } from 'timers/promises'
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
const DRY = process.argv.includes('--dry')

// Minutes threshold to be considered a "regular" (≈5+ full matches). Keeps the
// bundle sane while including squad defenders + starting GKs and dropping
// fringe/cup-only players. Raise (600/750) if the output file exceeds ~6 MB.
const MIN_MINUTES = 1600
// Per-league floor: even if a league has few players over the threshold, keep
// its top-N by minutes so small leagues still get coverage.
const LEAGUE_FLOOR = 40
// Politeness delay between paginated API calls.
const DELAY_MS = 320

// League registry — MUST stay in sync with lib/api-football.ts (the displayed
// leagues: LEAGUES + LEAGUES_EUROPE_OTHER + LEAGUES_2 + LEAGUES_AMERICAS +
// LEAGUES_ASIA_OCEANIA + LEAGUES_MIDDLE_EAST). LEAGUES_EURO (UCL/UEL/UECL) is
// intentionally EXCLUDED so we don't get duplicate club rows for the same
// player across their domestic league + a cup.
const LEAGUE_NAME = {
  // Europe 1st (LEAGUES)
  140: 'La Liga', 39: 'Premier League', 78: 'Bundesliga', 135: 'Serie A',
   61: 'Ligue 1', 94: 'Primeira Liga', 203: 'Süper Lig', 197: 'Super League',
  // Europe other 1st (LEAGUES_EUROPE_OTHER)
   88: 'Eredivisie', 144: 'Pro League', 179: 'Premiership',
  207: 'Super League', 218: 'Bundesliga', 106: 'Ekstraklasa',
  119: 'Superligaen', 113: 'Allsvenskan', 103: 'Eliteserien',
  // Europe 2nd (LEAGUES_2)
   40: 'Championship', 79: '2. Bundesliga', 136: 'Serie B', 62: 'Ligue 2',
  141: 'Segunda División', 95: 'Liga Portugal 2', 204: '1. Lig',
  199: 'Super League 2', 89: 'Eerste Divisie', 180: 'Championship',
  // Americas (LEAGUES_AMERICAS)
  253: 'MLS', 262: 'Liga MX', 71: 'Brasileirão Serie A',
  128: 'Liga Profesional', 265: 'Primera División',
  239: 'Categoría Primera A', 268: 'Primera División',
  // Asia / Oceania (LEAGUES_ASIA_OCEANIA)
   98: 'J1 League', 292: 'K League 1', 169: 'Super League', 188: 'A-League',
  // Middle East (LEAGUES_MIDDLE_EAST)
  307: 'Pro League',
}
// Some league NAMES collide across countries (two "Super League", two "Pro
// League", two "Primera División", "Championship" ENG/SCO, "Bundesliga"
// GER/AUT). The site keys leaderboards/competition pages by the league NAME
// string, exactly as the existing dataset did (the old generator used the same
// names), so we keep them as-is — the country is carried implicitly by club.
const LEAGUE_IDS = Object.keys(LEAGUE_NAME).map(Number)

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

// ─── fetch (with 429 backoff) ─────────────────────────────────────────────────
const dec = s => fixMojibake((s ?? '')
  .replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"'))
const nrmN = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()

async function apiGet(path) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'x-apisports-key': KEY, 'Content-Type': 'application/json' },
    })
    if (res.status === 429) { await sleep(2000); continue }
    if (!res.ok) throw new Error(`API-Football ${res.status} on ${path}`)
    const json = await res.json()
    if (json.errors && Array.isArray(json.errors) === false && Object.keys(json.errors).length) {
      console.warn('  API errors on', path, JSON.stringify(json.errors))
    }
    return json
  }
  throw new Error(`retries exhausted on ${path}`)
}

const num = v => (typeof v === 'number' ? v : (v == null || v === '' ? null : Number(v)))

function fullDisplayName(player) {
  // The dataset's `name` is the display name. We keep API `name` as the display
  // name and expose the full legal name as `fullName` when it differs (so users
  // can search by either) — mirrors gen-search-index.mjs.
  const display = dec(player.name)
  const full = [player.firstname, player.lastname].filter(Boolean).join(' ').trim()
  const fullName = full && nrmN(full) !== nrmN(player.name) ? dec(full) : undefined
  return { display, fullName }
}

// Build a dataset row from a player + their chosen statistics block.
function transform(player, stat) {
  const leagueName = LEAGUE_NAME[stat.league?.id]
  if (!leagueName) return null
  const season = SEASON_MAP[stat.league.season] ?? '2526'
  const { display, fullName } = fullDisplayName(player)

  const goals = num(stat.goals?.total) ?? 0
  const assists = num(stat.goals?.assists) ?? 0
  // tab preserves the scorer/assist dataset contract: scorer-leaning by default.
  const tab = goals >= assists ? 's' : 'a'

  const out = {
    name: display,
    club: dec(stat.team?.name ?? ''),
    league: leagueName,
    age: player.age,
    pj: num(stat.games?.appearences) ?? 0,
    goles: goals,
    asist: assists,
    season,
    src: 'live',
    tab,
    nationality: player.nationality,
  }
  if (fullName) out.fullName = fullName
  if (player.id != null) out.apiId = num(player.id)

  const flag = FLAG_MAP[player.nationality]
  if (flag) out.flag = flag
  const pos = POS_MAP[stat.games?.position]
  if (pos) out.position = pos
  if (player.photo) out.photo = player.photo

  // ── full statistics block (every field the dataset stores) ────────────────
  const games = stat.games ?? {}
  const subs = stat.substitutes ?? {}
  const shots = stat.shots ?? {}
  const passes = stat.passes ?? {}
  const tackles = stat.tackles ?? {}
  const duels = stat.duels ?? {}
  const dribbles = stat.dribbles ?? {}
  const fouls = stat.fouls ?? {}
  const cards = stat.cards ?? {}
  const penalty = stat.penalty ?? {}
  const g = stat.goals ?? {}

  const set = (k, v) => { if (num(v) != null) out[k] = num(v) }

  set('minutes', games.minutes)
  set('lineups', games.lineups)
  if (typeof games.captain === 'boolean' && games.captain) out.captain = true
  set('subIn', subs.in)
  set('subOut', subs.out)
  set('subBench', subs.bench)

  set('shotsTotal', shots.total)
  set('shotsOn', shots.on)
  set('passes', passes.total)
  set('keyPasses', passes.key)
  set('passAccuracy', passes.accuracy)
  set('tacklesTotal', tackles.total)
  set('blocks', tackles.blocks)
  set('interceptions', tackles.interceptions)
  set('duelsTotal', duels.total)
  set('duelsWon', duels.won)
  set('dribblesAttempts', dribbles.attempts)
  set('dribblesSuccess', dribbles.success)
  set('dribblesPast', dribbles.past)
  set('foulsDrawn', fouls.drawn)
  set('foulsCommitted', fouls.committed)
  set('yellowCards', cards.yellow)
  set('yellowRed', cards.yellowred)
  set('redCards', cards.red)
  set('penaltiesScored', penalty.scored)
  set('penaltyWon', penalty.won)
  set('penaltyCommitted', penalty.commited) // API spells it "commited"
  set('penaltyMissed', penalty.missed)
  set('penaltySaved', penalty.saved)
  set('goalsConceded', g.conceded)
  set('saves', g.saves)

  if (typeof player.injured === 'boolean' && player.injured) out.injured = true

  const rating = parseFloat(games.rating)
  if (!Number.isNaN(rating)) out.rating = Math.round(rating * 100) / 100

  return out
}

// Pick the statistics row that represents the player's main competition: the
// one matching a league we cover with the most appearances; fall back to the
// most-appearances row overall.
function pickMainStat(player, statistics, leagueId) {
  const stats = (statistics ?? []).filter(s => s && s.league)
  if (!stats.length) return null
  // Prefer the row for the league we're iterating (the player came from this
  // league's listing), but if absent take the covered league with most apps.
  const inThis = stats.filter(s => s.league.id === leagueId)
  const pool = inThis.length ? inThis : stats.filter(s => LEAGUE_NAME[s.league.id])
  const chosen = (pool.length ? pool : stats)
    .slice()
    .sort((a, b) => (num(b.games?.appearences) ?? 0) - (num(a.games?.appearences) ?? 0))[0]
  return chosen ?? null
}

// ─── ingest one league (all pages) ────────────────────────────────────────────
async function leaguePlayers(leagueId) {
  const out = []
  let page = 1, total = 1, calls = 0
  do {
    const data = await apiGet(`/players?league=${leagueId}&season=${SEASON}&page=${page}`)
    calls++
    total = data.paging?.total ?? 1
    for (const row of data.response ?? []) {
      const player = row.player
      if (!player) continue
      const stat = pickMainStat(player, row.statistics, leagueId)
      if (!stat) continue
      const p = transform(player, stat)
      if (!p) continue
      out.push(p)
    }
    page++
    if (page <= total) await sleep(DELAY_MS)
  } while (page <= total)
  return { rows: out, calls }
}

// ─── main ─────────────────────────────────────────────────────────────────--
async function main() {
  // NOTE: we deliberately do NOT exclude curated names anymore. Curated stars
  // (Kane, Olise, Bruno Fernandes, Lamine Yamal…) MUST also get a generated row
  // with full statistics (shots, keyPasses, passes, rating…), otherwise their
  // sparse curated stub wins the identity merge and the leaderboard shows "—".
  // lib/player-identity.ts now FIELD-MERGES the stats-rich generated row with the
  // curated-only extras (marketValue, elo, fantasy…), so generating everyone is
  // both safe and required.

  // Collect per-league, applying the minutes threshold + per-league floor BEFORE
  // global dedup so a small league keeps its top players even if under threshold.
  const collected = [] // {leagueId, rows}
  let totalCalls = 0
  for (const id of LEAGUE_IDS) {
    const ln = LEAGUE_NAME[id]
    let res
    try {
      res = await leaguePlayers(id)
    } catch (e) {
      console.warn(`  ✗ ${ln} (${id}): ${e.message}`)
      continue
    }
    totalCalls += res.calls
    const rows = res.rows
    if (!rows.length) {
      console.warn(`  ⚠ ${ln} (${id}): 0 players (no ${SEASON} data?)`)
      continue
    }
    // Minutes threshold; per-league floor of top-N by minutes if too few.
    const over = rows.filter(r => (r.minutes ?? 0) >= MIN_MINUTES)
    let kept
    if (over.length >= LEAGUE_FLOOR) {
      kept = over
    } else {
      kept = rows.slice().sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0)).slice(0, LEAGUE_FLOOR)
    }
    collected.push({ leagueId: id, rows: kept })
    console.log(`  ✓ ${ln.padEnd(22)} ingested ${rows.length}, kept ${kept.length} (${res.calls} pages)`)
  }

  // Global dedup by API id (mid-season movers appear in two leagues): keep the
  // row with the most minutes (their main club this season). Rows without an id
  // are deduped by normalized name as a fallback.
  const byId = new Map()
  const byName = new Map()
  for (const { rows } of collected) {
    for (const p of rows) {
      if (p.apiId != null) {
        const cur = byId.get(p.apiId)
        if (!cur || (p.minutes ?? 0) > (cur.minutes ?? 0)) byId.set(p.apiId, p)
      } else {
        const k = nrmN(p.name)
        const cur = byName.get(k)
        if (!cur || (p.minutes ?? 0) > (cur.minutes ?? 0)) byName.set(k, p)
      }
    }
  }
  // Generate EVERYONE, curated stars included — their stats-rich row is merged
  // with the curated extras downstream in lib/player-identity.ts.
  const all = [...byId.values(), ...byName.values()]

  all.sort((a, b) =>
    a.league === b.league
      ? (b.minutes ?? 0) - (a.minutes ?? 0)
      : a.league.localeCompare(b.league),
  )

  // recount per league after dedup
  const counts = {}
  for (const p of all) counts[p.league] = (counts[p.league] ?? 0) + 1

  // ── Anti-wipe guard ──────────────────────────────────────────────────────
  // A rate-limited / failed run could collapse to few rows and OVERWRITE the
  // dataset. Refuse to write when the result is implausibly small or a big
  // regression vs the existing file — keep the previous data, fail loudly.
  const FLOOR = 300
  let prevCount = 0
  try {
    const prev = readFileSync('data/players-generated.ts', 'utf8')
    // Match both the raw literal ("name":) and the JSON.parse(stringLiteral)
    // format where quotes are escaped (\"name\":), so the anti-wipe baseline
    // is real and not 0 (which would defeat the regression guard).
    prevCount = (prev.match(/\\?"name\\?":/g) || []).length
  } catch { /* no prior file */ }

  console.log(`\nTotal players: ${all.length} (previous file: ${prevCount}). API page calls: ${totalCalls}.`)
  for (const [lg, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${lg.padEnd(24)} ${n}`)
  }

  if (all.length < FLOOR || (prevCount > 0 && all.length < prevCount * 0.5)) {
    console.error(`\n✋ ABORT: only ${all.length} players generated (floor ${FLOOR}, previous ${prevCount}). ` +
      `Likely an API rate-limit / outage. NOT overwriting data/players-generated.ts — keeping existing data.`)
    process.exit(1)
  }

  if (DRY) { console.log('\n[dry] no write'); return }

  const header = `// AUTO-GENERATED by scripts/gen-players.mjs — do not edit by hand.
// Source: API-Football /players?league=&season=${SEASON} (→ '2526'), ALL positions.
// Minutes threshold: ${MIN_MINUTES} (per-league floor: top ${LEAGUE_FLOOR} by minutes).
// Generated: ${new Date().toISOString()}
// ALL players (curated stars included); curated-only extras are field-merged in lib/player-identity.ts.
import type { PlayerData } from '@/types'

// NOTE: wrapped in JSON.parse(stringLiteral) on purpose — a raw 6k-element
// object literal makes tsc explode with TS2590 ("union type too complex").
// JSON.parse returns \`any\`, so TS skips the giant union inference.
export const GENERATED_PLAYERS: PlayerData[] = JSON.parse(${JSON.stringify(JSON.stringify(all))}) as PlayerData[]
`
  writeFileSync('data/players-generated.ts', header)
  console.log(`\nWrote data/players-generated.ts — ${all.length} players`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
