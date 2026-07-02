// One-shot discovery: list api-football domestic leagues for the countries we
// cover, so we can pick the correct 2nd-division ids. 1 API call (/leagues).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = readFileSync(join(ROOT, '.env.local'), 'utf8')
const KEY = (env.match(/^API_FOOTBALL_KEY=(.*)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '')

const COUNTRIES = ['Spain','England','Germany','Italy','France','Portugal','Turkey','Greece','Netherlands','Belgium','Scotland','Switzerland','Austria','Poland','Denmark','Sweden','Norway','USA','Mexico','Brazil','Argentina','Chile','Colombia','Uruguay','Japan','South-Korea','China','Australia','Saudi-Arabia']

const res = await fetch('https://v3.football.api-sports.io/leagues', { headers: { 'x-apisports-key': KEY } })
const j = await res.json()
const all = j.response ?? []
const set = new Set(COUNTRIES.map(c => c.toLowerCase().replace(/-/g, ' ')))
const byCountry = new Map()
for (const item of all) {
  if (item.league?.type !== 'League') continue
  const country = (item.country?.name ?? '').toLowerCase()
  if (!set.has(country)) continue
  // latest season year with coverage
  const years = (item.seasons ?? []).map(s => s.year)
  const latest = years.length ? Math.max(...years) : 0
  if (latest < 2024) continue
  const arr = byCountry.get(item.country.name) ?? []
  arr.push({ id: item.league.id, name: item.league.name, latest })
  byCountry.set(item.country.name, arr)
}
for (const [country, arr] of [...byCountry.entries()].sort()) {
  console.log(`\n${country}:`)
  for (const l of arr.sort((a,b)=>a.id-b.id)) console.log(`  ${l.id}  ${l.name}  (→${l.latest})`)
}
