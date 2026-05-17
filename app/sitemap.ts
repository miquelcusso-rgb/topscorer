import type { MetadataRoute } from 'next'

const BASE = 'https://www.top-scorers.com'
const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
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
  ]
}
