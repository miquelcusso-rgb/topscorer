import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import PrediccionesClient from './PrediccionesClient'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const es = lang === 'es'
  const title = es ? 'Predicciones — Picks de la jornada' : 'Predictions — Matchday picks'
  const description = es
    ? 'Predice los partidos de la jornada (1·X·2). 3 puntos por acierto. Tu puntuación suma al ranking semanal de la comunidad.'
    : 'Pick winners across the matchday (1·X·2). 3 points per correct call. Score feeds the weekly community leaderboard.'
  return {
    title, description,
    alternates: {
      canonical: `${BASE}/${lang}/predicciones`,
      languages: {
        es: `${BASE}/es/predicciones`,
        en: `${BASE}/en/predicciones`,
        'x-default': `${BASE}/es/predicciones`,
      },
    },
    openGraph: {
      title: `${title} | TopScorers`, description,
      url: `${BASE}/${lang}/predicciones`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | TopScorers`, description },
  }
}

export default async function PrediccionesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumb = lang === 'en' ? ['Community', 'Predictions'] : ['Comunidad', 'Predicciones']
  return (
    <SaasShell activeKey="stats" breadcrumb={breadcrumb}>
      <PrediccionesClient />
    </SaasShell>
  )
}
