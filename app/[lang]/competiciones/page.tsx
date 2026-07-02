import type { Metadata } from 'next'
import Link from 'next/link'
import {
  LEAGUES,
  LEAGUES_EUROPE_OTHER,
  LEAGUES_AMERICAS,
  LEAGUES_ASIA_OCEANIA,
  LEAGUES_MIDDLE_EAST,
  LEAGUES_EURO,
  ALL_LEAGUES,
} from '@/lib/api-football'
import { isLocale, type Lang } from '@/lib/i18n'
import { leagueSlug } from '@/lib/league-data'
import SaasShell from '@/components/saas/SaasShell'
import RelatedLinks from '@/components/RelatedLinks'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/competiciones'
  return {
    title: 'Competiciones de Fútbol — 30+ ligas globales',
    description: 'Estadísticas de 30+ ligas: Big-5, segundas divisiones, MLS, Saudi Pro League, Brasileirão, Liga MX, J1, K1 y más. Clasificaciones y goleadores en tiempo real.',
    keywords: ['la liga', 'premier league', 'bundesliga', 'serie a', 'mls', 'saudi pro league', 'brasileirão', 'liga mx', 'j1 league', 'champions league', 'segunda división', 'championship'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: 'Competiciones de Fútbol — La Liga, Premier, Bundesliga | TopScorers',
      description: 'Todas las ligas europeas: clasificaciones, goleadores y resultados.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
  }
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Competiciones', item: 'https://www.top-scorers.com/competiciones' },
  ],
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Competiciones de Fútbol Europeo',
  url: 'https://www.top-scorers.com/competiciones',
  itemListElement: ALL_LEAGUES.map((league, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: league.name,
    url: `https://www.top-scorers.com/competiciones/${leagueSlug(league)}`,
  })),
}

export default async function CompeticionesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const breadcrumb = lang === 'en' ? ['Competitions'] : ['Competiciones']
  const sections = [
    { title: 'Grandes Ligas Europeas',  leagues: LEAGUES },
    { title: 'Otras Ligas Europeas',    leagues: LEAGUES_EUROPE_OTHER },
    // Segundas divisiones: fuera del índice a propósito — se llega a la 2ª de
    // cada país desde la página de su 1ª división.
    { title: 'Américas',                leagues: LEAGUES_AMERICAS },
    { title: 'Asia y Oceanía',          leagues: LEAGUES_ASIA_OCEANIA },
    { title: 'Oriente Medio',           leagues: LEAGUES_MIDDLE_EAST },
    { title: 'Competiciones Europeas',  leagues: LEAGUES_EURO },
  ]
  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--ts-text)', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
        {lang === 'en' ? 'Competitions' : 'Competiciones'}
      </h1>
      {sections.map(section => (
        <div key={section.title} className="mb-10">
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ts-muted)', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 12 }}>
            {section.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {section.leagues.map(league => (
              <Link key={league.id} href={`/${lang}/competiciones/${leagueSlug(league)}`} style={{ textDecoration: 'none' }}>
                <div
                  className="rounded-lg p-4 flex items-center gap-3 transition-all duration-150"
                  style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', cursor: 'pointer' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://media.api-sports.io/football/leagues/${league.id}.png`}
                    alt={league.name}
                    width={28}
                    height={28}
                    style={{ borderRadius: 3 }}
                  />
                  <div>
                    {/* Fix audit pass 1: was grey-on-grey muted color, now `var(--ts-text)` */}
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts-text)' }}>{league.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{league.country}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      <RelatedLinks
        title={lang === 'en' ? 'Top scorer rankings' : 'Rankings de goleadores'}
        exclude={['/competiciones']}
      />
    </SaasShell>
  )
}
