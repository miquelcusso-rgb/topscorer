'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { ApiStandingEntry, ApiFixture, LeagueMeta } from '@/lib/api-football'
import {
  LEAGUES as L_TOP,
  LEAGUES_EUROPE_OTHER as L_EUOTHER,
  LEAGUES_2 as L_SECOND,
  LEAGUES_AMERICAS as L_AMERICAS,
  LEAGUES_ASIA_OCEANIA as L_ASIA,
  LEAGUES_MIDDLE_EAST as L_ME,
} from '@/lib/api-football'
import AdSlot from '@/components/AdSlot'

// Flag emojis per ISO/short code, used by every section below.
const FLAG: Record<string, string> = {
  ESP:'🇪🇸', ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', GER:'🇩🇪', ITA:'🇮🇹', FRA:'🇫🇷', PRT:'🇵🇹', TUR:'🇹🇷', GRE:'🇬🇷',
  NED:'🇳🇱', BEL:'🇧🇪', SCO:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', SUI:'🇨🇭', AUT:'🇦🇹', POL:'🇵🇱', DEN:'🇩🇰', SWE:'🇸🇪', NOR:'🇳🇴',
  ENG2:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', GER2:'🇩🇪', ITA2:'🇮🇹', FRA2:'🇫🇷', ESP2:'🇪🇸', PRT2:'🇵🇹', TUR2:'🇹🇷', GRE2:'🇬🇷', NED2:'🇳🇱', SCO2:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA:'🇺🇸', MEX:'🇲🇽', BRA:'🇧🇷', ARG:'🇦🇷', CHI:'🇨🇱', COL:'🇨🇴', URU:'🇺🇾',
  JPN:'🇯🇵', KOR:'🇰🇷', CHN:'🇨🇳', AUS:'🇦🇺',
  KSA:'🇸🇦',
}
const withFlag = (l: LeagueMeta): LeagueMeta => ({ ...l, flag: FLAG[l.short] ?? '🏳️' })
const LEAGUES         = L_TOP.map(withFlag)
const LEAGUES_EUOTHER = L_EUOTHER.map(withFlag)
const LEAGUES_SECOND  = L_SECOND.map(withFlag)
const LEAGUES_AM      = L_AMERICAS.map(withFlag)
const LEAGUES_AS      = L_ASIA.map(withFlag)
const LEAGUES_MED     = L_ME.map(withFlag)

// Grouped extra leagues exposed via the "Más ligas ▾" dropdown.
const EXTRA_GROUPS: { label: string; leagues: LeagueMeta[] }[] = [
  { label: 'Otras Europa', leagues: LEAGUES_EUOTHER },
  { label: '2ª División',  leagues: LEAGUES_SECOND },
  { label: 'Américas',     leagues: LEAGUES_AM },
  { label: 'Asia / Oceanía', leagues: LEAGUES_AS },
  { label: 'Oriente Medio',  leagues: LEAGUES_MED },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Madrid',
  })
}

function isLive(short: string) {
  return ['1H', '2H', 'HT', 'ET', 'P'].includes(short)
}

// ─── Standings table ──────────────────────────────────────────────────────────

function StandingsTable({ standings, leagueColor, isLight }: { standings: ApiStandingEntry[]; leagueColor: string; isLight: boolean }) {
  const border = isLight ? '#c8d0e8' : '#151626'
  const rowBorder = isLight ? '#e2e8f4' : '#0d0e1c'
  const rowAlt = isLight ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.012)'
  const textMuted = isLight ? '#5060a0' : '#52526e'
  const textMain = isLight ? '#0f1830' : '#c8c8e0'
  const textBright = isLight ? '#0f1830' : '#e8e8f8'

  if (!standings.length) {
    return (
      <div className="py-10 text-center text-[12px]" style={{ color: textMuted }}>
        Clasificación no disponible
      </div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="w-full text-[12px]" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${border}` }}>
            {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'Pts', 'Forma'].map((h, i) => (
              <th
                key={h}
                className={`py-2 font-semibold ${i <= 1 ? 'text-left' : 'text-center'}`}
                style={{ color: textMuted, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, paddingLeft: i === 0 ? 12 : 4, paddingRight: 4, fontSize: 10, textTransform: 'uppercase' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => {
            const Relegation = row.description?.toLowerCase().includes('relegat')

            let leftBorder = 'transparent'
            if (row.rank <= 4) leftBorder = leagueColor
            else if (row.rank <= 6) leftBorder = '#00c8b0'
            else if (Relegation) leftBorder = '#e03a3a'

            return (
              <tr
                key={row.team.id}
                style={{
                  borderBottom: `1px solid ${rowBorder}`,
                  background: idx % 2 === 0 ? 'transparent' : rowAlt,
                }}
              >
                <td style={{ paddingLeft: 0, paddingTop: 7, paddingBottom: 7, borderLeft: `2px solid ${leftBorder}`, width: 40 }}>
                  <span className="pl-2" style={{ color: row.rank <= 3 ? leagueColor : textMuted, fontWeight: row.rank <= 3 ? 700 : 400, fontSize: 12 }}>
                    {row.rank}
                  </span>
                </td>
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.team.logo} alt={row.team.name} width={18} height={18} className="shrink-0 object-contain" />
                    <span style={{ color: textMain, fontSize: 12 }}>{row.team.name}</span>
                  </div>
                </td>
                {[row.all.played, row.all.win, row.all.draw, row.all.lose, row.all.goals.for, row.all.goals.against, row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff].map((val, i) => (
                  <td key={i} className="text-center" style={{ color: textMuted, paddingLeft: 4, paddingRight: 4 }}>{val}</td>
                ))}
                <td className="text-center font-bold" style={{ color: textBright, paddingLeft: 4, paddingRight: 4 }}>{row.points}</td>
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

function FixtureRow({ fixture, isLight }: { fixture: ApiFixture; isLight: boolean }) {
  const status = fixture.fixture.status.short
  const live = isLive(status)
  const finished = ['FT', 'AET', 'PEN'].includes(status)

  const rowBorder = isLight ? '#e2e8f4' : '#0d0e1c'
  const textMuted = isLight ? '#5060a0' : '#52526e'
  const textDim = isLight ? '#8898c0' : '#3a3b52'
  const textWinner = isLight ? '#0f1830' : '#e8e8f8'

  return (
    <div
      className="flex items-center gap-3 py-2.5 px-3 rounded-sm"
      style={{ background: live ? 'rgba(56,196,122,.06)' : 'transparent', borderBottom: `1px solid ${rowBorder}` }}
    >
      {/* Status */}
      <div className="shrink-0 w-[64px] text-right">
        {live ? (
          <span className="text-[10px] font-bold" style={{ color: '#38c47a' }}>
            {fixture.fixture.status.elapsed}&apos;
          </span>
        ) : finished ? (
          <span className="text-[10px]" style={{ color: textMuted }}>FIN</span>
        ) : (
          <span className="text-[10px]" style={{ color: textDim }}>
            {new Date(fixture.fixture.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}
          </span>
        )}
      </div>

      {/* Home */}
      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
        <span
          className="truncate text-[12px]"
          style={{ color: fixture.teams.home.winner ? textWinner : textMuted, fontWeight: fixture.teams.home.winner ? 600 : 400 }}
        >
          {fixture.teams.home.name}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fixture.teams.home.logo} alt="" width={16} height={16} className="shrink-0 object-contain" />
      </div>

      {/* Score */}
      <div className="shrink-0 w-[50px] text-center">
        {finished || live ? (
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: live ? '#38c47a' : textWinner, letterSpacing: 1 }}
          >
            {fixture.goals.home} - {fixture.goals.away}
          </span>
        ) : (
          <span className="text-[11px]" style={{ color: textMuted }}>vs</span>
        )}
      </div>

      {/* Away */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fixture.teams.away.logo} alt="" width={16} height={16} className="shrink-0 object-contain" />
        <span
          className="truncate text-[12px]"
          style={{ color: fixture.teams.away.winner ? textWinner : textMuted, fontWeight: fixture.teams.away.winner ? 600 : 400 }}
        >
          {fixture.teams.away.name}
        </span>
      </div>

      {/* Date */}
      <div className="shrink-0 hidden sm:block text-right w-[90px]">
        <span className="text-[10px]" style={{ color: isLight ? '#a0a8c8' : '#2a2b3e' }}>
          {formatDate(fixture.fixture.date)}
        </span>
      </div>
    </div>
  )
}

// ─── League section ───────────────────────────────────────────────────────────

function LeagueSection({ league, activeTab, isLight }: { league: LeagueMeta; activeTab: 'standings' | 'fixtures'; isLight: boolean }) {
  const [standings, setStandings] = useState<ApiStandingEntry[]>([])
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const textDim = isLight ? '#8898c0' : '#3a3b52'

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
        <div className="py-12 text-center text-[12px]" style={{ color: textDim }}>
          Cargando...
        </div>
      )}
      {error && !loading && (
        <div className="py-10 text-center text-[12px]" style={{ color: textDim }}>
          Error al cargar los datos. Intenta de nuevo.
        </div>
      )}
      {!loading && !error && activeTab === 'standings' && (
        <StandingsTable standings={standings} leagueColor={league.color} isLight={isLight} />
      )}
      {!loading && !error && activeTab === 'fixtures' && (
        <div>
          {fixtures.length === 0 ? (
            <div className="py-10 text-center text-[12px]" style={{ color: textDim }}>
              Sin partidos recientes
            </div>
          ) : (
            fixtures.slice().reverse().map(f => <FixtureRow key={f.fixture.id} fixture={f} isLight={isLight} />)
          )}
        </div>
      )}
    </div>
  )
}

// ─── Round-by-round view (jornada a jornada) ───────────────────────────────────

// Extract a sortable number from an API-Football round string like
// "Regular Season - 12" → 12. Non-numbered rounds sort last.
function roundNumber(round: string): number {
  const m = round.match(/(\d+)\s*$/)
  return m ? Number(m[1]) : 9999
}
function roundShortLabel(round: string): string {
  const m = round.match(/(\d+)\s*$/)
  return m ? `J${m[1]}` : round
}

function RoundsView({ league, isLight }: { league: LeagueMeta; isLight: boolean }) {
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [round, setRound] = useState<string | null>(null)

  const textDim = isLight ? '#8898c0' : '#3a3b52'
  const textMuted = isLight ? '#5060a0' : '#52526e'
  const textMain = isLight ? '#0f1830' : '#c8c8e0'
  const ctrlBorder = isLight ? '#c8d0e8' : '#151626'

  useEffect(() => {
    setLoading(true); setError(false); setRound(null)
    fetch(`/api/football/fixtures?league=${league.id}&season=2025&all=1`)
      .then(r => r.json())
      .then(j => { if (j.ok) setFixtures(j.data); else setError(true) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [league.id])

  // Ordered list of distinct rounds.
  const rounds = Array.from(new Set(fixtures.map(f => f.league.round)))
    .sort((a, b) => roundNumber(a) - roundNumber(b))

  // Default round: the latest one that already has a finished match (the most
  // recent "current" matchday); fall back to the last round overall.
  const finished = (s: string) => ['FT', 'AET', 'PEN'].includes(s)
  const defaultRound = (() => {
    const playedRounds = rounds.filter(r => fixtures.some(f => f.league.round === r && finished(f.fixture.status.short)))
    return playedRounds.length ? playedRounds[playedRounds.length - 1] : (rounds[0] ?? null)
  })()
  const current = round ?? defaultRound
  const idx = current ? rounds.indexOf(current) : -1
  const roundFixtures = fixtures
    .filter(f => f.league.round === current)
    .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())

  if (loading) return <div className="py-12 text-center text-[12px]" style={{ color: textDim }}>Cargando jornadas…</div>
  if (error) return <div className="py-10 text-center text-[12px]" style={{ color: textDim }}>Error al cargar los partidos.</div>
  if (!rounds.length) return <div className="py-10 text-center text-[12px]" style={{ color: textDim }}>Sin jornadas disponibles.</div>

  return (
    <div>
      {/* Round selector: prev · dropdown · next */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${ctrlBorder}` }}>
        <button
          onClick={() => idx > 0 && setRound(rounds[idx - 1])}
          disabled={idx <= 0}
          aria-label="Jornada anterior"
          className="cursor-pointer"
          style={{ background: 'transparent', border: `1px solid ${ctrlBorder}`, borderRadius: 6, color: idx <= 0 ? textDim : league.color, width: 30, height: 30, fontSize: 16, lineHeight: 1, opacity: idx <= 0 ? 0.4 : 1 }}
        >‹</button>

        <select
          value={current ?? ''}
          onChange={e => setRound(e.target.value)}
          className="cursor-pointer"
          style={{
            flex: 1, maxWidth: 240, padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: isLight ? '#ffffff' : '#0d0e1c', color: textMain,
            border: `1px solid ${ctrlBorder}`, fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {rounds.map(r => (
            <option key={r} value={r}>{roundShortLabel(r)} · {r}</option>
          ))}
        </select>

        <button
          onClick={() => idx < rounds.length - 1 && setRound(rounds[idx + 1])}
          disabled={idx >= rounds.length - 1}
          aria-label="Jornada siguiente"
          className="cursor-pointer"
          style={{ background: 'transparent', border: `1px solid ${ctrlBorder}`, borderRadius: 6, color: idx >= rounds.length - 1 ? textDim : league.color, width: 30, height: 30, fontSize: 16, lineHeight: 1, opacity: idx >= rounds.length - 1 ? 0.4 : 1 }}
        >›</button>

        <span className="ml-auto text-[10px] tabular-nums" style={{ color: textMuted }}>
          {idx + 1} / {rounds.length}
        </span>
      </div>

      {/* Round fixtures */}
      {roundFixtures.length === 0 ? (
        <div className="py-10 text-center text-[12px]" style={{ color: textDim }}>Sin partidos en esta jornada.</div>
      ) : (
        roundFixtures.map(f => <FixtureRow key={f.fixture.id} fixture={f} isLight={isLight} />)
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

// "Más ligas ▾" — dropdown grouped by region (2ª, Américas, Asia, etc.)
function MoreLeaguesDropdown({
  groups, activeLeague, onSelect, isLight, textDim, headerBorder,
}: {
  groups: { label: string; leagues: LeagueMeta[] }[]
  activeLeague: LeagueMeta
  onSelect: (l: LeagueMeta) => void
  isLight: boolean
  textDim: string
  headerBorder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isExtra = groups.some(g => g.leagues.some(l => l.id === activeLeague.id))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-150 shrink-0 py-2 px-3"
        style={{
          color: isExtra ? activeLeague.color : textDim,
          background: 'transparent', border: 'none',
          borderBottom: isExtra ? `2px solid ${activeLeague.color}` : '2px solid transparent',
          marginBottom: -1,
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1, height: 22, display: 'flex', alignItems: 'center' }}>🌐</span>
        <span style={{ fontSize: 9, letterSpacing: 1, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase' }}>
          Más ▾
        </span>
      </button>
      {open && (
        <div
          className="absolute top-full right-0 z-50 mt-1 rounded-md shadow-2xl"
          style={{
            background: isLight ? '#ffffff' : '#0d0e1c',
            border: `1px solid ${headerBorder}`,
            minWidth: 280,
            maxHeight: 460,
            overflowY: 'auto',
          }}
        >
          {groups.map(g => (
            <div key={g.label}>
              <div
                style={{
                  padding: '8px 14px 4px',
                  fontSize: 10,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: isLight ? '#5060a0' : '#5a5c80',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                }}
              >
                {g.label}
              </div>
              <div className="grid grid-cols-2 gap-0">
                {g.leagues.map(l => {
                  const active = activeLeague.id === l.id
                  return (
                    <button
                      key={l.id}
                      onClick={() => { onSelect(l); setOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 12px',
                        background: active ? `${l.color}1f` : 'transparent',
                        border: 'none',
                        color: active ? l.color : (isLight ? '#0f1830' : '#c8c8e0'),
                        fontSize: 12,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = isLight ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.04)' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: 14 }}>{l.flag ?? '🏳️'}</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{l.short}</span>
                      <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 'auto' }}>{l.country}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ResultadosClient() {
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0])
  const [activeTab, setActiveTab] = useState<'standings' | 'fixtures' | 'rounds'>('standings')
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const pageBg = isLight ? '#edf1f8' : '#0b0c1a'
  const headerBg = isLight ? 'linear-gradient(180deg, #dde5f4, #edf1f8)' : 'linear-gradient(180deg,#07081a,#050610)'
  const headerBorder = isLight ? '#c8d0e8' : '#151626'
  const cardBg = isLight ? '#ffffff' : '#06070e'
  const cardBorder = isLight ? '#c8d0e8' : '#151626'
  const textPrimary = isLight ? '#0f1830' : '#e8e8f8'
  const textMuted = isLight ? '#5060a0' : '#52526e'
  const textDim = isLight ? '#8898c0' : '#3a3b52'

  return (
    <main className="relative z-10 min-h-screen">

      {/* Page header */}
      <div
        className="w-full"
        style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}
      >
        <div className="max-w-[1100px] mx-auto px-5">
          <div className="pt-6 pb-0">
            <div
              className="font-bold tracking-[3px] uppercase mb-2"
              style={{ fontSize: 10, color: textMuted, fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Europa &nbsp;·&nbsp; Temporada 2025/26
            </div>
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 30, fontWeight: 700, color: textPrimary,
                letterSpacing: 0.5, lineHeight: 1,
              }}
            >
              Resultados{' '}
              <span style={{ color: textMuted, fontWeight: 400 }}>y Clasificaciones</span>
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
                    color: active ? league.color : textDim,
                    background: 'transparent', border: 'none',
                    borderBottom: active ? `2px solid ${league.color}` : '2px solid transparent',
                    marginBottom: -1,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = isLight ? '#8898c0' : '#60608a' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = textDim }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

            {/* "Más ligas" dropdown — 2ª divisiones + ligas globales */}
            <MoreLeaguesDropdown
              groups={EXTRA_GROUPS}
              activeLeague={activeLeague}
              onSelect={setActiveLeague}
              isLight={isLight}
              textDim={textDim}
              headerBorder={headerBorder}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full" style={{ background: pageBg }}>
        <div className="max-w-[1100px] mx-auto px-5 py-5 pb-20">

          {/* Sub-tabs: Standings · Last matches · Round-by-round */}
          <div className="flex gap-2 mb-5">
            {([
              { id: 'standings', label: 'Clasificación' },
              { id: 'fixtures', label: 'Últimos partidos' },
              { id: 'rounds', label: 'Jornada a jornada' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="cursor-pointer transition-all duration-150 text-[11px] font-bold uppercase tracking-[1.5px] px-4 py-1.5 rounded-sm"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  background: activeTab === t.id ? activeLeague.color : 'transparent',
                  color: activeTab === t.id ? (isLight ? '#ffffff' : '#05060c') : textMuted,
                  border: `1px solid ${activeTab === t.id ? activeLeague.color : headerBorder}`,
                }}
                onMouseEnter={e => { if (activeTab !== t.id) { e.currentTarget.style.borderColor = isLight ? '#8898c0' : '#3a3b52'; e.currentTarget.style.color = isLight ? '#0f1830' : '#c8c8e0' } }}
                onMouseLeave={e => { if (activeTab !== t.id) { e.currentTarget.style.borderColor = headerBorder; e.currentTarget.style.color = textMuted } }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* League panel */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {/* League header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: `1px solid ${cardBorder}`, borderLeft: `3px solid ${activeLeague.color}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <div className="text-[11px]" style={{ color: textDim }}>
                  {activeLeague.country} · 2025/26
                </div>
              </div>
            </div>

            {activeTab === 'rounds'
              ? <RoundsView league={activeLeague} isLight={isLight} />
              : <LeagueSection league={activeLeague} activeTab={activeTab} isLight={isLight} />}

            {/* Ad below standings, before fixtures */}
            <AdSlot slot="5544332211" format="horizontal" className="px-4 py-3" />
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
                  <span className="text-[10px]" style={{ color: textDim }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
