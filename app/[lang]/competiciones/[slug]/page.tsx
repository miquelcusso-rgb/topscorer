import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  ALL_LEAGUES,
  getStandings,
  getFixtures,
  getNextFixtures,
  getTopScorers,
  getTopAssists,
} from '@/lib/api-football'
import CompeticionClient from './CompeticionClient'

export const revalidate = 1800

export async function generateStaticParams() {
  return ALL_LEAGUES.map(l => ({ slug: l.short.toLowerCase() }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const league = ALL_LEAGUES.find(l => l.short.toLowerCase() === slug)
  if (!league) return {}
  const description = `Clasificación, goleadores, asistentes y resultados de ${league.name}. Estadísticas en tiempo real de la temporada 2025/26.`
  return {
    title: `${league.name} — Clasificación y Estadísticas | TopScorers`,
    description,
    keywords: [league.name, league.country, 'clasificación', 'goleadores', 'estadísticas fútbol', 'temporada 2025 2026'],
    alternates: { canonical: `https://www.top-scorers.com/competiciones/${slug}` },
    openGraph: {
      title: `${league.name} — Clasificación y Estadísticas | TopScorers`,
      description,
      url: `https://www.top-scorers.com/competiciones/${slug}`,
      siteName: 'TopScorers',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${league.name} — Clasificación y Estadísticas | TopScorers`,
      description,
    },
  }
}

export default async function CompeticionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const league = ALL_LEAGUES.find(l => l.short.toLowerCase() === slug)
  if (!league) notFound()

  const [standings, pastFixtures, nextFixtures, scorers, assists] = await Promise.all([
    getStandings(league.id).catch(() => []),
    getFixtures(league.id, 2025, 15).catch(() => []),
    getNextFixtures(league.id, 2025, 10).catch(() => []),
    getTopScorers(league.id).catch(() => []),
    getTopAssists(league.id).catch(() => []),
  ])

  const sportsOrgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: league.name,
    url: `https://www.top-scorers.com/competiciones/${slug}`,
    sport: 'Soccer',
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: 'Competiciones', item: 'https://www.top-scorers.com/competiciones' },
      { '@type': 'ListItem', position: 3, name: league.name, item: `https://www.top-scorers.com/competiciones/${slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsOrgJsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <CompeticionClient
        league={league}
        standings={standings}
        pastFixtures={pastFixtures}
        nextFixtures={nextFixtures}
        scorers={scorers}
        assists={assists}
      />
    </>
  )
}
