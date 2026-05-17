'use client'

import { useState, useEffect } from 'react'
import type { ApiFixture, ApiStandingEntry, ApiPlayerResponse } from '@/lib/api-football'

// ─── Static WC 2026 data ──────────────────────────────────────────────────────

const WC_GROUPS = [
  { id: 'A', teams: ['Qatar', 'Ecuador', 'Senegal', 'Netherlands'] },
  { id: 'B', teams: ['England', 'Iran', 'USA', 'Wales'] },
  { id: 'C', teams: ['Argentina', 'Saudi Arabia', 'Mexico', 'Poland'] },
  { id: 'D', teams: ['France', 'Australia', 'Denmark', 'Tunisia'] },
  { id: 'E', teams: ['Spain', 'Costa Rica', 'Germany', 'Japan'] },
  { id: 'F', teams: ['Belgium', 'Canada', 'Morocco', 'Croatia'] },
  { id: 'G', teams: ['Brazil', 'Serbia', 'Switzerland', 'Cameroon'] },
  { id: 'H', teams: ['Portugal', 'Ghana', 'Uruguay', 'South Korea'] },
  { id: 'I', teams: ['Italy', 'Colombia', 'USA', 'Egypt'] },
  { id: 'J', teams: ['Netherlands', 'Chile', 'Austria', 'Algeria'] },
  { id: 'K', teams: ['Mexico', 'New Zealand', 'Ivory Coast', 'Iraq'] },
  { id: 'L', teams: ['Canada', 'Peru', 'Senegal', 'Slovenia'] },
]

const VENUES = [
  { city: 'New York/New Jersey', stadium: 'MetLife Stadium', country: 'USA', capacity: '82,500', final: true },
  { city: 'Los Angeles', stadium: 'SoFi Stadium', country: 'USA', capacity: '70,240', final: false },
  { city: 'Dallas', stadium: 'AT&T Stadium', country: 'USA', capacity: '80,000', final: false },
  { city: 'San Francisco', stadium: 'Levi\'s Stadium', country: 'USA', capacity: '68,500', final: false },
  { city: 'Miami', stadium: 'Hard Rock Stadium', country: 'USA', capacity: '64,767', final: false },
  { city: 'Seattle', stadium: 'Lumen Field', country: 'USA', capacity: '69,000', final: false },
  { city: 'Boston', stadium: 'Gillette Stadium', country: 'USA', capacity: '65,878', final: false },
  { city: 'Philadelphia', stadium: 'Lincoln Financial Field', country: 'USA', capacity: '69,176', final: false },
  { city: 'Kansas City', stadium: 'Arrowhead Stadium', country: 'USA', capacity: '76,416', final: false },
  { city: 'Atlanta', stadium: 'Mercedes-Benz Stadium', country: 'USA', capacity: '71,000', final: false },
  { city: 'Houston', stadium: 'NRG Stadium', country: 'USA', capacity: '72,220', final: false },
  { city: 'Toronto', stadium: 'BMO Field', country: 'Canada', capacity: '30,000', final: false },
  { city: 'Vancouver', stadium: 'BC Place', country: 'Canada', capacity: '54,500', final: false },
  { city: 'Guadalajara', stadium: 'Estadio Akron', country: 'Mexico', capacity: '49,850', final: false },
  { city: 'Ciudad de México', stadium: 'Estadio Azteca', country: 'Mexico', capacity: '87,523', final: false },
  { city: 'Monterrey', stadium: 'Estadio BBVA', country: 'Mexico', capacity: '53,500', final: false },
]

const START_DATE = new Date('2026-06-11T00:00:00Z')
const END_DATE   = new Date('2026-07-19T00:00:00Z')

function getDaysUntilStart() {
  const now = new Date()
  if (now >= END_DATE) return -2
  if (now >= START_DATE) return -1 // already started
  return Math.ceil((START_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Countdown component ──────────────────────────────────────────────────────

function Countdown() {
  const days = getDaysUntilStart()

  if (days === -2) {
    return (
      <div className="text-center py-4">
        <span className="text-[13px]" style={{ color: '#f0c040' }}>El Mundial 2026 ha concluido</span>
      </div>
    )
  }

  if (days === -1) {
    return (
      <div className="flex items-center gap-2 justify-center py-3">
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#38c47a', boxShadow: '0 0 7px #38c47a' }} />
        <span className="text-[13px] font-bold tracking-[2px] uppercase" style={{ color: '#38c47a', fontFamily: "'Barlow Condensed', sans-serif" }}>
          En curso
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 justify-center py-3">
      <div className="text-center">
        <div className="text-[40px] font-bold leading-none tabular-nums" style={{ color: '#f0c040', fontFamily: "'Barlow Condensed', sans-serif" }}>
          {days}
        </div>
        <div className="text-[9px] tracking-[2px] uppercase mt-1" style={{ color: '#52526e' }}>días</div>
      </div>
      <div className="text-[11px]" style={{ color: '#3a3b52' }}>hasta el</div>
      <div className="text-center">
        <div className="text-[13px] font-bold" style={{ color: '#e8e8f8', fontFamily: "'Barlow Condensed', sans-serif" }}>
          11 Jun 2026
        </div>
        <div className="text-[9px] tracking-[2px] uppercase mt-1" style={{ color: '#52526e' }}>Copa del Mundo</div>
      </div>
    </div>
  )
}

// ─── Live data panel ──────────────────────────────────────────────────────────

function LiveDataPanel() {
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [scorers, setScorers] = useState<ApiPlayerResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/football/fixtures?league=1&season=2025&last=8').then(r => r.json()),
      fetch('/api/football/topscorers?league=1&season=2025').then(r => r.json()),
    ]).then(([fix, sc]) => {
      if (fix.ok) setFixtures(fix.data)
      if (sc.ok) setScorers(sc.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-center text-[12px]" style={{ color: '#3a3b52' }}>
        Cargando datos del torneo...
      </div>
    )
  }

  const hasData = fixtures.length > 0 || scorers.length > 0

  if (!hasData) {
    return (
      <div
        className="rounded-sm px-5 py-8 text-center"
        style={{ background: 'rgba(240,192,64,.04)', border: '1px solid rgba(240,192,64,.12)' }}
      >
        <div className="text-[13px] font-semibold mb-2" style={{ color: '#f0c040' }}>
          Datos en tiempo real — disponibles al inicio del torneo
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: '#3a3b52', maxWidth: 400, margin: '0 auto' }}>
          Los resultados, clasificaciones y estadísticas de goleadores aparecerán aquí
          desde el 11 de junio de 2026, actualizados cada 30 minutos.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Fixtures */}
      <div style={{ background: '#06070e', border: '1px solid #151626', borderRadius: 4 }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #151626' }}>
          <span className="text-[11px] font-bold tracking-[1.5px] uppercase" style={{ color: '#f0c040', fontFamily: "'Barlow Condensed', sans-serif" }}>
            Últimos partidos
          </span>
        </div>
        {fixtures.slice().reverse().map(f => (
          <div key={f.fixture.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid #0d0e1c' }}>
            <span className="text-[10px] shrink-0" style={{ color: '#52526e', width: 32 }}>
              {['FT', 'AET', 'PEN'].includes(f.fixture.status.short) ? 'FIN' : f.fixture.status.short}
            </span>
            <div className="flex-1 flex items-center gap-2 justify-end">
              <span className="text-[11px] truncate" style={{ color: f.teams.home.winner ? '#e8e8f8' : '#52526e' }}>
                {f.teams.home.name}
              </span>
              <img src={f.teams.home.logo} alt="" width={14} height={14} className="object-contain shrink-0" />
            </div>
            <span className="text-[12px] font-bold shrink-0 tabular-nums" style={{ color: '#e8e8f8', width: 40, textAlign: 'center' }}>
              {f.goals.home} - {f.goals.away}
            </span>
            <div className="flex-1 flex items-center gap-2">
              <img src={f.teams.away.logo} alt="" width={14} height={14} className="object-contain shrink-0" />
              <span className="text-[11px] truncate" style={{ color: f.teams.away.winner ? '#e8e8f8' : '#52526e' }}>
                {f.teams.away.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top scorers */}
      <div style={{ background: '#06070e', border: '1px solid #151626', borderRadius: 4 }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #151626' }}>
          <span className="text-[11px] font-bold tracking-[1.5px] uppercase" style={{ color: '#f0c040', fontFamily: "'Barlow Condensed', sans-serif" }}>
            Goleadores del torneo
          </span>
        </div>
        {scorers.slice(0, 10).map((p, i) => {
          const stat = p.statistics[0]
          return (
            <div key={p.player.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid #0d0e1c' }}>
              <span className="text-[12px] font-bold w-5 shrink-0" style={{ color: i === 0 ? '#f0c040' : '#52526e' }}>
                {i + 1}
              </span>
              <img src={p.player.photo} alt={p.player.name} width={24} height={24} className="rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] truncate" style={{ color: '#c8c8e0' }}>{p.player.name}</div>
                <div className="text-[10px]" style={{ color: '#3a3b52' }}>{stat?.team?.name}</div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[14px] font-bold" style={{ color: '#f0c040', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {stat?.goals?.total ?? 0}
                </span>
                <span className="text-[10px] ml-1" style={{ color: '#52526e' }}>goles</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Mundial2026Client() {
  const [view, setView] = useState<'overview' | 'groups' | 'venues' | 'live'>('overview')

  return (
    <main className="relative z-10 min-h-screen">

      {/* Hero header */}
      <div
        className="w-full"
        style={{
          background: 'linear-gradient(180deg,#0a0800,#07060f)',
          borderBottom: '1px solid #252010',
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5">
          <div className="pt-6 pb-0">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-[2px] uppercase"
                style={{ background: 'rgba(240,192,64,.12)', color: '#f0c040', border: '1px solid rgba(240,192,64,.2)' }}
              >
                FIFA WORLD CUP
              </span>
              <span className="text-[9px] tracking-[2px] uppercase" style={{ color: '#52526e' }}>
                USA · CANADA · MEXICO
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 38, fontWeight: 700, color: '#f0c040',
                letterSpacing: 1, lineHeight: 1,
              }}
            >
              MUNDIAL 2026
            </h1>
            <p className="mt-1 text-[13px]" style={{ color: '#52526e' }}>
              48 selecciones · 16 sedes · 104 partidos · 11 jun – 19 jul 2026
            </p>

            <Countdown />
          </div>

          {/* Nav tabs */}
          <div className="flex items-end mt-2">
            {([
              { id: 'overview', label: 'Resumen' },
              { id: 'groups',   label: 'Grupos' },
              { id: 'venues',   label: 'Sedes' },
              { id: 'live',     label: 'En vivo' },
            ] as const).map(t => {
              const active = view === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setView(t.id)}
                  className="cursor-pointer transition-all duration-150 shrink-0"
                  style={{
                    fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase',
                    color: active ? '#f0c040' : '#3a3b52',
                    background: 'transparent', border: 'none',
                    borderBottom: active ? '2px solid #f0c040' : '2px solid transparent',
                    padding: '9px 18px', marginBottom: -1,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#60608a' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#3a3b52' }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full" style={{ background: '#0b0c1a' }}>
        <div className="max-w-[1100px] mx-auto px-5 py-6 pb-20">

          {view === 'overview' && <OverviewPanel />}
          {view === 'groups' && <GroupsPanel />}
          {view === 'venues' && <VenuesPanel />}
          {view === 'live' && <LiveDataPanel />}

        </div>
      </div>
    </main>
  )
}

// ─── Overview panel ───────────────────────────────────────────────────────────

function OverviewPanel() {
  const stats = [
    { label: 'Selecciones', value: '48', desc: 'Primer mundial con 48 equipos' },
    { label: 'Grupos',      value: '12', desc: 'Grupos de 4 — top 2 + mejores 8 terceros' },
    { label: 'Partidos',    value: '104', desc: '56 más que en Qatar 2022' },
    { label: 'Sedes',       value: '16',  desc: 'USA (11) + México (3) + Canadá (2)' },
    { label: 'Fechas',      value: '39 días', desc: '11 jun — 19 jul 2026' },
    { label: 'Inicio',      value: 'CDMX', desc: 'Estadio Azteca, inauguración' },
  ]

  const favourites = [
    { flag: 'br', name: 'Brasil',   odds: '5.0' },
    { flag: 'fr', name: 'Francia',  odds: '5.5' },
    { flag: 'en', name: 'Inglaterra', odds: '6.0' },
    { flag: 'es', name: 'España',   odds: '7.0' },
    { flag: 'ar', name: 'Argentina', odds: '7.5' },
    { flag: 'de', name: 'Alemania', odds: '8.0' },
    { flag: 'pt', name: 'Portugal', odds: '10.0' },
    { flag: 'nl', name: 'Países Bajos', odds: '11.0' },
  ]

  return (
    <div className="space-y-6">
      {/* Key stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(s => (
          <div
            key={s.label}
            className="rounded-sm px-4 py-3"
            style={{ background: '#06070e', border: '1px solid #151626' }}
          >
            <div className="text-[22px] font-bold leading-none" style={{ color: '#f0c040', fontFamily: "'Barlow Condensed', sans-serif" }}>
              {s.value}
            </div>
            <div className="text-[11px] font-semibold mt-1 uppercase tracking-[1px]" style={{ color: '#c8c8e0', fontFamily: "'Barlow Condensed', sans-serif" }}>
              {s.label}
            </div>
            <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: '#3a3b52' }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Format explanation */}
      <div
        className="rounded-sm px-5 py-4"
        style={{ background: '#06070e', border: '1px solid #151626' }}
      >
        <div className="text-[12px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: '#52526e', fontFamily: "'Barlow Condensed', sans-serif" }}>
          Formato del torneo
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { phase: 'Fase de grupos', detail: '12 grupos × 4 equipos' },
            { phase: 'Octavos de final', detail: '32 equipos clasificados' },
            { phase: 'Cuartos de final', detail: '16 equipos' },
            { phase: 'Semifinales', detail: '8 equipos' },
            { phase: 'Final', detail: 'MetLife Stadium, NJ' },
          ].map((p, i) => (
            <div key={p.phase} className="flex items-center gap-2">
              {i > 0 && <span style={{ color: '#1a1b2e' }}>›</span>}
              <div className="text-center">
                <div className="text-[11px] font-semibold" style={{ color: '#c8c8e0' }}>{p.phase}</div>
                <div className="text-[10px]" style={{ color: '#3a3b52' }}>{p.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Favourites */}
      <div
        className="rounded-sm"
        style={{ background: '#06070e', border: '1px solid #151626' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #151626' }}>
          <span className="text-[11px] font-bold tracking-[1.5px] uppercase" style={{ color: '#52526e', fontFamily: "'Barlow Condensed', sans-serif" }}>
            Favoritos al título
          </span>
        </div>
        {favourites.map((t, i) => (
          <div
            key={t.name}
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderBottom: i < favourites.length - 1 ? '1px solid #0d0e1c' : 'none' }}
          >
            <span className="text-[12px] font-bold w-5 shrink-0" style={{ color: i === 0 ? '#f0c040' : '#52526e' }}>
              {i + 1}
            </span>
            <span className="text-[12px]" style={{ color: '#c8c8e0' }}>{t.name}</span>
            <span className="text-[10px] ml-auto" style={{ color: '#52526e' }}>x{t.odds}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Groups panel ─────────────────────────────────────────────────────────────

function GroupsPanel() {
  return (
    <div className="space-y-2">
      <p className="text-[12px] mb-4" style={{ color: '#52526e' }}>
        El sorteo del Mundial 2026 se realizará en diciembre de 2025. Los grupos se actualizarán automáticamente.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {WC_GROUPS.map(g => (
          <div
            key={g.id}
            className="rounded-sm"
            style={{ background: '#06070e', border: '1px solid #151626' }}
          >
            <div
              className="px-3 py-2 text-[12px] font-bold"
              style={{
                color: '#f0c040', fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: 1, borderBottom: '1px solid #151626',
                borderLeft: '2px solid #f0c040',
              }}
            >
              GRUPO {g.id}
            </div>
            {g.teams.map(team => (
              <div key={team} className="px-3 py-1.5" style={{ borderBottom: '1px solid #0d0e1c' }}>
                <span className="text-[12px]" style={{ color: '#9090a8' }}>{team}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-[10px] mt-3" style={{ color: '#2a2b3e' }}>
        * Grupos provisionales basados en clasificaciones UEFA/CONMEBOL. Se actualizarán tras el sorteo oficial.
      </p>
    </div>
  )
}

// ─── Venues panel ────────────────────────────────────────────────────────────

function VenuesPanel() {
  const countries = ['USA', 'Mexico', 'Canada']
  return (
    <div className="space-y-5">
      {countries.map(country => (
        <div key={country}>
          <div
            className="text-[10px] font-bold tracking-[2px] uppercase mb-2"
            style={{ color: '#52526e', fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {country}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {VENUES.filter(v => v.country === country).map(venue => (
              <div
                key={venue.stadium}
                className="rounded-sm px-4 py-3"
                style={{
                  background: '#06070e',
                  border: `1px solid ${venue.final ? 'rgba(240,192,64,.3)' : '#151626'}`,
                }}
              >
                {venue.final && (
                  <span
                    className="inline-block text-[8px] font-bold tracking-[1.5px] uppercase px-1.5 py-0.5 rounded-sm mb-2"
                    style={{ background: 'rgba(240,192,64,.12)', color: '#f0c040', border: '1px solid rgba(240,192,64,.25)' }}
                  >
                    SEDE FINAL
                  </span>
                )}
                <div className="text-[13px] font-semibold" style={{ color: '#c8c8e0', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {venue.stadium}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: '#52526e' }}>{venue.city}</div>
                <div className="text-[10px] mt-1" style={{ color: '#2a2b3e' }}>
                  Cap. {venue.capacity}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
