import type { PlayerData } from '@/types'

// SINGLE source of truth for a player's photo. API-Football photo URLs are
// predictable by player id (…/players/<id>.png and it serves a neutral
// silhouette for ids without a real headshot), so any player WITH an apiId can
// always show a photo even when the dataset row has no stored `photo`. This is
// why some players (Muriqi, Yamal, Undav, Vinicius…) rendered initials: their
// dataset row lacked a photo string. Deriving from apiId fixes 100% of them.
export function apiPhoto(apiId?: number): string | undefined {
  return apiId ? `https://media.api-sports.io/football/players/${apiId}.png` : undefined
}

/** A player's photo: stored value first, else derived from the apiId. */
export function playerPhoto(p: Pick<PlayerData, 'photo' | 'apiId'>): string | undefined {
  return p.photo || apiPhoto(p.apiId)
}

/** Return the player with `photo` guaranteed-filled when an apiId exists. */
export function withPhoto<T extends Pick<PlayerData, 'photo' | 'apiId'>>(p: T): T {
  const photo = playerPhoto(p)
  return photo && photo !== p.photo ? { ...p, photo } : p
}
