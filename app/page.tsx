import type { Metadata } from 'next'
import MainApp from '@/components/MainApp'

export const metadata: Metadata = {
  title: 'TopScorers — Goleadores y Asistentes Fútbol Europeo',
  description: 'Top 25 goleadores y asistentes de La Liga, Premier League, Bundesliga, Serie A, Ligue 1 y más. Estadísticas actualizadas en tiempo real. Temporada 2025/26.',
  alternates: { canonical: 'https://www.top-scorers.com' },
  openGraph: {
    title: 'TopScorers — Goleadores y Asistentes Fútbol Europeo',
    description: 'Top 25 goleadores y asistentes de las principales ligas europeas. Temporada 2025/26.',
    url: 'https://www.top-scorers.com',
    siteName: 'TopScorers',
    locale: 'es_ES',
    type: 'website',
  },
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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <MainApp />
    </>
  )
}
