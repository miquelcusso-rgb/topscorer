import { unstable_cache } from 'next/cache'

// Lightweight Transfermarkt reader. Uses TM's own internal JSON endpoint for the
// market-value history (no HTML parsing) + the quick-search to map a player name
// → TM id. Cached aggressively so we never hammer TM. If TM ever blocks our
// server egress we move this behind an offline scrape → Supabase cache.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const headers = { 'User-Agent': UA, 'Accept': 'application/json, text/html', 'Accept-Language': 'en' }

export interface MarketValuePoint {
  date: string   // ISO yyyy-mm-dd
  value: number  // euros
  label: string  // "€180.00m"
  club: string
  crest?: string
  age?: string
}

// name → Transfermarkt player id (first/most-relevant quick-search result).
export const tmSearchId = unstable_cache(
  async (name: string): Promise<number | null> => {
    try {
      const res = await fetch(`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(name)}`, { headers })
      if (!res.ok) return null
      const html = await res.text()
      const m = html.match(/\/spieler\/(\d+)/)
      return m ? Number(m[1]) : null
    } catch { return null }
  },
  ['tm-search'],
  { revalidate: 2592000, tags: ['transfermarkt'] } // 30d — ids don't change
)

// Market-value history for a TM player id.
export const tmMarketValue = unstable_cache(
  async (tmId: number): Promise<MarketValuePoint[]> => {
    try {
      const res = await fetch(`https://www.transfermarkt.com/ceapi/marketValueDevelopment/graph/${tmId}`, { headers })
      if (!res.ok) return []
      const data = await res.json() as { list?: Array<{ x: number; y: number; mw: string; datum_mw: string; verein: string; wappen?: string; age?: string }> }
      return (data.list ?? []).map(p => ({
        date: new Date(p.x).toISOString().slice(0, 10),
        value: Number(p.y) || 0,
        label: p.mw,
        club: p.verein,
        crest: p.wappen || undefined,
        age: p.age,
      }))
    } catch { return [] }
  },
  ['tm-marketvalue'],
  { revalidate: 604800, tags: ['transfermarkt'] } // 7d — values update ~weekly
)

/** Resolve market-value history from a player name (search → graph). */
export async function marketValueByName(name: string): Promise<{ tmId: number | null; points: MarketValuePoint[] }> {
  const tmId = await tmSearchId(name)
  if (!tmId) return { tmId: null, points: [] }
  return { tmId, points: await tmMarketValue(tmId) }
}
