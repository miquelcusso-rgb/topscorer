import { PLAYERS } from '@/data/players'
import { slugify } from './slugify'
import type { PlayerData } from '@/types'

// How many distinct dataset players share each base slug (slugify(name)).
// Built once at module init. Players whose name is unique keep the clean slug;
// only colliding names (e.g. the several "Vitinha") get an `-<apiId>` suffix so
// each resolves to a distinct profile while SEO URLs stay clean for everyone else.
const baseCount = (() => {
  const m = new Map<string, number>()
  for (const p of PLAYERS) {
    const b = slugify(p.name)
    m.set(b, (m.get(b) ?? 0) + 1)
  }
  return m
})()

/** Canonical URL slug for a player. Adds `-<apiId>` only on name collisions. */
export function playerSlug(p: Pick<PlayerData, 'name' | 'apiId'>): string {
  const base = slugify(p.name)
  if ((baseCount.get(base) ?? 0) > 1 && p.apiId) return `${base}-${p.apiId}`
  return base
}

/** Resolve a slug back to a player. Accepts the clean form (returns the
 *  primary = most-minutes player with that name) and the `-<apiId>` form
 *  (returns that exact player). */
export function findPlayerBySlug(slug: string): PlayerData | undefined {
  const m = slug.match(/^(.*)-(\d+)$/)
  if (m) {
    const id = Number(m[2])
    const exact = PLAYERS.find(p => p.apiId === id)
    if (exact) return exact
  }
  const matches = PLAYERS.filter(p => slugify(p.name) === slug)
  if (!matches.length) return undefined
  return matches.sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0))[0]
}

/** All dataset entries that belong to the same player as `slug` (across
 *  seasons), for the profile's season history. Matches by apiId when the slug
 *  is disambiguated, otherwise by name. */
export function playersForSlug(slug: string): PlayerData[] {
  const base = findPlayerBySlug(slug)
  if (!base) return []
  if (base.apiId) {
    const byId = PLAYERS.filter(p => p.apiId === base.apiId)
    if (byId.length) return byId
  }
  return PLAYERS.filter(p => slugify(p.name) === slugify(base.name))
}
