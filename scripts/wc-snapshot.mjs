// One-off: snapshot final WC-2026 data from api-football into the repo.
// Fetches fixtures, top scorers, top assists (league 1, season 2026) and the
// final match's detail (events) — then writes data/wc2026-snapshot.json.
import { readFileSync, writeFileSync } from 'node:fs'

const env = readFileSync('.env.local', 'utf8')
const KEY = env.match(/API_FOOTBALL_KEY=(.+)/)[1].trim()
const BASE = 'https://v3.football.api-sports.io'

async function get(path) {
  const r = await fetch(BASE + path, { headers: { 'x-apisports-key': KEY } })
  if (!r.ok) throw new Error(path + ' -> ' + r.status)
  const j = await r.json()
  if (j.errors && Object.keys(j.errors).length) throw new Error(path + ' -> ' + JSON.stringify(j.errors))
  return j.response ?? []
}

const fixtures = await get('/fixtures?league=1&season=2026')
const scorers = await get('/players/topscorers?league=1&season=2026')
const assists = await get('/players/topassists?league=1&season=2026')

const finals = fixtures.filter(f => f.league.round === 'Final')
console.log('fixtures:', fixtures.length, '| scorers:', scorers.length, '| assists:', assists.length, '| finals:', finals.length)
for (const f of finals) {
  console.log('FINAL:', f.fixture.id, f.teams.home.name, f.goals.home, '-', f.goals.away, f.teams.away.name,
    f.fixture.status.short, JSON.stringify(f.score.penalty), f.fixture.venue?.name, f.fixture.date)
}

let finalEvents = []
if (finals.length === 1) {
  finalEvents = await get(`/fixtures/events?fixture=${finals[0].fixture.id}`)
  console.log('final events:', finalEvents.length)
  for (const e of finalEvents) console.log(' ', e.time.elapsed + (e.time.extra ? '+' + e.time.extra : ''), e.type, e.detail, '-', e.player?.name, '(' + e.team?.name + ')')
}

writeFileSync('data/wc2026-snapshot.json',
  JSON.stringify({ capturedAt: '2026-07-20', fixtures, scorers, assists, finalEvents }, null, 1))
console.log('written data/wc2026-snapshot.json')
