import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import GroupsPanel from '../../_panels/GroupsPanel'
import { getAllStandings, type ApiStandingEntry } from '@/lib/api-football'

// Groups update live during the tournament → revalidate hourly. The data is
// server-rendered + ISR (NOT per-request); the panel keeps the seed.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/grupos'
  const title = lang === 'en'
    ? '2026 World Cup Groups: Standings of all 12 groups'
    : 'Grupos del Mundial 2026: Clasificación de los 12 grupos'
  const description = lang === 'en'
    ? 'All 12 groups of the 2026 World Cup with live standings: teams, points and ranking of the 48 nations across the USA, Canada and Mexico.'
    : 'Los 12 grupos del Mundial 2026 con la clasificación en directo: equipos, puntos y posiciones de las 48 selecciones en USA, Canadá y México.'
  return {
    title,
    description,
    openGraph: {
      title: `${title} | TopScorers`,
      description,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-mundial-${lang}.jpg`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    keywords: ['grupos mundial 2026', 'world cup 2026 groups', 'clasificación mundial 2026', 'world cup 2026 standings', 'sorteo mundial 2026'],
  }
}

export default async function GruposPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'

  // Server-seed so the groups land in the initial HTML (SEO) — no "Cargando".
  // Defensive: any error → [] (the panel client-fetches too).
  let groups: ApiStandingEntry[][] = []
  try { groups = await getAllStandings(1, 2026) } catch { groups = [] }

  // Real draw groups only (Group A–L) — mirror the panel's tolerant matcher so
  // the ItemList reflects exactly what renders.
  const groupLetter = (name?: string) => (name ?? '').match(/group\s+([a-l])\s*$/i)?.[1]?.toUpperCase()
  const realGroups = groups
    .filter(g => g.length >= 2 && groupLetter(g[0]?.group))
    .sort((a, b) => (groupLetter(a[0]?.group) ?? '').localeCompare(groupLetter(b[0]?.group) ?? ''))

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Groups' : 'Grupos', item: `https://www.top-scorers.com/${lang}/mundial-2026/grupos` },
    ],
  }

  const itemListJsonLd = realGroups.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en' ? '2026 World Cup groups' : 'Grupos del Mundial 2026',
    description: lang === 'en'
      ? 'The 2026 FIFA World Cup draw groups with the nations in each group.'
      : 'Los grupos del sorteo del Mundial 2026 con las selecciones de cada grupo.',
    url: `https://www.top-scorers.com/${lang}/mundial-2026/grupos`,
    numberOfItems: realGroups.length,
    itemListElement: realGroups.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${lang === 'en' ? 'Group' : 'Grupo'} ${groupLetter(g[0]?.group)}: ${g.map(r => r.team.name).join(', ')}`,
    })),
  } : null

  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  return (
    <>
      {ld(breadcrumbJsonLd)}
      {itemListJsonLd && ld(itemListJsonLd)}
      <GroupsPanel initial={groups} />
    </>
  )
}
