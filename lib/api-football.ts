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
}

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
  { revalidate: 3600, tags: ['api-football'] }
)

export const getTopAssists = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiPlayerResponse[]> => {
    const data = await apiFetch<ApiPlayerResponse[]>(
      `/players/topassists?league=${leagueId}&season=${season}`
    )
    return data.response ?? []
  },
  ['api-football-topassists'],
  { revalidate: 3600, tags: ['api-football'] }
)

export const getStandings = unstable_cache(
  async (leagueId: number, season: number = 2025): Promise<ApiStandingEntry[]> => {
    const data = await apiFetch<Array<{ league: { standings: ApiStandingEntry[][] } }>>(
      `/standings?league=${leagueId}&season=${season}`
    )
    return data.response?.[0]?.league?.standings?.[0] ?? []
  },
  ['api-football-standings'],
  { revalidate: 3600, tags: ['api-football'] }
)

export const getFixtures = unstable_cache(
  async (leagueId: number, season: number = 2025, last: number = 10): Promise<ApiFixture[]> => {
    const data = await apiFetch<ApiFixture[]>(
      `/fixtures?league=${leagueId}&season=${season}&last=${last}`
    )
    return data.response ?? []
  },
  ['api-football-fixtures'],
  { revalidate: 1800, tags: ['api-football'] }
)

export const getNextFixtures = unstable_cache(
  async (leagueId: number, season: number = 2025, next: number = 5): Promise<ApiFixture[]> => {
    const data = await apiFetch<ApiFixture[]>(
      `/fixtures?league=${leagueId}&season=${season}&next=${next}`
    )
    return data.response ?? []
  },
  ['api-football-next-fixtures'],
  { revalidate: 1800, tags: ['api-football'] }
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLeague(id: number): LeagueMeta | undefined {
  return LEAGUES.find(l => l.id === id)
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
