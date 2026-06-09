import type { PlayerData } from '@/types'
import { SEARCH_INDEX } from '@/data/search-index'
import { CURATED_IDS } from '@/data/curated-ids'

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

// norm(fullName) → id, with collisions flagged. Used for conservative
// "query name is a PREFIX of a canonical full name" matching (e.g.
// "Alejandro Grimaldo" ⊂ "Alejandro Grimaldo García", which the exact/firstLast
// keys above miss because firstLast picks the LAST token "García").
const FULL_TO_ID: Map<string, number> = new Map()
const FULL_AMBIG: Set<string> = new Set()
for (const p of SEARCH_INDEX) {
  if (!p.id) continue
  const nf = norm(p.fullName)
  if (!nf) continue
  const cur = FULL_TO_ID.get(nf)
  if (cur === undefined) FULL_TO_ID.set(nf, p.id)
  else if (cur !== p.id) FULL_AMBIG.add(nf)
}

// Conservative prefix match: the (multi-word) query name must be an exact
// prefix of exactly ONE canonical full name. Returns undefined when zero or
// more than one full name matches, so we never collapse two different players.
function idByFullNamePrefix(name?: string): number | undefined {
  const q = norm(name)
  if (!q || q.split(' ').length < 2) return undefined
  let found: number | undefined
  for (const [nf, id] of FULL_TO_ID) {
    if (FULL_AMBIG.has(nf)) continue
    if (nf === q || nf.startsWith(q + ' ')) {
      if (found !== undefined && found !== id) return undefined // ambiguous → bail
      found = id
    }
  }
  return found
}

// Curated stars pinned to their CURRENT id (data/curated-ids.ts). This BEATS the
// fuzzy first-last / prefix lookups below because those can collide on shared
// surnames (e.g. curated "Luis Díaz" would otherwise hit Luis *Suárez Díaz* id
// 157 via a first-last match on "luis diaz"). The pin is curated truth.
function idByName(p: Pick<PlayerData, 'name' | 'fullName'>): number | undefined {
  return NAME_TO_ID.get(norm(p.name)) ?? (p.fullName ? NAME_TO_ID.get(norm(p.fullName)) : undefined)
    ?? CURATED_IDS[norm(p.name)] ?? (p.fullName ? CURATED_IDS[norm(p.fullName)] : undefined)
    ?? NAME_TO_ID.get(firstLast(norm(p.name)))
    ?? idByFullNamePrefix(p.name) ?? (p.fullName ? idByFullNamePrefix(p.fullName) : undefined)
}

/** A player's photo: stored value → apiId → search-index id by name. */
export function playerPhoto(p: Pick<PlayerData, 'photo' | 'apiId' | 'name' | 'fullName'>): string | undefined {
  return p.photo || apiPhoto(p.apiId) || apiPhoto(idByName(p))
}

/** A player's raw API-Football id: stored apiId → search-index id by name.
 *  Used by features that need the numeric id (injuries, sidelined, predictions)
 *  for players who carry no apiId on the dataset row. */
export function playerApiId(p: Pick<PlayerData, 'apiId' | 'name' | 'fullName'>): number | undefined {
  return p.apiId ?? idByName(p)
}

/** Return the player with `photo` guaranteed-filled when resolvable. */
export function withPhoto<T extends Pick<PlayerData, 'photo' | 'apiId' | 'name' | 'fullName'>>(p: T): T {
  const photo = playerPhoto(p)
  return photo && photo !== p.photo ? { ...p, photo } : p
}
