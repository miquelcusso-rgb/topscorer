import { unstable_cache } from 'next/cache'

const UA = 'TopScorers/1.0 (https://www.top-scorers.com)'

export interface PlayerBio {
  title: string
  extract: string
  url: string
  thumbnail?: string
}

// Short bio for a player from Wikipedia (free, no key). Resolves the article
// title via search (disambiguated with "footballer"/"futbolista") then pulls the
// REST summary. Cached 30d — bios change slowly.
export const getPlayerBio = unstable_cache(
  async (name: string, lang: 'es' | 'en'): Promise<PlayerBio | null> => {
    try {
      const wiki = lang === 'en' ? 'en' : 'es'
      const qualifier = lang === 'en' ? 'footballer' : 'futbolista'
      const searchUrl = `https://${wiki}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`${name} ${qualifier}`)}&srlimit=1&format=json`
      const sr = await fetch(searchUrl, { headers: { 'User-Agent': UA } })
      if (!sr.ok) return null
      const sj = await sr.json() as { query?: { search?: Array<{ title: string }> } }
      const title = sj.query?.search?.[0]?.title
      if (!title) return null

      const sumUrl = `https://${wiki}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`
      const res = await fetch(sumUrl, { headers: { 'User-Agent': UA } })
      if (!res.ok) return null
      const d = await res.json() as {
        title?: string; extract?: string; type?: string
        content_urls?: { desktop?: { page?: string } }; thumbnail?: { source?: string }
      }
      if (!d.extract || d.type === 'disambiguation') return null
      // Only trust results that read like a footballer bio.
      if (!new RegExp(qualifier, 'i').test(d.extract) && !/football|soccer|fútbol|futbol/i.test(d.extract)) return null
      // Guard against the wrong same-initials player: the searched surname must
      // appear in the resolved title (accent-insensitive).
      const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      const surname = norm(name).split(/\s+/).filter(Boolean).pop() ?? ''
      if (surname.length >= 3 && !norm(d.title ?? title).includes(surname)) return null
      return {
        title: d.title ?? title,
        extract: d.extract.length > 420 ? d.extract.slice(0, 420).replace(/\s+\S*$/, '') + '…' : d.extract,
        url: d.content_urls?.desktop?.page ?? `https://${wiki}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        thumbnail: d.thumbnail?.source,
      }
    } catch { return null }
  },
  ['wikipedia-bio'],
  { revalidate: 2592000, tags: ['wikipedia'] } // 30d
)
