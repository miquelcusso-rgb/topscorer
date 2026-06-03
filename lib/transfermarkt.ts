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

export interface TmProfile {
  contractExpires?: string  // e.g. "30/06/2029"
  joined?: string           // at current club since
  foot?: string             // "right" | "left" | "both"
  agent?: string            // player agent / agency (only public, no contact data)
  outfitter?: string        // kit brand (adidas/Nike…)
  placeOfBirth?: string
  height?: string           // "1,86 m"
}

const clean = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

// Profile "info-table" (contract, foot, joined…). PUBLIC scouting fields only —
// never contact details. <es2018-safe regex (no dotAll flag).
export const tmProfile = unstable_cache(
  async (tmId: number): Promise<TmProfile> => {
    try {
      const res = await fetch(`https://www.transfermarkt.com/-/profil/spieler/${tmId}`, { headers })
      if (!res.ok) return {}
      const html = await res.text()
      const pairs: Record<string, string> = {}
      const re = /<span class="info-table__content info-table__content--regular">([^<]*)<\/span>\s*<span class="info-table__content info-table__content--bold">([\s\S]*?)<\/span>/g
      let m: RegExpExecArray | null
      while ((m = re.exec(html))) {
        const label = clean(m[1]).replace(/:$/, '').toLowerCase()
        const value = clean(m[2])
        if (label && value) pairs[label] = value
      }
      return {
        contractExpires: pairs['contract expires'] || undefined,
        joined: pairs['joined'] || undefined,
        foot: pairs['foot'] || undefined,
        agent: pairs['player agent'] || undefined,
        outfitter: pairs['outfitter'] || undefined,
        placeOfBirth: pairs['place of birth'] || undefined,
        height: pairs['height'] || undefined,
      }
    } catch { return {} }
  },
  ['tm-profile'],
  { revalidate: 604800, tags: ['transfermarkt'] } // 7d
)

/** Scouting profile fields resolved from a player name (search → profile). */
export async function scoutByName(name: string): Promise<TmProfile & { tmId: number | null }> {
  const tmId = await tmSearchId(name)
  if (!tmId) return { tmId: null }
  return { tmId, ...(await tmProfile(tmId)) }
}
