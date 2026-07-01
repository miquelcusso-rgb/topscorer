import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { canonicalClubName, clubColor } from '@/lib/club-colors'
import { clubLogo } from '@/lib/club-logos'
import { slugify } from '@/lib/slugify'
import { rankScore } from '@/lib/iig'
import { playerSlug } from '@/lib/player-slug'
import { playerPhoto } from '@/lib/player-photo'
import { flagFor } from '@/lib/flags'
import type { PlayerData } from '@/types'

// Team-page data layer. Everything here is derived from the static current-season
// dataset (PRIMARY_PLAYERS) + the club-logos / club-colors maps — no external
// call, so the pages build instantly and stay on the free tier. Richer facts
// (founded, stadium, history, squad value) are fetched lazily client-side via
// /api/team-info. Author: Furiosa Studio.

export interface TeamSquadPlayer {
  name: string
  slug: string
  position: string | null
  photo: string | null
  flag: string | null
  goles: number
  asist: number
  pj: number
  age: number | null
  rating: number | null
}

export interface TeamData {
  name: string          // canonical display name (accent/short-form folded)
  slug: string
  league: string        // raw dataset league string
  crest?: string
  teamId?: number       // api-football team id (extracted from the crest URL)
  accent?: string       // brand colour, when known
  squad: TeamSquadPlayer[]
  totals: { players: number; goals: number; assists: number; avgAge: number | null }
}

/** api-football team id, extracted from the crest URL (…/teams/<id>.png). */
export function teamIdFromCrest(club: string): number | undefined {
  const url = clubLogo(club)
  const m = url?.match(/teams\/(\d+)\.png/)
  return m ? Number(m[1]) : undefined
}

/** Canonical slug for a club (folds "Atletico"/"Atlético", "PSG"/"Paris…"). */
export function teamSlug(club: string): string {
  return slugify(canonicalClubName(club))
}

function currentSeason(): PlayerData[] {
  return (Array.isArray(PRIMARY_PLAYERS) ? PRIMARY_PLAYERS : []).filter(
    p => p && p.season === '2526' && p.club
  )
}

let _index: Map<string, TeamData> | null = null

function buildIndex(): Map<string, TeamData> {
  if (_index) return _index
  // Group the current-season dataset by canonical club slug.
  const groups = new Map<string, { canonical: string; league: string; players: PlayerData[] }>()
  for (const p of currentSeason()) {
    const canonical = canonicalClubName(p.club)
    const slug = slugify(canonical)
    if (!slug) continue
    const g = groups.get(slug) ?? { canonical, league: p.league, players: [] }
    g.players.push(p)
    groups.set(slug, g)
  }

  const out = new Map<string, TeamData>()
  for (const [slug, g] of groups) {
    const ranked = [...g.players].sort((a, b) => rankScore(b) - rankScore(a))
    const squad: TeamSquadPlayer[] = ranked.map(p => ({
      name: p.name,
      slug: playerSlug(p),
      position: p.position ?? null,
      photo: playerPhoto(p) ?? null,
      flag: p.flag ?? flagFor(p.nationality) ?? null,
      goles: p.goles ?? 0,
      asist: p.asist ?? 0,
      pj: p.pj ?? 0,
      age: typeof p.age === 'number' && p.age > 0 ? p.age : null,
      rating: typeof p.rating === 'number' && p.rating > 0 ? p.rating : null,
    }))
    const goals = g.players.reduce((s, p) => s + (p.goles ?? 0), 0)
    const assists = g.players.reduce((s, p) => s + (p.asist ?? 0), 0)
    const ages = g.players.map(p => p.age).filter((a): a is number => typeof a === 'number' && a > 0)
    const avgAge = ages.length ? Math.round((ages.reduce((s, a) => s + a, 0) / ages.length) * 10) / 10 : null
    out.set(slug, {
      name: g.canonical,
      slug,
      league: g.league,
      crest: clubLogo(g.canonical),
      teamId: teamIdFromCrest(g.canonical),
      accent: clubColor(g.canonical),
      squad,
      totals: { players: g.players.length, goals, assists, avgAge },
    })
  }
  _index = out
  return out
}

/** Every team slug we can render (has ≥1 current-season player). */
export function allTeamSlugs(): string[] {
  return [...buildIndex().keys()]
}

export function findTeamBySlug(slug: string): TeamData | null {
  return buildIndex().get(slug) ?? null
}
