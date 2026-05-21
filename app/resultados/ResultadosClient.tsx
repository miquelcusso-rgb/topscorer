'use client'

import { useState, useEffect } from 'react'
import type { ApiStandingEntry, ApiFixture, LeagueMeta } from '@/lib/api-football'

const LEAGUES: LeagueMeta[] = [
  { id: 140, name: 'La Liga',        country: 'Spain',    short: 'ESP', color: '#ee3124', flag: '🇪🇸' },
  { id:  39, name: 'Premier League', country: 'England',  short: 'ENG', color: '#3d195b', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id:  78, name: 'Bundesliga',     country: 'Germany',  short: 'GER', color: '#d20515', flag: '🇩🇪' },
  { id: 135, name: 'Serie A',        country: 'Italy',    short: 'ITA', color: '#024494', flag: '🇮🇹' },
  { id:  61, name: 'Ligue 1',        country: 'France',   short: 'FRA', color: '#003087', flag: '🇫🇷' },
  { id:  94, name: 'Primeira Liga',  country: 'Portugal', short: 'PRT', color: '#006600', flag: '🇵🇹' },
  { id: 203, name: 'Süper Lig',      country: 'Turkey',   short: 'TUR', color: '#e30a17', flag: '🇹🇷' },
  { id: 197, name: 'Super League',   country: 'Greece',   short: 'GRE', color: '#0d5eaf', flag: '🇬🇷' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid',
  })
}

function getStatusLabel(short: string) {
  const map: Record<string, string> = {
    FT: 'FIN', AET: 'PRÓRR.', PEN: 'PENS.',
    '1H': 'VIVO', '2H': 'VIVO', HT: 'DESCANSO',
    NS: 'Pendiente', PST: 'Aplazado', CANC: 'Cancelado',
  }
  return map[short] ?? short
}

function isLive(short: string) {
  return ['1H', '2H', 'HT', 'ET', 'P'].includes(short)
}

// ─── Standings table ──────────────────────────────────────────────────────────

function StandingsTable({ standings, leagueColor }: { standings: ApiStandingEntry[]; leagueColor: string }) {
  if (!standings.length) {
    return (
      <div className="py-10 text-center text-[12px]" style={{ color: '#3a3b52' }}>
        Clasificación no disponible
      </div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="w-full text-[12px]" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #151626' }}>
            {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'Pts', 'Forma'].map((h, i) => (
              <th
                key={h}
                className={`py-2 font-semibold ${i <= 1 ? 'text-left' : 'text-center'}`}
                style={{ color: '#52526e', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, paddingLeft: i === 0 ? 12 : 4, paddingRight: 4, fontSize: 10, textTransform: 'uppercase' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => {
            const highlight = row.description?.toLowerCase().includes('champion') || row.rank <= 4
            const Europa = row.description?.toLowerCase().includes('europa') || row.rank <= 6
            const Relegation = row.description?.toLowerCase().includes('relegat')

            let leftBorder = 'transparent'
            if (row.rank <= 4) leftBorder = leagueColor
            else if (row.rank <= 6) leftBorder = '#00c8b0'
            else if (Relegation) leftBorder = '#e03a3a'

            return (
              <tr
                key={row.team.id}
                style={{
                  borderBottom: '1px solid #0d0e1c',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.012)',
                }}
              >
                <td style={{ paddingLeft: 0, paddingTop: 7, paddingBottom: 7, borderLeft: `2px solid ${leftBorder}`, width: 40 }}>
                  <span className="pl-2" style={{ color: row.rank <= 3 ? leagueColor : '#52526e', fontWeight: row.rank <= 3 ? 700 : 400, fontSize: 12 }}>
                    {row.rank}
                  </span>
                </td>
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    <img src={row.team.logo} alt={row.team.name} width={18} height={18} className="shrink-0 object-contain" />
                    <span style={{ color: '#c8c8e0', fontSize: 12 }}>{row.team.name}</span>
                  </div>
                </td>
                {[row.all.played, row.all.win, row.all.draw, row.all.lose, row.all.goals.for, row.all.goals.against, row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff].map((val, i) => (
                  <td key={i} className="text-center" style={{ color: '#52526e', paddingLeft: 4, paddingRight: 4 }}>{val}</td>
                ))}
                <td className="text-center font-bold" style={{ color: '#e8e8f8', paddingLeft: 4, paddingRight: 4 }}>{row.points}</td>
                <td className="text-center py-1.5" style={{ paddingLeft: 4, paddingRight: 12 }}>
                  <div className="flex gap-0.5 justify-center">
                    {(row.form ?? '').split('').slice(-5).map((f, fi) => (
                      <span
                        key={fi}
                        className="inline-flex items-center justify-center text-[9px] font-bold"
                        style={{
                          width: 14, height: 14, borderRadius: 2,
                          background: f === 'W' ? '#22c55e22' : f === 'D' ? '#f0c04022' : '#e03a3a22',
                          color: f === 'W' ? '#22c55e' : f === 'D' ? '#f0c040' : '#e03a3a',
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Fixtures list ────────────────────────────────────────────────────────────

function FixtureRow({ fixture }: { fixture: ApiFixture }) {
  const status = fixture.fixture.status.short
  const live = isLive(status)
  const finished = ['FT', 'AET', 'PEN'].includes(status)
  const pending = status === 'NS'

  return (
    <div
      className="flex items-center gap-3 py-2.5 px-3 rounded-sm"
      style={{ background: live ? 'rgba(56,196,122,.04)' : 'transparent', borderBottom: '1px solid #0d0e1c' }}
    >
      {/* Status */}
      <div className="shrink-0 w-[64px] text-right">
        {live ? (
          <span className="text-[10px] font-bold" style={{ color: '#38c47a' }}>
            {fixture.fixture.status.elapsed}&apos;
          </span>
        ) : finished ? (
          <span className="text-[10px]" style={{ color: '#52526e' }}>FIN</span>
        ) : (
          <span className="text-[10px]" style={{ color: '#3a3b52' }}>
            {new Date(fixture.fixture.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}
          </span>
        )}
      </div>

      {/* Home */}
      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
        <span
          className="truncate text-[12px]"
          style={{ color: fixture.teams.home.winner ? '#e8e8f8' : '#52526e', fontWeight: fixture.teams.home.winner ? 600 : 400 }}
        >
          {fixture.teams.home.name}
        </span>
        <img src={fixture.teams.home.logo} alt="" width={16} height={16} className="shrink-0 object-contain" />
      </div>

      {/* Score */}
      <div className="shrink-0 w-[50px] text-center">
        {finished || live ? (
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: live ? '#38c47a' : '#e8e8f8', letterSpacing: 1 }}
          >
            {fixture.goals.home} - {fixture.goals.away}
          </span>
        ) : (
          <span className="text-[11px]" style={{ color: '#3a3b52' }}>vs</span>
        )}
      </div>

      {/* Away */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <img src={fixture.teams.away.logo} alt="" width={16} height={16} className="shrink-0 object-contain" />
        <span
          className="truncate text-[12px]"
          style={{ color: fixture.teams.away.winner ? '#e8e8f8' : '#52526e', fontWeight: fixture.teams.away.winner ? 600 : 400 }}
        >
          {fixture.teams.away.name}
        </span>
      </div>

      {/* Date */}
      <div className="shrink-0 hidden sm:block text-right w-[90px]">
        <span className="text-[10px]" style={{ color: '#2a2b3e' }}>
          {formatDate(fixture.fixture.date)}
        </span>
      </div>
    </div>
  )
}

// ─── League section ───────────────────────────────────────────────────────────

function LeagueSection({ league, activeTab }: { league: LeagueMeta; activeTab: 'standings' | 'fixtures' }) {
  const [standings, setStandings] = useState<ApiStandingEntry[]>([])
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    const ep = activeTab === 'standings'
      ? `/api/football/standings?league=${league.id}&season=2025`
      : `/api/football/fixtures?league=${league.id}&season=2025&last=8`

    fetch(ep)
      .then(r => r.json())
      .then(j => {
        if (j.ok) {
          if (activeTab === 'standings') setStandings(j.data)
          else setFixtures(j.data)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [league.id, activeTab])

  return (
    <div>
      {loading && (
        <div className="py-12 text-center text-[12px]" style={{ color: '#3a3b52' }}>
          Cargando...
        </div>
      )}
      {error && !loading && (
        <div className="py-10 text-center text-[12px]" style={{ color: '#3a3b52' }}>
          Error al cargar los datos. Intenta de nuevo.
        </div>
      )}
      {!loading && !error && activeTab === 'standings' && (
        <StandingsTable standings={standings} leagueColor={league.color} />
      )}
      {!loading && !error && activeTab === 'fixtures' && (
        <div>
          {fixtures.length === 0 ? (
            <div className="py-10 text-center text-[12px]" style={{ color: '#3a3b52' }}>
              Sin partidos recientes
            </div>
          ) : (
            fixtures.slice().reverse().map(f => <FixtureRow key={f.fixture.id} fixture={f} />)
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResultadosClient() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0])
  const [activeTab, setActiveTab] = useState<'standings' | 'fixtures'>('standings')

  return (
    <main className="relative z-10 min-h-screen">

      {/* Page header */}
      <div
        className="w-full"
        style={{ background: 'linear-gradient(180deg,#07081a,#050610)', borderBottom: '1px solid #151626' }}
      >
        <div className="max-w-[1100px] mx-auto px-5">
          <div className="pt-6 pb-0">
            <div
              className="font-bold tracking-[3px] uppercase mb-2"
              style={{ fontSize: 10, color: '#52526e', fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Europa &nbsp;·&nbsp; Temporada 2025/26
            </div>
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 30, fontWeight: 700, color: '#e8e8f8',
                letterSpacing: 0.5, lineHeight: 1,
              }}
            >
              Resultados{' '}
              <span style={{ color: '#52526e', fontWeight: 400 }}>y Clasificaciones</span>
            </h1>
          </div>

          {/* League tabs */}
          <div className="flex items-end overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {LEAGUES.map(league => {
              const active = activeLeague.id === league.id
              return (
                <button
                  key={league.id}
                  onClick={() => setActiveLeague(league)}
                  className="flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-150 shrink-0 py-2 px-3"
                  style={{
                    color: active ? league.color : '#3a3b52',
                    background: 'transparent', border: 'none',
                    borderBottom: active ? `2px solid ${league.color}` : '2px solid transparent',
                    marginBottom: -1,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#60608a' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#3a3b52' }}
                >
                  <img
                    src={`https://media.api-sports.io/football/leagues/${league.id}.png`}
                    width={22}
                    height={22}
                    alt={league.name}
                    style={{ borderRadius: 2, objectFit: 'contain' }}
                  />
                  <span style={{ fontSize: 9, letterSpacing: 1, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase' }}>
                    {league.short} {league.flag}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full" style={{ background: '#0b0c1a' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-5 pb-20">

          {/* Sub-tabs: Standings vs Fixtures */}
          <div className="flex gap-2 mb-5">
            {(['standings', 'fixtures'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="cursor-pointer transition-all duration-150 text-[11px] font-bold uppercase tracking-[1.5px] px-4 py-1.5 rounded-sm"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  background: activeTab === t ? activeLeague.color : 'transparent',
                  color: activeTab === t ? '#05060c' : '#52526e',
                  border: `1px solid ${activeTab === t ? activeLeague.color : '#151626'}`,
                }}
                onMouseEnter={e => { if (activeTab !== t) { e.currentTarget.style.borderColor = '#3a3b52'; e.currentTarget.style.color = '#c8c8e0' } }}
                onMouseLeave={e => { if (activeTab !== t) { e.currentTarget.style.borderColor = '#151626'; e.currentTarget.style.color = '#52526e' } }}
              >
                {t === 'standings' ? 'Clasificación' : 'Últimos partidos'}
              </button>
            ))}
          </div>

          {/* League panel */}
          <div
            style={{
              background: '#06070e',
              border: '1px solid #151626',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {/* League header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: '1px solid #151626', borderLeft: `3px solid ${activeLeague.color}` }}
            >
              <img
                src={`https://media.api-sports.io/football/leagues/${activeLeague.id}.png`}
                width={40}
                height={40}
                alt={activeLeague.name}
                style={{ borderRadius: 3, objectFit: 'contain', flexShrink: 0 }}
              />
              <div>
                <span
                  className="text-[13px] font-bold uppercase tracking-[1px]"
                  style={{ color: activeLeague.color, fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {activeLeague.name}
                </span>
                <div className="text-[11px]" style={{ color: '#3a3b52' }}>
                  {activeLeague.country} · 2025/26
                </div>
              </div>
            </div>

            <LeagueSection league={activeLeague} activeTab={activeTab} />
          </div>

          {/* Legend */}
          {activeTab === 'standings' && (
            <div className="flex flex-wrap gap-4 mt-4">
              {[
                { color: activeLeague.color, label: 'Champions League' },
                { color: '#00c8b0', label: 'Europa League / Conference' },
                { color: '#e03a3a', label: 'Descenso' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[10px]" style={{ color: '#3a3b52' }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
