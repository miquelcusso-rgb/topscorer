import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import ClasificacionClient from './ClasificacionClient'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const es = lang === 'es'
  const title = es ? 'Clasificación — Comunidad TopScorers' : 'Leaderboard — TopScorers community'
  const description = es
    ? 'Ranking de la comunidad TopScorers por puntos. 5 niveles de badge: Amateur, Profesional, Crack de Champions, Top Mundial y Estratosférico.'
    : 'TopScorers community ranking by points. 5 badge tiers: Amateur, Pro, Champions Crack, World Class and Stratospheric.'
  return {
    title, description,
    alternates: {
      canonical: `${BASE}/${lang}/clasificacion`,
      languages: {
        es: `${BASE}/es/clasificacion`,
        en: `${BASE}/en/clasificacion`,
        'x-default': `${BASE}/es/clasificacion`,
      },
    },
    openGraph: {
      title, description,
      url: `${BASE}/${lang}/clasificacion`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ClasificacionPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumb = lang === 'en' ? ['Competitions', 'Leaderboard'] : ['Competiciones', 'Clasificación']
  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      <ClasificacionClient />
    </SaasShell>
  )
}
