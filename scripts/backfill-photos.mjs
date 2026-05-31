/**
 * backfill-photos.mjs  (v2 — robust name matching)
 *
 * Backfill `player.photo` URLs from API-Football v3 into data/players-generated.ts.
 *
 * The dataset stores FULL names ("Jonathan Michael Burkardt") while API
 * /topscorers returns abbreviated `player.name` ("J. Burkardt"), so exact
 * name match fails. This version builds several indices from the API
 * (firstname+lastname, raw name, lastname+team, unique lastname) and matches
 * each dataset row by full name → lastname+club → unique lastname.
 *
 * Run:
 *   node scripts/backfill-photos.mjs --dry
 *   node scripts/backfill-photos.mjs
 *   node scripts/backfill-photos.mjs --league=140
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

const BASE   = 'https://v3.football.api-sports.io'
const SEASON = 2025
const DRY    = process.argv.includes('--dry')
const LEAGUE_FILTER = process.argv.find(a => a.startsWith('--league='))?.split('=')[1]

// Prioritise Top-5 + Portugal/Turkey/Greece/NL (most user-facing). Page deeper
// on these. Other leagues get the cheap topscorers/topassists coverage.
const PRIORITY = [140, 39, 78, 135, 61, 94, 203, 197, 88]
const SECONDARY = [
  144, 179, 207, 218, 106, 119, 113, 103,
  40, 79, 136, 62, 141, 95, 204, 199, 89, 180,
  253, 262, 71, 128, 265, 239, 268, 98, 292, 169, 188, 307,
]
const LEAGUE_IDS = LEAGUE_FILTER
  ? [Number(LEAGUE_FILTER)]
  : [...PRIORITY, ...SECONDARY]

const norm = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim()
const lastWord = s => { const w = norm(s).split(' ').filter(Boolean); return w[w.length - 1] ?? '' }

async function fetchJson(path) {
  const r = await fetch(BASE + path, { headers: { 'x-apisports-key': KEY } })
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}

// Global indices
const byFull = new Map()        // "firstname lastname" -> photo
const byName = new Map()        // raw api name -> photo
const byLastTeam = new Map()    // "lastname|team" -> photo
const byLast = new Map()        // lastname -> photo  (value null if ambiguous)

function ingest(record) {
  const p = record.player
  if (!p?.photo) return
  const team = record.statistics?.[0]?.team?.name
  const full = norm(`${p.firstname ?? ''} ${p.lastname ?? ''}`)
  const nm = norm(p.name)
  const last = norm(p.lastname) || lastWord(p.name)
  if (full) byFull.set(full, p.photo)
  if (nm) byName.set(nm, p.photo)
  if (last && team) byLastTeam.set(`${last}|${norm(team)}`, p.photo)
  if (last) {
    if (byLast.has(last) && byLast.get(last) !== p.photo) byLast.set(last, null) // ambiguous
    else if (!byLast.has(last)) byLast.set(last, p.photo)
  }
}

let totalCalls = 0
for (const lid of LEAGUE_IDS) {
  let calls = 0
  try {
    for (const ep of ['topscorers', 'topassists']) {
      const j = await fetchJson(`/players/${ep}?league=${lid}&season=${SEASON}`)
      calls++
      ;(j.response ?? []).forEach(ingest)
      await sleep(700)
    }
    // deeper paging for priority leagues
    const pages = PRIORITY.includes(lid) ? 6 : 2
    for (let page = 1; page <= pages; page++) {
      const j = await fetchJson(`/players?league=${lid}&season=${SEASON}&page=${page}`)
      calls++
      ;(j.response ?? []).forEach(ingest)
      if (!j.paging || page >= (j.paging.total ?? 1)) break
      await sleep(700)
    }
    totalCalls += calls
    console.log(`league ${lid}: ${calls} calls`)
  } catch (e) {
    console.error(`league ${lid}: ${e.message}`)
  }
}
console.log(`\nIndexed: ${byFull.size} full, ${byName.size} name, ${byLastTeam.size} last+team, ${byLast.size} last. ${totalCalls} calls.\n`)

function findPhoto(name, club) {
  const nFull = norm(name)
  const last = lastWord(name)
  const nClub = norm(club)
  return (
    byFull.get(nFull) ||
    byName.get(nFull) ||
    byLastTeam.get(`${last}|${nClub}`) ||
    (byLast.get(last) || undefined) ||
    undefined
  )
}

// ─── patch generated file ────────────────────────────────────────────────────
const path = 'data/players-generated.ts'
let src = readFileSync(path, 'utf8')

let patched = 0, already = 0, missed = 0
src = src.replace(/\{\s*"name":\s*"([^"]+)"[\s\S]*?\n  \}/g, (block, name) => {
  if (/"photo":\s*"/.test(block)) { already++; return block }
  const clubMatch = block.match(/"club":\s*"([^"]*)"/)
  const club = clubMatch ? clubMatch[1] : ''
  const url = findPhoto(name, club)
  if (!url) { missed++; return block }
  patched++
  return block.replace(/\n  \}$/, `,\n    "photo": ${JSON.stringify(url)}\n  }`)
})

console.log(`Patched ${patched} · already had ${already} · missed ${missed}`)
if (DRY) { console.log('--dry: no write.'); process.exit(0) }
writeFileSync(path, src)
console.log(`Wrote ${path}.`)
