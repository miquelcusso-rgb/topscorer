import type { Metadata } from 'next'
import Link from 'next/link'
import { LEAGUES, LEAGUES_2, LEAGUES_EURO } from '@/lib/api-football'

export const metadata: Metadata = {
  title: 'Competiciones — TopScorers',
  description: 'Estadísticas de todas las competiciones de fútbol europeo en TopScorers.',
}

export default function CompeticionesPage() {
  const sections = [
    { title: 'Grandes Ligas',          leagues: LEAGUES },
    { title: 'Segunda División',       leagues: LEAGUES_2 },
    { title: 'Competiciones Europeas', leagues: LEAGUES_EURO },
  ]
  return (
    <div className="max-w-[1100px] mx-auto px-5 py-8">
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 800, color: '#eef4ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 32 }}>
        Competiciones
      </h1>
      {sections.map(section => (
        <div key={section.title} className="mb-10">
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#6878a0', fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 12 }}>
            {section.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {section.leagues.map(league => (
              <Link key={league.id} href={`/?liga=${league.short}`} style={{ textDecoration: 'none' }}>
                <div
                  className="rounded-lg p-4 flex items-center gap-3 transition-all duration-150"
                  style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${league.color}22`, cursor: 'pointer' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://media.api-sports.io/football/leagues/${league.id}.png`}
                    alt={league.name}
                    width={28}
                    height={28}
                    style={{ borderRadius: 3 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#dde8ff' }}>{league.name}</div>
                    <div style={{ fontSize: 10, color: '#6878a0' }}>{league.country}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
