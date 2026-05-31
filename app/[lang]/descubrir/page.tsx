import type { Metadata } from 'next'
import { getTopScorers, getTopAssists, LEAGUES, LEAGUES_2 } from '@/lib/api-football'
import { transformApiPlayer } from '@/lib/api-to-players'
import { enrich } from '@/lib/utils'
import type { EnrichedPlayer } from '@/types'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import DiscubrirClient from './DiscubrirClient'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/descubrir'
  return {
    title: 'Radar de Talentos — Jugadores Infravalorados | TopScorers',
    description:
      'Descubre jugadores infravalorados con alto rendimiento por 90 minutos en ligas de menor exposición. Algoritmo propio que puntúa más de 500 jugadores cada semana.',
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
  }
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Descubrir', item: 'https://www.top-scorers.com/descubrir' },
  ],
}

export default async function DescubrirPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumb = lang === 'en' ? ['Players', 'Discover'] : ['Jugadores', 'Descubrir']
  const allLeagues = [...LEAGUES, ...LEAGUES_2]
  let players: EnrichedPlayer[] = []

  try {
    const season = 2025
    const [scorerResults, assistResults] = await Promise.all([
      Promise.all(allLeagues.map(l => getTopScorers(l.id, season))),
      Promise.all(allLeagues.map(l => getTopAssists(l.id, season))),
    ])

    const seen = new Set<string>()
    const raw = []

    for (const results of scorerResults) {
      for (const r of results) {
        const p = transformApiPlayer(r, 's')
        if (p && p.pj > 0 && !seen.has(p.name)) {
          seen.add(p.name)
          raw.push(p)
        }
      }
    }
    for (const results of assistResults) {
      for (const r of results) {
        const p = transformApiPlayer(r, 'a')
        if (p && p.pj > 0 && !seen.has(p.name)) {
          seen.add(p.name)
          raw.push(p)
        }
      }
    }

    players = raw.map(enrich)
  } catch {
    // will show empty state
  }

  return (
    <SaasShell activeKey="players" breadcrumb={breadcrumb}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <DiscubrirClient players={players} />
    </SaasShell>
  )
}
