import { slugify } from './slugify'
import { PRIMARY_PLAYERS, playerKey, seasonsForPlayer } from './player-identity'
import type { PlayerData } from '@/types'

// One canonical entry per real player (PRIMARY_PLAYERS = current season). Slugs
// are computed over these, so the same player never splits across two URLs.
// A clean `slugify(name)` is used unless two DIFFERENT players share that base
// slug, in which case the colliding ones get an `-<apiId>` suffix (clean URLs
// stay for everyone else → SEO preserved).
const baseCount = (() => {
  const m = new Map<string, number>()
  for (const p of PRIMARY_PLAYERS) {
    const b = slugify(p.name)
    m.set(b, (m.get(b) ?? 0) + 1)
  }
  return m
})()

export function playerSlug(p: Pick<PlayerData, 'name' | 'apiId'>): string {
  const base = slugify(p.name)
  if ((baseCount.get(base) ?? 0) > 1 && p.apiId) return `${base}-${p.apiId}`
  return base
}

// slug → primary player. Build the map once from PRIMARY_PLAYERS.
const BY_SLUG = (() => {
  const m = new Map<string, PlayerData>()
  for (const p of PRIMARY_PLAYERS) m.set(playerSlug(p), p)
  return m
})()

/** Resolve a slug to the canonical (current-season) player. */
export function findPlayerBySlug(slug: string): PlayerData | undefined {
  const exact = BY_SLUG.get(slug)
  if (exact) return exact
  // `-<apiId>` form whose base wasn't flagged as colliding (defensive).
  const m = slug.match(/^(.*)-(\d+)$/)
  if (m) {
    const id = Number(m[2])
    const byId = PRIMARY_PLAYERS.find(p => p.apiId === id)
    if (byId) return byId
  }
  // Fall back to clean base match.
  return PRIMARY_PLAYERS.find(p => slugify(p.name) === slug)
}

/** Every season row for the player addressed by `slug` (newest first). */
export function playersForSlug(slug: string): PlayerData[] {
  const base = findPlayerBySlug(slug)
  if (!base) return []
  const seasons = seasonsForPlayer(base)
  return seasons.length ? seasons : [base]
}

export { playerKey }
