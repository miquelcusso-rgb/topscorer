/**
 * API-Football (api-sports.io) client
 * Base: https://v3.football.api-sports.io
 * Free tier: 100 req/day  |  Starter ~7,500/day
 * All public functions are wrapped in unstable_cache (1 h TTL)
 */

import { unstable_cache } from 'next/cache'

const BASE = 'https://v3.football.api-sports.io'
const KEY = process.env.API_FOOTBALL_KEY ?? ''

// ─── League registry ─────────────────────────────────────────────────────────

export interface LeagueMeta {
  id: number
  name: string
  country: string
  short: string
  color: string
  flag?: string
}

/**
 * League registry. Slugs (`short` lowercased) are stable URL keys for
 * /competiciones/[slug]. Colors are flag-derived where possible.
 *
 * Coverage tiers:
 *  - LEAGUES                 : European top division "headline" set (Big-5 + PT/TR/GR)
 *  - LEAGUES_EUROPE_OTHER    : rest of Europe top division
 *  - LEAGUES_2               : European second divisions (Big-5 + PT/TR/GR/NL/BE/SCO)
 *  - LEAGUES_AMERICAS        : USA + Latin America top divisions
 *  - LEAGUES_ASIA_OCEANIA    : Asia / Oceania top divisions
 *  - LEAGUES_MIDDLE_EAST     : Middle East top divisions
 *  - LEAGUES_EURO            : European club competitions (UCL / UEL / UECL)
 */
export const LEAGUES: LeagueMeta[] = [
  { id: 140, name: 'La Liga',        country: 'Spain',    short: 'ESP', color: '#ee3124' },
  { id:  39, name: 'Premier League', country: 'England',  short: 'ENG', color: '#3d195b' },
  { id:  78, name: 'Bundesliga',     country: 'Germany',  short: 'GER', color: '#d20515' },
  { id: 135, name: 'Serie A',        country: 'Italy',    short: 'ITA', color: '#024494' },
  { id:  61, name: 'Ligue 1',        country: 'France',   short: 'FRA', color: '#003087' },
  { id:  94, name: 'Primeira Liga',  country: 'Portugal', short: 'PRT', color: '#006600' },
  { id: 203, name: 'Süper Lig',      country: 'Turkey',   short: 'TUR', color: '#e30a17' },
  { id: 197, name: 'Super League',   country: 'Greece',   short: 'GRE', color: '#0d5eaf' },
]

export const LEAGUES_EUROPE_OTHER: LeagueMeta[] = [
  { id:  88, name: 'Eredivisie',         country: 'Netherlands', short: 'NED', color: '#ff7900' },
  { id: 144, name: 'Pro League',         country: 'Belgium',     short: 'BEL', color: '#ed2939' },
  { id: 179, name: 'Premiership',        country: 'Scotland',    short: 'SCO', color: '#005eb8' },
  { id: 207, name: 'Super League',       country: 'Switzerland', short: 'SUI', color: '#d52b1e' },
  { id: 218, name: 'Bundesliga',         country: 'Austria',     short: 'AUT', color: '#ef3340' },
  { id: 106, name: 'Ekstraklasa',        country: 'Poland',      short: 'POL', color: '#dc143c' },
  { id: 119, name: 'Superligaen',        country: 'Denmark',     short: 'DEN', color: '#c8102e' },
  { id: 113, name: 'Allsvenskan',        country: 'Sweden',      short: 'SWE', color: '#006aa7' },
  { id: 103, name: 'Eliteserien',        country: 'Norway',      short: 'NOR', color: '#ba0c2f' },
]

export const LEAGUES_2: LeagueMeta[] = [
  { id:  40, name: 'Championship',     country: 'England',     short: 'ENG2', color: '#3d195b' },
  { id:  79, name: '2. Bundesliga',    country: 'Germany',     short: 'GER2', color: '#d20515' },
  { id: 136, name: 'Serie B',          country: 'Italy',       short: 'ITA2', color: '#024494' },
  { id:  62, name: 'Ligue 2',          country: 'France',      short: 'FRA2', color: '#003087' },
  { id: 141, name: 'Segunda División', country: 'Spain',       short: 'ESP2', color: '#ee3124' },
  { id:  95, name: 'Liga Portugal 2',  country: 'Portugal',    short: 'PRT2', color: '#006600' },
  { id: 204, name: '1. Lig',           country: 'Turkey',      short: 'TUR2', color: '#e30a17' },
  { id: 199, name: 'Super League 2',   country: 'Greece',      short: 'GRE2', color: '#0d5eaf' },
  { id:  89, name: 'Eerste Divisie',   country: 'Netherlands', short: 'NED2', color: '#ff7900' },
  { id: 180, name: 'Championship',     country: 'Scotland',    short: 'SCO2', color: '#005eb8' },
]

export const LEAGUES_AMERICAS: LeagueMeta[] = [
  { id: 253, name: 'MLS',                  country: 'USA',       short: 'USA', color: '#b22234' },
  { id: 262, name: 'Liga MX',              country: 'Mexico',    short: 'MEX', color: '#006847' },
  { id:  71, name: 'Brasileirão Serie A',  country: 'Brazil',    short: 'BRA', color: '#009b3a' },
  { id: 128, name: 'Liga Profesional',     country: 'Argentina', short: 'ARG', color: '#74acdf' },
  { id: 265, name: 'Primera División',     country: 'Chile',     short: 'CHI', color: '#d52b1e' },
  { id: 239, name: 'Categoría Primera A',  country: 'Colombia',  short: 'COL', color: '#fcd116' },
  { id: 268, name: 'Primera División',     country: 'Uruguay',   short: 'URU', color: '#74acdf' },
]

export const LEAGUES_ASIA_OCEANIA: LeagueMeta[] = [
  { id:  98, name: 'J1 League',           country: 'Japan',       short: 'JPN', color: '#bc002d' },
  { id: 292, name: 'K League 1',          country: 'South Korea', short: 'KOR', color: '#c4001b' },
  { id: 169, name: 'Super League',        country: 'China',       short: 'CHN', color: '#de2910' },
  { id: 188, name: 'A-League',            country: 'Australia',   short: 'AUS', color: '#00843d' },
]

export const LEAGUES_MIDDLE_EAST: LeagueMeta[] = [
  { id: 307, name: 'Pro League',          country: 'Saudi Arabia', short: 'KSA', color: '#006c35' },
]

export const LEAGUES_EURO: LeagueMeta[] = [
  { id:   2, name: 'Champions League',  country: 'Europe', short: 'UCL',  color: '#1a3a6e' },
  { id:   3, name: 'Europa League',     country: 'Europe', short: 'UEL',  color: '#f77f00' },
  { id: 848, name: 'Conference League', country: 'Europe', short: 'UECL', color: '#38c47a' },
]

export const ALL_LEAGUES = [
  ...LEAGUES,
  ...LEAGUES_EUROPE_OTHER,
  ...LEAGUES_2,
  ...LEAGUES_AMERICAS,
  ...LEAGUES_ASIA_OCEANIA,
  ...LEAGUES_MIDDLE_EAST,
  ...LEAGUES_EURO,
]

export const WORLD_CUP: LeagueMeta = {
  id: 1,
  name: 'FIFA World Cup',
  country: 'World',
  short: 'WC26',
  color: '#f0c040',
}

// ─── Raw API types ────────────────────────────────────────────────────────────

export interface ApiPlayerResponse {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    age: number
    nationality: string
    photo: string
  }
  statistics: Array<{
    team: { id: number; name: string; logo: string }
    league: { id: number; name: string; country: string; logo: string; season: number }
    games: { appearences: number; minutes: number; position: string }
    goals: { total: number; assists: number }
    passes: { total: number; accuracy: string; key: number }
    tackles: { total: number; blocks: number; interceptions: number }
    dribbles: { attempts: number; success: number }
    shots: { total: number; on: number }
  }>
}

export interface ApiStandingEntry {
  rank: number
  group?: string
  team: { id: number; name: string; logo: string }
  points: number
  goalsDiff: number
  form: string
  description: string | null
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
}

export interface ApiFixture {
  fixture: {
    id: number
    date: string
    timestamp: number
    status: { long: string; short: string; elapsed: number | null }
    venue: { name: string; city: string }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    round: string
  }
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null }
    away: { id: number; name: string; logo: string; winner: boolean | null }
  }
  goals: { home: number | null; away: number | null }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
  }
}

// ─── Raw fetch (server-only, no caching) ─────────────────────────────────────

async function apiFetch<T = unknown>(path: string): Promise<{ response: T; errors: unknown }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'x-apisports-key': KEY,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`API-Football ${res.status} on ${path}`)
  return res.json()
}

// ─── Cached data functions (1 h TTL) ──────────────────────────────────────────

export const getTopScorers = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiPlayerResponse[]> => {
    try {
      const data = await apiFetch<ApiPlayerResponse[]>(
        `/players/topscorers?league=${leagueId}&season=${season}`
      )
      return data.response ?? []
    } catch {
      return [] // defensive: a 429/5xx must never crash the caller (page/build)
    }
  },
  ['api-football-topscorers'],
  { revalidate: 10800, tags: ['api-football'] } // 3 h — scorers change slowly
)

export const getTopAssists = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiPlayerResponse[]> => {
    try {
      const data = await apiFetch<ApiPlayerResponse[]>(
        `/players/topassists?league=${leagueId}&season=${season}`
      )
      return data.response ?? []
    } catch {
      return [] // defensive: a 429/5xx must never crash the caller (page/build)
    }
  },
  ['api-football-topassists-v2'], // v2: bust a stale pre-tournament empty cache
  { revalidate: 10800, tags: ['api-football'] } // 3 h — matches are daily; 30-min refresh just burned quota
)

export const getStandings = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiStandingEntry[]> => {
    try {
      const data = await apiFetch<Array<{ league: { standings: ApiStandingEntry[][] } }>>(
        `/standings?league=${leagueId}&season=${season}`
      )
      return data.response?.[0]?.league?.standings?.[0] ?? []
    } catch {
      return [] // defensive: a 429/5xx must never crash the caller (page/build)
    }
  },
  ['api-football-standings'],
  { revalidate: 21600, tags: ['api-football'] } // 6 h — standings update ~weekly
)

// ─── Team profile (club info + venue) ────────────────────────────────────────
// /teams?id= returns the club (name, country, founded, national flag) and its
// venue (stadium, city, capacity). Powers the team pages. Cached 7 days — these
// facts are essentially static. Defensive: any error → null.
export interface TeamInfoResponse {
  team: { id: number; name: string; code: string | null; country: string; founded: number | null; national: boolean; logo: string }
  venue: { id: number | null; name: string | null; address: string | null; city: string | null; capacity: number | null; surface: string | null; image: string | null }
}
export const getTeamInfo = unstable_cache(
  async (teamId: number): Promise<TeamInfoResponse | null> => {
    try {
      const data = await apiFetch<TeamInfoResponse[]>(`/teams?id=${teamId}`)
      return data.response?.[0] ?? null
    } catch {
      return null
    }
  },
  ['api-football-team-info'],
  { revalidate: 604800, tags: ['api-football'] } // 7 d — club/venue facts are static
)

// International friendlies (league 10) in a date window — used for the World
// Cup 2026 build-up "preview" section. Revalidates hourly so newly-played
// matches and scores appear automatically. Defensive: any error → [].
export const getFriendlies = unstable_cache(
  async (from: string, to: string): Promise<ApiFixture[]> => {
    try {
      const data = await apiFetch<ApiFixture[]>(`/fixtures?league=10&season=2026&from=${from}&to=${to}`)
      const list = data.response ?? []
      return [...list].sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)
    } catch {
      return []
    }
  },
  ['api-football-friendlies'],
  { revalidate: 10800, tags: ['api-football'] } // 3 h — friendlies window is over; results land daily
)

// Full per-season career for one player (on-demand). Loops the seasons the API
// lists, picks the club competition with the most appearances per season, and
// returns dataset-shaped rows. Cached 24h. Used by the profile history + the
// comparador season picker so careers aren't limited to the bundled seasons.
export interface CareerSeason {
  season: string            // dataset code, e.g. 2022 → "2223"
  club: string
  league: string
  age?: number
  pj: number
  goles: number
  asist: number
  minutes?: number
  rating?: number
  shotsTotal?: number
  shotsOn?: number
  passes?: number
  keyPasses?: number
  passAccuracy?: number
  tacklesTotal?: number
  interceptions?: number
  duelsTotal?: number
  duelsWon?: number
  dribblesAttempts?: number
  dribblesSuccess?: number
  photo?: string
}
const num = (v: unknown) => (v == null ? undefined : Number(v))
const seasonCode = (y: number) => `${String(y % 100).padStart(2, '0')}${String((y + 1) % 100).padStart(2, '0')}`

export const getPlayerCareer = unstable_cache(
  async (playerId: number): Promise<CareerSeason[]> => {
    const seasonsRes = await apiFetch<number[]>(`/players/seasons?player=${playerId}`)
    // Don't show future seasons: a season starting in year Y only counts once it
    // has actually begun (~July). Today June 2026 → cutoff start-year = 2025.
    const now = new Date()
    const cutoff = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
    const seasons = (seasonsRes.response ?? []).filter(y => y >= 2008 && y <= cutoff).sort((a, b) => b - a)
    const out: CareerSeason[] = []
    for (const y of seasons) {
      try {
        const r = await apiFetch<Array<{ player: { age?: number; photo?: string }; statistics: Array<Record<string, any>> }>>(
          `/players?id=${playerId}&season=${y}`
        )
        const row = r.response?.[0]
        if (!row) continue
        // Pick the club competition (national league/cups) with the most apps.
        const stats = (row.statistics ?? []).filter(s => (s.games?.appearences ?? 0) > 0)
        if (!stats.length) continue
        const best = [...stats].sort((a, b) => (b.games?.appearences ?? 0) - (a.games?.appearences ?? 0))[0]
        out.push({
          season: seasonCode(y),
          club: best.team?.name ?? '',
          league: best.league?.name ?? '',
          age: num(row.player?.age),
          pj: num(best.games?.appearences) ?? 0,
          goles: num(best.goals?.total) ?? 0,
          asist: num(best.goals?.assists) ?? 0,
          minutes: num(best.games?.minutes),
          rating: best.games?.rating != null ? Math.round(Number(best.games.rating) * 100) / 100 : undefined,
          shotsTotal: num(best.shots?.total),
          shotsOn: num(best.shots?.on),
          passes: num(best.passes?.total),
          keyPasses: num(best.passes?.key),
          passAccuracy: num(best.passes?.accuracy),
          tacklesTotal: num(best.tackles?.total),
          interceptions: num(best.tackles?.interceptions),
          duelsTotal: num(best.duels?.total),
          duelsWon: num(best.duels?.won),
          dribblesAttempts: num(best.dribbles?.attempts),
          dribblesSuccess: num(best.dribbles?.success),
          photo: row.player?.photo,
        })
      } catch { /* skip a season that errors */ }
    }
    return out
  },
  ['api-football-career'],
  { revalidate: 86400, tags: ['api-football'] }
)

// ── Player honours (palmarés) + transfer history ─────────────────────────────
export interface PlayerHonors {
  trophies: { title: string; country: string; count: number }[]   // titles WON, grouped
  totalWon: number
  transfers: { date: string; type: string; from: string; to: string }[]
}

export const getPlayerHonors = unstable_cache(
  async (playerId: number): Promise<PlayerHonors> => {
    const [trRes, tfRes] = await Promise.all([
      apiFetch<Array<{ league: string; country: string; season: string; place: string }>>(`/trophies?player=${playerId}`),
      apiFetch<Array<{ transfers: Array<{ date: string; type: string; teams: { in: { name: string }; out: { name: string } } }> }>>(`/transfers?player=${playerId}`),
    ])
    const won = (trRes.response ?? []).filter(t => /winner/i.test(t.place))
    const byTitle = new Map<string, { title: string; country: string; count: number }>()
    for (const t of won) {
      const cur = byTitle.get(t.league)
      if (cur) cur.count++
      else byTitle.set(t.league, { title: t.league, country: t.country, count: 1 })
    }
    const trophies = [...byTitle.values()].sort((a, b) => b.count - a.count)
    const transfers = (tfRes.response?.[0]?.transfers ?? [])
      .map(x => ({ date: x.date, type: x.type, from: x.teams?.out?.name ?? '', to: x.teams?.in?.name ?? '' }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    return { trophies, totalWon: won.length, transfers }
  },
  ['api-football-honors'],
  { revalidate: 86400, tags: ['api-football'] }
)

// ── Match summary card (goals+assists, stats, auto MVP) ──────────────────────
export interface MatchSummary {
  date: string
  status: string
  venue?: string
  league: string
  round?: string
  home: { id: number; name: string; logo: string; goals: number | null }
  away: { id: number; name: string; logo: string; goals: number | null }
  scorers: { minute: number; teamId: number; player: string; assist?: string }[]
  stats: { label: string; home: string | number; away: string | number }[]
  mvp?: { name: string; team: string; rating: number; photo?: string }
}

export const getMatchSummary = unstable_cache(
  async (fixtureId: number): Promise<MatchSummary | null> => {
    const [fxRes, evRes, stRes, plRes] = await Promise.all([
      apiFetch<ApiFixture[]>(`/fixtures?id=${fixtureId}`),
      apiFetch<Array<Record<string, any>>>(`/fixtures/events?fixture=${fixtureId}`),
      apiFetch<Array<Record<string, any>>>(`/fixtures/statistics?fixture=${fixtureId}`),
      apiFetch<Array<Record<string, any>>>(`/fixtures/players?fixture=${fixtureId}`),
    ])
    const fx = fxRes.response?.[0]
    if (!fx) return null
    const scorers = (evRes.response ?? [])
      .filter(e => e.type === 'Goal' && e.detail !== 'Missed Penalty')
      .map(e => ({ minute: e.time?.elapsed ?? 0, teamId: e.team?.id, player: e.player?.name ?? '', assist: e.assist?.name ?? undefined }))
    const wanted = ['Ball Possession', 'Total Shots', 'Shots on Goal', 'Corner Kicks', 'Fouls']
    const labelEs: Record<string, string> = { 'Ball Possession': 'Posesión', 'Total Shots': 'Tiros', 'Shots on Goal': 'A puerta', 'Corner Kicks': 'Córners', 'Fouls': 'Faltas' }
    const sHome = stRes.response?.[0]?.statistics ?? []
    const sAway = stRes.response?.[1]?.statistics ?? []
    const stat = (arr: any[], type: string) => arr.find((s: any) => s.type === type)?.value ?? '—'
    const stats = wanted.map(t => ({ label: labelEs[t] ?? t, home: stat(sHome, t) ?? '—', away: stat(sAway, t) ?? '—' }))
    // MVP = highest match rating across both teams.
    let mvp: MatchSummary['mvp']
    for (const team of plRes.response ?? []) {
      for (const p of team.players ?? []) {
        const r = parseFloat(p.statistics?.[0]?.games?.rating ?? '0')
        if (r && (!mvp || r > mvp.rating)) mvp = { name: p.player?.name ?? '', team: team.team?.name ?? '', rating: Math.round(r * 100) / 100, photo: p.player?.photo }
      }
    }
    return {
      date: fx.fixture.date,
      status: fx.fixture.status.short,
      venue: fx.fixture.venue?.name,
      league: fx.league.name,
      round: fx.league.round,
      home: { id: fx.teams.home.id, name: fx.teams.home.name, logo: fx.teams.home.logo, goals: fx.goals.home },
      away: { id: fx.teams.away.id, name: fx.teams.away.name, logo: fx.teams.away.logo, goals: fx.goals.away },
      scorers, stats, mvp,
    }
  },
  ['api-football-match-summary'],
  { revalidate: 21600, tags: ['api-football'] } // 6 h — a played match's summary never changes
)

// All standings groups (e.g. World Cup groups A–L), not just the first one.
export const getAllStandings = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiStandingEntry[][]> => {
    const data = await apiFetch<Array<{ league: { standings: ApiStandingEntry[][] } }>>(
      `/standings?league=${leagueId}&season=${season}`
    )
    return data.response?.[0]?.league?.standings ?? []
  },
  ['api-football-all-standings'],
  { revalidate: 21600, tags: ['api-football'] }
)

export const getFixtures = unstable_cache(
  async (leagueId: number, season: number = 2025, last: number = 10): Promise<ApiFixture[]> => {
    const data = await apiFetch<ApiFixture[]>(
      `/fixtures?league=${leagueId}&season=${season}&last=${last}`
    )
    return data.response ?? []
  },
  ['api-football-fixtures'],
  { revalidate: 86400, tags: ['api-football'] } // 24 h — past fixtures never change
)

// All of one team's fixtures this season (one call). The team page splits them
// into recent results (status FT/AET/PEN) and upcoming (NS/TBD) itself. Cached
// 3h so newly-played scores and reschedules surface.
export const getTeamFixtures = unstable_cache(
  async (teamId: number, season: number = 2025): Promise<ApiFixture[]> => {
    try {
      const data = await apiFetch<ApiFixture[]>(`/fixtures?team=${teamId}&season=${season}`)
      return data.response ?? []
    } catch {
      return []
    }
  },
  ['api-football-team-fixtures'],
  { revalidate: 10800, tags: ['api-football'] } // 3 h
)

export const getNextFixtures = unstable_cache(
  async (leagueId: number, season: number = 2025, next: number = 5): Promise<ApiFixture[]> => {
    const data = await apiFetch<ApiFixture[]>(
      `/fixtures?league=${leagueId}&season=${season}&next=${next}`
    )
    return data.response ?? []
  },
  ['api-football-next-fixtures'],
  { revalidate: 10800, tags: ['api-football'] } // 3 h — kickoff times rarely shift same-day
)

// Whole-season fixtures (every round/matchday). One API call; grouped by
// `league.round` on the client for the round-by-round view.
export const getAllFixtures = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiFixture[]> => {
    const data = await apiFetch<ApiFixture[]>(
      `/fixtures?league=${leagueId}&season=${season}`
    )
    return data.response ?? []
  },
  ['api-football-all-fixtures'],
  { revalidate: 21600, tags: ['api-football'] } // 6 h
)

// ─── Extended player detail type ─────────────────────────────────────────────

export interface ApiPlayerDetail {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    age: number
    birth: { date: string; place: string; country: string }
    nationality: string
    height: string
    weight: string
    injured: boolean
    photo: string
  }
  statistics: Array<{
    team: { id: number; name: string; logo: string }
    league: { id: number; name: string; country: string; logo: string; season: number }
    games: {
      appearences: number
      lineups: number
      minutes: number
      rating: string | null
      captain: boolean
    }
    substitutes: { in: number; out: number; bench: number }
    shots: { total: number | null; on: number | null }
    goals: { total: number; conceded: number; assists: number | null; saves: number | null }
    passes: { total: number | null; key: number | null; accuracy: number | null }
    tackles: { total: number | null; blocks: number | null; interceptions: number | null }
    duels: { total: number | null; won: number | null }
    dribbles: { attempts: number | null; success: number | null }
    fouls: { drawn: number | null; committed: number | null }
    cards: { yellow: number; yellowred: number; red: number }
    penalty: { won: number | null; scored: number; missed: number; saved: number | null }
  }>
}

export async function getPlayerDetails(
  playerId: number,
  season: number = 2025
): Promise<ApiPlayerDetail | null> {
  return unstable_cache(
    async () => {
      try {
        const data = await apiFetch<ApiPlayerDetail[]>(
          `/players?id=${playerId}&season=${season}`
        )
        return data.response?.[0] ?? null
      } catch {
        return null
      }
    },
    [`api-football-player-detail-${playerId}-${season}`],
    { revalidate: 21600, tags: ['api-football'] } // 6 h — bio never changes; stats update at most once a day (per match)
  )()
}

// Base player profile (identity only, no season stats) via /players/profiles.
// Used as a fallback so a real player id whose current season has no stats
// (youth, deep reserves, just-signed) still opens a profile instead of 404ing.
export interface ApiPlayerProfile {
  id: number
  name: string
  firstname: string | null
  lastname: string | null
  age: number | null
  birth: { date: string | null; place: string | null; country: string | null }
  nationality: string | null
  height: string | null
  weight: string | null
  number: number | null
  position: string | null
  photo: string | null
}
export const getPlayerProfile = unstable_cache(
  async (playerId: number): Promise<ApiPlayerProfile | null> => {
    try {
      const data = await apiFetch<Array<{ player: ApiPlayerProfile }>>(`/players/profiles?player=${playerId}`)
      return data.response?.[0]?.player ?? null
    } catch {
      return null
    }
  },
  ['api-football-player-profile'],
  { revalidate: 604800, tags: ['api-football'] } // 7 d — identity is static
)

// ─── Injuries (current season) + sidelined (injury/suspension history) ───────
// `/injuries?player=&season=` → current-season injury records (type, reason,
// the fixture/league/date it was reported). `/sidelined?player=` → the player's
// full sidelined timeline (injuries AND suspensions, with start/end dates).
// Both fully defensive (→ []), so the UI hides the section on any error or when
// the player has no records. Season data: revalidate 6 h.

export interface PlayerInjury {
  type: string            // e.g. "Knee Injury", "Suspended"
  reason: string          // free-text reason from the API
  date: string            // ISO fixture date the record refers to
  league: string
}

export interface SidelinedEntry {
  type: string            // "Knee Surgery", "Suspended", "Calf Injury"…
  start: string           // ISO date (YYYY-MM-DD)
  end: string | null      // ISO date or null if ongoing
}

export const getPlayerInjuries = unstable_cache(
  async (playerId: number, season: number = 2025): Promise<PlayerInjury[]> => {
    try {
      const data = await apiFetch<Array<{
        player?: { type?: string; reason?: string }
        fixture?: { date?: string }
        league?: { name?: string }
      }>>(`/injuries?player=${playerId}&season=${season}`)
      return (data.response ?? []).map(r => ({
        type: r.player?.type ?? '',
        reason: r.player?.reason ?? '',
        date: r.fixture?.date ?? '',
        league: r.league?.name ?? '',
      }))
    } catch {
      return []
    }
  },
  ['api-football-injuries'],
  { revalidate: 21600, tags: ['api-football'] } // 6 h
)

// League-wide injuries (e.g. World Cup 2026 = league 1) grouped by national
// team. `/injuries?league=&season=` returns one record per affected player with
// the team they belong to + the injury type/reason. Empty before the tournament
// (the UI then shows a graceful empty state). Defensive (→ []). Cached 6 h.

export interface TeamInjury {
  playerId: number
  player: string
  photo: string
  type: string            // "Missing Fixture" | "Questionable" | reason category
  reason: string          // free-text reason from the API
}

export interface TeamInjuryGroup {
  teamId: number
  team: string
  teamLogo: string
  players: TeamInjury[]
}

export const getLeagueInjuries = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<TeamInjuryGroup[]> => {
    try {
      const data = await apiFetch<Array<{
        player?: { id?: number; name?: string; photo?: string; type?: string; reason?: string }
        team?: { id?: number; name?: string; logo?: string }
      }>>(`/injuries?league=${leagueId}&season=${season}`)
      const byTeam = new Map<number, TeamInjuryGroup>()
      const seen = new Set<string>() // dedupe player×reason rows the API can repeat per fixture
      for (const r of data.response ?? []) {
        const teamId = r.team?.id
        const playerId = r.player?.id
        if (teamId == null || playerId == null) continue
        const key = `${playerId}|${r.player?.reason ?? ''}`
        if (seen.has(key)) continue
        seen.add(key)
        let g = byTeam.get(teamId)
        if (!g) {
          g = { teamId, team: r.team?.name ?? '', teamLogo: r.team?.logo ?? '', players: [] }
          byTeam.set(teamId, g)
        }
        g.players.push({
          playerId,
          player: r.player?.name ?? '',
          photo: r.player?.photo ?? '',
          type: r.player?.type ?? '',
          reason: r.player?.reason ?? '',
        })
      }
      return [...byTeam.values()].sort((a, b) => a.team.localeCompare(b.team))
    } catch {
      return []
    }
  },
  ['api-football-league-injuries'],
  { revalidate: 21600, tags: ['api-football'] } // 6 h
)

export const getPlayerSidelined = unstable_cache(
  async (playerId: number): Promise<SidelinedEntry[]> => {
    try {
      const data = await apiFetch<Array<{ type?: string; start?: string; end?: string | null }>>(
        `/sidelined?player=${playerId}`
      )
      return (data.response ?? [])
        .map(r => ({ type: r.type ?? '', start: r.start ?? '', end: r.end ?? null }))
        .filter(r => r.type || r.start)
        .sort((a, b) => (b.start || '').localeCompare(a.start || '')) // newest first
    } catch {
      return []
    }
  },
  ['api-football-sidelined'],
  { revalidate: 86400, tags: ['api-football'] } // 24 h — history changes rarely
)

export async function searchPlayer(name: string, season: number = 2025): Promise<ApiPlayerResponse[]> {
  return unstable_cache(
    async () => {
      const data = await apiFetch<ApiPlayerResponse[]>(
        `/players?search=${encodeURIComponent(name)}&season=${season}`
      )
      return data.response ?? []
    },
    [`api-football-player-search-${name.toLowerCase().replace(/\s+/g, '-')}-${season}`],
    { revalidate: 21600, tags: ['api-football'] } // 6 h — search results are near-static
  )()
}

// ─── Transfers ───────────────────────────────────────────────────────────────

export interface ApiTransfer {
  player: { id: number; name: string; photo: string }
  update: string
  transfers: Array<{
    date: string
    type: string // 'Free', '€Xm', 'Loan', 'N/A'
    teams: {
      in:  { id: number; name: string; logo: string }
      out: { id: number; name: string; logo: string }
    }
  }>
}

export async function getTransfersByTeam(teamId: number): Promise<ApiTransfer[]> {
  return unstable_cache(
    async () => {
      try {
        const data = await apiFetch<ApiTransfer[]>(`/transfers?team=${teamId}`)
        return data.response ?? []
      } catch {
        return [] // defensive: a 429/5xx must never crash the caller (page/build)
      }
    },
    [`api-football-transfers-team-${teamId}`],
    { revalidate: 21600, tags: ['api-football'] } // 6 h — signings don't need hourly refresh
  )()
}

// ─── National teams (World Cup 2026 squad profiles) ──────────────────────────
// Resolve a country name → its national team id, then squad + coach. All cached
// long (squads/coaches change rarely) and fully defensive: any error → null/[]
// so the page degrades to a "coming soon / data unavailable" state, never 500.

export interface SquadPlayer {
  id: number
  name: string
  age: number | null
  number: number | null
  position: string   // "Goalkeeper" | "Defender" | "Midfielder" | "Attacker"
  photo: string
}

export interface NationalCoach {
  id: number
  name: string
  age: number | null
  nationality: string | null
  photo: string
}

// API-Football expects a specific country name in /teams?name=, but our slugs
// arrive in many forms: the editorial WC table's `api` field, a slugified
// Spanish/English display name, or a slugified API *team* name coming straight
// from a standings/fixtures row ("Korea Republic", "IR Iran", "USA"). Map the
// common variants to the name(s) API-Football actually indexes, so every real
// nation resolves instead of 404-ing. Keyed by normalized lowercase.
const _nnorm = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

// alias → ordered list of names to try against /teams?name= (best first).
const NATIONAL_TEAM_ALIASES: Record<string, string[]> = {}
const aliasNation = (canonical: string, ...aliases: string[]) => {
  for (const a of [canonical, ...aliases]) NATIONAL_TEAM_ALIASES[_nnorm(a)] = [canonical, ...aliases]
}
aliasNation('USA', 'United States', 'United States of America', 'Estados Unidos', 'US')
aliasNation('South Korea', 'Korea Republic', 'Republic of Korea', 'Corea del Sur', 'Korea South')
aliasNation('North Korea', 'Korea DPR', 'Korea North')
aliasNation('Ivory Coast', "Cote d'Ivoire", 'Côte d’Ivoire', 'Costa de Marfil')
aliasNation('DR Congo', 'Congo DR', 'Democratic Republic of Congo', 'Congo Kinshasa')
aliasNation('Congo', 'Congo Republic', 'Republic of Congo', 'Congo Brazzaville')
aliasNation('Bosnia and Herzegovina', 'Bosnia', 'Bosnia & Herzegovina', 'Bosnia-Herzegovina')
aliasNation('Turkey', 'Türkiye', 'Turkiye', 'Turquia', 'Turquía')
aliasNation('Iran', 'IR Iran', 'Islamic Republic of Iran')
aliasNation('Saudi Arabia', 'Arabia Saudi', 'Arabia Saudí', 'KSA', 'Saudi')
aliasNation('Czech Republic', 'Czechia', 'Czech-Republic', 'Chequia')
aliasNation('Tunisia', 'Túnez', 'Tunez')
aliasNation('Egypt', 'Egipto')
aliasNation('Iraq', 'Irak')
aliasNation('Austria', 'Österreich', 'Osterreich')
aliasNation('Croatia', 'Hrvatska', 'Croacia')
aliasNation('Switzerland', 'Suiza', 'Schweiz', 'Svizzera')
aliasNation('Cape Verde', 'Cabo Verde')
aliasNation('North Macedonia', 'Macedonia', 'FYR Macedonia')
aliasNation('Netherlands', 'Holland', 'Holanda', 'Paises Bajos', 'Países Bajos')
aliasNation('England', 'Inglaterra')
aliasNation('Wales', 'Gales')
aliasNation('Germany', 'Alemania', 'Deutschland')
aliasNation('Spain', 'España', 'Espana')
aliasNation('France', 'Francia')
aliasNation('Brazil', 'Brasil')
aliasNation('Mexico', 'México')
aliasNation('Canada', 'Canadá')
aliasNation('Japan', 'Japón', 'Japon')

// Build the ordered list of candidate /teams?name= queries for an input.
function nationCandidates(country: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const push = (s?: string) => { const v = (s ?? '').trim(); const k = _nnorm(v); if (v && !seen.has(k)) { seen.add(k); out.push(v) } }
  push(country)                                  // as given (usually the right one)
  for (const alt of NATIONAL_TEAM_ALIASES[_nnorm(country)] ?? []) push(alt)
  return out
}

// Country → national team id. API-Football tags national sides with
// `national:true`; among matches for a country name we pick that one. Robust to
// name variants: we try the given name, then known aliases, and only accept a
// team flagged `national:true` (so "Saudi Arabia" doesn't resolve to a club).
export const getNationalTeamId = unstable_cache(
  async (country: string): Promise<number | null> => {
    for (const name of nationCandidates(country)) {
      try {
        const data = await apiFetch<Array<{ team: { id: number; name: string; national: boolean } }>>(
          `/teams?name=${encodeURIComponent(name)}`
        )
        const list = data.response ?? []
        if (list.length === 0) continue
        // Prefer the actual national side; fall back to the first match only when
        // we exhausted aliases (avoids accidentally returning a same-named club).
        const national = list.find(t => t.team?.national)
        if (national?.team?.id != null) return national.team.id
      } catch {
        // try the next candidate
      }
    }
    // Last resort: take whatever the primary name returned, national or not.
    try {
      const data = await apiFetch<Array<{ team: { id: number; name: string; national: boolean } }>>(
        `/teams?name=${encodeURIComponent(nationCandidates(country)[0] ?? country)}`
      )
      return data.response?.[0]?.team?.id ?? null
    } catch {
      return null
    }
  },
  ['api-football-national-team-id'],
  { revalidate: 604800, tags: ['api-football'] } // 7 d — team ids are stable
)

export const getSquad = unstable_cache(
  async (teamId: number): Promise<SquadPlayer[]> => {
    try {
      const data = await apiFetch<Array<{ players: Array<{ id: number; name: string; age: number | null; number: number | null; position: string; photo: string }> }>>(
        `/players/squads?team=${teamId}`
      )
      const players = data.response?.[0]?.players ?? []
      return players.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age ?? null,
        number: p.number ?? null,
        position: p.position ?? '',
        photo: p.photo || apiPhotoUrl(p.id),
      }))
    } catch {
      return []
    }
  },
  ['api-football-squad'],
  { revalidate: 86400, tags: ['api-football'] } // 24 h — squads change rarely
)

export const getCoach = unstable_cache(
  async (teamId: number): Promise<NationalCoach | null> => {
    try {
      const data = await apiFetch<Array<{ id: number; name: string; age: number | null; nationality: string | null; photo: string; team?: { id: number }; career?: Array<{ team?: { id: number }; end: string | null }> }>>(
        `/coachs?team=${teamId}`
      )
      const list = data.response ?? []
      // The endpoint can return past coaches too; prefer the one whose current
      // (end === null) career entry is this team, else first match.
      const current = list.find(c => (c.career ?? []).some(s => s.team?.id === teamId && s.end == null)) ?? list[0]
      if (!current) return null
      return {
        id: current.id,
        name: current.name,
        age: current.age ?? null,
        nationality: current.nationality ?? null,
        photo: current.photo || apiPhotoUrl(current.id, 'coachs'),
      }
    } catch {
      return null
    }
  },
  ['api-football-coach'],
  { revalidate: 86400, tags: ['api-football'] } // 24 h
)

// media.api-sports.io photo URL for a player (or coach) id.
function apiPhotoUrl(id: number, kind: 'players' | 'coachs' = 'players'): string {
  return `https://media.api-sports.io/football/${kind}/${id}.png`
}

// ─── National-team recent XI (who actually plays the big matches) ─────────────
// Builds a per-player profile from the team's last ~10 finished fixtures: how
// often each player started, total minutes, and the most-used formation. This
// powers a "probable XI" that reflects reality (regular starters) rather than
// shirt numbers. Cached 24h, fully defensive (→ null on any failure).

export interface RecentLineupPlayer {
  id: number
  starts: number     // times in the starting XI across recent matches
  minutes: number    // total minutes across recent matches
  position?: string  // grid position line from lineups (G/D/M/F) when available
}

export interface RecentLineups {
  /** player id → aggregated recent usage */
  byPlayer: Record<number, RecentLineupPlayer>
  /** most-used recent formation, e.g. "4-3-3" (null if none reported) */
  formation: string | null
  /** number of finished fixtures actually analysed */
  matches: number
}

export const getNationalTeamRecentLineups = unstable_cache(
  async (teamId: number): Promise<RecentLineups | null> => {
    try {
      const fxRes = await apiFetch<ApiFixture[]>(`/fixtures?team=${teamId}&last=10`)
      const finished = (fxRes.response ?? []).filter(f =>
        ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short),
      )
      if (!finished.length) return null

      const byPlayer: Record<number, RecentLineupPlayer> = {}
      const formationCount = new Map<string, number>()

      // Lineups give us starters + formation; player stats give minutes. We fetch
      // both per fixture (parallel within a fixture), serialising fixtures to be
      // gentle on the rate limit. Each fixture is best-effort.
      for (const f of finished) {
        const fid = f.fixture.id
        try {
          const [luRes, plRes] = await Promise.all([
            apiFetch<Array<{ team: { id: number }; formation: string | null; startXI: Array<{ player: { id: number; pos: string | null } }> }>>(
              `/fixtures/lineups?fixture=${fid}`,
            ),
            apiFetch<Array<{ team: { id: number }; players: Array<{ player: { id: number }; statistics: Array<{ games?: { minutes: number | null } }> }> }>>(
              `/fixtures/players?fixture=${fid}`,
            ),
          ])
          const lu = (luRes.response ?? []).find(l => l.team?.id === teamId)
          if (lu?.formation) formationCount.set(lu.formation, (formationCount.get(lu.formation) ?? 0) + 1)
          for (const s of lu?.startXI ?? []) {
            const pid = s.player?.id
            if (!pid) continue
            const rec = (byPlayer[pid] ??= { id: pid, starts: 0, minutes: 0 })
            rec.starts++
            if (s.player.pos && !rec.position) rec.position = s.player.pos
          }
          const pl = (plRes.response ?? []).find(p => p.team?.id === teamId)
          for (const p of pl?.players ?? []) {
            const pid = p.player?.id
            if (!pid) continue
            const mins = Number(p.statistics?.[0]?.games?.minutes ?? 0) || 0
            const rec = (byPlayer[pid] ??= { id: pid, starts: 0, minutes: 0 })
            rec.minutes += mins
          }
        } catch { /* skip a fixture that errors */ }
      }

      if (Object.keys(byPlayer).length === 0) return null
      const formation = [...formationCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
      return { byPlayer, formation, matches: finished.length }
    } catch {
      return null
    }
  },
  ['api-football-recent-lineups'],
  { revalidate: 86400, tags: ['api-football'] }, // 24 h
)

// ─── National-team aggregate stats (FootyStats-style %) ───────────────────────
// Aggregated from the same recent finished fixtures: win/draw/loss %, clean
// sheets, goals for/against per match, plus form string (last 5, newest last).
// Cached 24h, defensive (→ null).

export interface TeamAggregateStats {
  played: number
  winPct: number
  drawPct: number
  lossPct: number
  cleanSheetPct: number
  goalsForAvg: number
  goalsAgainstAvg: number
  bttsPct: number          // both teams to score %
  form: string             // e.g. "WWDLW" (oldest → newest)
}

export const getNationalTeamAggregateStats = unstable_cache(
  async (teamId: number): Promise<TeamAggregateStats | null> => {
    try {
      const fxRes = await apiFetch<ApiFixture[]>(`/fixtures?team=${teamId}&last=10`)
      const finished = (fxRes.response ?? [])
        .filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short))
        .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp) // oldest → newest
      const n = finished.length
      if (!n) return null

      let win = 0, draw = 0, loss = 0, cs = 0, gf = 0, ga = 0, btts = 0
      let form = ''
      for (const f of finished) {
        const home = f.teams.home.id === teamId
        const us = (home ? f.goals.home : f.goals.away) ?? 0
        const them = (home ? f.goals.away : f.goals.home) ?? 0
        gf += us; ga += them
        if (them === 0) cs++
        if (us > 0 && them > 0) btts++
        if (us > them) { win++; form += 'W' }
        else if (us < them) { loss++; form += 'L' }
        else { draw++; form += 'D' }
      }
      const pct = (x: number) => Math.round((x / n) * 100)
      return {
        played: n,
        winPct: pct(win), drawPct: pct(draw), lossPct: pct(loss),
        cleanSheetPct: pct(cs), bttsPct: pct(btts),
        goalsForAvg: Math.round((gf / n) * 100) / 100,
        goalsAgainstAvg: Math.round((ga / n) * 100) / 100,
        form: form.slice(-5),
      }
    } catch {
      return null
    }
  },
  ['api-football-team-agg-stats'],
  { revalidate: 86400, tags: ['api-football'] }, // 24 h
)

// ─── Team season statistics (/teams/statistics) ───────────────────────────────
// Far richer than aggregating fixtures: form string, W/D/L split home/away/total,
// goals for/against averages, clean-sheet & failed-to-score counts, biggest wins
// and streaks, cards by minute interval, and which lineups (formations) were used.
// Requires team + league + season. Fully defensive (→ null). Cached 24 h.

export interface TeamSeasonStats {
  form: string                       // e.g. "WWDLW" (chronological)
  fixtures: {
    played: { home: number; away: number; total: number }
    wins: { home: number; away: number; total: number }
    draws: { home: number; away: number; total: number }
    loses: { home: number; away: number; total: number }
  }
  goalsForAvg: { home: string; away: string; total: string }
  goalsAgainstAvg: { home: string; away: string; total: string }
  cleanSheet: { home: number; away: number; total: number }
  failedToScore: { home: number; away: number; total: number }
  biggestWinHome: string | null      // "4-0"
  biggestWinAway: string | null
  biggestStreak: { wins: number; draws: number; loses: number }
  cardsYellow: Record<string, number>  // minute bucket "0-15" → count
  cardsRed: Record<string, number>
  lineups: { formation: string; played: number }[]  // formations used, most-used first
  leagueName: string
  season: number
}

export const getTeamSeasonStats = unstable_cache(
  async (teamId: number, leagueId: number, season: number = 2025): Promise<TeamSeasonStats | null> => {
    try {
      const data = await apiFetch<Record<string, any>>(
        `/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`
      )
      const r = data.response as Record<string, any> | undefined
      if (!r || !r.fixtures) return null
      // A team that played zero matches in this league/season → not useful.
      if ((r.fixtures?.played?.total ?? 0) === 0) return null
      const cardBuckets = (obj: Record<string, any> | undefined): Record<string, number> => {
        const out: Record<string, number> = {}
        for (const [k, v] of Object.entries(obj ?? {})) {
          const total = (v as { total?: number | null })?.total
          if (total != null) out[k] = total
        }
        return out
      }
      const lineups = ((r.lineups ?? []) as Array<{ formation?: string; played?: number }>)
        .filter(l => l.formation && (l.played ?? 0) > 0)
        .map(l => ({ formation: l.formation as string, played: l.played as number }))
        .sort((a, b) => b.played - a.played)
      return {
        form: typeof r.form === 'string' ? r.form : '',
        fixtures: {
          played: r.fixtures?.played ?? { home: 0, away: 0, total: 0 },
          wins: r.fixtures?.wins ?? { home: 0, away: 0, total: 0 },
          draws: r.fixtures?.draws ?? { home: 0, away: 0, total: 0 },
          loses: r.fixtures?.loses ?? { home: 0, away: 0, total: 0 },
        },
        goalsForAvg: r.goals?.for?.average ?? { home: '0', away: '0', total: '0' },
        goalsAgainstAvg: r.goals?.against?.average ?? { home: '0', away: '0', total: '0' },
        cleanSheet: r.clean_sheet ?? { home: 0, away: 0, total: 0 },
        failedToScore: r.failed_to_score ?? { home: 0, away: 0, total: 0 },
        biggestWinHome: r.biggest?.wins?.home ?? null,
        biggestWinAway: r.biggest?.wins?.away ?? null,
        biggestStreak: r.biggest?.streak ?? { wins: 0, draws: 0, loses: 0 },
        cardsYellow: cardBuckets(r.cards?.yellow),
        cardsRed: cardBuckets(r.cards?.red),
        lineups,
        leagueName: r.league?.name ?? '',
        season: r.league?.season ?? season,
      }
    } catch {
      return null
    }
  },
  ['api-football-team-statistics'],
  { revalidate: 86400, tags: ['api-football'] } // 24 h
)

// National-team season stats: discover the most-recent league+season the team
// actually competed in (WC qualifiers, Nations League, friendlies league, etc.)
// from its recent fixtures, then call /teams/statistics for it. National sides
// have no single "domestic league", so this picks the most-played competition
// in the latest season seen. Defensive (→ null). One discovery call + one stats
// call, both cached. Cached 24 h.
export const getNationalTeamSeasonStats = unstable_cache(
  async (teamId: number): Promise<TeamSeasonStats | null> => {
    try {
      const fxRes = await apiFetch<ApiFixture[]>(`/fixtures?team=${teamId}&last=30`)
      const finished = (fxRes.response ?? []).filter(f =>
        ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short),
      )
      if (!finished.length) return null
      // Latest season among recent fixtures, then the competition played most in it.
      const seasonOf = (f: ApiFixture) => new Date(f.fixture.date).getUTCFullYear()
      const latestSeason = Math.max(...finished.map(seasonOf))
      const inSeason = finished.filter(f => seasonOf(f) === latestSeason)
      const byLeague = new Map<number, number>()
      for (const f of inSeason) byLeague.set(f.league.id, (byLeague.get(f.league.id) ?? 0) + 1)
      const leagueId = [...byLeague.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
      if (!leagueId) return null
      return await getTeamSeasonStats(teamId, leagueId, latestSeason)
    } catch {
      return null
    }
  },
  ['api-football-national-team-statistics'],
  { revalidate: 86400, tags: ['api-football'] } // 24 h
)

// ─── Match prediction (/predictions) ──────────────────────────────────────────
// Win/draw/loss percentages, a textual advice, and a compact form comparison for
// an UPCOMING fixture. The API only returns meaningful predictions for fixtures
// that haven't been played; for finished/absent fixtures we return null and the
// UI shows nothing. Defensive (→ null). Cached 1 h (predictions can shift as the
// match approaches).

export interface FixturePrediction {
  homePct: number          // win probability home (0–100)
  drawPct: number
  awayPct: number
  advice: string           // e.g. "Combo Double chance : Spain or draw"
  winnerName: string | null
  homeName: string
  awayName: string
  homeForm: string | null  // recent form % string from the API ("60%")
  awayForm: string | null
}

const pctNum = (s: unknown): number => {
  const n = parseInt(String(s ?? '').replace('%', ''), 10)
  return Number.isFinite(n) ? n : 0
}

export const getFixturePrediction = unstable_cache(
  async (fixtureId: number): Promise<FixturePrediction | null> => {
    try {
      const data = await apiFetch<Array<{
        predictions?: { percent?: { home?: string; draw?: string; away?: string }; advice?: string; winner?: { name?: string | null } | null }
        teams?: { home?: { name?: string; last_5?: { form?: string } }; away?: { name?: string; last_5?: { form?: string } } }
      }>>(`/predictions?fixture=${fixtureId}`)
      const r = data.response?.[0]
      const pc = r?.predictions?.percent
      if (!r || !pc) return null
      const homePct = pctNum(pc.home), drawPct = pctNum(pc.draw), awayPct = pctNum(pc.away)
      // No usable probabilities → nothing to show.
      if (homePct + drawPct + awayPct === 0) return null
      return {
        homePct, drawPct, awayPct,
        advice: r.predictions?.advice ?? '',
        winnerName: r.predictions?.winner?.name ?? null,
        homeName: r.teams?.home?.name ?? '',
        awayName: r.teams?.away?.name ?? '',
        homeForm: r.teams?.home?.last_5?.form ?? null,
        awayForm: r.teams?.away?.last_5?.form ?? null,
      }
    } catch {
      return null
    }
  },
  ['api-football-prediction'],
  { revalidate: 21600, tags: ['api-football'] } // 6 h — bookmaker odds are set pre-match, no need for hourly
)

// ─── Head-to-head (/fixtures/headtohead) ──────────────────────────────────────
// Recent meetings between two teams + an aggregate W/D/L tally from this team's
// perspective (relative to teamAId). Used in a match preview/summary. Defensive
// (→ null). Cached 24 h (past meetings never change).

export interface HeadToHead {
  total: number
  aWins: number            // wins for teamAId
  bWins: number            // wins for teamBId
  draws: number
  recent: {                // most recent meetings (newest first)
    date: string
    league: string
    homeId: number
    homeName: string
    awayId: number
    awayName: string
    homeGoals: number | null
    awayGoals: number | null
  }[]
}

export const getHeadToHead = unstable_cache(
  async (teamAId: number, teamBId: number): Promise<HeadToHead | null> => {
    try {
      const data = await apiFetch<ApiFixture[]>(`/fixtures/headtohead?h2h=${teamAId}-${teamBId}&last=20`)
      const list = (data.response ?? []).filter(f =>
        ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short),
      )
      if (!list.length) return null
      let aWins = 0, bWins = 0, draws = 0
      for (const f of list) {
        const h = f.goals.home ?? 0, a = f.goals.away ?? 0
        const aIsHome = f.teams.home.id === teamAId
        const aGoals = aIsHome ? h : a
        const bGoals = aIsHome ? a : h
        if (aGoals > bGoals) aWins++
        else if (aGoals < bGoals) bWins++
        else draws++
      }
      const recent = [...list]
        .sort((x, y) => y.fixture.timestamp - x.fixture.timestamp)
        .slice(0, 6)
        .map(f => ({
          date: f.fixture.date,
          league: f.league.name,
          homeId: f.teams.home.id,
          homeName: f.teams.home.name,
          awayId: f.teams.away.id,
          awayName: f.teams.away.name,
          homeGoals: f.goals.home,
          awayGoals: f.goals.away,
        }))
      return { total: list.length, aWins, bWins, draws, recent }
    } catch {
      return null
    }
  },
  ['api-football-h2h'],
  { revalidate: 86400, tags: ['api-football'] } // 24 h
)

// ─── Most-booked ranking (/players/topyellowcards) ────────────────────────────
// Top yellow-carded players in a league/season. Defensive (→ []). Cached 6 h.

export interface BookedPlayer {
  id: number
  name: string
  photo: string
  team: string
  yellow: number
  red: number
}

export const getTopYellowCards = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<BookedPlayer[]> => {
    try {
      const data = await apiFetch<ApiPlayerDetail[]>(`/players/topyellowcards?league=${leagueId}&season=${season}`)
      return (data.response ?? []).slice(0, 10).map(r => {
        const st = r.statistics?.[0]
        return {
          id: r.player?.id,
          name: r.player?.name ?? '',
          photo: r.player?.photo ?? '',
          team: st?.team?.name ?? '',
          yellow: Number(st?.cards?.yellow ?? 0) + Number(st?.cards?.yellowred ?? 0),
          red: Number(st?.cards?.red ?? 0),
        }
      })
    } catch {
      return []
    }
  },
  ['api-football-topyellowcards'],
  { revalidate: 21600, tags: ['api-football'] } // 6 h
)

// ─── Single-fixture detail (match page) ───────────────────────────────────────
// Lineups, timeline events, per-player match stats/ratings and team statistics
// for ONE fixture. All short TTL (300 s) since a match can be live. All fully
// defensive (→ [] / null), so a scheduled match (no data yet) or a transient API
// error degrades to a graceful empty state and never 500s the page.

export interface FixtureTeamRef {
  id: number
  name: string
  logo: string
  winner: boolean | null
}

// One starting-XI / bench entry from /fixtures/lineups.
export interface LineupPlayer {
  id: number | null
  name: string
  number: number | null
  pos: string | null        // "G" | "D" | "M" | "F"
  grid: string | null       // "1:1" row:col on the pitch (startXI only)
}

export interface FixtureLineup {
  teamId: number
  teamName: string
  teamLogo: string
  formation: string | null
  coach: string | null
  startXI: LineupPlayer[]
  substitutes: LineupPlayer[]
}

export const getFixtureLineups = unstable_cache(
  async (fixtureId: number): Promise<FixtureLineup[]> => {
    try {
      const data = await apiFetch<Array<{
        team?: { id?: number; name?: string; logo?: string }
        formation?: string | null
        coach?: { name?: string | null }
        startXI?: Array<{ player?: { id?: number | null; name?: string; number?: number | null; pos?: string | null; grid?: string | null } }>
        substitutes?: Array<{ player?: { id?: number | null; name?: string; number?: number | null; pos?: string | null; grid?: string | null } }>
      }>>(`/fixtures/lineups?fixture=${fixtureId}`)
      const mapP = (x: { player?: { id?: number | null; name?: string; number?: number | null; pos?: string | null; grid?: string | null } }): LineupPlayer => ({
        id: x.player?.id ?? null,
        name: x.player?.name ?? '',
        number: x.player?.number ?? null,
        pos: x.player?.pos ?? null,
        grid: x.player?.grid ?? null,
      })
      return (data.response ?? []).map(l => ({
        teamId: l.team?.id ?? 0,
        teamName: l.team?.name ?? '',
        teamLogo: l.team?.logo ?? '',
        formation: l.formation ?? null,
        coach: l.coach?.name ?? null,
        startXI: (l.startXI ?? []).map(mapP),
        substitutes: (l.substitutes ?? []).map(mapP),
      }))
    } catch {
      return []
    }
  },
  ['api-football-fixture-lineups'],
  { revalidate: 300, tags: ['api-football'] } // 5 min — can be live
)

// One timeline event from /fixtures/events (goal, card, subst, VAR).
export interface FixtureEvent {
  minute: number
  extra: number | null      // added-time minutes (e.g. 90+3 → 3)
  teamId: number
  teamName: string
  player: string
  assist: string | null     // assist (goal) OR player coming ON (subst)
  type: string              // "Goal" | "Card" | "subst" | "Var"
  detail: string            // "Normal Goal" | "Yellow Card" | "Substitution 1"…
  comments: string | null
}

export const getFixtureEvents = unstable_cache(
  async (fixtureId: number): Promise<FixtureEvent[]> => {
    try {
      const data = await apiFetch<Array<{
        time?: { elapsed?: number | null; extra?: number | null }
        team?: { id?: number; name?: string }
        player?: { name?: string | null }
        assist?: { name?: string | null }
        type?: string
        detail?: string
        comments?: string | null
      }>>(`/fixtures/events?fixture=${fixtureId}`)
      return (data.response ?? [])
        .map(e => ({
          minute: e.time?.elapsed ?? 0,
          extra: e.time?.extra ?? null,
          teamId: e.team?.id ?? 0,
          teamName: e.team?.name ?? '',
          player: e.player?.name ?? '',
          assist: e.assist?.name ?? null,
          type: e.type ?? '',
          detail: e.detail ?? '',
          comments: e.comments ?? null,
        }))
        .sort((a, b) => (a.minute + (a.extra ?? 0)) - (b.minute + (b.extra ?? 0)))
    } catch {
      return []
    }
  },
  ['api-football-fixture-events'],
  { revalidate: 300, tags: ['api-football'] } // 5 min — can be live
)

// Per-player match stats/ratings from /fixtures/players, grouped by team.
export interface FixturePlayerStat {
  id: number | null
  name: string
  number: number | null
  photo: string
  rating: number | null
  minutes: number | null
  goals: number | null
  assists: number | null
  shotsTotal: number | null
  shotsOn: number | null
  passes: number | null
  passAccuracy: number | null
  captain: boolean
}

export interface FixturePlayersGroup {
  teamId: number
  teamName: string
  teamLogo: string
  players: FixturePlayerStat[]
}

export const getFixturePlayers = unstable_cache(
  async (fixtureId: number): Promise<FixturePlayersGroup[]> => {
    try {
      const data = await apiFetch<Array<{
        team?: { id?: number; name?: string; logo?: string }
        players?: Array<{
          player?: { id?: number | null; name?: string; photo?: string }
          statistics?: Array<Record<string, any>>
        }>
      }>>(`/fixtures/players?fixture=${fixtureId}`)
      return (data.response ?? []).map(g => ({
        teamId: g.team?.id ?? 0,
        teamName: g.team?.name ?? '',
        teamLogo: g.team?.logo ?? '',
        players: (g.players ?? []).map(p => {
          const s = p.statistics?.[0] ?? {}
          const r = s.games?.rating != null ? Number(s.games.rating) : null
          return {
            id: p.player?.id ?? null,
            name: p.player?.name ?? '',
            number: s.games?.number ?? null,
            photo: p.player?.photo ?? '',
            rating: r != null && Number.isFinite(r) ? Math.round(r * 100) / 100 : null,
            minutes: s.games?.minutes ?? null,
            goals: s.goals?.total ?? null,
            assists: s.goals?.assists ?? null,
            shotsTotal: s.shots?.total ?? null,
            shotsOn: s.shots?.on ?? null,
            passes: s.passes?.total ?? null,
            passAccuracy: s.passes?.accuracy != null ? Number(s.passes.accuracy) : null,
            captain: !!s.games?.captain,
          }
        }),
      }))
    } catch {
      return []
    }
  },
  ['api-football-fixture-players'],
  { revalidate: 300, tags: ['api-football'] } // 5 min — can be live
)

// Raw per-team statistics array from /fixtures/statistics (type/value pairs).
export interface FixtureTeamStatistics {
  teamId: number
  teamName: string
  teamLogo: string
  stats: { type: string; value: string | number | null }[]
}

export const getFixtureStatistics = unstable_cache(
  async (fixtureId: number): Promise<FixtureTeamStatistics[]> => {
    try {
      const data = await apiFetch<Array<{
        team?: { id?: number; name?: string; logo?: string }
        statistics?: Array<{ type?: string; value?: string | number | null }>
      }>>(`/fixtures/statistics?fixture=${fixtureId}`)
      return (data.response ?? []).map(t => ({
        teamId: t.team?.id ?? 0,
        teamName: t.team?.name ?? '',
        teamLogo: t.team?.logo ?? '',
        stats: (t.statistics ?? []).map(s => ({ type: s.type ?? '', value: s.value ?? null })),
      }))
    } catch {
      return []
    }
  },
  ['api-football-fixture-statistics'],
  { revalidate: 300, tags: ['api-football'] } // 5 min — can be live
)

// Single fixture header (teams, score, status, venue, league/round/date).
export const getFixtureById = unstable_cache(
  async (fixtureId: number): Promise<ApiFixture | null> => {
    try {
      const data = await apiFetch<ApiFixture[]>(`/fixtures?id=${fixtureId}`)
      return data.response?.[0] ?? null
    } catch {
      return null
    }
  },
  ['api-football-fixture-by-id'],
  { revalidate: 300, tags: ['api-football'] } // 5 min — can be live
)

// One round-trip for the match-detail page: header + lineups + events + per-player
// stats + team statistics. All pieces independently defensive; `fixture: null`
// signals "fixture not found" so the page can render a graceful not-found state.
export interface MatchDetail {
  fixture: ApiFixture | null
  lineups: FixtureLineup[]
  events: FixtureEvent[]
  players: FixturePlayersGroup[]
  statistics: FixtureTeamStatistics[]
}

export const getMatchDetail = unstable_cache(
  async (fixtureId: number): Promise<MatchDetail> => {
    const [fixture, lineups, events, players, statistics] = await Promise.all([
      getFixtureById(fixtureId),
      getFixtureLineups(fixtureId),
      getFixtureEvents(fixtureId),
      getFixturePlayers(fixtureId),
      getFixtureStatistics(fixtureId),
    ])
    return { fixture, lineups, events, players, statistics }
  },
  ['api-football-match-detail'],
  { revalidate: 300, tags: ['api-football'] } // 5 min — can be live
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLeague(id: number): LeagueMeta | undefined {
  return ALL_LEAGUES.find(l => l.id === id)
}

export function formatMatchDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  })
}

export function getStatusLabel(short: string): string {
  const map: Record<string, string> = {
    FT: 'Final',
    AET: 'Prórroga',
    PEN: 'Penaltis',
    '1H': 'En juego',
    '2H': 'En juego',
    HT: 'Descanso',
    NS: 'Pendiente',
    PST: 'Aplazado',
    CANC: 'Cancelado',
  }
  return map[short] ?? short
}
