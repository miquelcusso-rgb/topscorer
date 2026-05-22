import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PLAYERS } from '@/data/players'
import { enrich } from '@/lib/utils'
import { slugify } from '@/lib/slugify'
import { searchPlayer, getPlayerDetails } from '@/lib/api-football'
import type { ApiPlayerDetail } from '@/lib/api-football'
import PlayerPageClient from './PlayerPageClient'

export const revalidate = 3600

export async function generateStaticParams() {
  return PLAYERS
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
    .slice(0, 60)
    .map(p => ({ slug: slugify(p.name) }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params
  const player = PLAYERS.find(p => slugify(p.name) === slug)
  if (!player) return { title: 'Jugador — TopScorers' }
  const description = `Estadísticas de ${player.name}: goles, asistencias, valoración y más. Temporada 2025/26.`
  const path = `/jugadores/${slug}`
  return {
    title: `${player.name} — Estadísticas | TopScorers`,
    description,
    keywords: [player.name, player.club ?? '', 'estadísticas fútbol', 'goleadores', 'temporada 2025 2026'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: `${player.name} — Estadísticas | TopScorers`,
      description,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: 'es_ES',
      type: 'profile',
      images: [{ url: 'https://www.top-scorers.com/og-player.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${player.name} — Estadísticas | TopScorers`,
      description,
    },
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const staticPlayers = PLAYERS.filter(p => slugify(p.name) === slug)
  if (!staticPlayers.length) notFound()

  const basePlayer = staticPlayers[0]
  const enriched = enrich(basePlayer)

  let liveStats = null
  let playerDetails: ApiPlayerDetail | null = null

  try {
    const results = await searchPlayer(basePlayer.name)
    if (results.length > 0) {
      liveStats = results[0]
      const apiId = results[0].player.id
      playerDetails = await getPlayerDetails(apiId, 2025)
    }
  } catch {
    // fall back to static data
  }

  const allSeasons = PLAYERS.filter(p => slugify(p.name) === slug).map(enrich)

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: basePlayer.name,
    url: `https://www.top-scorers.com/jugadores/${slug}`,
    jobTitle: 'Professional Football Player',
    ...(basePlayer.club ? { memberOf: { '@type': 'SportsTeam', name: basePlayer.club } } : {}),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: 'Jugadores', item: 'https://www.top-scorers.com/jugadores' },
      { '@type': 'ListItem', position: 3, name: basePlayer.name, item: `https://www.top-scorers.com/jugadores/${slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <PlayerPageClient
        player={enriched}
        liveStats={liveStats}
        allSeasons={allSeasons}
        playerDetails={playerDetails}
      />
    </>
  )
}
