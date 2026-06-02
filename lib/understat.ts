import { unstable_cache } from 'next/cache'

// Understat reader (xG/npxG/xA/key_passes/xGChain/xGBuildup/shots). Their league
// page no longer inlines the JSON; data comes from the internal endpoint
// `POST main/getPlayersStats/` (gzip). Cached so we never hammer it. 6 leagues.

export interface UnderstatRow {
  id: string
  name: string
  team: string
  position: string
  minutes: number
  games: number
  goals: number
  assists: number
  xG: number
  npxG: number
  xA: number
  key_passes: number
  xGChain: number
  xGBuildup: number
  shots: number
  npg: number
}

// Our dataset league name → Understat league slug.
const SLUG: Record<string, string> = {
  'La Liga': 'La_liga',
  'Premier League': 'EPL',
  'Bundesliga': 'Bundesliga',
  'Serie A': 'Serie_A',
  'Ligue 1': 'Ligue_1',
}
export const understatCovers = (league: string) => league in SLUG

// season code "2526" → understat start year 2025.
const startYear = (season: string) => 2000 + Number(season.slice(0, 2))

export const getUnderstatLeague = unstable_cache(
  async (league: string, season = '2526'): Promise<UnderstatRow[]> => {
    const slug = SLUG[league]
    if (!slug) return []
    try {
      const res = await fetch('https://understat.com/main/getPlayersStats/', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TopScorersBot/1.0)',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: `league=${slug}&season=${startYear(season)}`,
      })
      if (!res.ok) return []
      const data = await res.json() as { response?: { players?: any[] }; players?: any[] }
      const raw = data.response?.players ?? data.players ?? (Array.isArray(data) ? data : [])
      const n = (v: unknown) => Number(v) || 0
      return raw.map((p: any) => ({
        id: String(p.id),
        name: p.player_name,
        team: p.team_title,
        position: p.position ?? '',
        minutes: n(p.time),
        games: n(p.games),
        goals: n(p.goals),
        assists: n(p.assists),
        xG: n(p.xG),
        npxG: n(p.npxG),
        xA: n(p.xA),
        key_passes: n(p.key_passes),
        xGChain: n(p.xGChain),
        xGBuildup: n(p.xGBuildup),
        shots: n(p.shots),
        npg: n(p.npg),
      }))
    } catch { return [] }
  },
  ['understat-league'],
  { revalidate: 86400, tags: ['understat'] } // 24h
)
