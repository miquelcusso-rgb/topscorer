import { PLAYERS } from '@/data/players'
import type { PlayerData } from '@/types'

// Unified player identity. The generated current-season rows carry a real
// API-Football `apiId`; curated/historical rows of the SAME player do not, so we
// build a name → apiId map from the rows that have one and attach the same
// identity to the rows that don't. This collapses the "3 Pedris" / "Mbappé ×3"
// duplicates into a single player with multiple season entries.

function norm(s?: string): string {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
}

const NAME_TO_ID = (() => {
  const m = new Map<string, number>()
  for (const p of PLAYERS) {
    if (!p.apiId) continue
    const n = norm(p.name)
    if (!m.has(n)) m.set(n, p.apiId)
    const f = norm(p.fullName)
    if (f && !m.has(f)) m.set(f, p.apiId)
  }
  return m
})()

/** Stable identity key for a player row (same person → same key). */
export function playerKey(p: Pick<PlayerData, 'apiId' | 'name' | 'fullName'>): string {
  if (p.apiId) return `id:${p.apiId}`
  const byName = NAME_TO_ID.get(norm(p.name)) ?? (p.fullName ? NAME_TO_ID.get(norm(p.fullName)) : undefined)
  return byName ? `id:${byName}` : `nm:${norm(p.name)}`
}

// Higher = more recent. Season codes are 4-digit ("2526" > "2425" > … > "1011").
const seasonRank = (s: string) => Number(s) || 0

// Group every dataset row by identity; seasons sorted newest-first.
const GROUPS: Map<string, PlayerData[]> = (() => {
  const m = new Map<string, PlayerData[]>()
  for (const p of PLAYERS) {
    const k = playerKey(p)
    const arr = m.get(k) ?? []
    arr.push(p)
    m.set(k, arr)
  }
  for (const arr of m.values()) arr.sort((a, b) => seasonRank(b.season) - seasonRank(a.season))
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
