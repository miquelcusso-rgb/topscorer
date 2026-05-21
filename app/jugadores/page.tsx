import type { Metadata } from 'next'
import { PLAYERS } from '@/data/players'
import { enrich } from '@/lib/utils'
import JugadorCard from './JugadorCard'

export const metadata: Metadata = {
  title: 'Jugadores — TopScorers',
  description: 'Estadísticas por jugador de las principales ligas europeas. Temporada 2025/26.',
  alternates: { canonical: 'https://www.top-scorers.com/jugadores' },
}

export default function JugadoresPage() {
  const unique = PLAYERS.filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
    .filter(p => p.season === '2526')
    .map(enrich)
    .sort((a, b) => b.val_con - a.val_con)
    .slice(0, 100)

  return (
    <div className="max-w-[1100px] mx-auto px-5 py-8">
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
