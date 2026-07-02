// Generate data/teams-index.ts — the canonical Leagues → Teams source.
// One /teams?league=<id>&season= call per league (not per team). Produces a
// slug → { teamId, name, logo, leagueId, leagueName, country, founded, venue,
// city, capacity } map covering EVERY team in the leagues we support, so team
// pages exist for the full universe (not just clubs in the curated stats set).
//
// Run:  node scripts/gen-teams-index.mjs
// Refresh: after adding leagues or once per season. Reads API_FOOTBALL_KEY from .env.local.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// API key from .env.local
const env = readFileSync(join(ROOT, '.env.local'), 'utf8')
const KEY = (env.match(/^API_FOOTBALL_KEY=(.*)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '')
if (!KEY) { console.error('No API_FOOTBALL_KEY in .env.local'); process.exit(1) }

const SEASON = 2025

// Domestic leagues we cover: 1st AND 2nd division per country (ids verified via
// scripts/discover-2nd-divisions.mjs). [id, name, country]. 1st-division names
// match the site catalog so the team→league chip links resolve; 2nd-division
// names are the api-football names. To add more tiers: append ids and re-run.
const LEAGUES = [
  // Spain
  [140, "La Liga", "Spain"], [141, "Segunda División", "Spain"],
  // England
  [39, "Premier League", "England"], [40, "Championship", "England"],
  // Germany
  [78, "Bundesliga", "Germany"], [79, "2. Bundesliga", "Germany"],
  // Italy
  [135, "Serie A", "Italy"], [136, "Serie B", "Italy"],
  // France
  [61, "Ligue 1", "France"], [62, "Ligue 2", "France"],
  // Portugal
  [94, "Primeira Liga", "Portugal"], [95, "Liga Portugal 2", "Portugal"],
  // Turkey
  [203, "Süper Lig", "Turkey"], [204, "1. Lig", "Turkey"],
  // Greece
  [197, "Super League", "Greece"], [494, "Super League 2", "Greece"],
  // Netherlands
  [88, "Eredivisie", "Netherlands"], [89, "Eerste Divisie", "Netherlands"],
  // Belgium
  [144, "Pro League", "Belgium"], [145, "Challenger Pro League", "Belgium"],
  // Scotland
  [179, "Premiership", "Scotland"], [180, "Championship", "Scotland"],
  // Switzerland
  [207, "Super League", "Switzerland"], [208, "Challenge League", "Switzerland"],
  // Austria
  [218, "Bundesliga", "Austria"], [219, "2. Liga", "Austria"],
  // Poland
  [106, "Ekstraklasa", "Poland"], [107, "I Liga", "Poland"],
  // Denmark
  [119, "Superligaen", "Denmark"], [120, "1. Division", "Denmark"],
  // Sweden
  [113, "Allsvenskan", "Sweden"], [114, "Superettan", "Sweden"],
  // Norway
  [103, "Eliteserien", "Norway"], [104, "1. Division", "Norway"],
  // USA
  [253, "MLS", "USA"], [255, "USL Championship", "USA"],
  // Mexico
  [262, "Liga MX", "Mexico"], [263, "Liga de Expansión MX", "Mexico"],
  // Brazil
  [71, "Brasileirão Serie A", "Brazil"], [72, "Brasileirão Serie B", "Brazil"],
  // Argentina
  [128, "Liga Profesional", "Argentina"], [129, "Primera Nacional", "Argentina"],
  // Chile
  [265, "Primera División", "Chile"], [266, "Primera B", "Chile"],
  // Colombia
  [239, "Categoría Primera A", "Colombia"], [240, "Primera B", "Colombia"],
  // Uruguay
  [268, "Primera División", "Uruguay"], [269, "Segunda División", "Uruguay"],
  // Japan
  [98, "J1 League", "Japan"], [99, "J2 League", "Japan"],
  // South Korea
  [292, "K League 1", "South Korea"], [293, "K League 2", "South Korea"],
  // China
  [169, "Super League", "China"], [170, "League One", "China"],
  // Australia
  [188, "A-League", "Australia"],
  // Saudi Arabia
  [307, "Pro League", "Saudi Arabia"],
]

// slugify — must match lib/slugify.ts exactly.
const SPECIAL = { 'ø': 'o', 'œ': 'oe', 'æ': 'ae', 'å': 'a', 'ß': 'ss', 'ł': 'l', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ı': 'i', 'ħ': 'h' }
function slugify(name) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[øœæåßłđðþıħ]/g, c => SPECIAL[c] ?? c)
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

async function fetchTeamsSeason(leagueId, season) {
  const res = await fetch(`https://v3.football.api-sports.io/teams?league=${leagueId}&season=${season}`, {
    headers: { 'x-apisports-key': KEY },
  })
  if (!res.ok) throw new Error(`league ${leagueId}: ${res.status}`)
  const j = await res.json()
  return j.response ?? []
}

// Try the current season; if the league hasn't populated its squad list yet
// (some calendars / just-ended seasons return 0), fall back to the prior season
// so the club roster is never empty.
async function fetchTeams(leagueId) {
  let teams = await fetchTeamsSeason(leagueId, SEASON)
  if (!teams.length) teams = await fetchTeamsSeason(leagueId, SEASON - 1)
  return teams
}

const bySlug = new Map()   // slug -> entry (first league claiming it wins)
const seenId = new Set()   // teamId -> already indexed
let calls = 0

for (const [leagueId, leagueName, country] of LEAGUES) {
  try {
    const teams = await fetchTeams(leagueId)
    calls++
    for (const t of teams) {
      const team = t.team, venue = t.venue ?? {}
      if (!team?.id || !team?.name) continue
      if (seenId.has(team.id)) continue
      const slug = slugify(team.name)
      if (!slug || bySlug.has(slug)) continue
      seenId.add(team.id)
      bySlug.set(slug, {
        teamId: team.id,
        name: team.name,
        slug,
        logo: team.logo ?? null,
        leagueId,
        leagueName,
        country,
        founded: team.founded ?? null,
        venue: venue.name ?? null,
        city: venue.city ?? null,
        capacity: venue.capacity ?? null,
      })
    }
    console.log(`  ${leagueName} (${country}): ${teams.length} teams`)
  } catch (e) {
    console.error(`  ! ${leagueName}: ${e.message}`)
  }
}

const entries = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug))
const header = `// AUTO-GENERATED by scripts/gen-teams-index.mjs — do not edit by hand.
// Canonical Leagues → Teams universe (${entries.length} teams across ${calls} leagues, season ${SEASON}).
// Refresh: node scripts/gen-teams-index.mjs

export interface TeamIndexEntry {
  teamId: number
  name: string
  slug: string
  logo: string | null
  leagueId: number
  leagueName: string
  country: string
  founded: number | null
  venue: string | null
  city: string | null
  capacity: number | null
}

export const TEAMS_INDEX: Record<string, TeamIndexEntry> = `

const body = '{\n' + entries.map(e => `  ${JSON.stringify(e.slug)}: ${JSON.stringify(e)},`).join('\n') + '\n}\n'
writeFileSync(join(ROOT, 'data', 'teams-index.ts'), header + body, 'utf8')
console.log(`\nWrote data/teams-index.ts — ${entries.length} teams, ${calls} API calls.`)
