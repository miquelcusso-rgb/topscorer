// One-off (re-runnable): snapshot final WC-2026 data from api-football into the
// repo. The tournament is OVER (final 19-jul-2026), so none of this data can
// change again — freezing it removes the live api-football calls the World Cup
// nation pages made on every ISR regen, and with them the quota-exhaustion
// failure mode that blanked the bracket in prod on 20-jul.
//
// Captures:
//   fixtures      — all WC-2026 fixtures (league 1, season 2026)
//   scorers       — tournament top-20 scorers  (/players/topscorers)
//   assists       — tournament top-20 assists  (/players/topassists)
//   finalEvents   — events of the final
//   nationScorers — per-nation FULL scorer list, keyed by api-football team id.
//                   The top-20 endpoint only surfaces a nation's single best
//                   player (Mexico → just Quiñones); this gives every nation a
//                   real scorer table instead of a one-row stub.
//
// Usage:  node scripts/wc-snapshot.mjs           (everything)
//         node scripts/wc-snapshot.mjs --core    (skip the per-nation pass)
//
// Re-running merges into the existing snapshot: nations already captured are
// kept, so a run interrupted by the daily quota can simply be resumed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'data', 'wc2026-snapshot.json')

const env = readFileSync(join(ROOT, '.env.local'), 'utf8')
const KEY = env.match(/API_FOOTBALL_KEY=(.+)/)[1].trim()
const BASE = 'https://v3.football.api-sports.io'

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// api-football enforces a per-MINUTE ceiling on top of the daily quota, so every
// call is paced and rate-limit rejections are retried with a long backoff.
async function get(path, attempt = 1) {
  await sleep(1500)
  const r = await fetch(BASE + path, { headers: { 'x-apisports-key': KEY } })
  if (!r.ok) throw new Error(path + ' -> ' + r.status)
  const j = await r.json()
  const errs = j.errors && !Array.isArray(j.errors) ? j.errors : null
  if (errs && Object.keys(errs).length) {
    if (errs.rateLimit && attempt <= 5) {
      console.log(`  …rate limited, waiting 65s (attempt ${attempt})`)
      await sleep(65_000)
      return get(path, attempt + 1)
    }
    throw new Error(path + ' -> ' + JSON.stringify(errs))
  }
  return j
}
const res = async (path) => (await get(path)).response ?? []

// /status is free — it does not count against the daily quota.
const quota = async () => (await get('/status')).response.requests

const coreOnly = process.argv.includes('--core')
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}

const before = await quota()
console.log(`quota before: ${before.current}/${before.limit_day}`)

const fixtures = await res('/fixtures?league=1&season=2026')
const scorers = await res('/players/topscorers?league=1&season=2026')
const assists = await res('/players/topassists?league=1&season=2026')

const finals = fixtures.filter(f => f.league.round === 'Final')
console.log('fixtures:', fixtures.length, '| scorers:', scorers.length, '| assists:', assists.length, '| finals:', finals.length)
for (const f of finals) {
  console.log('FINAL:', f.fixture.id, f.teams.home.name, f.goals.home, '-', f.goals.away, f.teams.away.name,
    f.fixture.status.short, JSON.stringify(f.score.penalty), f.fixture.venue?.name, f.fixture.date)
}

let finalEvents = prev.finalEvents ?? []
if (finals.length === 1) {
  finalEvents = await res(`/fixtures/events?fixture=${finals[0].fixture.id}`)
  console.log('final events:', finalEvents.length)
}

// ── Per-nation scorers ──────────────────────────────────────────────────────
// Participating teams are derived from the fixtures themselves (no hard-coded
// list). Each nation costs 1-2 calls and is captured once, forever.
const nationScorers = { ...(prev.nationScorers ?? {}) }
if (!coreOnly) {
  const teams = new Map()
  for (const f of fixtures) {
    for (const side of ['home', 'away']) {
      const t = f.teams[side]
      if (t?.id && !teams.has(t.id)) teams.set(t.id, t.name)
    }
  }
  console.log(`\nper-nation pass: ${teams.size} teams (${Object.keys(nationScorers).length} already captured)`)

  let n = 0
  for (const [id, name] of teams) {
    if (nationScorers[String(id)]) continue
    // Leave a safety margin so this script never starves the live site. Checked
    // periodically rather than per nation (the check itself is a request).
    if (n++ % 8 === 0) {
      const q = await quota()
      if (q.limit_day - q.current < 150) {
        console.log(`\n⚠️  stopping: quota headroom ${q.limit_day - q.current} too low. Re-run after reset to resume.`)
        break
      }
    }
    try {
      const rows = []
      let page = 1
      let total = 1
      while (page <= total && page <= 4) {
        const j = await get(`/players?team=${id}&league=1&season=2026&page=${page}`)
        rows.push(...(j.response ?? []))
        total = j.paging?.total ?? 1
        page++
      }
      // Keep only players who actually scored, with the fields the page renders.
      const list = rows
        .map(p => ({
          id: p.player.id,
          name: p.player.name,
          photo: p.player.photo,
          goals: p.statistics[0]?.goals?.total ?? 0,
          assists: p.statistics[0]?.goals?.assists ?? 0,
          apps: p.statistics[0]?.games?.appearences ?? 0,
          minutes: p.statistics[0]?.games?.minutes ?? 0,
          position: p.statistics[0]?.games?.position ?? null,
        }))
        .filter(p => p.goals > 0)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.minutes - b.minutes)
      nationScorers[String(id)] = list
      console.log(`  ${name} (${id}): ${list.length} scorer(s)${list[0] ? ` — top ${list[0].name} ${list[0].goals}g` : ''}`)
    } catch (e) {
      console.log(`  ${name} (${id}): FAILED — ${e.message}`)
    }
  }
}

writeFileSync(OUT, JSON.stringify({
  capturedAt: '2026-07-21',
  fixtures, scorers, assists, finalEvents, nationScorers,
}, null, 1))

const after = await quota()
console.log(`\nwritten data/wc2026-snapshot.json — nations captured: ${Object.keys(nationScorers).length}`)
console.log(`quota after: ${after.current}/${after.limit_day} (spent ${after.current - before.current})`)
