import { PLAYERS } from '@/data/players'
import { CURATED_IDS } from '@/data/curated-ids'
import type { PlayerData } from '@/types'

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

// Richness: when two rows describe the SAME player+season (e.g. a curated stub
// with no photo vs the generated row with photo + full API stats), keep the
// richer one. apiId/photo (generated) dominate, then minutes.
const score = (p: PlayerData) => (p.apiId ? 1e9 : 0) + (p.photo ? 1e6 : 0) + (p.minutes ?? 0)

// Group every dataset row by identity; collapse to one row per season (richest);
// sort newest-first so [0] is the current season's best entry.
const GROUPS: Map<string, PlayerData[]> = (() => {
  const m = new Map<string, PlayerData[]>()
  for (const p of PLAYERS) {
    const k = playerKey(p)
    const arr = m.get(k) ?? []
    arr.push(p)
    m.set(k, arr)
  }
  for (const [k, arr] of m) {
    const bySeason = new Map<string, PlayerData>()
    for (const p of arr) {
      const cur = bySeason.get(p.season)
      if (!cur || score(p) > score(cur)) bySeason.set(p.season, p)
    }
    m.set(k, [...bySeason.values()].sort((a, b) => seasonRank(b.season) - seasonRank(a.season)))
  }
  return m
})()

/** All season rows for the same player as `p`, newest season first. */
export function seasonsForPlayer(p: Pick<PlayerData, 'apiId' | 'name' | 'fullName'>): PlayerData[] {
  return GROUPS.get(playerKey(p)) ?? []
}

/** Exactly one entry per real player — the most recent (current) season. */
export const PRIMARY_PLAYERS: PlayerData[] = (() => {
  const out: PlayerData[] = []
  for (const arr of GROUPS.values()) if (arr[0]) out.push(arr[0])
  return out
})()
