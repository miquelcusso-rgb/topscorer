import type { MetadataRoute } from 'next'
import { allPlayerSlugs } from '@/lib/player-slug'
import { allLeagueSlugs, leaguesWithData } from '@/lib/league-data'
import { majorTeamSlugs } from '@/lib/team-data'
import { WC_NATIONS, nationSlug } from '@/lib/wc-nations'
import { COMPETITIONS } from '@/lib/golden-boot-data'
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
    // World Cup 2026 tab routes (each its own indexable URL). High priority —
    // seasonal traffic surface. hourly/daily mirrors each route's revalidate.
    ['/mundial-2026/grupos',     'hourly',  0.9],
    ['/mundial-2026/calendario', 'hourly',  0.9],
    ['/mundial-2026/resultados', 'hourly',  0.9],
    ['/mundial-2026/bota-de-oro','hourly',  0.9],
    ['/mundial-2026/asistentes', 'hourly',  0.88],
    ['/mundial-2026/disciplina', 'daily',   0.85],
    ['/mundial-2026/bajas',      'daily',   0.85],
    ['/mundial-2026/noticias',   'hourly',  0.85],
    ['/mundial-2026/sedes',      'monthly', 0.8],
    ['/pricing',                 'monthly', 0.7],
    ['/about',                   'monthly', 0.5],
    ['/terminos',                'yearly',  0.3],
    ['/cookies',                 'yearly',  0.3],
    ['/aviso',                   'yearly',  0.3],
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

  // Team pages (/equipo/[slug]). Only the MAJOR clubs (majorTeamSlugs = the ~24
  // prerendered, deepest-squad, highest-search-value teams) — NOT all 1001. On a
  // young low-authority domain, listing the full long tail (incl. thin 2nd-div
  // clubs) risks index bloat; the rest are discovered via internal links from
  // league/competition pages and get indexed as authority grows. Expand to
  // top-flight-league teams once domain authority supports it.
  const teamUrls = majorTeamSlugs().flatMap(slug =>
    localized(`/equipo/${slug}`, 'weekly', 0.7),
  )

  // Scouter Top-20 programmatic pages: an index + one page per league that has
  // tracked players (same set generateStaticParams produces, so no listed URL
  // 404s). Both locales + hreflang via localized().
  const scouterUrls = [
    ...localized('/scouter', 'weekly', 0.8),
    ...leaguesWithData().flatMap(({ slug }) =>
      localized(`/scouter/${slug}`, 'weekly', 0.75),
    ),
  ]

  // Only the slugs the player page actually resolves (same canonical set +
  // slug fn as resolvePlayerProfile), so the sitemap never lists a /jugadores
  // URL that 404s. See lib/player-slug.ts → allPlayerSlugs().
  const playerUrls = allPlayerSlugs()
    .flatMap(slug => localized(`/jugadores/${slug}`, 'weekly', 0.7))

  // World Cup 2026 national-team profiles (hosts + favourites/likely qualifiers
  // with hand-written facts). Late qualifiers still work by slug but aren't
  // pre-listed here. Deduped by canonical slug — WC_NATIONS lists a couple of
  // teams twice with the same slug, which would otherwise emit duplicate URLs.
  // High priority (0.85): this is the seasonal traffic surface we want indexed
  // ahead of the tournament. Daily changeFrequency — squads/lineups update live.
  const seenNation = new Set<string>()
  const nationUrls = WC_NATIONS.flatMap(n => {
    const slug = nationSlug(n)
    if (seenNation.has(slug)) return []
    seenNation.add(slug)
    return localized(`/mundial-2026/${slug}`, 'daily', 0.85)
  })

  // Golden Boot evergreen cluster (data-driven from COMPETITIONS → no manual
  // list to drift). Same set generateStaticParams produces, so no listed URL 404s.
  const goldenBootUrls = [
    ...localized('/golden-boot', 'weekly', 0.85), // hub del cluster
    ...COMPETITIONS.flatMap(c => localized(`/golden-boot/${c.slug}`, 'weekly', 0.85)),
  ]

  return [...staticUrls, ...competicionUrls, ...teamUrls, ...scouterUrls, ...goldenBootUrls, ...playerUrls, ...nationUrls]
}
