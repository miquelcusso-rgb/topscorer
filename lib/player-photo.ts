import type { PlayerData } from '@/types'
import { SEARCH_INDEX } from '@/data/search-index'

// SINGLE source of truth for a player's photo. API-Football photo URLs are
// predictable by player id (…/players/<id>.png; it serves a neutral silhouette
// for ids without a real headshot), so any player we can map to an id always
// shows a photo. The dataset is messy (some rows lack both `photo` and `apiId`),
// so we resolve, in order: stored photo → row apiId → SEARCH_INDEX id by name.
// SEARCH_INDEX carries the API-Football id for every indexed player, which is
// why this recovers Muriqi / Yamal / Undav / Vinicius / Gyökeres, etc.

export function apiPhoto(id?: number): string | undefined {
  return id ? `https://media.api-sports.io/football/players/${id}.png` : undefined
}

const norm = (s?: string) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim()
const firstLast = (s: string) => { const p = s.split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1]}` : s }

// name/fullName (and first+last form) → API-Football id, built once.
const NAME_TO_ID: Map<string, number> = (() => {
  const m = new Map<string, number>()
  for (const p of SEARCH_INDEX) {
    if (!p.id) continue
    for (const key of [norm(p.name), norm(p.fullName), firstLast(norm(p.name)), p.fullName ? firstLast(norm(p.fullName)) : '']) {
      if (key && !m.has(key)) m.set(key, p.id)
    }
  }
  return m
})()

function idByName(p: Pick<PlayerData, 'name' | 'fullName'>): number | undefined {
  return NAME_TO_ID.get(norm(p.name)) ?? (p.fullName ? NAME_TO_ID.get(norm(p.fullName)) : undefined)
    ?? NAME_TO_ID.get(firstLast(norm(p.name)))
}

/** A player's photo: stored value → apiId → search-index id by name. */
export function playerPhoto(p: Pick<PlayerData, 'photo' | 'apiId' | 'name' | 'fullName'>): string | undefined {
  return p.photo || apiPhoto(p.apiId) || apiPhoto(idByName(p))
}

/** Return the player with `photo` guaranteed-filled when resolvable. */
export function withPhoto<T extends Pick<PlayerData, 'photo' | 'apiId' | 'name' | 'fullName'>>(p: T): T {
  const photo = playerPhoto(p)
  return photo && photo !== p.photo ? { ...p, photo } : p
}
