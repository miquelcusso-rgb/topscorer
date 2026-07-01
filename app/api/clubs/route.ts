import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { canonicalClubName } from '@/lib/club-colors'
import { TEAMS_INDEX } from '@/data/teams-index'

// Distinct clubs (current season) for the sidebar "my team" typeahead. Deduped
// by canonical name; value = a raw dataset name (so crest + team lookups match),
// label = canonical display. Static dataset → cheap, CDN-cached a day.
export const revalidate = 86400

export async function GET() {
  const seen = new Set<string>()
  const clubs: { value: string; label: string }[] = []
  for (const p of (Array.isArray(PRIMARY_PLAYERS) ? PRIMARY_PLAYERS : [])) {
    if (!p || p.season !== '2526' || !p.club) continue
    const label = canonicalClubName(p.club)
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    clubs.push({ value: p.club, label })
  }
  // Full universe: every team from the api-football index not already listed.
  for (const e of Object.values(TEAMS_INDEX)) {
    const key = e.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    clubs.push({ value: e.name, label: e.name })
  }
  clubs.sort((a, b) => a.label.localeCompare(b.label))
  return Response.json(clubs, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
  })
}
