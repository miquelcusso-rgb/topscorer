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

function buildFaq(lang: string) {
  const entries =
    lang === 'en'
      ? [
          ['Who is the top scorer in Europe this season?', 'TopScorers ranks the leading scorers across La Liga, the Premier League, Serie A, the Bundesliga and Ligue 1 in real time. The combined European ranking is updated as matches are played during the 2025/26 season.'],
          ['Where can I see the top scorers of each league?', 'TopScorers has a dedicated page for each major league: LaLiga (Pichichi), the Premier League, Serie A (capocannoniere), the Bundesliga and Ligue 1, each with the top 25 scorers updated live.'],
          ['What is the Golden Boot and how is it calculated?', 'The European Golden Boot is awarded to the top scorer across European leagues, with goals weighted by the strength of each league. TopScorers shows the live Golden Boot standings with that weighting applied.'],
          ['How often is the data updated?', 'Scorer and assist data is sourced from API-Football and refreshed in near real time, typically within minutes of matches finishing.'],
        ]
      : [
          ['¿Quién es el máximo goleador de Europa esta temporada?', 'TopScorers ordena en tiempo real a los máximos goleadores de LaLiga, la Premier League, la Serie A, la Bundesliga y la Ligue 1. El ranking europeo combinado se actualiza a medida que se juegan los partidos de la temporada 2025/26.'],
          ['¿Dónde veo los goleadores de cada liga?', 'TopScorers tiene una página por cada gran liga: LaLiga (Pichichi), Premier League, Serie A (capocannoniere), Bundesliga y Ligue 1, cada una con el top 25 de goleadores actualizado en directo.'],
          ['¿Qué es la Bota de Oro y cómo se calcula?', 'La Bota de Oro europea premia al máximo goleador de las ligas europeas, ponderando los goles según la dificultad de cada liga. TopScorers muestra la clasificación de la Bota de Oro en directo con esa ponderación aplicada.'],
          ['¿Cada cuánto se actualizan los datos?', 'Los datos de goleadores y asistentes provienen de API-Football y se actualizan casi en tiempo real, normalmente pocos minutos después de terminar los partidos.'],
        ]
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang === 'en' ? 'en' : 'es',
    mainEntity: entries.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  const lang = isLocale(rawLang) ? rawLang : 'es'
  const faqJsonLd = buildFaq(lang)
  // Fetch the 8 European headline leagues (both tabs) in parallel for the home cross-table
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />
      <MainApp initialPlayers={initialPlayers.length > 0 ? initialPlayers : undefined} />
    </>
  )
}
