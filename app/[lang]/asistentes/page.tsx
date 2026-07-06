import type { Metadata } from 'next'
import { isLocale, type Lang } from '@/lib/i18n'
import SaasHomeBody from '@/components/saas/SaasHomeBody'
import { CURRENT_SEASON_SHORT } from '@/lib/season'

// Pillar de asistencias (brief producto 5-jul): el tab 'ast' ya genera el
// ranking — esta página lo expone como URL propia con ItemList citable.
// KWs: "máximos asistentes 2026", "líderes de asistencias", "most assists 2025/26".
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/asistentes'
  const en = lang === 'en'
  const title = en
    ? `Most Assists ${CURRENT_SEASON_SHORT} — Assist Leaders in Europe`
    : `Máximos Asistentes ${CURRENT_SEASON_SHORT} — Líderes de Asistencias`
  const description = en
    ? `Live ranking of the players with the most assists in European football ${CURRENT_SEASON_SHORT}: assist leaders in La Liga, Premier League, Bundesliga, Serie A and Ligue 1, updated after every match.`
    : `Ranking en directo de los máximos asistentes del fútbol europeo ${CURRENT_SEASON_SHORT}: líderes de asistencias en LaLiga, Premier League, Bundesliga, Serie A y Ligue 1, actualizado tras cada partido.`
  return {
    title,
    description,
    keywords: en
      ? ['most assists 2025/26', 'assist leaders', 'top assists europe', 'assists ranking']
      : ['máximos asistentes 2026', 'líderes de asistencias', 'asistencias la liga', 'ranking asistencias'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: `${title} | TopScorers`,
      description,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | TopScorers`,
      description,
      images: [`https://www.top-scorers.com/og-default-${lang}.jpg`],
    },
  }
}

export default async function AsistentesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: raw } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const heading = lang === 'en'
    ? { breadcrumb: ['Statistics', 'Assists'], h1: 'Most assists · Europe', sub: `Season ${CURRENT_SEASON_SHORT} · ranked by assists · last-5 ratings` }
    : { breadcrumb: ['Estadísticas', 'Asistentes'], h1: 'Máximos asistentes · Europa', sub: `Temporada ${CURRENT_SEASON_SHORT} · por asistencias · valoración últimos 5` }
  return (
    <SaasHomeBody
      lang={lang}
      defaultPos="ast"
      heading={heading}
      itemList={{
        name: lang === 'en' ? `Most assists in Europe ${CURRENT_SEASON_SHORT}` : `Máximos asistentes de Europa ${CURRENT_SEASON_SHORT}`,
        url: `https://www.top-scorers.com/${lang}/asistentes`,
      }}
    />
  )
}
