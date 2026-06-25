/**
 * news-resolver.mjs — shared helpers for the news-photo enrichment toolchain.
 *
 * Mirrors the matching primitives in lib/player-photo.ts (norm, the resolver
 * passes) and lib/news.ts (the RSS feed list + headline decode), so the
 * diagnostic (scripts/diagnose-news-photos.mjs) and the enrichment script
 * (scripts/enrich-news-photos.mjs) test exactly what the running app resolves.
 *
 * Read-only / build-time only. NEVER imported by the app.
 */
import { readFileSync } from 'fs'

export function loadEnv(path = '.env.local') {
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
}

export const norm = (s) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '').trim()

const firstLast = (s) => { const p = s.split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1]}` : s }
const surnameOf = (base) => { const toks = base.split(' ').filter((t) => t.length >= 4); return toks[toks.length - 1] ?? '' }

// ── Load the search index + curated ids + verified set, same files the app uses
export function loadSearchIndex() {
  const src = readFileSync('data/search-index.ts', 'utf8')
  const m = src.match(/JSON\.parse\((\"[\s\S]*\")\)/)
  return JSON.parse(JSON.parse(m[1]))
}
export function loadCuratedIds() {
  const src = readFileSync('data/curated-ids.ts', 'utf8')
  return JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1))
}
export function loadVerified() {
  const src = readFileSync('data/photo-verified.ts', 'utf8')
  const body = src.slice(src.indexOf('[') + 1, src.lastIndexOf(']'))
  return new Set(body.split(',').map((x) => Number(x.trim())).filter(Boolean))
}
export function loadNewsNamePhotos() {
  try {
    const src = readFileSync('data/news-name-photos.ts', 'utf8')
    const obj = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1))
    const m = new Map()
    for (const [k, v] of Object.entries(obj)) m.set(k, v)
    return m
  } catch { return new Map() }
}

// MONONYM_ALIASES + SURNAME_STOPWORDS kept in sync with lib/player-photo.ts.
export const MONONYM_ALIASES = {
  vinicius: 762, rodrygo: 10009, benzema: 759, modric: 754,
  pedri: 133609, gavi: 296667, raphinha: 1496, yamal: 386828, lewandowski: 521,
  mbappe: 278, dembele: 153, kvaratskhelia: 483,
  messi: 154, ronaldo: 874,
  neymar: 276, casemiro: 747, griezmann: 56, salah: 306, lautaro: 217,
  vlahovic: 30415, rashford: 909, isak: 2864, musiala: 181812, leao: 22236, cancelo: 855,
}
export const SURNAME_STOPWORDS = new Set([
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

/**
 * Build the resolver — a function headline → id|undefined that mirrors
 * headshotForHeadline's PASS 0/1/2 logic (and the new news-name-photos pass).
 * `verified` gates passes 1/2 exactly like the app. Pass 0 (mononym) and the
 * news-name-photos pass are photo-trusted (bypass the gate), as in the app.
 */
export function buildResolver({ index, curated, verified, newsNamePhotos = new Map() }) {
  const STAR_IDS = new Set(Object.values(curated))
  const PHRASE_TO_ID = new Map(); const PHRASE_AMBIG = new Set()
  const addPhrase = (phrase, id) => {
    if (!phrase || phrase.split(' ').length < 2) return
    const cur = PHRASE_TO_ID.get(phrase)
    if (cur === undefined) PHRASE_TO_ID.set(phrase, id)
    else if (cur !== id) PHRASE_AMBIG.add(phrase)
  }
  const SURNAME_TO_ID = new Map(); const SURNAME_AMBIG = new Set()
  const SURNAME_STAR = new Map(); const SURNAME_STAR_AMBIG = new Set()
  for (const p of index) {
    if (!p.id) continue
    const name = norm(p.name); const full = norm(p.fullName)
    addPhrase(name, p.id); if (full) addPhrase(full, p.id)
    const surname = surnameOf(full || name)
    if (!surname || SURNAME_STOPWORDS.has(surname)) continue
    const cur = SURNAME_TO_ID.get(surname)
    if (cur === undefined) SURNAME_TO_ID.set(surname, p.id)
    else if (cur !== p.id) SURNAME_AMBIG.add(surname)
    if (STAR_IDS.has(p.id)) {
      const s = SURNAME_STAR.get(surname)
      if (s === undefined) SURNAME_STAR.set(surname, p.id)
      else if (s !== p.id) SURNAME_STAR_AMBIG.add(surname)
    }
  }
  const PHRASES_BY_LEN = [...PHRASE_TO_ID.keys()].sort((a, b) => b.length - a.length)
  const verifiedPhoto = (id) => (id && verified.has(id) ? id : undefined)

  return function resolve(headline) {
    const h = norm(headline)
    if (!h) return { id: undefined, pass: null }
    const padded = ` ${h} `
    // Pass 0: mononym alias
    for (const alias in MONONYM_ALIASES) {
      if (padded.includes(` ${alias} `)) return { id: MONONYM_ALIASES[alias], pass: 'mononym' }
    }
    // Pass 0.5: news-name-photos cache (photo-trusted, whole-phrase whole-word)
    for (const [phrase, id] of newsNamePhotos) {
      if (phrase.split(' ').length < 2) {
        if (padded.includes(` ${phrase} `)) return { id, pass: 'news-cache' }
      } else if (padded.includes(` ${phrase} `)) return { id, pass: 'news-cache' }
    }
    // Pass 1: complete-name phrase, verified-gated
    for (const phrase of PHRASES_BY_LEN) {
      if (PHRASE_AMBIG.has(phrase)) continue
      if (padded.includes(` ${phrase} `)) {
        const id = verifiedPhoto(PHRASE_TO_ID.get(phrase))
        if (id) return { id, pass: 'phrase' }
      }
    }
    // Pass 2: distinctive surname, verified-gated
    const words = new Set(h.split(' ').filter((w) => w.length >= 4))
    for (const w of words) {
      if (SURNAME_STOPWORDS.has(w)) continue
      if (SURNAME_AMBIG.has(w)) {
        if (!SURNAME_STAR_AMBIG.has(w)) {
          const id = verifiedPhoto(SURNAME_STAR.get(w))
          if (id) return { id, pass: 'surname-star' }
        }
        continue
      }
      const id = verifiedPhoto(SURNAME_TO_ID.get(w))
      if (id) return { id, pass: 'surname' }
    }
    return { id: undefined, pass: null }
  }
}

// ── RSS feeds (mirrors lib/news.ts FEEDS) ───────────────────────────────────
export const FEEDS = [
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00109', lang: 'es' },
  { name: 'Marca', url: 'https://e00-marca.uecdn.es/rss/futbol/primera-division.xml', lang: 'es' },
  { name: 'Marca — Más fútbol', url: 'https://e00-marca.uecdn.es/rss/futbol/mas-futbol.xml', lang: 'es' },
  { name: 'Marca — Champions', url: 'https://e00-marca.uecdn.es/rss/futbol/champions-league.xml', lang: 'es' },
  { name: 'Mundo Deportivo', url: 'https://www.mundodeportivo.com/rss/futbol', lang: 'es' },
  { name: 'Sport', url: 'https://www.sport.es/es/rss/futbol/rss.xml', lang: 'es' },
  { name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundodeporte/rss/futbol.xml', lang: 'es' },
  { name: 'ABC', url: 'https://www.abc.es/rss/feeds/abc_Deportes.xml', lang: 'es' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/football/rss', lang: 'en' },
  { name: 'Guardian — Transfers', url: 'https://www.theguardian.com/football/transfer-window/rss', lang: 'en' },
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', lang: 'en' },
  { name: 'BBC — Premier League', url: 'https://feeds.bbci.co.uk/sport/football/premier-league/rss.xml', lang: 'en' },
  { name: 'ESPN', url: 'https://www.espn.com/espn/rss/soccer/news', lang: 'en' },
  { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040', lang: 'en' },
  { name: 'Sky — Transfer Centre', url: 'https://www.skysports.com/rss/12691', lang: 'en' },
  { name: 'talkSPORT', url: 'https://talksport.com/football/feed/', lang: 'en' },
  { name: 'Football365', url: 'https://www.football365.com/rss', lang: 'en' },
  { name: 'The Independent', url: 'https://www.independent.co.uk/sport/football/rss', lang: 'en' },
  { name: 'LaLiga', url: 'https://news.google.com/rss/search?q=LaLiga+f%C3%BAtbol&hl=es&gl=ES&ceid=ES:es', lang: 'es' },
  { name: 'Premier League', url: 'https://news.google.com/rss/search?q=Premier+League+f%C3%BAtbol&hl=es&gl=ES&ceid=ES:es', lang: 'es' },
  { name: 'Serie A', url: 'https://news.google.com/rss/search?q=Serie+A+f%C3%BAtbol&hl=es&gl=ES&ceid=ES:es', lang: 'es' },
  { name: 'Bundesliga', url: 'https://news.google.com/rss/search?q=Bundesliga+f%C3%BAtbol&hl=es&gl=ES&ceid=ES:es', lang: 'es' },
  { name: 'Ligue 1', url: 'https://news.google.com/rss/search?q=Ligue+1+f%C3%BAtbol&hl=es&gl=ES&ceid=ES:es', lang: 'es' },
  { name: 'LaLiga', url: 'https://news.google.com/rss/search?q=La+Liga+football&hl=en-GB&gl=GB&ceid=GB:en', lang: 'en' },
  { name: 'Premier League', url: 'https://news.google.com/rss/search?q=Premier+League+football&hl=en-GB&gl=GB&ceid=GB:en', lang: 'en' },
  { name: 'Serie A', url: 'https://news.google.com/rss/search?q=Serie+A+football&hl=en-GB&gl=GB&ceid=GB:en', lang: 'en' },
  { name: 'Bundesliga', url: 'https://news.google.com/rss/search?q=Bundesliga+football&hl=en-GB&gl=GB&ceid=GB:en', lang: 'en' },
  { name: 'Ligue 1', url: 'https://news.google.com/rss/search?q=Ligue+1+football&hl=en-GB&gl=GB&ceid=GB:en', lang: 'en' },
]

function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).trim()
}
function pickTitle(block) {
  const m = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return m ? decode(m[1]) : ''
}
export async function fetchHeadlines() {
  const all = await Promise.all(FEEDS.map(async (f) => {
    try {
      const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TopScorersBot/1.0)', 'Accept': 'application/rss+xml, application/xml, text/xml' } })
      if (!res.ok) return []
      const xml = await res.text()
      const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? []
      return blocks.map(pickTitle).filter(Boolean)
    } catch { return [] }
  }))
  return [...new Set(all.flat())]
}

// ── Candidate name extraction from headlines ────────────────────────────────
// Multi-word capitalized sequences (incl. accented/European letters) + known
// single-name stars. Strips Google-News " - Source" suffixes first.
const CAP = "A-ZÀ-ÖØ-Þ"
const LOW = "a-zà-öø-ÿ"
const NAME_RE = new RegExp(`\\b[${CAP}][${LOW}'’.-]+(?:\\s+(?:de|del|van|von|der|dos|da|di|el|al)\\s+)?(?:\\s+[${CAP}][${LOW}'’.-]+){1,2}`, 'g')
const COMMON_NONNAME = new Set([
  'real madrid', 'manchester united', 'manchester city', 'aston villa', 'west ham',
  'la liga', 'serie a', 'premier league', 'champions league', 'europa league',
  'nations league', 'world cup', 'copa del', 'champions', 'borussia dortmund',
  'bayern munich', 'inter milan', 'paris saint', 'sporting cp', 'crystal palace',
  'world cup', 'fa cup', 'carabao cup', 'el clasico', 'el clásico',
])
export function extractCandidates(headline) {
  const stripped = headline.replace(/\s+-\s+[^-]+$/, '') // drop Google-News source suffix
  const out = new Set()
  for (const m of stripped.matchAll(NAME_RE)) {
    const raw = m[0].trim()
    const n = norm(raw)
    if (!n || n.split(' ').length < 2) continue
    if (COMMON_NONNAME.has(n)) continue
    out.add(raw)
  }
  return [...out]
}
