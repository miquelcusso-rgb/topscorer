import { unstable_cache } from 'next/cache'
import { headshotForHeadline, crestForHeadline, nationFlagForHeadline, leagueLogoForHeadline, isGlobalArticle, NEWS_GLOBAL_MARK } from './player-photo'

// Free, durable football news via public RSS feeds. We show headline + source +
// date + link to the original (correct RSS use — traffic goes to the source).

export interface NewsItem {
  title: string
  link: string
  source: string
  date: string        // ISO
  lang: 'es' | 'en'   // source-feed language (for the foreign-source badge)
  image?: string      // RAW RSS image — agency-owned. NEVER rehosted/displayed
                      // as licensed. Kept only for server-side signal/debug.
  isPriority?: boolean
  isWorldCup?: boolean
  isBreaking?: boolean   // recent + breaking keyword → eligible for the home banner
  /** License-aware visual resolved server-side (player headshot or club crest;
   *  undefined when neither resolves → card shows a branded placeholder). */
  visual?: NewsVisual
}

// A ToS-safe visual for a news item: either a SPECIFIC player's official
// API-Football headshot (licensed via our API → `agency`) or the relevant
// club's crest (badge → `crest`, identification use). We NEVER expose the raw
// RSS/agency image as licensed, and we no longer fall back to a random generic
// stock scene: when neither a player nor a club resolves, `visual` is omitted
// and the card renders a branded placeholder instead.
export interface NewsVisual {
  url: string
  // agency = player headshot (cover-fit). crest/flag/league/global = a logo or
  // flag (contain-fit). There is ALWAYS a visual now — never the outlet logo,
  // never blank.
  license: 'agency' | 'crest' | 'flag' | 'league' | 'global'
  source?: string   // outlet, for the embed/credit line on the card
}

interface Feed { name: string; url: string; lang: 'es' | 'en' }

// All feeds verified live (2026-06-05). NOTE: AS RSS was dropped — it has been
// abandoned since Aug 2022 (valid XML, zero fresh items). We only ingest feeds
// the publisher publicly exposes, and we show headline + source + link back
// (no article body / images beyond the RSS field) → clean, ToS-safe syndication.
const FEEDS: Feed[] = [
  // Spanish
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00109', lang: 'es' },
  { name: 'Marca', url: 'https://e00-marca.uecdn.es/rss/futbol/primera-division.xml', lang: 'es' },
  { name: 'Marca — Más fútbol', url: 'https://e00-marca.uecdn.es/rss/futbol/mas-futbol.xml', lang: 'es' },
  { name: 'Marca — Champions', url: 'https://e00-marca.uecdn.es/rss/futbol/champions-league.xml', lang: 'es' },
  { name: 'Mundo Deportivo', url: 'https://www.mundodeportivo.com/rss/futbol', lang: 'es' },
  { name: 'Sport', url: 'https://www.sport.es/es/rss/futbol/rss.xml', lang: 'es' },
  { name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundodeporte/rss/futbol.xml', lang: 'es' },
  { name: 'ABC', url: 'https://www.abc.es/rss/feeds/abc_Deportes.xml', lang: 'es' },
  // English
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
  // Per-league coverage via Google News RSS (each item links to the original
  // publisher → clean link-back). Gives dedicated Serie A / Bundesliga / Ligue 1
  // depth the outlet feeds lacked. Dedup-by-title collapses overlaps.
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

// Internationally-followed clubs + marquee names → boosted to the top.
const PRIORITY = [
  'real madrid', 'barcelona', 'barça', 'atlético', 'atletico', 'manchester city', 'man city',
  'manchester united', 'man united', 'liverpool', 'arsenal', 'chelsea', 'tottenham',
  'psg', 'paris saint', 'bayern', 'juventus', 'inter', 'milan', 'napoli', 'dortmund',
  'messi', 'mbapp', 'haaland', 'vinicius', 'vinícius', 'yamal', 'bellingham', 'cristiano', 'ronaldo',
]
const WORLD_CUP = ['mundial', 'world cup', 'copa del mundo', 'fifa', 'selección', 'seleccion', 'la roja']
// Strong "breaking" signals in ES/EN sports headlines. Combined with a recency
// gate (<90 min old) to power the home breaking banner without false positives.
const BREAKING = [
  'oficial', 'official', 'última hora', 'ultima hora', 'breaking', 'confirmado', 'confirmed',
  'acuerdo', 'done deal', 'here we go', 'ficha por', 'signs for', 'fichaje cerrado',
  'lesión', 'lesion', 'baja', 'ruled out', 'injury', 'destituido', 'sacked', 'dimite', 'resigns',
]
const BREAKING_WINDOW_MS = 90 * 60 * 1000

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim()
}
const pick = (block: string, tag: string) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return m ? decode(m[1]) : ''
}
// Bump a thumbnail URL toward a larger render when the size is encoded in the
// URL (cheap, no rehosting — still the publisher's own CDN image).
function upgradeImageUrl(url: string): string {
  return url
    // BBC ichef: /news/240/cpsprodpb/... or /standard/240/ → request 800px wide
    .replace(/\/(?:news|standard|ace)\/(?:cpsprodpb\/)?\d{2,4}\//, m => m.replace(/\d{2,4}/, '800'))
    // Common query-param resizers: width=NN / w=NN / size=NN → 800
    .replace(/([?&](?:width|w|size|imwidth)=)\d{2,4}/i, '$1800')
    // Google/WordPress style -120x90 / -300x200 size suffix → drop it (full size)
    .replace(/-\d{2,4}x\d{2,4}(\.(?:jpe?g|png|webp))/i, '$1')
}

function pickImage(block: string): string | undefined {
  // Gather every media candidate with any declared width, prefer the widest.
  let best: { url: string; w: number } | undefined
  const re = /<(?:enclosure|media:content|media:thumbnail)\b([^>]*)\/?>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(block))) {
    const attrs = m[1]
    const urlM = attrs.match(/url="([^"]+)"/i)
    if (!urlM) continue
    // Only consider image candidates (skip video/audio enclosures).
    const typeM = attrs.match(/type="([^"]+)"/i)
    if (typeM && !/^image\//i.test(typeM[1])) continue
    const wM = attrs.match(/width="(\d+)"/i)
    const w = wM ? Number(wM[1]) : 0
    if (!best || w > best.w) best = { url: urlM[1], w }
  }
  if (best) return upgradeImageUrl(best.url)
  // Fallback: first <img> embedded in the description/content. Descriptions are
  // often HTML-entity-encoded (&lt;img…&gt;), so search a lightly-decoded copy.
  const decoded = block.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?34;/g, '"')
  const img = decoded.match(/<img[^>]*\bsrc=["']([^"']+)["']/i)
  return img ? upgradeImageUrl(img[1]) : undefined
}

function parseFeed(xml: string, source: string, lang: 'es' | 'en'): NewsItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? []
  const out: NewsItem[] = []
  for (const b of blocks) {
    const title = pick(b, 'title')
    let link = pick(b, 'link')
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); if (m) link = m[1] }
    const dateRaw = pick(b, 'pubDate') || pick(b, 'published') || pick(b, 'updated')
    const d = dateRaw ? new Date(dateRaw) : null
    if (!title || !link) continue
    out.push({ title, link: link.trim(), source, lang, date: (d && !isNaN(d.getTime()) ? d : new Date(0)).toISOString(), image: pickImage(b) })
  }
  return out
}

const fetchOne = async (f: Feed): Promise<NewsItem[]> => {
  try {
    const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TopScorersBot/1.0)', 'Accept': 'application/rss+xml, application/xml, text/xml' } })
    if (!res.ok) return []
    return parseFeed(await res.text(), f.name, f.lang)
  } catch { return [] }
}

// Same-as-site-language recency boost (ms). Modest vs the ~6h priority boost so
// foreign-language sources still appear in the mix, but the site language keeps
// the upper hand at similar freshness. ~3h.
const SAME_LANG_BOOST_MS = 3 * 60 * 60 * 1000

export const getNews = unstable_cache(
  // `lang` is now the SITE language: it drives the same-language sort bias and
  // the foreign-source badge — NOT a hard filter. We ingest ALL feeds (es + en).
  async (lang: 'es' | 'en', scope: 'general' | 'worldcup' = 'general', limit = 40): Promise<NewsItem[]> => {
    const results = await Promise.all(FEEDS.map(fetchOne))
    const seen = new Set<string>()
    // Dedup by title prefix, but visit site-language items first so that when the
    // same headline appears in both languages the site-language copy is the one
    // kept (cleaner UX — no badge on a story we have natively).
    let items = results.flat()
      .sort((a, b) => (a.lang === lang ? 0 : 1) - (b.lang === lang ? 0 : 1))
      .filter(it => {
        const k = it.title.toLowerCase().slice(0, 60)
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
    const nowMs = Date.now()
    for (const it of items) {
      const t = it.title.toLowerCase()
      it.isPriority = PRIORITY.some(p => t.includes(p))
      it.isWorldCup = WORLD_CUP.some(p => t.includes(p))
      const ageMs = nowMs - new Date(it.date).getTime()
      it.isBreaking = ageMs >= 0 && ageMs <= BREAKING_WINDOW_MS && BREAKING.some(p => t.includes(p))
    }
    if (scope === 'worldcup') items = items.filter(it => it.isWorldCup)
    // Sort by recency, nudging priority items up (~6h boost) and same-as-site-
    // language items up a bit (~3h) so the site language dominates while foreign
    // sources still surface in the mix.
    items.sort((a, b) => {
      const sa = new Date(a.date).getTime() + (a.isPriority ? 21600000 : 0) + (a.lang === lang ? SAME_LANG_BOOST_MS : 0)
      const sb = new Date(b.date).getTime() + (b.isPriority ? 21600000 : 0) + (b.lang === lang ? SAME_LANG_BOOST_MS : 0)
      return sb - sa
    })
    return items.slice(0, limit)
  },
  ['football-news'],
  { revalidate: 1200, tags: ['news'] } // 20 min
)

// Resolve a ToS-safe visual for a news item (SERVER ONLY). Owner directive:
// ALWAYS show an image, and always the RIGHT one — never blank, never a wrong
// player, never the news outlet's logo. Strict priority, first hit wins:
//   1. the SPECIFIC player the headline names (rigorous — full name / unique
//      surname / unambiguous star) → official API-Football headshot (`agency`);
//   2. a club named in the headline → club crest (`crest`);
//   3. a national team named → that nation's flag (`flag`);
//   4. a league named → league logo (`league`);
//   5. fallback → the brand "world football" mark (`global`) — used for global
//      ranking pieces and as the guaranteed last resort.
// `it.image` (the raw RSS/agency photo) is deliberately ignored — external
// content is never rehosted.
export function resolveNewsVisual(it: Pick<NewsItem, 'title' | 'source'>): NewsVisual {
  const src = it.source
  const headshot = headshotForHeadline(it.title)
  if (headshot) return { url: headshot, license: 'agency', source: src }
  // Global/ranking pieces have no single subject → go straight to the brand mark
  // rather than guessing a tangential club/league mentioned in passing.
  if (!isGlobalArticle(it.title)) {
    const crest = crestForHeadline(it.title)
    if (crest) return { url: crest, license: 'crest', source: src }
    const flag = nationFlagForHeadline(it.title)
    if (flag) return { url: flag, license: 'flag', source: src }
    const league = leagueLogoForHeadline(it.title)
    if (league) return { url: league, license: 'league', source: src }
  }
  return { url: NEWS_GLOBAL_MARK, license: 'global', source: src }
}

/** getNews + a resolved, license-aware `visual` (headshot/crest, or none). */
export async function getNewsWithVisuals(
  lang: 'es' | 'en', scope: 'general' | 'worldcup' = 'general', limit = 40,
): Promise<NewsItem[]> {
  const items = await getNews(lang, scope, limit)
  return items.map(it => ({ ...it, visual: resolveNewsVisual(it) }))
}
