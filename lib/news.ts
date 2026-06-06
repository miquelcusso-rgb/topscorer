import { unstable_cache } from 'next/cache'

// Free, durable football news via public RSS feeds. We show headline + source +
// date + link to the original (correct RSS use — traffic goes to the source).

export interface NewsItem {
  title: string
  link: string
  source: string
  date: string        // ISO
  image?: string
  isPriority?: boolean
  isWorldCup?: boolean
  isBreaking?: boolean   // recent + breaking keyword → eligible for the home banner
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
function pickImage(block: string): string | undefined {
  const enc = block.match(/<(?:enclosure|media:content|media:thumbnail)[^>]*url="([^"]+)"/i)
  if (enc) return enc[1]
  const img = block.match(/<img[^>]*src="([^"]+)"/i)
  return img ? img[1] : undefined
}

function parseFeed(xml: string, source: string): NewsItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? []
  const out: NewsItem[] = []
  for (const b of blocks) {
    const title = pick(b, 'title')
    let link = pick(b, 'link')
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); if (m) link = m[1] }
    const dateRaw = pick(b, 'pubDate') || pick(b, 'published') || pick(b, 'updated')
    const d = dateRaw ? new Date(dateRaw) : null
    if (!title || !link) continue
    out.push({ title, link: link.trim(), source, date: (d && !isNaN(d.getTime()) ? d : new Date(0)).toISOString(), image: pickImage(b) })
  }
  return out
}

const fetchOne = async (f: Feed): Promise<NewsItem[]> => {
  try {
    const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TopScorersBot/1.0)', 'Accept': 'application/rss+xml, application/xml, text/xml' } })
    if (!res.ok) return []
    return parseFeed(await res.text(), f.name)
  } catch { return [] }
}

export const getNews = unstable_cache(
  async (lang: 'es' | 'en', scope: 'general' | 'worldcup' = 'general', limit = 40): Promise<NewsItem[]> => {
    const feeds = FEEDS.filter(f => f.lang === lang)
    const results = await Promise.all(feeds.map(fetchOne))
    const seen = new Set<string>()
    let items = results.flat().filter(it => {
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
    // Sort by recency, nudging priority items up (~6h boost).
    items.sort((a, b) => {
      const sa = new Date(a.date).getTime() + (a.isPriority ? 21600000 : 0)
      const sb = new Date(b.date).getTime() + (b.isPriority ? 21600000 : 0)
      return sb - sa
    })
    return items.slice(0, limit)
  },
  ['football-news'],
  { revalidate: 1200, tags: ['news'] } // 20 min
)
