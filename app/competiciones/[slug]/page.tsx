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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const league = ALL_LEAGUES.find(l => l.short.toLowerCase() === slug)
  if (!league) return {}
  return {
    title: `${league.name} — TopScorers`,
    description: `Clasificación, partidos y estadísticas de ${league.name}`,
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

  return (
    <CompeticionClient
      league={league}
      standings={standings}
      pastFixtures={pastFixtures}
      nextFixtures={nextFixtures}
      scorers={scorers}
      assists={assists}
    />
  )
}
