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
}

interface Feed { name: string; url: string; lang: 'es' | 'en' }

const FEEDS: Feed[] = [
  // Spanish
  { name: 'Europa Press', url: 'https://www.europapress.es/rss/rss.aspx?ch=00109', lang: 'es' },
  { name: 'AS', url: 'https://as.com/rss/futbol/primera.xml', lang: 'es' },
  { name: 'Marca', url: 'https://e00-marca.uecdn.es/rss/futbol/primera-division.xml', lang: 'es' },
  { name: 'Mundo Deportivo', url: 'https://www.mundodeportivo.com/rss/futbol', lang: 'es' },
  { name: 'Sport', url: 'https://www.sport.es/es/rss/futbol/rss.xml', lang: 'es' },
  // English
  { name: 'The Guardian', url: 'https://www.theguardian.com/football/rss', lang: 'en' },
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', lang: 'en' },
]

// Internationally-followed clubs + marquee names → boosted to the top.
const PRIORITY = [
  'real madrid', 'barcelona', 'barça', 'atlético', 'atletico', 'manchester city', 'man city',
  'manchester united', 'man united', 'liverpool', 'arsenal', 'chelsea', 'tottenham',
  'psg', 'paris saint', 'bayern', 'juventus', 'inter', 'milan', 'napoli', 'dortmund',
  'messi', 'mbapp', 'haaland', 'vinicius', 'vinícius', 'yamal', 'bellingham', 'cristiano', 'ronaldo',
]
const WORLD_CUP = ['mundial', 'world cup', 'copa del mundo', 'fifa', 'selección', 'seleccion', 'la roja']

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
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
    for (const it of items) {
      const t = it.title.toLowerCase()
      it.isPriority = PRIORITY.some(p => t.includes(p))
      it.isWorldCup = WORLD_CUP.some(p => t.includes(p))
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
