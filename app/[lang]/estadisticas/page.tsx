import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isLocale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/estadisticas'
  return {
    title: 'Estadísticas de Fútbol — Goleadores y Asistentes',
    description: 'Estadísticas completas de fútbol europeo: goles, asistencias, valoraciones y comparador de jugadores de La Liga, Premier League, Bundesliga, Serie A y más.',
    keywords: ['estadísticas fútbol', 'comparador jugadores', 'datos fútbol europeo', 'goleadores', 'asistentes', 'valoración jugadores'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: 'Estadísticas de Fútbol — Goleadores y Asistentes | TopScorers',
      description: 'Estadísticas completas de fútbol europeo: goles, asistencias y comparador de jugadores.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Estadísticas de Fútbol — Goleadores y Asistentes | TopScorers',
      description: 'Estadísticas completas de fútbol europeo: goles, asistencias y comparador de jugadores.',
      images: [`https://www.top-scorers.com/og-default-${lang}.jpg`],
    },
  }
}

export default function EstadisticasPage() {
  redirect('/')
}
