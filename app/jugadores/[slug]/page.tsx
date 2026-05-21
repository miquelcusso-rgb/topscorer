import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PLAYERS } from '@/data/players'
import { enrich } from '@/lib/utils'
import { slugify } from '@/lib/slugify'
import { searchPlayer } from '@/lib/api-football'
import PlayerPageClient from './PlayerPageClient'

export const revalidate = 3600

export async function generateStaticParams() {
  return PLAYERS
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
    .slice(0, 60)
    .map(p => ({ slug: slugify(p.name) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const player = PLAYERS.find(p => slugify(p.name) === slug)
  if (!player) return { title: 'Jugador — TopScorers' }
  return {
    title: `${player.name} — Estadísticas | TopScorers`,
    description: `Estadísticas de ${player.name}: goles, asistencias, valoración y más. Temporada 2025/26.`,
    alternates: { canonical: `https://www.top-scorers.com/jugadores/${slug}` },
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const staticPlayers = PLAYERS.filter(p => slugify(p.name) === slug)
  if (!staticPlayers.length) notFound()

  const basePlayer = staticPlayers[0]
  const enriched = enrich(basePlayer)

  let liveStats = null
  try {
    const results = await searchPlayer(basePlayer.name)
    if (results.length > 0) liveStats = results[0]
  } catch {
    // fall back to static data
  }

  const allSeasons = PLAYERS.filter(p => slugify(p.name) === slug).map(enrich)

  return <PlayerPageClient player={enriched} liveStats={liveStats} allSeasons={allSeasons} />
}
