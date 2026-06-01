import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import {
  allLeagueSlugs,
  findLeagueBySlug,
  leagueSlug,
  playersForLeague,
} from '@/lib/league-data'
import LeagueClient from './LeagueClient'

const BASE = 'https://www.top-scorers.com'

export function generateStaticParams() {
  return allLeagueSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang: raw, slug } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const league = findLeagueBySlug(slug)
  if (!league) return {}
  const path = `/competiciones/${slug}`
  const title =
    lang === 'en'
      ? `${league.name} — Top Scorers & Stats 25/26 | TopScorers`
      : `${league.name} — Pichichi y Estadísticas 25/26 | TopScorers`
  const description =
    lang === 'en'
      ? `Top scorers, assist leaders and league MVP for ${league.name} (${league.country}), season 25/26. Real stats and the IIG striker impact index.`
      : `Pichichi, máximos goleadores, asistentes y MVP de ${league.name} (${league.country}) en la temporada 25/26. Estadísticas reales e índice IIG.`
  return {
    title,
    description,
    keywords: [league.name, league.country, 'goleadores', 'pichichi', 'asistentes', 'estadísticas fútbol', 'temporada 2025 2026', 'MVP'],
    alternates: {
      canonical: `${BASE}/${lang}${path}`,
      languages: {
        es: `${BASE}/es${path}`,
        en: `${BASE}/en${path}`,
        'x-default': `${BASE}/es${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE}/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: league.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@Furiosadata',
      creator: '@Furiosadata',
    },
  }
}

export default async function CompeticionPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: raw, slug } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const league = findLeagueBySlug(slug)
  if (!league) notFound()

  const players = playersForLeague(league, '2526')

  const breadcrumb =
    lang === 'en' ? ['Competitions', league.name] : ['Competiciones', league.name]

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${league.name} — ${lang === 'en' ? 'Top scorers 25/26' : 'Goleadores 25/26'}`,
    url: `${BASE}/${lang}/competiciones/${slug}`,
    numberOfItems: Math.min(players.length, 12),
    itemListElement: [...players]
      .sort((a, b) => (b.goles ?? 0) - (a.goles ?? 0))
      .slice(0, 12)
      .map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.name} — ${p.goles} ${lang === 'en' ? 'goals' : 'goles'} (${p.club})`,
      })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TopScorers', item: BASE },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'Competitions' : 'Competiciones', item: `${BASE}/${lang}/competiciones` },
      { '@type': 'ListItem', position: 3, name: league.name, item: `${BASE}/${lang}/competiciones/${slug}` },
    ],
  }

  const sportsOrgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: league.name,
    url: `${BASE}/${lang}/competiciones/${slug}`,
    sport: 'Soccer',
  }

  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsOrgJsonLd).replace(/</g, '\\u003c') }} />
      <LeagueClient
        lang={lang}
        league={league}
        leagueName={league.name}
        leagueCountry={league.country}
        leagueId={league.id}
        leagueColor={league.color}
        leagueFlag={league.flag}
        leagueSlug={leagueSlug(league)}
        players={players}
      />
    </SaasShell>
  )
}
