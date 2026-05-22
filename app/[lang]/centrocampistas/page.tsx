import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isLocale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/centrocampistas'
  return {
    title: 'Mejores Centrocampistas — Estadísticas y Asistencias | TopScorers',
    description: 'Ranking de los mejores centrocampistas del fútbol europeo: asistencias, pases clave y valoración por 90 minutos en La Liga, Premier League, Bundesliga, Serie A y más.',
    keywords: ['centrocampistas', 'mejores centrocampistas', 'asistencias fútbol', 'mediocampistas la liga', 'creadores de juego'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: 'Mejores Centrocampistas — Estadísticas y Asistencias | TopScorers',
      description: 'Ranking de los mejores centrocampistas del fútbol europeo: asistencias y valoración por 90 minutos.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: 'es_ES',
      type: 'website',
      images: [{ url: 'https://www.top-scorers.com/og-default.jpg', width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Mejores Centrocampistas — Estadísticas y Asistencias | TopScorers',
      description: 'Ranking de los mejores centrocampistas del fútbol europeo.',
      images: ['https://www.top-scorers.com/og-default.jpg'],
    },
  }
}

export default function CentrocampistasPage() {
  redirect('/')
}
