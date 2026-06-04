import type { PlayerData } from '@/types'
import { playersForSlug } from '@/lib/player-slug'
import { getPlayerDetails, type ApiPlayerDetail } from '@/lib/api-football'
import { flagFor } from '@/lib/flags'
import { slugify } from '@/lib/slugify'
import { SEARCH_INDEX } from '@/data/search-index'

// slugify(name) → apiId, built once. Lets a CLEAN slug (e.g. "christos-tzolis")
// for a player who isn't in the static dataset still resolve live by apiId.
const SLUG_TO_ID = (() => {
  const m = new Map<string, number>()
  for (const p of SEARCH_INDEX) { const s = slugify(p.name); if (!m.has(s)) m.set(s, p.id) }
  return m
})()

const POS_MAP: Record<string, PlayerData['position']> = {
  Attacker: 'FW', Forward: 'FW', Midfielder: 'MF', Defender: 'DF', Goalkeeper: 'GK',
}
const num = (v: unknown): number | undefined => (v == null ? undefined : Number(v))
const round2 = (v: unknown): number | undefined => (v == null ? undefined : Math.round(Number(v) * 100) / 100)

// Map a live API-Football player detail → our PlayerData shape. Picks the
// statistics entry with the most appearances (a player can have rows for league
// + cups; we want their main competition).
export function apiDetailToPlayer(d: ApiPlayerDetail): PlayerData | null {
  const stats = d.statistics ?? []
  if (!stats.length) return null
  const st = [...stats].sort((a, b) => (b.games?.appearences ?? 0) - (a.games?.appearences ?? 0))[0]
  if (!st) return null
  const p = d.player
  const full = [p.firstname, p.lastname].filter(Boolean).join(' ').trim()
  const fullName = full && full.toLowerCase() !== (p.name ?? '').toLowerCase() ? full : undefined
  return {
    name: p.name,
    fullName,
    apiId: p.id,
    club: st.team?.name ?? '',
    league: st.league?.name ?? '',
    age: num(p.age) ?? 0,
    pj: num(st.games?.appearences) ?? 0,
    goles: num(st.goals?.total) ?? 0,
    asist: num(st.goals?.assists) ?? 0,
    season: '2526',
    src: 'live',
    tab: 's',
    nationality: p.nationality,
    flag: flagFor(p.nationality),
    photo: p.photo,
    position: POS_MAP[(st.games as { position?: string })?.position ?? ''] ?? undefined,
    height: p.height || undefined,
    weight: p.weight || undefined,
    birthDate: p.birth?.date || undefined,
    birthPlace: [p.birth?.place, p.birth?.country].filter(Boolean).join(', ') || undefined,
    injured: p.injured === true ? true : undefined,
    minutes: num(st.games?.minutes),
    lineups: num(st.games?.lineups),
    rating: round2(st.games?.rating),
    shotsTotal: num(st.shots?.total),
    shotsOn: num(st.shots?.on),
    passes: num(st.passes?.total),
    keyPasses: num(st.passes?.key),
    passAccuracy: num(st.passes?.accuracy),
    tacklesTotal: num(st.tackles?.total),
    blocks: num(st.tackles?.blocks),
    interceptions: num(st.tackles?.interceptions),
    duelsTotal: num(st.duels?.total),
    duelsWon: num(st.duels?.won),
    dribblesAttempts: num(st.dribbles?.attempts),
    dribblesSuccess: num(st.dribbles?.success),
    foulsDrawn: num(st.fouls?.drawn),
    foulsCommitted: num(st.fouls?.committed),
    yellowCards: num(st.cards?.yellow),
    redCards: num(st.cards?.red),
    goalsConceded: num(st.goals?.conceded),
    saves: num(st.goals?.saves),
    penaltiesScored: num(st.penalty?.scored),
  }
}

export interface ResolvedProfile {
  base: PlayerData
  seasons: PlayerData[]
  /** true when resolved live from API (not in the static dataset). */
  live: boolean
}

// Resolve a profile slug to a player. First the static dataset (rich, multi-season);
// otherwise, for a `name-<apiId>` slug, fetch the player live from API-Football so
// long-tail players found via search still open a real profile.
export async function resolvePlayerProfile(slug: string): Promise<ResolvedProfile | null> {
  const seasons = playersForSlug(slug)
  if (seasons.length) {
    const base = seasons.find(p => p.season === '2526') ?? seasons[0]
    return { base, seasons, live: false }
  }
  // `name-<apiId>` slug, or a clean slug resolved via the search index.
  const m = slug.match(/-(\d+)$/)
  const id = m ? Number(m[1]) : (SLUG_TO_ID.get(slug) ?? 0)
  if (!id) return null
  const detail = await getPlayerDetails(id, 2025)
  if (!detail) return null
  const base = apiDetailToPlayer(detail)
  if (!base) return null
  return { base, seasons: [base], live: true }
}
