import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import Mundial2026Client from './Mundial2026Client'
import { wcFaqs } from './wc-faqs'
import WorldCupFriendlies from '@/components/saas/WorldCupFriendlies'
import { getFriendlies, getTopScorers, type ApiPlayerResponse } from '@/lib/api-football'

// Auto-refresh hourly so the Golden Boot table, groups and results stay live and
// the friendlies→group-stage transition flips on its own around kickoff.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026'
  // The root layout applies a `%s | TopScorers` title template, so the <title>
  // here must NOT repeat the brand (the OG title, which isn't templated, keeps it).
  const title = lang === 'en'
    ? '2026 World Cup: Golden Boot, Groups & Live Results'
    : 'Mundial 2026: Bota de Oro, Grupos y Resultados en directo'
  const description = lang === 'en'
    ? 'Follow the 2026 World Cup live: Golden Boot top scorers, groups, standings and results of all 48 teams across the USA, Canada and Mexico.'
    : 'Sigue el Mundial 2026 en directo: Bota de Oro (máximos goleadores), grupos, clasificación y resultados de las 48 selecciones en USA, Canadá y México.'
  return {
    title,
    description,
    openGraph: {
      title: `${title} | TopScorers`,
      description: lang === 'en' ? '48 teams · 16 venues · 1 trophy. Live Golden Boot, groups and results.' : '48 selecciones · 16 sedes · 1 trofeo. Bota de Oro, grupos y resultados en directo.',
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
  const breadcrumb = lang === 'en' ? ['Competitions', 'World Cup 2026'] : ['Competiciones', 'Mundial 2026']

  // Live Golden Boot data (league 1 = FIFA World Cup, season 2026). Defensive:
  // any error → [] (pre-tournament the API has no scorers yet). Seeds the client
  // so scorers land in the initial HTML, and powers the ItemList JSON-LD.
  let scorers: ApiPlayerResponse[] = []
  try { scorers = await getTopScorers(1, 2026) } catch { scorers = [] }

  // Data-driven transition: the tournament is "started" once the API reports
  // World Cup scorers (i.e. the first goals are in). More robust than a hardcoded
  // kickoff date — no clock drift, reflects the real tournament. Until then the
  // groups, calendar and build-up friendlies carry the page (never empty).
  const started = scorers.length > 0

  // Build-up friendlies: only fetched/shown before the tournament starts. After
  // kickoff the page's own content (Golden Boot, groups, results) takes over —
  // clean transition, never an empty page.
  const friendlies = started ? [] : await getFriendlies('2026-05-15', '2026-06-11')

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
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      {ld(sportsEventJsonLd)}
      {ld(breadcrumbJsonLd)}
      {ld(faqJsonLd)}
      {scorersItemListJsonLd && ld(scorersItemListJsonLd)}
      <Mundial2026Client initialScorers={scorers} started={started} />
      {!started && <WorldCupFriendlies fixtures={friendlies} lang={lang} />}
    </SaasShell>
  )
}
