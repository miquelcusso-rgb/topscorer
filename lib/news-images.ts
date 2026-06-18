// Curated generic images for news/rumour cards that have NO resolvable player
// headshot. These are SELF-HOSTED, ORIGINAL graphics under `public/news/*`
// (authored by Furiosa Studio) — NOT photographs scraped from a feed. We treat
// them as `cc0` (public-domain-equivalent: our own work, free to use, no
// attribution required) so the license model classifies them as publishable
// with zero rights risk. We deliberately self-host instead of hotlinking a CC0
// stock host: it removes any hotlink/availability/attribution ambiguity and
// costs nothing on the Vercel free tier (tiny inline SVGs, no image transforms).

export type GenericImage = { url: string; license: 'cc0'; alt: string }

const IMAGES = {
  pitch:   { url: '/news/pitch.svg',   license: 'cc0', alt: 'Football pitch' },
  stadium: { url: '/news/stadium.svg', license: 'cc0', alt: 'Stadium under lights' },
  ball:    { url: '/news/ball.svg',    license: 'cc0', alt: 'Football on the grass' },
  crowd:   { url: '/news/crowd.svg',   license: 'cc0', alt: 'Stadium crowd' },
  trophy:  { url: '/news/trophy.svg',  license: 'cc0', alt: 'Trophy' },
} as const satisfies Record<string, GenericImage>

export type GenericImageKey = keyof typeof IMAGES

// Map a free-text hint (a league name, a category, or a headline) to a stable
// generic image. Keyword buckets first (so "Champions"/"final"/"trophy" →
// trophy, "transfer"/"rumour"/"deal" → crowd, etc.), then a deterministic hash
// fallback so the same hint always yields the same image (no layout churn).
const BUCKETS: Array<[RegExp, GenericImageKey]> = [
  [/champion|final|trophy|title|copa|ucl|trofeo|bota de oro|golden boot|ballon/i, 'trophy'],
  [/transfer|rumou?r|rumor|deal|fichaj|traspaso|mercado|signing|loan|cedid/i, 'crowd'],
  [/stadium|estadio|arena|attendance|fans|afici|crowd|home|visit/i, 'stadium'],
  [/goal|gol|scor|striker|delanter|shot|penalty|penalti|hat-?trick/i, 'ball'],
  [/laliga|la liga|premier|bundesliga|serie a|ligue 1|eredivisie|liga/i, 'pitch'],
]

function hashKey(s: string): GenericImageKey {
  const keys = Object.keys(IMAGES) as GenericImageKey[]
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return keys[Math.abs(h) % keys.length]
}

/** Pick a stable, rights-safe generic CC0 image for a category/league/headline. */
export function genericImageFor(hint?: string): GenericImage {
  const h = (hint ?? '').trim()
  if (!h) return IMAGES.pitch
  for (const [re, key] of BUCKETS) if (re.test(h)) return IMAGES[key]
  return IMAGES[hashKey(h.toLowerCase())]
}

export { IMAGES as GENERIC_IMAGES }
