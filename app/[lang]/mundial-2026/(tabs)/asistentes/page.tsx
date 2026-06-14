import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import AssistsPanel from '../../_panels/AssistsPanel'
import { getTopAssists, type ApiPlayerResponse } from '@/lib/api-football'

// Live ranking → revalidate hourly (the panel also refetches on the client).
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/asistentes'
  const title = lang === 'en'
    ? '2026 World Cup Top Assists: Live assists ranking'
    : 'Asistentes del Mundial 2026: Ranking de asistencias en directo'
  const description = lang === 'en'
    ? 'Live ranking of the top assists at the 2026 World Cup: the players providing the most final passes before a goal, updated throughout the tournament.'
    : 'Ranking en directo de los máximos asistentes del Mundial 2026: los jugadores con más pases de gol, actualizado durante todo el torneo.'
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
    keywords: ['asistentes mundial 2026', 'world cup 2026 assists', 'máximos asistentes mundial', 'world cup 2026 top assists', 'asistencias mundial 2026'],
  }
}

export default async function AsistentesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'

  // Server-seed so the ranking lands in the initial HTML (SEO) and powers the
  // ItemList JSON-LD. Defensive: any error → [] (the panel client-fetches too).
  let assists: ApiPlayerResponse[] = []
  try { assists = await getTopAssists(1, 2026) } catch { assists = [] }

  const ast = lang === 'en' ? 'assists' : 'asistencias'
  const itemListJsonLd = assists.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en' ? '2026 World Cup top assists' : 'Máximos asistentes del Mundial 2026',
    description: lang === 'en'
      ? 'Live top assists of the 2026 FIFA World Cup, ranked by assists.'
      : 'Máximos asistentes del Mundial 2026 en tiempo real, ordenados por asistencias.',
    url: `https://www.top-scorers.com/${lang}/mundial-2026/asistentes`,
    numberOfItems: Math.min(assists.length, 10),
    itemListElement: assists.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.player.name} — ${p.statistics[0]?.goals?.assists ?? 0} ${ast} (${p.statistics[0]?.team?.name ?? ''})`,
    })),
  } : null

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Assists' : 'Asistentes', item: `https://www.top-scorers.com/${lang}/mundial-2026/asistentes` },
    ],
  }
  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  return (
    <>
      {ld(breadcrumbJsonLd)}
      {itemListJsonLd && ld(itemListJsonLd)}
      <AssistsPanel initial={assists} />
    </>
  )
}
