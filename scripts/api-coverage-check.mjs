/**
 * api-coverage-check.mjs — probes the API-Football endpoints we DON'T use yet
 * and reports whether they return data on our current plan + a sample of the
 * fields they expose. Read-only. Run: node scripts/api-coverage-check.mjs
 * See docs/api-coverage.md for the full list.
 */
import { readFileSync } from 'fs'

function loadEnv(p) { try { for (const l of readFileSync(p, 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') } } catch {} }
loadEnv('.env.local')
const KEY = process.env.API_FOOTBALL_KEY
if (!KEY) { console.error('Missing API_FOOTBALL_KEY'); process.exit(1) }

const BASE = 'https://v3.football.api-sports.io'
const SEASON = 2025
// reference ids: La Liga=140, Real Madrid=541, Haaland=1100, two fixtures for h2h
const PROBES = [
  ['injuries (league, current)',      `/injuries?league=140&season=${SEASON}`],
  ['injuries (player)',               `/injuries?player=1100&season=${SEASON}`],
  ['sidelined (player history)',      `/sidelined?player=1100`],
  ['predictions (a fixture)',         `/predictions?fixture=0`], // replaced below with a real upcoming id
  ['fixtures/headtohead',             `/fixtures/headtohead?h2h=541-529`], // Real Madrid vs Barcelona
  ['teams/statistics (season form)',  `/teams/statistics?league=140&season=${SEASON}&team=541`],
  ['players/topyellowcards',          `/players/topyellowcards?league=140&season=${SEASON}`],
  ['players/topredcards',             `/players/topredcards?league=140&season=${SEASON}`],
  ['players/profiles (bio)',          `/players/profiles?player=1100`],
  ['venues',                          `/venues?id=1456`],
  ['fixtures/rounds',                 `/fixtures/rounds?league=140&season=${SEASON}&current=true`],
]

async function probe(label, path) {
  try {
    const r = await fetch(`${BASE}${path}`, { headers: { 'x-apisports-key': KEY } })
    const j = await r.json()
    const errs = j.errors && (Array.isArray(j.errors) ? j.errors.length : Object.keys(j.errors).length) ? JSON.stringify(j.errors) : ''
    const n = j.results ?? (Array.isArray(j.response) ? j.response.length : 0)
    let sample = ''
    const first = Array.isArray(j.response) ? j.response[0] : j.response
    if (first && typeof first === 'object') sample = Object.keys(first).slice(0, 8).join(', ')
    console.log(`${n > 0 ? '✅' : '⚪️'} ${label.padEnd(34)} results=${String(n).padEnd(4)} ${errs ? '⚠️ ' + errs : 'keys: ' + sample}`)
  } catch (e) {
    console.log(`❌ ${label.padEnd(34)} ${e.message}`)
  }
}

const run = async () => {
  console.log(`API-Football coverage check · season ${SEASON}\n`)
  // get a real upcoming fixture id for predictions
  try {
    const fx = await (await fetch(`${BASE}/fixtures?league=140&season=${SEASON}&next=1`, { headers: { 'x-apisports-key': KEY } })).json()
    const id = fx.response?.[0]?.fixture?.id
    if (id) PROBES[3][1] = `/predictions?fixture=${id}`
  } catch {}
  for (const [label, path] of PROBES) { await probe(label, path); await new Promise(r => setTimeout(r, 350)) }
  console.log('\nLegend: ✅ returns data · ⚪️ empty (no data right now, endpoint exists) · ⚠️ plan/param error · ❌ network')
}
run()
