import type { MetadataRoute } from 'next'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'
import { playerSlug } from '@/lib/player-slug'
import { allLeagueSlugs } from '@/lib/league-data'
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
    ['/goleadores-serie-a',      'weekly',  0.9],
    ['/goleadores-bundesliga',   'weekly',  0.9],
    ['/goleadores-ligue-1',      'weekly',  0.9],
    ['/maximos-goleadores-europa','weekly', 0.9],
    ['/europe-top-scorers',      'weekly',  0.9],
    ['/bota-de-oro',             'weekly',  0.85],
    ['/records',                 'weekly',  0.8],
    ['/transferencias',          'daily',   0.7],
    ['/estadisticas',            'weekly',  0.7],
    ['/estadisticas/comparador', 'weekly',  0.65],
    ['/centrocampistas',         'weekly',  0.7],
    ['/wiki',                    'monthly', 0.6],
    ['/rumores',                 'daily',   0.85],
    ['/clasificacion',           'daily',   0.55],
    ['/encuestas',               'daily',   0.7],
    ['/predicciones',            'daily',   0.75],
  ]

  const staticUrls = staticPaths.flatMap(([p, f, pr]) => localized(p, f, pr))

  const competicionUrls = allLeagueSlugs().flatMap(slug =>
    localized(`/competiciones/${slug}`, 'weekly', 0.8),
  )

  const playerUrls = PLAYERS
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
    .filter(p => p.season === '2526')
    .flatMap(p => localized(`/jugadores/${playerSlug(p)}`, 'weekly', 0.7))

  return [...staticUrls, ...competicionUrls, ...playerUrls]
}
