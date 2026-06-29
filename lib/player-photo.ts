import type { PlayerData } from '@/types'
import { SEARCH_INDEX } from '@/data/search-index'
import { CURATED_IDS } from '@/data/curated-ids'
import { clubLogo } from '@/data/club-logos'
import { PHOTO_VERIFIED } from '@/data/photo-verified'
import { NEWS_NAME_PHOTOS } from '@/data/news-name-photos'

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

// A headshot URL only when the id is CONFIRMED to carry a real photo. API-Football
// serves a generic gray silhouette (HTTP 200) for any id without a photo, and we
// cannot tell it apart from the URL alone — so news visuals emit a headshot ONLY
// for an id in PHOTO_VERIFIED (built once by scripts/verify-photos.mjs). Every
// other id returns undefined here, letting the caller fall back to the club crest
// → branded placeholder. This is what guarantees a silhouette never reaches a card.
function verifiedPhoto(id?: number): string | undefined {
  return id && PHOTO_VERIFIED.has(id) ? apiPhoto(id) : undefined
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
// Precision over recall: a wrong face — or a gray silhouette — is worse than no
// face. Two gates: (a) we resolve an id only when confident WHICH player a
// headline is about (the two passes below), and (b) we only emit the headshot
// when that id is in PHOTO_VERIFIED (a real photo, not the api-sports
// silhouette). Fail either gate → undefined → caller falls back to the crest.
// We resolve the id via two passes:
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

// Enrichment-cached news names (already normalised by the build script), tested
// longest-first so a more specific full name wins over any shorter one it
// contains. Used by headshotForHeadline pass 0.5.
const NEWS_PHOTO_KEYS: string[] = Object.keys(NEWS_NAME_PHOTOS).sort((a, b) => b.length - a.length)

// Surname index over the confirmed enrichment map. Headlines almost always use
// a player's SURNAME only ("Bellingham celebrates…", "Messi signs…"), which the
// full-"first last" phrase pass (NEWS_PHOTO_KEYS) misses — so without this the
// card fell back to the club crest. Each enrichment id is a hand-confirmed real
// photo (photo-trusted). Ambiguity guard: a surname shared by two enrichment
// entries is dropped here; the per-headline pass additionally skips any surname
// that is ambiguous across the broader SEARCH_INDEX (so common names like
// "silva" never resolve to the wrong face).
const NEWS_SURNAME_TO_ID = new Map<string, number>()
const NEWS_SURNAME_AMBIG = new Set<string>()
for (const phrase in NEWS_NAME_PHOTOS) {
  const toks = phrase.split(' ').filter(Boolean)
  if (toks.length < 2) continue
  const sn = toks[toks.length - 1]
  if (sn.length < 4) continue
  const id = NEWS_NAME_PHOTOS[phrase]
  const cur = NEWS_SURNAME_TO_ID.get(sn)
  if (cur === undefined) NEWS_SURNAME_TO_ID.set(sn, id)
  else if (cur !== id) NEWS_SURNAME_AMBIG.add(sn)
}
// Surnames shared by many ACTIVE players, where resolving the enrichment entry
// on a surname-only headline could paint the wrong (e.g. retired) namesake. For
// these we keep the strict broader-index ambiguity guard; for distinctive
// surnames (Bellingham, Mbappé…) we trust the confirmed enrichment id even if a
// minor namesake exists — so a Jude Bellingham headline shows Jude, not nobody.
const SURNAME_RISKY = new Set<string>([
  'silva', 'williams', 'james', 'henderson', 'sanchez', 'torres', 'gomez',
  'fernandez', 'martinez', 'rodriguez', 'lopez', 'garcia', 'santos', 'costa',
  'pereira', 'gonzalez', 'hernandez', 'jesus', 'felix', 'luis', 'paqueta',
])

// CURATED MONONYM ALIASES — popular SINGLE-name / one-word forms that headlines
// actually use ("Vinicius brilla", "Pedri vuelve", "Neymar firma") and which the
// full-name phrase pass (needs ≥2 tokens) and the surname pass (a single one-word
// name has no distinct surname) both miss. We map each well-known popular name →
// the star's API-Football id as a HIGH-PRIORITY pass that runs BEFORE the generic
// surname pass.
//
// Precision rule (a wrong face is worse than none): only UNAMBIGUOUS popular
// names of clear stars are listed — names that, for the typical reader, refer to
// exactly one player. Keys are normalised (accents folded via `norm`, so
// "Vinícius"/"Vinicius", "Mbappé"/"Mbappe" both hit). Every id has a real photo:
// all are in PHOTO_VERIFIED except a few hard-included stars confirmed by hand
// (e.g. Benzema 759) — alias-mapped ids are TREATED as photo-trusted, so they
// bypass the verifiedPhoto() gate (see headshotForHeadline pass 0).
const MONONYM_ALIASES: Record<string, number> = {
  // Real Madrid / ex-Madrid
  vinicius: 762,        // Vinícius Júnior
  rodrygo: 10009,
  benzema: 759,         // hard-included (confirmed real photo, not in PHOTO_VERIFIED)
  modric: 754,
  endrick: 377122,      // Endrick Felipe (Real Madrid)
  cristiano: 874,       // Cristiano Ronaldo — headlines use "Cristiano" alone too
  // Barcelona
  pedri: 133609,
  gavi: 296667,
  raphinha: 1496,
  yamal: 386828,        // Lamine Yamal
  lewandowski: 521,
  // PSG / France
  mbappe: 278,          // Kylian Mbappé
  dembele: 153,         // Ousmane Dembélé
  kvaratskhelia: 483,
  // other marquee single-name referents
  messi: 154,           // Lionel Messi (Inter Miami — not in our ingested leagues)
  ronaldo: 874,         // Cristiano Ronaldo (Al Nassr — likewise)
  neymar: 276,
  casemiro: 747,
  griezmann: 56,
  salah: 306,           // Mohamed Salah
  lautaro: 217,         // Lautaro Martínez
  vlahovic: 30415,
  rashford: 909,
  isak: 2864,
  musiala: 181812,
  leao: 22236,          // Rafael Leão
  cancelo: 855,         // João Cancelo
}

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

  // Pass 0: a curated popular MONONYM (single-word star name) appears as a whole
  // word. Highest priority — these are unambiguous public referents and the only
  // pass that catches one-word headline names. Alias ids are photo-trusted, so we
  // emit the headshot directly (bypassing the verifiedPhoto gate). Checked before
  // the generic surname pass so a popular single name always wins.
  const padded0 = ` ${h} `
  for (const alias in MONONYM_ALIASES) {
    if (padded0.includes(` ${alias} `)) return apiPhoto(MONONYM_ALIASES[alias])
  }

  // Pass 0.5: an enrichment-cached news name (data/news-name-photos.ts) appears
  // in the headline. These are players news headlines name but who are NOT in
  // SEARCH_INDEX (leagues we don't ingest — Saudi, MLS — or a name form the
  // index passes miss). Resolved at BUILD/CRON time via /players/profiles with
  // precision-first disambiguation and each photo CONFIRMED real, so they are
  // photo-trusted (bypass the verifiedPhoto gate) like the mononyms above.
  // Checked before the index passes so a confidently-enriched id always wins;
  // longest keys first so a full "first last" wins over any shorter contained
  // name, and every key is a whole-word (padded) match (≥2 tokens by build).
  for (const phrase of NEWS_PHOTO_KEYS) {
    if (padded0.includes(` ${phrase} `)) return apiPhoto(NEWS_NAME_PHOTOS[phrase])
  }

  // Pass 0.6: a CONFIRMED enrichment player's SURNAME appears as a whole word.
  // This is what makes surname-only headlines ("Bellingham…", "Messi…") show the
  // real player photo instead of the club crest. Photo-trusted ids. Skip any
  // surname that's ambiguous either within the enrichment map OR across the
  // broader SEARCH_INDEX, so a shared surname never paints the wrong face.
  for (const w of h.split(' ')) {
    if (w.length < 4 || SURNAME_STOPWORDS.has(w) || NEWS_SURNAME_AMBIG.has(w)) continue
    // Risky common surnames: only resolve when unambiguous in the broader index.
    // Distinctive surnames resolve from the confirmed enrichment id regardless,
    // so a famous player isn't blocked just because a minor namesake exists.
    if (SURNAME_RISKY.has(w) && SURNAME_AMBIG.has(w)) continue
    const id = NEWS_SURNAME_TO_ID.get(w)
    if (id) return apiPhoto(id)
  }

  // Pass 1: an unambiguous COMPLETE-name phrase appears in the headline. Scan
  // the phrase map (far smaller than the index) and test whole-word presence
  // via a padded compare. Longer phrases first so a full "luis diaz" wins over
  // any shorter contained name before we ever reach the surname pass.
  const padded = ` ${h} `
  for (const phrase of PHRASES_BY_LEN) {
    if (PHRASE_AMBIG.has(phrase)) continue
    if (padded.includes(` ${phrase} `)) {
      const photo = verifiedPhoto(PHRASE_TO_ID.get(phrase)!)
      if (photo) return photo // else: id has no real photo → keep scanning / fall to crest
    }
  }

  // Pass 2: a distinctive (or star-dominant) surname appears as a whole word.
  const words = new Set(h.split(' ').filter(w => w.length >= 4))
  if (!words.size) return undefined
  for (const w of words) {
    if (SURNAME_STOPWORDS.has(w)) continue // club/place word, not a surname
    if (SURNAME_AMBIG.has(w)) {
      // Shared surname → only resolve if exactly one star owns it.
      if (!SURNAME_STAR_AMBIG.has(w)) {
        const photo = verifiedPhoto(SURNAME_STAR.get(w))
        if (photo) return photo
      }
      continue // otherwise don't guess
    }
    const photo = verifiedPhoto(SURNAME_TO_ID.get(w))
    if (photo) return photo
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
