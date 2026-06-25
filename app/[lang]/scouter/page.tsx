import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale, type Lang } from '@/lib/i18n'
import { leaguesWithData, playersForLeague } from '@/lib/league-data'
import { byIig } from '@/lib/iig'
import SaasShell from '@/components/saas/SaasShell'
import RelatedLinks from '@/components/RelatedLinks'

const BASE = 'https://www.top-scorers.com'

export const revalidate = 86400 // 24h ISR (was 21600) — dataset-driven index, changes on deploy

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/scouter'
  const title =
    lang === 'en'
      ? 'Scouter — Top 20 by league 25/26 | TopScorers'
      : 'Scouter — Top 20 por liga 25/26 | TopScorers'
  const description =
    lang === 'en'
      ? 'Scouter leaderboards: the 20 best players of each league, ranked by the IIG striker impact index — built from real season stats. La Liga, Premier, Bundesliga, Serie A, Ligue 1 and 30+ more.'
      : 'Rankings Scouter: los 20 mejores jugadores de cada liga, ordenados por el índice de impacto IIG con estadísticas reales. La Liga, Premier, Bundesliga, Serie A, Ligue 1 y 30+ ligas más.'
  return {
    title,
    description,
    keywords: ['scouter', 'top 20', 'mejores jugadores', 'IIG', 'goleadores', 'la liga', 'premier league', 'bundesliga', 'serie a', 'ligue 1', 'estadísticas fútbol'],
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
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers Scouter' }],
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

export default async function ScouterIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: raw } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const breadcrumb = ['Scouter']

  // Leagues with at least one tracked player, each annotated with its current
  // #1 (by rankScore) so the directory cards are useful, not just a list.
  const leagues = leaguesWithData('2526').map(({ league, slug }) => {
    const top = [...playersForLeague(league, '2526')].sort(byIig)[0]
    return { league, slug, top }
  })

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en' ? 'Scouter Top 20 leaderboards by league' : 'Rankings Scouter Top 20 por liga',
    url: `${BASE}/${lang}/scouter`,
    numberOfItems: leagues.length,
    itemListElement: leagues.map(({ league, slug }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: league.name,
      url: `${BASE}/${lang}/scouter/${slug}`,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TopScorers', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Scouter', item: `${BASE}/${lang}/scouter` },
    ],
  }

  return (
    <SaasShell activeKey="players" breadcrumb={breadcrumb}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />

      <div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--ts-text)', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
          Scouter
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ts-muted)', margin: '8px 0 0', maxWidth: 720 }}>
          {lang === 'en'
            ? 'The 20 best players of each league, ranked by the IIG striker impact index — built only from real season stats. Pick a league:'
            : 'Los 20 mejores jugadores de cada liga, ordenados por el índice de impacto IIG con estadísticas reales. Elige una liga:'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {leagues.map(({ league, slug, top }) => (
          <Link key={slug} href={`/${lang}/scouter/${slug}`} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10,
                padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', minHeight: 64,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://media.api-sports.io/football/leagues/${league.id}.png`}
                alt={league.name}
                width={32}
                height={32}
                style={{ borderRadius: 4, flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {lang === 'en' ? `Top 20 — ${league.name}` : `Top 20 — ${league.name}`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {league.country}{top ? ` · #1 ${top.flag ? `${top.flag} ` : ''}${top.name}` : ''}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <RelatedLinks
        title={lang === 'en' ? 'More rankings' : 'Más rankings'}
        exclude={[]}
      />
    </SaasShell>
  )
}
