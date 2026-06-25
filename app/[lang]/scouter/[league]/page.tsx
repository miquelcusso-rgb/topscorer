import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, type Lang } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import {
  findLeagueBySlug,
  leagueSlug,
  leaguesWithData,
  playersForLeague,
} from '@/lib/league-data'
import { byIig, iig, IIG_NAME } from '@/lib/iig'
import ScouterTable from '@/components/saas/ScouterTable'
import RelatedLinks from '@/components/RelatedLinks'

const BASE = 'https://www.top-scorers.com'
const TOP_N = 20

export const revalidate = 86400 // 24h ISR (was 21600) — ranking is dataset-driven (changes on deploy); one page per league × es/en, free-tier ISR writes

/** One scouter page per league that actually has tracked players, × es/en. */
export function generateStaticParams() {
  return leaguesWithData().map(({ slug }) => ({ league: slug }))
}

/** Top-20 of a league ranked by rankScore (IIG when meaningful, else rating·coef). */
function top20ForSlug(slug: string) {
  const league = findLeagueBySlug(slug)
  if (!league) return null
  const players = playersForLeague(league, '2526')
  if (players.length === 0) return null
  return { league, players: [...players].sort(byIig).slice(0, TOP_N) }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; league: string }>
}): Promise<Metadata> {
  const { lang: raw, league: slug } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const resolved = top20ForSlug(slug)
  if (!resolved) return {}
  const { league } = resolved
  const path = `/scouter/${slug}`
  const title =
    lang === 'en'
      ? `Scouter Top 20 — ${league.name} 25/26 | TopScorers`
      : `Scouter Top 20 — ${league.name} 25/26 | TopScorers`
  const description =
    lang === 'en'
      ? `The 20 best players in ${league.name} (${league.country}) for season 25/26, ranked by the IIG striker impact index — rating, goals and assists from real stats.`
      : `Los 20 mejores jugadores de ${league.name} (${league.country}) en la temporada 25/26, ordenados por el índice de impacto IIG — nota, goles y asistencias con estadísticas reales.`
  return {
    title,
    description,
    keywords: [league.name, league.country, 'scouter', 'top 20', 'IIG', 'goleadores', 'mejores jugadores', 'estadísticas fútbol', 'temporada 2025 2026'],
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

export default async function ScouterLeaguePage({
  params,
}: {
  params: Promise<{ lang: string; league: string }>
}) {
  const { lang: raw, league: slug } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const resolved = top20ForSlug(slug)
  if (!resolved) notFound()
  const { league, players } = resolved

  const heading =
    lang === 'en'
      ? `Top 20 — ${league.name}`
      : `Top 20 — ${league.name}`
  const breadcrumb =
    lang === 'en' ? ['Scouter', league.name] : ['Scouter', league.name]

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name:
      lang === 'en'
        ? `Scouter Top 20 — ${league.name} 25/26`
        : `Scouter Top 20 — ${league.name} 25/26`,
    description: IIG_NAME[lang],
    url: `${BASE}/${lang}/scouter/${slug}`,
    numberOfItems: players.length,
    itemListElement: players.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.name} — IIG ${iig(p).toFixed(1)} (${p.club})`,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TopScorers', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Scouter', item: `${BASE}/${lang}/scouter` },
      { '@type': 'ListItem', position: 3, name: league.name, item: `${BASE}/${lang}/scouter/${slug}` },
    ],
  }

  return (
    <SaasShell activeKey="players" breadcrumb={breadcrumb}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />

      <div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--ts-text)', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
          {heading}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ts-muted)', margin: '8px 0 0', maxWidth: 720 }}>
          {lang === 'en'
            ? `The 20 best players in ${league.name} (${league.country}), season 25/26, ranked by the IIG striker impact index — built only from real season stats.`
            : `Los 20 mejores jugadores de ${league.name} (${league.country}), temporada 25/26, ordenados por el índice de impacto IIG — calculado solo con estadísticas reales de la temporada.`}
        </p>
      </div>

      <ScouterTable players={players} lang={lang} />

      <RelatedLinks
        title={lang === 'en' ? 'More rankings' : 'Más rankings'}
        exclude={[`/scouter/${slug}`]}
      />
    </SaasShell>
  )
}
