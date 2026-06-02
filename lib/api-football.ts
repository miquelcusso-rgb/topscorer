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
    const data = await apiFetch<ApiPlayerResponse[]>(
      `/players/topscorers?league=${leagueId}&season=${season}`
    )
    return data.response ?? []
  },
  ['api-football-topscorers'],
  { revalidate: 10800, tags: ['api-football'] } // 3 h — scorers change slowly
)

export const getTopAssists = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiPlayerResponse[]> => {
    const data = await apiFetch<ApiPlayerResponse[]>(
      `/players/topassists?league=${leagueId}&season=${season}`
    )
    return data.response ?? []
  },
  ['api-football-topassists'],
  { revalidate: 10800, tags: ['api-football'] } // 3 h — assists change slowly
)

export const getStandings = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiStandingEntry[]> => {
    const data = await apiFetch<Array<{ league: { standings: ApiStandingEntry[][] } }>>(
      `/standings?league=${leagueId}&season=${season}`
    )
    return data.response?.[0]?.league?.standings?.[0] ?? []
  },
  ['api-football-standings'],
  { revalidate: 21600, tags: ['api-football'] } // 6 h — standings update ~weekly
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
  { revalidate: 3600, tags: ['api-football'] }
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

export const getNextFixtures = unstable_cache(
  async (leagueId: number, season: number = 2025, next: number = 5): Promise<ApiFixture[]> => {
    const data = await apiFetch<ApiFixture[]>(
      `/fixtures?league=${leagueId}&season=${season}&next=${next}`
    )
    return data.response ?? []
  },
  ['api-football-next-fixtures'],
  { revalidate: 3600, tags: ['api-football'] } // 1 h — upcoming fixtures may shift
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
    { revalidate: 7200, tags: ['api-football'] } // 2 h — bio never changes, stats update per match
  )()
}

export async function searchPlayer(name: string, season: number = 2025): Promise<ApiPlayerResponse[]> {
  return unstable_cache(
    async () => {
      const data = await apiFetch<ApiPlayerResponse[]>(
        `/players?search=${encodeURIComponent(name)}&season=${season}`
      )
      return data.response ?? []
    },
    [`api-football-player-search-${name.toLowerCase().replace(/\s+/g, '-')}-${season}`],
    { revalidate: 3600, tags: ['api-football'] }
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
      const data = await apiFetch<ApiTransfer[]>(`/transfers?team=${teamId}`)
      return data.response ?? []
    },
    [`api-football-transfers-team-${teamId}`],
    { revalidate: 3600, tags: ['api-football'] }
  )()
}

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
