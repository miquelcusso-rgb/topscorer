import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Estadísticas de Fútbol — Goleadores y Asistentes | TopScorers',
  description: 'Estadísticas completas de fútbol europeo: goles, asistencias, valoraciones y comparador de jugadores de La Liga, Premier League, Bundesliga, Serie A y más.',
  keywords: ['estadísticas fútbol', 'comparador jugadores', 'datos fútbol europeo', 'goleadores', 'asistentes', 'valoración jugadores'],
  alternates: { canonical: 'https://www.top-scorers.com/estadisticas' },
  openGraph: {
    title: 'Estadísticas de Fútbol — Goleadores y Asistentes | TopScorers',
    description: 'Estadísticas completas de fútbol europeo: goles, asistencias y comparador de jugadores.',
    url: 'https://www.top-scorers.com/estadisticas',
    siteName: 'TopScorers',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: 'https://www.top-scorers.com/og-default.jpg', width: 1200, height: 630, alt: 'TopScorers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estadísticas de Fútbol — Goleadores y Asistentes | TopScorers',
    description: 'Estadísticas completas de fútbol europeo: goles, asistencias y comparador de jugadores.',
    images: ['https://www.top-scorers.com/og-default.jpg'],
  },
}

export default function EstadisticasPage() {
  redirect('/')
}
