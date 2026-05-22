import type { MetadataRoute } from 'next'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'
import { ALL_LEAGUES } from '@/lib/api-football'

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

  const competicionUrls: MetadataRoute.Sitemap = ALL_LEAGUES.map(l => ({
    url: `${BASE}/competiciones/${l.short.toLowerCase()}`,
    lastModified: NOW,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
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
    {
      url: `${BASE}/competiciones`,
      lastModified: NOW,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE}/descubrir`,
      lastModified: NOW,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${BASE}/transferencias`,
      lastModified: NOW,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE}/estadisticas/comparador`,
      lastModified: NOW,
      changeFrequency: 'weekly',
      priority: 0.65,
    },
    ...competicionUrls,
    ...playerUrls,
  ]
}
