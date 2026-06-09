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
  { revalidate: 3600, tags: ['api-football'] } // 1 h — picks up new results
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

// Country → national team id. API-Football tags national sides with
// `national:true`; among matches for a country name we pick that one.
export const getNationalTeamId = unstable_cache(
  async (country: string): Promise<number | null> => {
    try {
      const data = await apiFetch<Array<{ team: { id: number; name: string; national: boolean } }>>(
        `/teams?name=${encodeURIComponent(country)}`
      )
      const list = data.response ?? []
      const national = list.find(t => t.team?.national) ?? list[0]
      return national?.team?.id ?? null
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
  { revalidate: 3600, tags: ['api-football'] } // 1 h
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
