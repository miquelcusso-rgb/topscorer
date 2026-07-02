import type { PlayerData } from '@/types'
import { playersForSlug, playersForId } from '@/lib/player-slug'
import { getPlayerDetails, getPlayerProfile, type ApiPlayerDetail, type ApiPlayerProfile } from '@/lib/api-football'
import { flagFor } from '@/lib/flags'
import { slugify } from '@/lib/slugify'
import { SEARCH_INDEX } from '@/data/search-index'

// slugify(name) → apiId, built once. Lets a CLEAN slug (e.g. "christos-tzolis")
// for a player who isn't in the static dataset still resolve live by apiId.
// "Erling Braut Haaland" → "erling haaland" (first word + last word). Lets a
// natural "FirstName Surname" slug resolve even when the dataset stores the
// player as an initial ("E. Haaland") and the fullName has a middle name.
function firstLast(full: string): string {
  const parts = full.trim().split(/\s+/)
  if (parts.length < 2) return ''
  return `${parts[0]} ${parts[parts.length - 1]}`
}

const SLUG_TO_ID = (() => {
  const m = new Map<string, number>()
  for (const p of SEARCH_INDEX) {
    const forms = [slugify(p.name)]
    if (p.fullName) {
      forms.push(slugify(p.fullName))
      const fl = firstLast(p.fullName)
      if (fl) forms.push(slugify(fl))
    }
    for (const s of forms) {
      if (s && !m.has(s)) m.set(s, p.id)
    }
  }
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
    yellowRed: num(st.cards?.yellowred),
    redCards: num(st.cards?.red),
    goalsConceded: num(st.goals?.conceded),
    saves: num(st.goals?.saves),
    penaltyWon: num(st.penalty?.won),
    penaltiesScored: num(st.penalty?.scored),
    penaltyMissed: num(st.penalty?.missed),
    penaltySaved: num(st.penalty?.saved),
    captain: st.games?.captain === true ? true : undefined,
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
  // If that apiId is actually in the static dataset (e.g. "erling-haaland"
  // resolving to E. Haaland / 1100), serve the rich static profile instead of a
  // slow, failure-prone live fetch.
  const staticById = playersForId(id)
  if (staticById.length) {
    const base = staticById.find(p => p.season === '2526') ?? staticById[0]
    return { base, seasons: staticById, live: false }
  }
  const detail = await getPlayerDetails(id, 2025)
  const base = detail ? apiDetailToPlayer(detail) : null
  if (base) return { base, seasons: [base], live: true }
  // No current-season stats (youth / deep reserve / just-signed): fall back to
  // the identity-only profile so the fiche still opens instead of 404ing.
  const profile = await getPlayerProfile(id)
  if (!profile) return null
  return { base: apiProfileToPlayer(profile), seasons: [], live: true }
}

// Minimal PlayerData from an identity-only profile (no season stats).
function apiProfileToPlayer(p: ApiPlayerProfile): PlayerData {
  const full = [p.firstname, p.lastname].filter(Boolean).join(' ').trim()
  const fullName = full && full.toLowerCase() !== (p.name ?? '').toLowerCase() ? full : undefined
  return {
    name: p.name,
    fullName,
    apiId: p.id,
    club: '',
    league: '',
    age: num(p.age) ?? 0,
    pj: 0,
    goles: 0,
    asist: 0,
    season: '2526',
    src: 'live',
    tab: 's',
    nationality: p.nationality ?? undefined,
    flag: p.nationality ? flagFor(p.nationality) : undefined,
    photo: p.photo ?? undefined,
    position: POS_MAP[p.position ?? ''] ?? undefined,
    height: p.height || undefined,
    weight: p.weight || undefined,
    birthDate: p.birth?.date || undefined,
    birthPlace: [p.birth?.place, p.birth?.country].filter(Boolean).join(', ') || undefined,
  }
}
