import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PLAYERS } from '@/data/players'
import { playerSlug } from '@/lib/player-slug'
import { resolvePlayerProfile } from '@/lib/resolve-player'
import { isLocale } from '@/lib/i18n'
import PlayerProfile from '@/components/player/PlayerProfile'

// Reads ONLY the static dataset (real season stats) — no live per-player API
// call and no server-side auth. The page is therefore fully static/ISR and is
// served from the CDN (critical: ~12k player pages must not run a serverless
// function per visit — that was the main Fluid Active CPU burn). The Pro plan
// badge in the sidebar is resolved client-side from Clerk (see Sidebar.tsx).
export const revalidate = 86400 // 24h ISR — dataset only changes on deploy
export const dynamicParams = true // slugs beyond the prebuilt set render once, then cache

export async function generateStaticParams() {
  return PLAYERS
    .filter((p, i, arr) => arr.findIndex(x => playerSlug(x) === playerSlug(p)) === i)
    .slice(0, 200)
    .map(p => ({ slug: playerSlug(p) }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params
  const resolved = await resolvePlayerProfile(slug)
  const player = resolved?.base
  if (!player) return { title: 'Jugador — TopScorers' }
  const description = `Estadísticas de ${player.name}: goles, asistencias, valoración y más. Temporada 2025/26.`
  const path = `/jugadores/${slug}`
  const ogImage = `/api/og/jugador?slug=${encodeURIComponent(slug)}&lang=${lang}`
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
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'profile',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${player.name} — TopScorers` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${player.name} — Estadísticas | TopScorers`,
      description,
      images: [ogImage],
    },
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params
  const lang = isLocale(rawLang) ? rawLang : 'es'

  const resolved = await resolvePlayerProfile(slug)
  if (!resolved) notFound()
  const { base: basePlayer, seasons: staticPlayers } = resolved

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
      <PlayerProfile player={basePlayer} lang={lang} slug={slug} seasons={staticPlayers} />
    </>
  )
}
