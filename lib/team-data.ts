import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { canonicalClubName, clubColor } from '@/lib/club-colors'
import { clubLogo } from '@/lib/club-logos'
import { slugify } from '@/lib/slugify'
import { rankScore, iig } from '@/lib/iig'
import { playerSlug } from '@/lib/player-slug'
import { playerPhoto } from '@/lib/player-photo'
import { flagFor } from '@/lib/flags'
import { leagueIdForDatasetName } from '@/lib/league-data'
import { TEAMS_INDEX } from '@/data/teams-index'
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
  iig: number
}

export interface TeamData {
  name: string          // canonical display name (accent/short-form folded)
  slug: string
  league: string        // raw dataset league string
  leagueId?: number     // api-football league id (for standings/stats/fixtures)
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
      iig: iig(p),
    }))
    const goals = g.players.reduce((s, p) => s + (p.goles ?? 0), 0)
    const assists = g.players.reduce((s, p) => s + (p.asist ?? 0), 0)
    const ages = g.players.map(p => p.age).filter((a): a is number => typeof a === 'number' && a > 0)
    const avgAge = ages.length ? Math.round((ages.reduce((s, a) => s + a, 0) / ages.length) * 10) / 10 : null
    out.set(slug, {
      name: g.canonical,
      slug,
      league: g.league,
      leagueId: leagueIdForDatasetName(g.league),
      crest: clubLogo(g.canonical),
      teamId: teamIdFromCrest(g.canonical),
      accent: clubColor(g.canonical),
      squad,
      totals: { players: g.players.length, goals, assists, avgAge },
    })
  }

  // Canonical Leagues → Teams universe: add every team from the api-football
  // teams index that we don't already track. Dataset-derived teams keep their
  // exact slugs + stats (SEO-safe); index-only clubs get a page too (squad is
  // fetched live from the API on render). Dedupe by teamId so a club that also
  // exists in the curated set never doubles under a different slug.
  const trackedIds = new Set<number>()
  for (const t of out.values()) if (t.teamId) trackedIds.add(t.teamId)
  for (const [slug, e] of Object.entries(TEAMS_INDEX)) {
    if (out.has(slug) || trackedIds.has(e.teamId)) continue
    out.set(slug, {
      name: e.name,
      slug,
      league: e.leagueName,
      leagueId: e.leagueId,
      crest: e.logo ?? undefined,
      teamId: e.teamId,
      accent: clubColor(e.name),
      squad: [],           // filled live from api-football on the page
      totals: { players: 0, goals: 0, assists: 0, avgAge: null },
    })
  }

  _index = out
  return out
}

/** Every team slug we can render (has ≥1 current-season player). */
export function allTeamSlugs(): string[] {
  return [...buildIndex().keys()]
}

/** The teams we prerender at build: the top ~24 by tracked-squad depth (a good
 *  proxy for prominence — big clubs have the most tracked players). Kept small
 *  on purpose: each team page fires ~5 live api-football calls (squad, coach,
 *  standings, stats, fixtures, transfers, injuries), and a bigger burst trips
 *  api-football's per-minute rate limit at build. The long tail (900+ clubs)
 *  renders on-demand via dynamicParams and caches — one at a time, no burst. */
export function majorTeamSlugs(): string[] {
  return [...buildIndex().values()]
    .sort((a, b) => b.squad.length - a.squad.length)
    .slice(0, 24)
    .map(t => t.slug)
}

export function findTeamBySlug(slug: string): TeamData | null {
  return buildIndex().get(slug) ?? null
}

/** norm(player name) → our tracked stats, for merging onto the full API squad. */
export function datasetStatsByName(team: TeamData): Map<string, TeamSquadPlayer> {
  const m = new Map<string, TeamSquadPlayer>()
  for (const p of team.squad) {
    const key = p.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
    if (!m.has(key)) m.set(key, p)
  }
  return m
}
