import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import AssistsPanel from '../../_panels/AssistsPanel'
import { assistsFaqs } from '../../wc-faqs'
import { getTopAssists, type ApiPlayerResponse } from '@/lib/api-football'

// Live ranking → revalidate hourly (the panel also refetches on the client).
export const revalidate = 86400 // torneo acabado (19-jul-2026): archivo, 24h de sobra

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/asistentes'

  // Dynamic title with the live assists leader + count + freshness (cached fetch
  // → no extra quota; reuses the same getTopAssists call the page body runs).
  let leaderName: string | undefined
  let leaderAssists = 0
  try {
    const a = await getTopAssists(1, 2026)
    leaderName = a[0]?.player?.name
    leaderAssists = a[0]?.statistics[0]?.goals?.assists ?? 0
  } catch { /* leave undefined → static title */ }

  const title = leaderName
    ? (lang === 'en'
        ? `World Cup 2026 assists LIVE: ${leaderName} leads with ${leaderAssists} · standings updated`
        : `Asistentes Mundial 2026 EN DIRECTO: ${leaderName} lidera con ${leaderAssists} · clasificación actualizada`)
    : (lang === 'en'
        ? '2026 World Cup Top Assists: Live assists standings'
        : 'Asistentes del Mundial 2026: Clasificación de asistencias en directo')
  const description = lang === 'en'
    ? 'Live ranking of the top assists at the 2026 World Cup: the players providing the most final passes before a goal, updated live through the group stage and knockout rounds.'
    : 'Ranking en directo de los máximos asistentes del Mundial 2026: los jugadores con más pases de gol, actualizado en vivo desde la fase de grupos hasta las eliminatorias.'
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

  // Server-rendered freshness date (locale-formatted) → passed into the panel so
  // the "Actualizado / Updated" line is in the initial HTML.
  const updated = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

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

  // FAQPage JSON-LD from the SAME source the panel renders. Concrete when a
  // leader exists in the server seed → citable for GEO.
  const leaderName = assists[0]?.player?.name
  const leaderAssists = assists[0]?.statistics[0]?.goals?.assists ?? 0
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: assistsFaqs(lang, leaderName, leaderName ? leaderAssists : undefined).map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  return (
    <>
      {ld(breadcrumbJsonLd)}
      {itemListJsonLd && ld(itemListJsonLd)}
      {ld(faqJsonLd)}
      <AssistsPanel initial={assists} updated={updated} />
    </>
  )
}
