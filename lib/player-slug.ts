import { slugify } from './slugify'
import { withPhoto } from './player-photo'
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

/**
 * Every resolvable player slug — exactly the keys `findPlayerBySlug` /
 * `resolvePlayerProfile` resolve from the static dataset. The sitemap MUST use
 * this (not a PLAYERS-by-name dedup) so it never emits a slug the player page
 * 404s on: same canonical set (PRIMARY_PLAYERS), same slug function.
 */
export function allPlayerSlugs(): string[] {
  return Array.from(BY_SLUG.keys())
}

/**
 * Subconjunto del sitemap (audit 9-jul): listar los 48.200 slugs (24k × 2 langs)
 * era index bloat — con autoridad baja Google los deja en "Discovered" y las
 * fichas que la gente SÍ busca ("mbappé top-scorers") nunca entran al índice.
 * Regla 10 de CLAUDE.md (calidad de sitemap): solo URLs que queremos indexadas.
 * Criterio: producción real (G+A), nota alta con minutos, o dato curado
 * (marketValue) — cap a MAX. Todas las demás fichas siguen resolviendo y son
 * crawleables por enlaces internos; solo salen del sitemap.
 */
export function notablePlayerSlugs(max = 1200): string[] {
  const score = (p: PlayerData): number =>
    (p.goles ?? 0) * 2 + (p.asist ?? 0) +
    ((p.rating ?? 0) >= 7 && (p.minutes ?? 0) >= 900 ? 5 : 0) +
    (p.marketValue ? 10 : 0)
  return Array.from(BY_SLUG.entries())
    .map(([slug, p]) => ({ slug, s: score(p) }))
    .filter(x => x.s >= 6) // umbral: al menos 3 goles / 6 asist / nota+minutos / curado
    .sort((a, b) => b.s - a.s)
    .slice(0, max)
    .map(x => x.slug)
}

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
  return (seasons.length ? seasons : [base]).map(withPhoto)
}

/** Every season row for the player with this apiId (newest first), or []. */
export function playersForId(apiId: number): PlayerData[] {
  const base = PRIMARY_PLAYERS.find(p => p.apiId === apiId)
  if (!base) return []
  const seasons = seasonsForPlayer(base)
  return (seasons.length ? seasons : [base]).map(withPhoto)
}

export { playerKey }
