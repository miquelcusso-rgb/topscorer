import type { MetadataRoute } from 'next'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'

const BASE = 'https://www.top-scorers.com'
const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const playerUrls: MetadataRoute.Sitemap = PLAYERS
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
    .filter(p => p.season === '2526')
    .map(p => ({
      url: `${BASE}/jugadores/${slugify(p.name)}`,
      lastModified: NOW,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [
    {
      url: BASE,
      lastModified: NOW,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${BASE}/resultados`,
      lastModified: NOW,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE}/mundial-2026`,
      lastModified: NOW,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE}/pricing`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/about`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE}/privacidad`,
      lastModified: NOW,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/legal`,
      lastModified: NOW,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/jugadores`,
      lastModified: NOW,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...playerUrls,
  ]
}
