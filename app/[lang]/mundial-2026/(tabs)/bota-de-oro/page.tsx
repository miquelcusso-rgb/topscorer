import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import GoldenBootPanel from '../../_panels/GoldenBootPanel'
import { goldenBootFaqs } from '../../wc-faqs'
import { getTopScorers, type ApiPlayerResponse } from '@/lib/api-football'

// Live ranking → revalidate hourly (the panel keeps the seed if present).
export const revalidate = 86400 // torneo acabado (19-jul-2026): archivo, 24h de sobra

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/bota-de-oro'

  // Dynamic title with the live leader + goals + freshness (cached fetch → no
  // extra quota; reuses the same getTopScorers call the page body runs).
  let leaderName: string | undefined
  let leaderGoals = 0
  try {
    const s = await getTopScorers(1, 2026)
    leaderName = s[0]?.player?.name
    leaderGoals = s[0]?.statistics[0]?.goals?.total ?? 0
  } catch { /* leave undefined → static title */ }

  // Keep the <title> ≤60 chars so it isn't truncated in SERPs. The live leader
  // stays in the title (freshness + CTR); the verbose phrasing lives in the
  // description/OG instead. The leaderGoals count is dropped from the title to
  // stay within budget for long player names.
  const title = leaderName
    ? (lang === 'en'
        ? `${leaderName} leads the 2026 World Cup Golden Boot`
        : `${leaderName} lidera la Bota de Oro del Mundial 2026`)
    : (lang === 'en'
        ? '2026 World Cup Golden Boot — Live Standings'
        : 'Bota de Oro del Mundial 2026 — Clasificación')
  const description = lang === 'en'
    ? 'Live 2026 World Cup Golden Boot race: top scorers ranked by goals, updated live through the group stage and knockout rounds. See who leads the standings after the group stage. Ties broken by assists, then fewest minutes played.'
    : 'Carrera por la Bota de Oro del Mundial 2026 en directo: máximos goleadores ordenados por goles, actualizados en vivo desde la fase de grupos hasta las eliminatorias. Mira quién lidera tras la fase de grupos. El empate lo decide asistencias y minutos.'
  return {
    title,
    description,
    openGraph: {
      title: `${title} | TopScorers`,
      description,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-mundial-${lang}.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@furiosadata',
      creator: '@furiosadata',
      title: `${title} | TopScorers`,
      description,
      images: [`https://www.top-scorers.com/og-mundial-${lang}.jpg`],
    },
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    keywords: ['bota de oro mundial 2026', 'golden boot world cup 2026', 'goleadores mundial 2026', 'world cup 2026 top scorers', 'máximo goleador mundial 2026'],
  }
}

export default async function BotaDeOroPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'

  // Server-seed so the ranking lands in the initial HTML (SEO) and powers the
  // ItemList JSON-LD. Defensive: any error → [] (the panel client-fetches too).
  let scorers: ApiPlayerResponse[] = []
  try { scorers = await getTopScorers(1, 2026) } catch { scorers = [] }

  // Server-rendered freshness date (locale-formatted) → passed into the panel so
  // the "Actualizado / Updated" line is in the initial HTML.
  const updated = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

  const goals = lang === 'en' ? 'goals' : 'goles'
  const itemListJsonLd = scorers.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en' ? '2026 World Cup Golden Boot — top scorers' : 'Bota de Oro del Mundial 2026 — máximos goleadores',
    description: lang === 'en'
      ? 'Live top scorers of the 2026 FIFA World Cup, ranked by goals.'
      : 'Máximos goleadores del Mundial 2026 en tiempo real, ordenados por goles.',
    url: `https://www.top-scorers.com/${lang}/mundial-2026/bota-de-oro`,
    numberOfItems: Math.min(scorers.length, 10),
    itemListElement: scorers.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.player.name} — ${p.statistics[0]?.goals?.total ?? 0} ${goals} (${p.statistics[0]?.team?.name ?? ''})`,
    })),
  } : null

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Golden Boot' : 'Bota de Oro', item: `https://www.top-scorers.com/${lang}/mundial-2026/bota-de-oro` },
    ],
  }

  // FAQPage JSON-LD built from the SAME source the panel renders (concrete when
  // a leader exists → citable for GEO). Mirrors the visible <details> accordion.
  const leaderName = scorers[0]?.player?.name
  const leaderGoals = scorers[0]?.statistics[0]?.goals?.total ?? 0
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: goldenBootFaqs(lang, leaderName, leaderName ? leaderGoals : undefined).map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  return (
    <>
      {ld(breadcrumbJsonLd)}
      {itemListJsonLd && ld(itemListJsonLd)}
      {ld(faqJsonLd)}
      <GoldenBootPanel initial={scorers} updated={updated} />
    </>
  )
}
