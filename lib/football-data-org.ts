// football-data.org — Free tier, covers Big 5 + UCL/UEL
// Free: 10 req/min, no API key needed for public endpoints
// Endpoint: https://api.football-data.org/v4/competitions/{code}/standings
// Auth: X-Auth-Token header (get free key from football-data.org)
// League codes: PL (Premier), PD (La Liga), BL1 (Bundesliga), SA (Serie A), FL1 (Ligue 1), PPL (Primeira Liga)
// FOOTBALL_DATA_TOKEN=your_free_key_from_football-data.org

import { unstable_cache } from 'next/cache'

const FD_BASE = 'https://api.football-data.org/v4'
const FD_TOKEN = process.env.FOOTBALL_DATA_TOKEN ?? ''

// Mapping from our league IDs to football-data.org codes
export const FD_LEAGUE_MAP: Record<number, string> = {
  39: 'PL',   // Premier League
  140: 'PD',  // La Liga
  78: 'BL1',  // Bundesliga
  135: 'SA',  // Serie A
  61: 'FL1',  // Ligue 1
  94: 'PPL',  // Primeira Liga
  2: 'CL',    // Champions League (yes, it's free!)
  3: 'EL',    // Europa League
}

export interface FDStanding {
  position: number
  team: { id: number; name: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form: string | null
}

async function fdFetch<T>(path: string): Promise<T | null> {
  if (!FD_TOKEN) return null
  try {
    const res = await fetch(`${FD_BASE}${path}`, {
      headers: { 'X-Auth-Token': FD_TOKEN },
      next: { revalidate: 21600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export const getFDStandings = unstable_cache(
  async (leagueId: number): Promise<FDStanding[] | null> => {
    const code = FD_LEAGUE_MAP[leagueId]
    if (!code) return null
    const data = await fdFetch<{ standings: Array<{ table: FDStanding[] }> }>(`/competitions/${code}/standings`)
    return data?.standings?.[0]?.table ?? null
  },
  ['fd-standings'],
  { revalidate: 21600, tags: ['football-data'] }
)

export const getFDScorers = unstable_cache(
  async (leagueId: number): Promise<Array<{ player: { name: string; nationality: string }; team: { name: string; crest: string }; goals: number; assists: number | null; playedMatches: number }> | null> => {
    const code = FD_LEAGUE_MAP[leagueId]
    if (!code) return null
    const data = await fdFetch<{ scorers: Array<{ player: { name: string; nationality: string }; team: { name: string; crest: string }; goals: number; assists: number | null; playedMatches: number }> }>(`/competitions/${code}/scorers?limit=20`)
    return data?.scorers ?? null
  },
  ['fd-scorers'],
  { revalidate: 10800, tags: ['football-data'] }
)
