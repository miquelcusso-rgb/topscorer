import type { Metadata } from 'next'
import { isLocale, type Lang } from '@/lib/i18n'
import SaasHomeBody from '@/components/saas/SaasHomeBody'
import { CURRENT_SEASON_SHORT } from '@/lib/season'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/centrocampistas'
  return {
    title: 'Mejores Centrocampistas — Estadísticas y Asistencias',
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
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Mejores Centrocampistas — Estadísticas y Asistencias | TopScorers',
      description: 'Ranking de los mejores centrocampistas del fútbol europeo.',
      images: [`https://www.top-scorers.com/og-default-${lang}.jpg`],
    },
  }
}

export default async function CentrocampistasPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: raw } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const heading = lang === 'en'
    ? { breadcrumb: ['Statistics', 'Midfielders'], h1: 'Best midfielders · Europe', sub: `Season ${CURRENT_SEASON_SHORT} · ranked by G+A · last-5 ratings` }
    : { breadcrumb: ['Estadísticas', 'Centrocampistas'], h1: 'Mejores centrocampistas · Europa', sub: `Temporada ${CURRENT_SEASON_SHORT} · por G+A · valoración últimos 5` }
  return (
    <SaasHomeBody
      lang={lang}
      defaultPos="mf"
      heading={heading}
      itemList={{
        name: lang === 'en' ? `Best midfielders in Europe ${CURRENT_SEASON_SHORT}` : `Mejores centrocampistas de Europa ${CURRENT_SEASON_SHORT}`,
        url: `https://www.top-scorers.com/${lang}/centrocampistas`,
      }}
    />
  )
}
