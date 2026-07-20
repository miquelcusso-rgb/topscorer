import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import { wcFaqs } from '../wc-faqs'
import OverviewPanel from '../_panels/OverviewPanel'
import KnockoutPanel from '../_panels/KnockoutPanel'
import ChampionPanel from '../_panels/ChampionPanel'
import { getTopScorers, getTopAssists, type ApiPlayerResponse } from '@/lib/api-football'

// Tournament OVER (final 19-jul-2026): the page is an archive now. Daily ISR is
// plenty — hourly refresh just burned api-football quota + Vercel ISR writes.
export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026'
  // The root layout applies a `%s | TopScorers` title template, so the <title>
  // here must NOT repeat the brand (the OG title, which isn't templated, keeps it).
  const title = lang === 'en'
    ? '2026 World Cup: Spain Champions — Final, Golden Boot & Results'
    : 'Mundial 2026: España Campeona — Final, Bota de Oro y Resultados'
  const description = lang === 'en'
    ? 'Spain won the 2026 World Cup, beating Argentina 1-0 in the final (Ferran Torres, 106\'). Full bracket, Golden Boot standings and results of all 48 teams.'
    : 'España ganó el Mundial 2026 al vencer 1-0 a Argentina en la final (Ferran Torres, 106\'). Cuadro completo, Bota de Oro y resultados de las 48 selecciones.'
  return {
    title,
    description,
    openGraph: {
      title: `${title} | TopScorers`,
      description: lang === 'en' ? '🏆 Spain 1-0 Argentina. Final bracket, Golden Boot and results of the 2026 World Cup.' : '🏆 España 1-0 Argentina. Cuadro final, Bota de Oro y resultados del Mundial 2026.',
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
    keywords: ['mundial 2026', 'world cup 2026', 'FIFA 2026', 'bota de oro mundial', 'golden boot world cup', 'goleadores mundial 2026', 'grupos mundial 2026'],
  }
}

const sportsEventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'FIFA World Cup 2026',
  sport: 'Soccer',
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  eventStatus: 'https://schema.org/EventScheduled',
  image: [
    'https://www.top-scorers.com/og-mundial-es.jpg',
    'https://www.top-scorers.com/og-mundial-en.jpg',
  ],
  location: [
    { '@type': 'Place', name: 'Estadio Azteca', address: { '@type': 'PostalAddress', addressLocality: 'Mexico City', addressCountry: 'MX' } },
    { '@type': 'Place', name: 'MetLife Stadium', address: { '@type': 'PostalAddress', addressLocality: 'New York/New Jersey', addressCountry: 'US' } },
    { '@type': 'Place', name: 'BC Place', address: { '@type': 'PostalAddress', addressLocality: 'Vancouver', addressCountry: 'CA' } },
  ],
  organizer: { '@type': 'Organization', name: 'FIFA', url: 'https://www.fifa.com' },
  // performer: schema.org permite un subconjunto (no exige los 48). Las anfitrionas
  // están 100% confirmadas → dato seguro que satisface el campo. NO añadimos `offers`:
  // no vendemos entradas (tracker gratuito) y un offers ficticio sería markup engañoso.
  performer: [
    { '@type': 'SportsTeam', name: 'United States' },
    { '@type': 'SportsTeam', name: 'Canada' },
    { '@type': 'SportsTeam', name: 'Mexico' },
  ],
  description: 'The 2026 FIFA World Cup is the 23rd edition of the tournament, the first with 48 teams, co-hosted by the United States, Canada and Mexico.',
  url: 'https://www.top-scorers.com/mundial-2026',
}

export default async function Mundial2026Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'

  // Live Golden Boot data (league 1 = FIFA World Cup, season 2026). Defensive:
  // any error → [] (pre-tournament the API has no scorers yet). Seeds the
  // Overview teasers so scorers land in the initial HTML, and powers the
  // ItemList JSON-LD.
  let scorers: ApiPlayerResponse[] = []
  try { scorers = await getTopScorers(1, 2026) } catch { scorers = [] }

  // Top assists — server-seeded twin of scorers so the Assists teaser lands in
  // the initial HTML when data exists. Defensive: any error → [].
  let assists: ApiPlayerResponse[] = []
  try { assists = await getTopAssists(1, 2026) } catch { assists = [] }

  // Tournament over: no friendlies, no "started" transition — the ChampionPanel
  // (static, curated) is the portada's opening screen regardless of API state.
  const leader = scorers[0]?.player?.name

  const goals = lang === 'en' ? 'goals' : 'goles'
  const scorersItemListJsonLd = scorers.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en' ? '2026 World Cup Golden Boot — top scorers' : 'Bota de Oro del Mundial 2026 — máximos goleadores',
    description: lang === 'en'
      ? 'Live top scorers of the 2026 FIFA World Cup, ranked by goals.'
      : 'Máximos goleadores del Mundial 2026 en tiempo real, ordenados por goles.',
    url: `https://www.top-scorers.com/${lang}/mundial-2026`,
    numberOfItems: Math.min(scorers.length, 10),
    itemListElement: scorers.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.player.name} — ${p.statistics[0]?.goals?.total ?? 0} ${goals} (${p.statistics[0]?.team?.name ?? ''})`,
    })),
  } : null

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: wcFaqs(lang, leader).map(({ q, a }) => ({
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
      {ld(sportsEventJsonLd)}
      {ld(breadcrumbJsonLd)}
      {ld(faqJsonLd)}
      {scorersItemListJsonLd && ld(scorersItemListJsonLd)}
      {/* Champion hero first — the tournament is over, this IS the portada. */}
      <ChampionPanel lang={lang} />
      <KnockoutPanel lang={lang} />
      <OverviewPanel scorers={scorers} assists={assists} />
    </>
  )
}
