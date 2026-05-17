import type { Metadata } from 'next'
import Mundial2026Client from './Mundial2026Client'

export const metadata: Metadata = {
  title: 'Mundial 2026 — Grupos, Resultados y Goleadores | TopScorers',
  description: 'Sigue el FIFA World Cup 2026 en tiempo real. Grupos, resultados, clasificaciones y top goleadores del Mundial 2026 en USA, Canadá y México.',
  openGraph: {
    title: 'Mundial 2026 — Grupos, Resultados y Goleadores | TopScorers',
    description: 'Sigue el FIFA World Cup 2026 en tiempo real. 48 selecciones, 3 sedes, 1 trofeo.',
    url: 'https://www.top-scorers.com/mundial-2026',
    siteName: 'TopScorers',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: 'https://www.top-scorers.com/og-mundial.jpg', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://www.top-scorers.com/mundial-2026' },
  keywords: ['mundial 2026', 'world cup 2026', 'FIFA 2026', 'goleadores mundial', 'grupos mundial 2026'],
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'FIFA World Cup 2026',
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  location: [
    { '@type': 'Place', name: 'MetLife Stadium', address: { '@type': 'PostalAddress', addressCountry: 'US' } },
    { '@type': 'Place', name: 'Estadio Azteca', address: { '@type': 'PostalAddress', addressCountry: 'MX' } },
    { '@type': 'Place', name: 'BC Place', address: { '@type': 'PostalAddress', addressCountry: 'CA' } },
  ],
  organizer: { '@type': 'Organization', name: 'FIFA', url: 'https://www.fifa.com' },
  description: 'The 2026 FIFA World Cup is the 23rd edition of the tournament, hosted by the United States, Canada, and Mexico.',
  url: 'https://www.top-scorers.com/mundial-2026',
}

export default function Mundial2026Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Mundial2026Client />
    </>
  )
}
