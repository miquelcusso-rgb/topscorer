import type { Metadata } from 'next'
import MainApp from '@/components/MainApp'
import { getTopScorers, getTopAssists, LEAGUES } from '@/lib/api-football'
import { transformApiPlayer } from '@/lib/api-to-players'
import { isLocale } from '@/lib/i18n'
import type { PlayerData } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = ''
  return {
    title: 'TopScorers — Goleadores y Asistentes Fútbol Europeo',
    description: 'Top 25 goleadores y asistentes de La Liga, Premier League, Bundesliga, Serie A, Ligue 1 y más. Estadísticas actualizadas en tiempo real. Temporada 2025/26.',
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: 'TopScorers — Goleadores y Asistentes Fútbol Europeo',
      description: 'Top 25 goleadores y asistentes de las principales ligas europeas. Temporada 2025/26.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TopScorers',
  url: 'https://www.top-scorers.com',
  description: 'Estadísticas de fútbol europeo: goleadores, asistentes y centrocampistas de las principales ligas.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.top-scorers.com/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export const revalidate = 3600

export default async function Home() {
  // Fetch all 8 leagues, both tabs, in parallel
  let initialPlayers: PlayerData[] = []
  try {
    const season = 2025
    const [scorerResults, assistResults] = await Promise.all([
      Promise.all(LEAGUES.map(l => getTopScorers(l.id, season))),
      Promise.all(LEAGUES.map(l => getTopAssists(l.id, season))),
    ])
    for (const results of scorerResults) {
      for (const r of results) {
        const p = transformApiPlayer(r, 's')
        if (p && p.pj > 0) initialPlayers.push(p)
      }
    }
    for (const results of assistResults) {
      for (const r of results) {
        const p = transformApiPlayer(r, 'a')
        if (p && p.pj > 0) initialPlayers.push(p)
      }
    }
  } catch {
    // will fall back to static PLAYERS in StatsPanel
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <MainApp initialPlayers={initialPlayers.length > 0 ? initialPlayers : undefined} />
    </>
  )
}
