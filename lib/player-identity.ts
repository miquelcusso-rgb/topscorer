import { PLAYERS } from '@/data/players'
import { CURATED_IDS } from '@/data/curated-ids'
import type { PlayerData } from '@/types'
import { withPhoto } from './player-photo'

// Unified player identity. The generated current-season rows carry a real
// API-Football `apiId`; curated/historical rows of the SAME player do not, so we
// build a name → apiId map from the rows that have one and attach the same
// identity to the rows that don't. This collapses the "3 Pedris" / "Mbappé ×3"
// duplicates into a single player with multiple season entries.

const SPECIAL: Record<string, string> = { 'ø': 'o', 'œ': 'oe', 'æ': 'ae', 'ł': 'l', 'ð': 'd', 'þ': 'th', 'ı': 'i', 'ß': 'ss', 'đ': 'd', 'ħ': 'h' }
function norm(s?: string): string {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[øœæłðþıßđħ]/g, c => SPECIAL[c] ?? c)
    .replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
}

// "Initial + last name" key: "Harry Kane" / "H. Kane" / "Harry Edward Kane" all
// collapse to "h kane", so curated full names match abbreviated generated names.
function initialLast(s?: string): string {
  const t = norm(s).split(' ').filter(Boolean)
  return t.length >= 2 ? `${t[0][0]} ${t[t.length - 1]}` : norm(s)
}

const NAME_TO_ID = new Map<string, number>()
// Initial+last → apiId, but only when UNAMBIGUOUS (one player per il key).
const IL_TO_ID = new Map<string, number>()
const IL_AMBIG = new Set<string>()
;(() => {
  for (const p of PLAYERS) {
    if (!p.apiId) continue
    const n = norm(p.name)
    if (!NAME_TO_ID.has(n)) NAME_TO_ID.set(n, p.apiId)
    const f = norm(p.fullName)
    if (f && !NAME_TO_ID.has(f)) NAME_TO_ID.set(f, p.apiId)
    for (const il of [initialLast(p.name), initialLast(p.fullName)]) {
      if (!il) continue
      const cur = IL_TO_ID.get(il)
      if (cur === undefined) IL_TO_ID.set(il, p.apiId)
      else if (cur !== p.apiId) IL_AMBIG.add(il) // two different players share the il key
    }
  }
})()

/** Stable identity key for a player row (same person → same key). */
export function playerKey(p: Pick<PlayerData, 'apiId' | 'name' | 'fullName'>): string {
  if (p.apiId) return `id:${p.apiId}`
  // Exact name / full-name match against a generated apiId.
  const exact = NAME_TO_ID.get(norm(p.name)) ?? (p.fullName ? NAME_TO_ID.get(norm(p.fullName)) : undefined)
  if (exact) return `id:${exact}`
  // Fallback: unambiguous initial+last match ("Harry Kane" → generated "H. Kane").
  for (const il of [initialLast(p.name), initialLast(p.fullName)]) {
    if (il && !IL_AMBIG.has(il)) { const id = IL_TO_ID.get(il); if (id) return `id:${id}` }
  }
  // Curated stars pinned to their current apiId (data/curated-ids.ts) so old
  // curated rows always merge with the fresh current entry, even when the name
  // is ambiguous or differs from the API's abbreviated form.
  const pinned = CURATED_IDS[norm(p.name)] ?? (p.fullName ? CURATED_IDS[norm(p.fullName)] : undefined)
  if (pinned) return `id:${pinned}`
  return `nm:${norm(p.name)}`
}

// Higher = more recent. Season codes are 4-digit ("2526" > "2425" > … > "1011").
const seasonRank = (s: string) => Number(s) || 0

// ── per-(player, season) FIELD MERGE ─────────────────────────────────────────
// Two rows can describe the SAME player in the SAME season: a stats-rich
// GENERATED row (apiId + shots/keyPasses/passes/rating/minutes/photo…) and a
// curated/EXT row that carries the editorial EXTRAS the API doesn't give us
// (marketValue, releaseClause, contractUntil, elo, fantasy…, plus localized
// nationality/flag/position). Instead of dropping one, we field-merge them: the
// stats-rich row is the base and wins on stat fields; the curated row overlays
// the EXTRAS and fills any missing nationality/flag/position. Net: Harry Kane
// keeps €70M AND gains rating/shots/keyPasses on the same row.

// Stat fields supplied by the generated dataset — the stats-rich row wins these.
const STAT_FIELDS: (keyof PlayerData)[] = [
  'shotsTotal', 'shotsOn', 'passes', 'keyPasses', 'passAccuracy', 'passesKey',
  'passesAccuracy', 'tacklesTotal', 'interceptions', 'blocks', 'duelsTotal',
  'duelsWon', 'dribblesAttempts', 'dribblesSuccess', 'dribblesPast', 'rating',
  'minutes', 'lineups', 'captain', 'subIn', 'subOut', 'subBench', 'foulsDrawn',
  'foulsCommitted', 'yellowCards', 'yellowRed', 'redCards', 'penaltiesScored',
  'penaltyWon', 'penaltyCommitted', 'penaltyMissed', 'penaltySaved',
  'goalsConceded', 'saves', 'photo', 'apiId', 'injured', 'recoveries',
  'ballsLost', 'progressivePasses', 'height', 'weight', 'birthPlace',
  'birthDate',
]
// Editorial extras the curated/EXT row owns — they win these when present.
const CURATED_EXTRAS: (keyof PlayerData)[] = [
  'marketValue', 'releaseClause', 'contractUntil', 'elo', 'fantasyPoints',
  'fantasyPrice', 'status', 'statusDetail', 'prevClub',
]
// Filled from whichever row has them when the stats-rich base is missing them.
const PREFER_FILL: (keyof PlayerData)[] = ['nationality', 'flag', 'position', 'fullName']

const STAT_SET = new Set<keyof PlayerData>(STAT_FIELDS)
const present = (v: unknown) => v != null && v !== ''

// How many real stat fields a row carries → identifies the stats-rich base.
const statRichness = (p: PlayerData) =>
  (p.apiId ? 1000 : 0) + STAT_FIELDS.reduce((n, f) => n + (present(p[f]) ? 1 : 0), 0)

// Merge all rows for one (player, season) into a single row: stats-rich base,
// stat fields from the richest row, extras + missing identity fields overlaid
// from the others. Generic: stat fields → stats-rich wins; extras → curated
// wins; everything else → first non-null (base first).
function mergeSeasonRows(rows: PlayerData[]): PlayerData {
  const ordered = rows.slice().sort((a, b) => statRichness(b) - statRichness(a))
  const base = ordered[0]
  const out: PlayerData = { ...base }
  const sink = out as unknown as Record<string, unknown>
  for (const r of ordered.slice(1)) {
    const src = r as unknown as Record<string, unknown>
    for (const k of Object.keys(r) as (keyof PlayerData)[]) {
      const rv = src[k]
      if (!present(rv)) continue
      if (STAT_SET.has(k)) {
        // stats-rich base wins; only fill if the base lacks it.
        if (!present(sink[k])) sink[k] = rv
      } else if (CURATED_EXTRAS.includes(k) || PREFER_FILL.includes(k)) {
        // curated row owns extras; for identity fields, fill if base is missing.
        if (CURATED_EXTRAS.includes(k) || !present(sink[k])) sink[k] = rv
      } else if (!present(sink[k])) {
        sink[k] = rv
      }
    }
  }
  return out
}

// Group every dataset row by identity; field-merge to one row per season; sort
// newest-first so [0] is the current season's best (merged) entry.
const GROUPS: Map<string, PlayerData[]> = (() => {
  const m = new Map<string, PlayerData[]>()
  for (const p of PLAYERS) {
    const k = playerKey(p)
    const arr = m.get(k) ?? []
    arr.push(p)
    m.set(k, arr)
  }
  for (const [k, arr] of m) {
    const bySeason = new Map<string, PlayerData[]>()
    for (const p of arr) {
      const cur = bySeason.get(p.season) ?? []
      cur.push(p)
      bySeason.set(p.season, cur)
    }
    const mergedSeasons = [...bySeason.values()].map(mergeSeasonRows)
    m.set(k, mergedSeasons.sort((a, b) => seasonRank(b.season) - seasonRank(a.season)))
  }
  return m
})()

/** All season rows for the same player as `p`, newest season first. */
export function seasonsForPlayer(p: Pick<PlayerData, 'apiId' | 'name' | 'fullName'>): PlayerData[] {
  return GROUPS.get(playerKey(p)) ?? []
}

// A player counts as "current" only if their newest entry is recent (≥ 23/24).
// This drops history-only players (e.g. someone who exists in the 10/11→19/20
// historical set but whose current club lives only in the live search index, like
// a capped-out active player) so they never surface as a STALE current entry —
// their up-to-date version still comes from the search index / live resolver, and
// their full history remains in seasonsForPlayer().
const CURRENT_SEASON_FLOOR = 2324
/** Exactly one entry per real player — the most recent (current) season. */
export const PRIMARY_PLAYERS: PlayerData[] = (() => {
  const out: PlayerData[] = []
  // Fill photo from apiId so every player with an id always renders a headshot
  // (not initials), regardless of whether the dataset row stored a photo URL.
  for (const arr of GROUPS.values()) {
    const p = arr[0]
    if (p && seasonRank(p.season) >= CURRENT_SEASON_FLOOR) out.push(withPhoto(p))
  }
  return out
})()
