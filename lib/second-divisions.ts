import { TEAMS_INDEX, type TeamIndexEntry } from '@/data/teams-index'
import { slugify } from '@/lib/slugify'

// Second-division handling. 2nd divisions carry their real league names and get
// their own /competiciones/<slug> page (a teams grid), but are NOT listed in the
// competitions index — you reach a country's 2nd tier from its top-flight page.

// api-football league id of the 2nd division, keyed by the top-flight id.
// (Same pairs as scripts/gen-teams-index.mjs.)
export const SECOND_DIVISION_OF: Record<number, number> = {
  140: 141, 39: 40, 78: 79, 135: 136, 61: 62, 94: 95, 203: 204, 197: 494,
  88: 89, 144: 145, 179: 180, 207: 208, 218: 219, 106: 107, 119: 120,
  113: 114, 103: 104, 253: 255, 262: 263, 71: 72, 128: 129, 265: 266,
  239: 240, 268: 269, 98: 99, 292: 293, 169: 170,
}

export interface LeagueFromIndex {
  leagueId: number
  name: string
  country: string
  slug: string
}

// Distinct leagues present in the teams index, keyed by slug(name).
const LEAGUE_BY_SLUG: Map<string, LeagueFromIndex> = (() => {
  const m = new Map<string, LeagueFromIndex>()
  for (const e of Object.values(TEAMS_INDEX)) {
    const slug = slugify(e.leagueName)
    if (!slug || m.has(slug)) continue
    m.set(slug, { leagueId: e.leagueId, name: e.leagueName, country: e.country, slug })
  }
  return m
})()

const LEAGUE_BY_ID: Map<number, LeagueFromIndex> = (() => {
  const m = new Map<number, LeagueFromIndex>()
  for (const l of LEAGUE_BY_SLUG.values()) if (!m.has(l.leagueId)) m.set(l.leagueId, l)
  return m
})()

const SECOND_DIV_IDS = new Set(Object.values(SECOND_DIVISION_OF))

/** A league from the teams index by its slug (undefined if unknown). */
export function leagueFromIndexBySlug(slug: string): LeagueFromIndex | undefined {
  return LEAGUE_BY_SLUG.get(slug)
}

/** The 2nd division paired with a top-flight league id (undefined if none). */
export function secondDivisionOf(firstLeagueId: number): LeagueFromIndex | undefined {
  const secondId = SECOND_DIVISION_OF[firstLeagueId]
  return secondId ? LEAGUE_BY_ID.get(secondId) : undefined
}

/** True if this league id is a 2nd division (hidden from the index list). */
export function isSecondDivision(leagueId: number): boolean {
  return SECOND_DIV_IDS.has(leagueId)
}

/** Slugs of every 2nd division, for generateStaticParams. */
export function secondDivisionSlugs(): string[] {
  const out: string[] = []
  for (const id of SECOND_DIV_IDS) {
    const l = LEAGUE_BY_ID.get(id)
    if (l) out.push(l.slug)
  }
  return out
}

/** All teams of a league id, sorted by name — for the league teams grid. */
export function teamsForLeagueId(leagueId: number): TeamIndexEntry[] {
  return Object.values(TEAMS_INDEX)
    .filter(e => e.leagueId === leagueId)
    .sort((a, b) => a.name.localeCompare(b.name))
}
