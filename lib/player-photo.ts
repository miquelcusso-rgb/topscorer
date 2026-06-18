import type { PlayerData } from '@/types'
import { SEARCH_INDEX } from '@/data/search-index'
import { CURATED_IDS } from '@/data/curated-ids'
import { clubLogo } from '@/data/club-logos'

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

// ── News headline → player headshot (SERVER ONLY) ──────────────────────────
// Resolve a news headline to a SPECIFIC player so news cards can show that
// player's official API-Football headshot (licensed via our API — NOT agency
// rehosting). Must stay server-side (SEARCH_INDEX is huge).
//
// Precision over recall: a wrong face is worse than no face. We resolve only
// when we are confident WHICH player a headline is about, via two passes:
//   1. FULL NAME — the player's full "first last" (or curated name) appears as
//      a contiguous phrase in the headline (e.g. "Vinícius Júnior", "Jude
//      Bellingham"). Unambiguous by construction.
//   2. DISTINCTIVE SURNAME — a single canonical surname (≥4 letters) appears as
//      a whole word. When several players share that surname we only resolve if
//      ONE of them is a curated/PRIMARY star (the dominant public referent,
//      e.g. "Yamal", "Haaland"); otherwise we DON'T guess.
// Built once at module load.

// curated ids → the set of API-Football ids we treat as "dominant stars".
const STAR_IDS: Set<number> = new Set(Object.values(CURATED_IDS))

// Words that are CLUB / place / football-common tokens, never to be treated as
// a player surname in the surname pass. Headlines say "Madrid", "City",
// "United", "Inter" constantly, and some players' last name token is exactly
// such a word (e.g. fullName "… Marchant Madrid"), which would otherwise put
// that obscure player's face on every "Madrid" story. Surname matches on these
// are skipped; the crest pass handles clubs instead.
const SURNAME_STOPWORDS: Set<string> = new Set([
  'madrid', 'city', 'united', 'inter', 'milan', 'roma', 'real', 'athletic',
  'atletico', 'sporting', 'club', 'town', 'rovers', 'wanderers', 'albion',
  'county', 'rangers', 'celtic', 'villa', 'palace', 'forest', 'hotspur',
  'munich', 'munchen', 'dortmund', 'leipzig', 'napoli', 'lazio', 'juventus',
  'benfica', 'porto', 'ajax', 'feyenoord', 'eindhoven', 'paris', 'lyon',
  'marseille', 'monaco', 'sevilla', 'betis', 'valencia', 'villarreal',
  'liverpool', 'arsenal', 'chelsea', 'tottenham', 'everton', 'newcastle',
  'leeds', 'fulham', 'brentford', 'brighton', 'bournemouth', 'sunderland',
  'barcelona', 'leverkusen', 'frankfurt', 'union', 'sociedad', 'bilbao',
])

const surnameOf = (base: string): string => {
  const toks = base.split(' ').filter(t => t.length >= 4)
  return toks[toks.length - 1] ?? ''
}

// Pass 1: COMPLETE-name phrases → id. We index only the player's full `name`
// and `fullName` as-is (multi-token), never a first+last contraction. Complete
// names are inherently specific: a headline "Luis Díaz" matches the real Luis
// Díaz's name "luis diaz" but NOT Luis Suárez (name "luis suarez", fullName
// "luis suarez diaz") — so the classic shared-surname collision can't put the
// wrong face on the card. Any phrase two distinct players produce is dropped.
const PHRASE_TO_ID: Map<string, number> = new Map()
const PHRASE_AMBIG: Set<string> = new Set()
const addPhrase = (phrase: string, id: number) => {
  if (!phrase || phrase.split(' ').length < 2) return
  const cur = PHRASE_TO_ID.get(phrase)
  if (cur === undefined) PHRASE_TO_ID.set(phrase, id)
  else if (cur !== id) PHRASE_AMBIG.add(phrase)
}

// Pass 2: surname → id, with collisions flagged. When a surname collides we
// keep the dominant star's id (if exactly one of the colliders is a star).
const SURNAME_TO_ID: Map<string, number> = new Map()
const SURNAME_AMBIG: Set<string> = new Set()
const SURNAME_STAR: Map<string, number> = new Map()
const SURNAME_STAR_AMBIG: Set<string> = new Set()

for (const p of SEARCH_INDEX) {
  if (!p.id) continue
  const name = norm(p.name)
  const full = norm(p.fullName)
  // Complete-name phrases only (no first+last contraction — see note above).
  addPhrase(name, p.id)
  if (full) addPhrase(full, p.id)

  const surname = surnameOf(full || name)
  if (!surname || SURNAME_STOPWORDS.has(surname)) continue
  const cur = SURNAME_TO_ID.get(surname)
  if (cur === undefined) SURNAME_TO_ID.set(surname, p.id)
  else if (cur !== p.id) SURNAME_AMBIG.add(surname)
  // Track which star id "owns" a surname (for disambiguating collisions).
  if (STAR_IDS.has(p.id)) {
    const s = SURNAME_STAR.get(surname)
    if (s === undefined) SURNAME_STAR.set(surname, p.id)
    else if (s !== p.id) SURNAME_STAR_AMBIG.add(surname)
  }
}

// Phrases tested longest-first so a more specific full name wins over any
// shorter name contained within it.
const PHRASES_BY_LEN: string[] = [...PHRASE_TO_ID.keys()].sort((a, b) => b.length - a.length)

/** A specific player's headshot if the headline clearly names them, else undefined. */
export function headshotForHeadline(headline?: string): string | undefined {
  const h = norm(headline)
  if (!h) return undefined

  // Pass 1: an unambiguous COMPLETE-name phrase appears in the headline. Scan
  // the phrase map (far smaller than the index) and test whole-word presence
  // via a padded compare. Longer phrases first so a full "luis diaz" wins over
  // any shorter contained name before we ever reach the surname pass.
  const padded = ` ${h} `
  for (const phrase of PHRASES_BY_LEN) {
    if (PHRASE_AMBIG.has(phrase)) continue
    if (padded.includes(` ${phrase} `)) return apiPhoto(PHRASE_TO_ID.get(phrase)!)
  }

  // Pass 2: a distinctive (or star-dominant) surname appears as a whole word.
  const words = new Set(h.split(' ').filter(w => w.length >= 4))
  if (!words.size) return undefined
  for (const w of words) {
    if (SURNAME_STOPWORDS.has(w)) continue // club/place word, not a surname
    if (SURNAME_AMBIG.has(w)) {
      // Shared surname → only resolve if exactly one star owns it.
      if (!SURNAME_STAR_AMBIG.has(w)) {
        const star = SURNAME_STAR.get(w)
        if (star) return apiPhoto(star)
      }
      continue // otherwise don't guess
    }
    const id = SURNAME_TO_ID.get(w)
    if (id) return apiPhoto(id)
  }
  return undefined
}

// ── News headline → club crest (SERVER ONLY) ───────────────────────────────
// When no player resolves, fall back to the crest of a club named in the
// headline. We match against the known club-name set (data/club-logos) plus a
// curated alias table for the common short forms RSS headlines actually use
// ("Barça", "Man Utd", "Atleti", "Bayern", "Spurs"…). Longest alias first so
// "Real Sociedad" wins over "Real" and "Manchester United" over "Manchester".
const CLUB_ALIASES: Array<[string, string]> = [
  ['real madrid', 'real madrid'], ['barcelona', 'barcelona'], ['barca', 'barcelona'],
  ['atletico madrid', 'atletico madrid'], ['atletico', 'atletico madrid'], ['atleti', 'atletico madrid'],
  ['real sociedad', 'real sociedad'], ['athletic club', 'athletic club'], ['athletic bilbao', 'athletic club'],
  ['real betis', 'real betis'], ['celta vigo', 'celta vigo'],
  ['manchester united', 'manchester united'], ['man united', 'manchester united'], ['man utd', 'manchester united'],
  ['manchester city', 'manchester city'], ['man city', 'manchester city'],
  ['tottenham', 'tottenham'], ['spurs', 'tottenham'], ['west ham', 'west ham'],
  ['newcastle', 'newcastle'], ['nottingham forest', 'nottingham forest'], ['aston villa', 'aston villa'],
  ['liverpool', 'liverpool'], ['arsenal', 'arsenal'], ['chelsea', 'chelsea'], ['everton', 'everton'],
  ['paris saint germain', 'paris saint germain'], ['paris saint-germain', 'paris saint germain'], ['psg', 'paris saint germain'],
  ['bayern munich', 'bayern munchen'], ['bayern munchen', 'bayern munchen'], ['bayern', 'bayern munchen'],
  ['borussia dortmund', 'borussia dortmund'], ['dortmund', 'borussia dortmund'],
  ['bayer leverkusen', 'bayer leverkusen'], ['leverkusen', 'bayer leverkusen'], ['rb leipzig', 'rb leipzig'],
  ['eintracht frankfurt', 'eintracht frankfurt'],
  ['juventus', 'juventus'], ['ac milan', 'ac milan'], ['inter milan', 'inter'], ['inter', 'inter'],
  ['napoli', 'napoli'], ['as roma', 'as roma'], ['lazio', 'lazio'], ['atalanta', 'atalanta'], ['fiorentina', 'fiorentina'],
  ['marseille', 'marseille'], ['lyon', 'lyon'], ['monaco', 'monaco'], ['lille', 'lille'],
  ['benfica', 'benfica'], ['porto', 'fc porto'], ['fc porto', 'fc porto'], ['sporting cp', 'sporting cp'], ['sporting lisbon', 'sporting cp'],
  ['ajax', 'ajax'], ['psv eindhoven', 'psv eindhoven'], ['feyenoord', 'feyenoord'],
  ['celtic', 'celtic'], ['rangers', 'rangers'],
  ['al nassr', 'al nassr'], ['al hilal', 'al hilal saudi fc'], ['inter miami', 'inter miami'],
]
// Sort by descending phrase length so multi-word names win over their prefixes.
const CLUB_ALIASES_SORTED = [...CLUB_ALIASES].sort((a, b) => b[0].length - a[0].length)

/** A club crest if a known club is named in the headline, else undefined. */
export function crestForHeadline(headline?: string): string | undefined {
  const h = norm(headline)
  if (!h) return undefined
  const padded = ` ${h} `
  for (const [alias, canonical] of CLUB_ALIASES_SORTED) {
    if (padded.includes(` ${alias} `)) {
      const logo = clubLogo(canonical)
      if (logo) return logo
    }
  }
  return undefined
}
