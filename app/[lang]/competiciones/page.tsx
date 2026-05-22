import type { Metadata } from 'next'
import Link from 'next/link'
import { LEAGUES, LEAGUES_2, LEAGUES_EURO } from '@/lib/api-football'
import { isLocale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/competiciones'
  return {
    title: 'Competiciones de Fútbol — La Liga, Premier, Bundesliga | TopScorers',
    description: 'Estadísticas de La Liga, Premier League, Bundesliga, Serie A, Ligue 1, Champions League y más. Clasificaciones, goleadores y resultados en tiempo real.',
    keywords: ['la liga', 'premier league', 'bundesliga', 'serie a', 'champions league', 'europa league', 'ligas futbol europeo'],
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
      locale: 'es_ES',
      type: 'website',
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
  itemListElement: [...LEAGUES, ...LEAGUES_EURO].map((league, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: league.name,
    url: `https://www.top-scorers.com/competiciones/${league.short.toLowerCase()}`,
  })),
}

export default function CompeticionesPage() {
  const sections = [
    { title: 'Grandes Ligas',          leagues: LEAGUES },
    { title: 'Segunda División',       leagues: LEAGUES_2 },
    { title: 'Competiciones Europeas', leagues: LEAGUES_EURO },
  ]
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
    <div className="max-w-[1100px] mx-auto px-5 py-8">
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 800, color: '#eef4ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 32 }}>
        Competiciones
      </h1>
      {sections.map(section => (
        <div key={section.title} className="mb-10">
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#6878a0', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 12 }}>
            {section.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {section.leagues.map(league => (
              <Link key={league.id} href={`/?liga=${league.short}`} style={{ textDecoration: 'none' }}>
                <div
                  className="rounded-lg p-4 flex items-center gap-3 transition-all duration-150"
                  style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${league.color}22`, cursor: 'pointer' }}
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
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#dde8ff' }}>{league.name}</div>
                    <div style={{ fontSize: 10, color: '#6878a0' }}>{league.country}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
    </>
  )
}
