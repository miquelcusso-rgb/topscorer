import type { Metadata } from 'next'
import { isLocale, type Lang } from '@/lib/i18n'
import SaasHomeBody from '@/components/saas/SaasHomeBody'
import { CURRENT_SEASON_SHORT } from '@/lib/season'

// Pillar de defensas (brief producto 5-jul): completa la familia por posición
// (goleadores/asistentes/centrocampistas/defensas) con el tab 'df'.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/defensas'
  const en = lang === 'en'
  const title = en
    ? `Best Defenders ${CURRENT_SEASON_SHORT} — Tackles & Interceptions Ranking`
    : `Mejores Defensas ${CURRENT_SEASON_SHORT} — Ranking de Entradas e Intercepciones`
  const description = en
    ? `Live ranking of the best defenders in European football ${CURRENT_SEASON_SHORT}: tackles, interceptions and duels won in La Liga, Premier League, Bundesliga, Serie A and Ligue 1.`
    : `Ranking en directo de los mejores defensas del fútbol europeo ${CURRENT_SEASON_SHORT}: entradas, intercepciones y duelos ganados en LaLiga, Premier League, Bundesliga, Serie A y Ligue 1.`
  return {
    title,
    description,
    keywords: en
      ? ['best defenders 2025/26', 'defender stats', 'tackles ranking', 'interceptions leaders']
      : ['mejores defensas 2026', 'estadísticas defensas', 'ranking entradas', 'defensas la liga'],
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

export default async function DefensasPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: raw } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const heading = lang === 'en'
    ? { breadcrumb: ['Statistics', 'Defenders'], h1: 'Best defenders · Europe', sub: `Season ${CURRENT_SEASON_SHORT} · ranked by defensive actions · last-5 ratings` }
    : { breadcrumb: ['Estadísticas', 'Defensas'], h1: 'Mejores defensas · Europa', sub: `Temporada ${CURRENT_SEASON_SHORT} · por acciones defensivas · valoración últimos 5` }
  return (
    <SaasHomeBody
      lang={lang}
      defaultPos="df"
      heading={heading}
      itemList={{
        name: lang === 'en' ? `Best defenders in Europe ${CURRENT_SEASON_SHORT}` : `Mejores defensas de Europa ${CURRENT_SEASON_SHORT}`,
        url: `https://www.top-scorers.com/${lang}/defensas`,
      }}
    />
  )
}
