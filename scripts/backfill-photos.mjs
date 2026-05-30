/**
 * backfill-photos.mjs
 *
 * Backfill `player.photo` URLs from API-Football v3 for every player in
 * data/players-generated.ts (and optionally data/players.ts).
 *
 * Strategy:
 *  - One API call per league × season: GET /players/topscorers (already lists
 *    photo URLs for the leaders, free of charge in the same response as goals).
 *    For deeper coverage we also page through GET /players?league=X&season=Y
 *    pages 1..N.
 *  - Build a Map<normalizedName, photoUrl>.
 *  - Rewrite data/players-generated.ts entries: insert `photo: '<url>'` if
 *    missing.
 *
 * Quota budget: 30 leagues × ~3 pages of /players = ~90 calls. Well within Pro
 * 7.5k/day. Add --dry to preview without writing.
 *
 * Run:
 *   node scripts/backfill-photos.mjs --dry         # preview only
 *   node scripts/backfill-photos.mjs               # write changes
 *   node scripts/backfill-photos.mjs --league=140  # restrict to 1 league
 */

import { readFileSync, writeFileSync } from 'fs'
import { setTimeout as sleep } from 'timers/promises'

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
if (!KEY) { console.error('Missing API_FOOTBALL_KEY'); process.exit(1) }

const BASE   = 'https://v3.football.api-sports.io'
const SEASON = 2025
const DRY    = process.argv.includes('--dry')
const LEAGUE_FILTER = process.argv.find(a => a.startsWith('--league='))?.split('=')[1]

// Same league list as gen-players.mjs (keep in sync).
const LEAGUE_IDS_FULL = [
  140, 39, 78, 135, 61, 94, 203, 197,
   88, 144, 179, 207, 218, 106, 119, 113, 103,
   40,  79, 136,  62, 141,  95, 204, 199,  89, 180,
  253, 262,  71, 128, 265, 239, 268,
   98, 292, 169, 188,
  307,
]
const LEAGUE_IDS = LEAGUE_FILTER ? [Number(LEAGUE_FILTER)] : LEAGUE_IDS_FULL

const normalize = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim()

async function fetchJson(path) {
  const r = await fetch(BASE + path, { headers: { 'x-apisports-key': KEY } })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}

async function getPhotosForLeague(leagueId) {
  const photos = new Map()
  let calls = 0

  // (a) Top scorers + top assists give us photos for leaders cheaply.
  for (const endpoint of ['topscorers', 'topassists']) {
    const j = await fetchJson(`/players/${endpoint}?league=${leagueId}&season=${SEASON}`)
    calls++
    for (const r of j.response ?? []) {
      const p = r.player
      if (p?.name && p?.photo) photos.set(normalize(p.name), p.photo)
    }
    await sleep(800)
  }

  // (b) Page through /players for broader coverage (3 pages = top 60 per league).
  for (let page = 1; page <= 3; page++) {
    const j = await fetchJson(`/players?league=${leagueId}&season=${SEASON}&page=${page}`)
    calls++
    for (const r of j.response ?? []) {
      const p = r.player
      if (p?.name && p?.photo) photos.set(normalize(p.name), p.photo)
    }
    if (!j.paging || page >= (j.paging.total ?? 1)) break
    await sleep(800)
  }

  return { photos, calls }
}

// ─── main ────────────────────────────────────────────────────────────────────
const ALL_PHOTOS = new Map()
let totalCalls = 0
for (const lid of LEAGUE_IDS) {
  try {
    const { photos, calls } = await getPhotosForLeague(lid)
    totalCalls += calls
    for (const [k, v] of photos) ALL_PHOTOS.set(k, v)
    console.log(`league ${lid}: +${photos.size} photos (${calls} calls)`)
  } catch (e) {
    console.error(`league ${lid}: ${e.message}`)
  }
}
console.log(`\nFetched ${ALL_PHOTOS.size} unique player photos in ${totalCalls} API calls.\n`)

// ─── patch generated file ────────────────────────────────────────────────────
const path = 'data/players-generated.ts'
let src = readFileSync(path, 'utf8')
const before = src

let patched = 0
// Match a player object block: `{ "name": "...", ... }` with double-quoted keys.
src = src.replace(/\{\s*"name":\s*"([^"]+)"[\s\S]*?\n  \}/g, (block, name) => {
  if (/"photo":\s*"/.test(block)) return block
  const url = ALL_PHOTOS.get(normalize(name))
  if (!url) return block
  patched++
  // Insert photo before the closing brace, keeping JSON valid.
  return block.replace(/\n  \}$/, `,\n    "photo": ${JSON.stringify(url)}\n  }`)
})

console.log(`Patched ${patched} player entries.`)
if (DRY) {
  console.log('--dry: no write. Diff lines:', (src.match(/photo: '/g) ?? []).length - (before.match(/photo: '/g) ?? []).length)
  process.exit(0)
}
writeFileSync(path, src)
console.log(`Wrote ${path}.`)
