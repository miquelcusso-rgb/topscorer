import type { Metadata } from 'next'
import { PLAYERS } from '@/data/players'
import { enrich } from '@/lib/utils'
import { isLocale } from '@/lib/i18n'
import JugadorCard from './JugadorCard'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/jugadores'
  return {
    title: 'Jugadores — TopScorers',
    description: 'Estadísticas por jugador de las principales ligas europeas. Temporada 2025/26.',
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
    { '@type': 'ListItem', position: 2, name: 'Jugadores', item: 'https://www.top-scorers.com/jugadores' },
  ],
}

export default function JugadoresPage() {
  const unique = PLAYERS.filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
    .filter(p => p.season === '2526')
    .map(enrich)
    .sort((a, b) => b.val_con - a.val_con)
    .slice(0, 100)

  return (
    <div className="max-w-[1100px] mx-auto px-5 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <h1
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 36,
          fontWeight: 800,
          color: '#eef4ff',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 24,
        }}
      >
        Jugadores
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {unique.map(p => (
          <JugadorCard key={p.name} player={p} />
        ))}
      </div>
    </div>
  )
}
