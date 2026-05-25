import type { MetadataRoute } from 'next'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'
import { ALL_LEAGUES } from '@/lib/api-football'
import { LOCALES } from '@/lib/i18n'

const BASE = 'https://www.top-scorers.com'
const NOW = new Date()

/**
 * Build a localized sitemap entry for a given path.
 * Emits one entry per locale, each carrying hreflang alternates pointing to
 * every locale variant + x-default. This gives Google the bilingual signal.
 */
function localized(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
): MetadataRoute.Sitemap {
  const clean = path === '/' ? '' : path
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l] = `${BASE}/${l}${clean}`
  languages['x-default'] = `${BASE}/es${clean}`

  return LOCALES.map(l => ({
    url: `${BASE}/${l}${clean}`,
    lastModified: NOW,
    changeFrequency,
    priority,
    alternates: { languages },
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths: [string, MetadataRoute.Sitemap[number]['changeFrequency'], number][] = [
    ['/',                        'hourly',  1],
    ['/resultados',              'hourly',  0.9],
    ['/mundial-2026',            'daily',   0.95],
    ['/pricing',                 'monthly', 0.7],
    ['/about',                   'monthly', 0.5],
    ['/privacidad',              'yearly',  0.3],
    ['/legal',                   'yearly',  0.3],
    ['/jugadores',               'weekly',  0.8],
    ['/competiciones',           'weekly',  0.85],
    ['/descubrir',               'weekly',  0.75],
    ['/goleadores-liga-espanola','weekly',  0.9],
    ['/goleadores-premier-league','weekly', 0.9],
    ['/maximos-goleadores-europa','weekly', 0.9],
    ['/bota-de-oro',             'weekly',  0.85],
    ['/transferencias',          'daily',   0.7],
    ['/estadisticas',            'weekly',  0.7],
    ['/estadisticas/comparador', 'weekly',  0.65],
    ['/centrocampistas',         'weekly',  0.7],
    ['/wiki',                    'monthly', 0.6],
  ]

  const staticUrls = staticPaths.flatMap(([p, f, pr]) => localized(p, f, pr))

  const competicionUrls = ALL_LEAGUES.flatMap(l =>
    localized(`/competiciones/${l.short.toLowerCase()}`, 'weekly', 0.8),
  )

  const playerUrls = PLAYERS
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
    .filter(p => p.season === '2526')
    .flatMap(p => localized(`/jugadores/${slugify(p.name)}`, 'weekly', 0.7))

  return [...staticUrls, ...competicionUrls, ...playerUrls]
}
