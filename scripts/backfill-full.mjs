/**
 * backfill-full.mjs
 *
 * Full per-player pass over API-Football /players (season 2025 → '2526') for the
 * first divisions of Europe + Turkey + Portugal + Greece + MLS + LATAM.
 * Collects photo + the COMPLETE statistics object and writes:
 *   - data/players-generated.ts  (top N per league by minutes, full stats + photo)
 *
 * Plan: 300 req/min, 7500/day (pro). We throttle ~220ms/call.
 *
 * Run:
 *   node scripts/backfill-full.mjs --dry      # counts only, no write
 *   node scripts/backfill-full.mjs            # write data/players-generated.ts
 *   node scripts/backfill-full.mjs --cap=150  # players per league (default 130)
 */
import { readFileSync, writeFileSync } from 'fs'
import { setTimeout as sleep } from 'timers/promises'

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
if (!KEY) { console.error('Missing API_FOOTBALL_KEY'); process.exit(1) }

const BASE = 'https://v3.football.api-sports.io'
const SEASON = 2025
const DRY = process.argv.includes('--dry')
const CAP = Number(process.argv.find(a => a.startsWith('--cap='))?.split('=')[1] ?? 130)

// Target leagues: id → canonical name used in the dataset.
const LEAGUES = [
  // Europe top divisions
  [140, 'La Liga'], [39, 'Premier League'], [78, 'Bundesliga'], [135, 'Serie A'], [61, 'Ligue 1'],
  [94, 'Primeira Liga'], [203, 'Süper Lig'], [197, 'Super League'], [88, 'Eredivisie'],
  [144, 'Pro League'], [179, 'Premiership'], [207, 'Swiss Super League'], [218, 'Austrian Bundesliga'],
  [106, 'Ekstraklasa'], [119, 'Superligaen'], [113, 'Allsvenskan'], [103, 'Eliteserien'],
  // MLS + LATAM
  [253, 'MLS'], [262, 'Liga MX'], [71, 'Brasileirão Serie A'], [128, 'Liga Profesional'],
  [265, 'Primera División (Chile)'], [239, 'Categoría Primera A'],
]

const POS = { Goalkeeper: 'GK', Defender: 'DF', Midfielder: 'MF', Attacker: 'FW' }
const nrmN = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
const num = v => (v == null ? undefined : Number(v))
const round2 = v => (v == null ? undefined : Math.round(Number(v) * 100) / 100)

async function apiGet(path) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${BASE}${path}`, { headers: { 'x-apisports-key': KEY } })
    if (res.status === 429) { await sleep(2000); continue }
    if (!res.ok) throw new Error(`${res.status} on ${path}`)
    return res.json()
  }
  throw new Error(`retries exhausted on ${path}`)
}

async function leaguePlayers(leagueId, leagueName) {
  const out = []
  let page = 1, total = 1
  do {
    const data = await apiGet(`/players?league=${leagueId}&season=${SEASON}&page=${page}`)
    total = data.paging?.total ?? 1
    for (const row of data.response ?? []) {
      const st = row.statistics?.[0]
      if (!st) continue
      const apps = num(st.games?.appearences)
      if (!apps || apps < 1) continue // only players who actually played
      const p = row.player
      const full = [p.firstname, p.lastname].filter(Boolean).join(' ').trim()
      const fullName = full && nrmN(full) !== nrmN(p.name) ? full : undefined
      out.push({
        name: p.name,
        fullName,
        club: st.team?.name ?? '',
        league: leagueName,
        age: num(p.age) ?? 0,
        pj: apps,
        goles: num(st.goals?.total) ?? 0,
        asist: num(st.goals?.assists) ?? 0,
        season: '2526', src: 'live', tab: 's',
        position: POS[st.games?.position] ?? undefined,
        photo: p.photo,
        nationality: p.nationality,
        minutes: num(st.games?.minutes),
        rating: round2(st.games?.rating),
        shotsTotal: num(st.shots?.total),
        shotsOn: num(st.shots?.on),
        passes: num(st.passes?.total),
        keyPasses: num(st.passes?.key),
        passAccuracy: num(st.passes?.accuracy),
        tacklesTotal: num(st.tackles?.total),
        blocks: num(st.tackles?.blocks),
        interceptions: num(st.tackles?.interceptions),
        duelsTotal: num(st.duels?.total),
        duelsWon: num(st.duels?.won),
        dribblesAttempts: num(st.dribbles?.attempts),
        dribblesSuccess: num(st.dribbles?.success),
        yellowCards: num(st.cards?.yellow),
        redCards: num(st.cards?.red),
        penaltiesScored: num(st.penalty?.scored),
      })
    }
    page++
    await sleep(220)
  } while (page <= total)
  // Cap per league by minutes played (keep real contributors, bound bundle size).
  out.sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0))
  return out.slice(0, CAP)
}

function strip(o) { // drop undefined keys to keep JSON small
  const r = {}
  for (const k in o) if (o[k] !== undefined && o[k] !== null) r[k] = o[k]
  return r
}

const all = []
let totalFetched = 0
for (const [id, name] of LEAGUES) {
  try {
    const players = await leaguePlayers(id, name)
    totalFetched += players.length
    all.push(...players)
    console.error(`✓ ${name} (${id}): kept ${players.length}`)
  } catch (e) {
    console.error(`✗ ${name} (${id}): ${e.message}`)
  }
}

// Dedup by normalized name (loan/transfer dupes) — keep the one with more minutes.
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
const byName = new Map()
for (const p of all) {
  const k = norm(p.name)
  const cur = byName.get(k)
  if (!cur || (p.minutes ?? 0) > (cur.minutes ?? 0)) byName.set(k, p)
}
const deduped = [...byName.values()].map(strip)

const withPhoto = deduped.filter(p => p.photo).length
console.error(`\nTOTAL kept ${deduped.length} players · with photo ${withPhoto} (${Math.round(withPhoto / deduped.length * 100)}%)`)

if (DRY) { console.error('[dry] no write'); process.exit(0) }

const header = `// AUTO-GENERATED by scripts/backfill-full.mjs — do not edit by hand.
// Source: API-Football /players, season ${SEASON} (→ '2526'), first divisions of
// Europe + Turkey + Portugal + Greece + MLS + LATAM. Top ${CAP}/league by minutes.
import type { PlayerData } from '@/types'

export const GENERATED_PLAYERS: PlayerData[] = JSON.parse(${JSON.stringify(JSON.stringify(deduped))}) as PlayerData[]
`
writeFileSync('data/players-generated.ts', header)
console.error(`✓ wrote data/players-generated.ts (${deduped.length} players)`)
