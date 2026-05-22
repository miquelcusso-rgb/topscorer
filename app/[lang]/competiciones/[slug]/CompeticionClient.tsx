'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import type {
  ApiStandingEntry,
  ApiFixture,
  ApiPlayerResponse,
  LeagueMeta,
} from '@/lib/api-football'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'clasificacion' | 'partidos' | 'estadisticas'

interface Props {
  league: LeagueMeta
  standings: ApiStandingEntry[]
  pastFixtures: ApiFixture[]
  nextFixtures: ApiFixture[]
  scorers: ApiPlayerResponse[]
  assists: ApiPlayerResponse[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Europe/Madrid',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  })
}

function relativeDay(iso: string): string {
  const now = new Date()
  const date = new Date(iso)
  const diff = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  if (diff > 1) return `En ${diff} días`
  return formatDateShort(iso)
}

function isLive(short: string): boolean {
  return ['1H', '2H', 'HT', 'ET', 'P'].includes(short)
}

function getStatusLabel(short: string): string {
  const map: Record<string, string> = {
    FT: 'FT', AET: 'PRÓRROGA', PEN: 'PENALTIS',
    '1H': 'VIVO', '2H': 'VIVO', HT: 'DESCANSO',
    NS: 'Pendiente', PST: 'Aplazado', CANC: 'Cancelado',
  }
  return map[short] ?? short
}

function longestWinningStreak(standings: ApiStandingEntry[]): string {
  let best = { name: '', streak: 0 }
  for (const row of standings) {
    const form = (row.form ?? '').split('')
    let cur = 0
    let max = 0
    for (const f of form) {
      if (f === 'W') { cur++; if (cur > max) max = cur } else cur = 0
    }
    if (max > best.streak) best = { name: row.team.name, streak: max }
  }
  return best.streak > 0 ? `${best.name} (${best.streak}W)` : '—'
}

// ─── Standing row zone colors ─────────────────────────────────────────────────

function getLeftBorder(row: ApiStandingEntry, leagueColor: string): string {
  const desc = (row.description ?? '').toLowerCase()
  if (desc.includes('champion') || row.rank <= 4) return leagueColor
  if (desc.includes('europa') || desc.includes('conference') || row.rank <= 6) return '#00c8b0'
  if (desc.includes('relegat')) return '#e03a3a'
  return 'transparent'
}

// ─── Form dots ────────────────────────────────────────────────────────────────

function FormDots({ form }: { form: string }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {(form ?? '').split('').slice(-5).map((f, fi) => (
        <span
          key={fi}
          className="inline-flex items-center justify-center"
          title={f === 'W' ? 'Victoria' : f === 'D' ? 'Empate' : 'Derrota'}
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: f === 'W' ? '#22c55e' : f === 'D' ? '#f0c040' : '#e03a3a',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

// ─── Standings Table ──────────────────────────────────────────────────────────

function StandingsTable({
  standings,
  leagueColor,
  isLight,
}: {
  standings: ApiStandingEntry[]
  leagueColor: string
  isLight: boolean
}) {
  const border = isLight ? '#c8d0e8' : '#1a1b2e'
  const rowAlt = isLight ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.012)'
  const textMuted = isLight ? '#6070a0' : '#52526e'
  const textMain = isLight ? '#0f1830' : '#c8c8e0'
  const textBright = isLight ? '#0f1830' : '#e8e8f8'

  if (!standings.length) {
    return (
      <div className="py-10 text-center text-[12px]" style={{ color: textMuted }}>
        Clasificación no disponible para esta temporada
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="w-full text-[12px]" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${border}` }}>
            {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'Pts', 'Casa', 'Fuera', 'Forma'].map((h, i) => (
              <th
                key={h}
                className={`py-2 font-semibold ${i <= 1 ? 'text-left' : 'text-center'}`}
                style={{
                  color: textMuted,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: 1,
                  paddingLeft: i === 0 ? 12 : 4,
                  paddingRight: 4,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  // Hide home/away on mobile via responsive class but we'll use data attributes
                  display: 'table-cell',
                }}
                data-col={h}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => {
            const leftBorder = getLeftBorder(row, leagueColor)
            const tooltip = row.description ?? ''

            return (
              <tr
                key={row.team.id}
                title={tooltip}
                style={{
                  borderBottom: `1px solid ${isLight ? '#e2e8f4' : '#0d0e1c'}`,
                  background: idx % 2 === 0 ? 'transparent' : rowAlt,
                }}
              >
                {/* Rank */}
                <td style={{ paddingLeft: 0, paddingTop: 7, paddingBottom: 7, borderLeft: `3px solid ${leftBorder}`, width: 40 }}>
                  <span
                    className="pl-2"
                    style={{
                      color: leftBorder !== 'transparent' ? leftBorder : textMuted,
                      fontWeight: leftBorder !== 'transparent' ? 700 : 400,
                      fontSize: 12,
                    }}
                  >
                    {row.rank}
                  </span>
                </td>

                {/* Team */}
                <td className="py-1.5 pr-2 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.team.logo} alt={row.team.name} width={18} height={18} className="shrink-0 object-contain" />
                    <span style={{ color: textMain, fontSize: 12 }}>{row.team.name}</span>
                  </div>
                </td>

                {/* PJ G E P GF GC DG */}
                {[row.all.played, row.all.win, row.all.draw, row.all.lose, row.all.goals.for, row.all.goals.against, row.goalsDiff > 0 ? `+${row.goalsDiff}` : `${row.goalsDiff}`].map((val, i) => (
                  <td key={i} className="text-center" style={{ color: textMuted, paddingLeft: 4, paddingRight: 4 }}>{val}</td>
                ))}

                {/* Pts */}
                <td className="text-center font-bold" style={{ color: textBright, paddingLeft: 4, paddingRight: 4 }}>{row.points}</td>

                {/* Casa */}
                <td className="text-center hidden md:table-cell" style={{ color: textMuted, paddingLeft: 4, paddingRight: 4, fontSize: 11 }}>
                  <span title={`${row.home.win}-${row.home.draw}-${row.home.lose}`} style={{ fontSize: 10 }}>
                    {row.home.win}-{row.home.draw}-{row.home.lose}
                  </span>
                </td>

                {/* Fuera */}
                <td className="text-center hidden md:table-cell" style={{ color: textMuted, paddingLeft: 4, paddingRight: 4, fontSize: 11 }}>
                  <span title={`${row.away.win}-${row.away.draw}-${row.away.lose}`} style={{ fontSize: 10 }}>
                    {row.away.win}-{row.away.draw}-{row.away.lose}
                  </span>
                </td>

                {/* Forma */}
                <td className="text-center py-1.5" style={{ paddingLeft: 4, paddingRight: 12 }}>
                  <FormDots form={row.form} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function FixtureCard({ fixture, isLight }: { fixture: ApiFixture; isLight: boolean }) {
  const status = fixture.fixture.status.short
  const live = isLive(status)
  const finished = ['FT', 'AET', 'PEN'].includes(status)
  const pending = !live && !finished

  const border = isLight ? '#c8d0e8' : '#1a1b2e'
  const textMuted = isLight ? '#6070a0' : '#52526e'
  const textMain = isLight ? '#0f1830' : '#c8c8e0'
  const textBright = isLight ? '#0f1830' : '#e8e8f8'
  const bg = live
    ? 'rgba(56,196,122,.06)'
    : isLight ? '#ffffff' : 'transparent'

  const ht = fixture.score.halftime
  const htStr = ht.home !== null && ht.away !== null ? `(${ht.home}-${ht.away})` : ''

  return (
    <div
      className="flex items-center gap-2 py-2.5 px-3"
      style={{ background: bg, borderBottom: `1px solid ${border}` }}
    >
      {/* Date/Time + Round */}
      <div className="shrink-0 w-[80px]">
        {live ? (
          <div className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#38c47a', display: 'inline-block' }}
            />
            <span className="text-[10px] font-bold" style={{ color: '#38c47a' }}>
              LIVE {fixture.fixture.status.elapsed}&apos;
            </span>
          </div>
        ) : (
          <>
            <div className="text-[10px]" style={{ color: textMuted }}>{formatDateShort(fixture.fixture.date)}</div>
            {pending && (
              <div className="text-[10px]" style={{ color: isLight ? '#6070a0' : '#3a3b52' }}>{formatTime(fixture.fixture.date)}</div>
            )}
          </>
        )}
      </div>

      {/* Home */}
      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
        <span
          className="truncate text-[12px]"
          style={{
            color: fixture.teams.home.winner ? textBright : textMuted,
            fontWeight: fixture.teams.home.winner ? 600 : 400,
          }}
        >
          {fixture.teams.home.name}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fixture.teams.home.logo} alt="" width={16} height={16} className="shrink-0 object-contain" />
      </div>

      {/* Score */}
      <div className="shrink-0 w-[56px] text-center">
        {finished || live ? (
          <div>
            <span
              className="text-[14px] font-bold tabular-nums"
              style={{ color: live ? '#38c47a' : textBright, letterSpacing: 1 }}
            >
              {fixture.goals.home} - {fixture.goals.away}
            </span>
            {finished && htStr && (
              <div className="text-[9px]" style={{ color: textMuted }}>{htStr}</div>
            )}
          </div>
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
          style={{
            color: fixture.teams.away.winner ? textBright : textMuted,
            fontWeight: fixture.teams.away.winner ? 600 : 400,
          }}
        >
          {fixture.teams.away.name}
        </span>
      </div>

      {/* Status badge / venue */}
      <div className="shrink-0 hidden sm:flex flex-col items-end w-[80px]">
        {finished && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{
              background: isLight ? '#e2e8f4' : '#1a1b2e',
              color: textMuted,
              letterSpacing: 0.5,
            }}
          >
            {getStatusLabel(status)}
          </span>
        )}
        <span className="text-[9px] mt-0.5 truncate max-w-[80px]" style={{ color: isLight ? '#8898c0' : '#2a2b3e' }}>
          {fixture.fixture.venue.city}
        </span>
      </div>
    </div>
  )
}

function UpcomingFixtureCard({ fixture, isLight }: { fixture: ApiFixture; isLight: boolean }) {
  const border = isLight ? '#c8d0e8' : '#1a1b2e'
  const textMuted = isLight ? '#6070a0' : '#52526e'
  const textMain = isLight ? '#0f1830' : '#c8c8e0'

  return (
    <div
      className="flex items-center gap-3 py-3 px-3"
      style={{ borderBottom: `1px solid ${border}` }}
    >
      {/* Relative time */}
      <div className="shrink-0 w-[80px]">
        <div className="text-[10px] font-semibold" style={{ color: textMuted }}>{relativeDay(fixture.fixture.date)}</div>
        <div className="text-[10px]" style={{ color: isLight ? '#8898c0' : '#3a3b52' }}>{formatTime(fixture.fixture.date)}</div>
        <div className="text-[9px] mt-0.5" style={{ color: isLight ? '#a0a8c0' : '#252636' }}>{fixture.league.round}</div>
      </div>

      {/* Home */}
      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
        <span className="truncate text-[12px]" style={{ color: textMain }}>{fixture.teams.home.name}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fixture.teams.home.logo} alt="" width={18} height={18} className="shrink-0 object-contain" />
      </div>

      {/* vs */}
      <div className="shrink-0 w-[32px] text-center text-[11px]" style={{ color: textMuted }}>vs</div>

      {/* Away */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fixture.teams.away.logo} alt="" width={18} height={18} className="shrink-0 object-contain" />
        <span className="truncate text-[12px]" style={{ color: textMain }}>{fixture.teams.away.name}</span>
      </div>

      {/* Venue */}
      <div className="shrink-0 hidden sm:block text-right w-[90px]">
        <div className="text-[9px]" style={{ color: isLight ? '#8898c0' : '#2a2b3e' }}>{fixture.fixture.venue.name}</div>
        <div className="text-[9px]" style={{ color: isLight ? '#a0a8c0' : '#252636' }}>{fixture.fixture.venue.city}</div>
      </div>
    </div>
  )
}

// ─── Stats Section ────────────────────────────────────────────────────────────

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,.08)' }}>
      <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function PlayerList({
  players,
  type,
  isLight,
}: {
  players: ApiPlayerResponse[]
  type: 'goals' | 'assists'
  isLight: boolean
}) {
  const color = type === 'goals' ? '#f0c040' : '#00c8b0'
  const label = type === 'goals' ? 'Goles' : 'Asistencias'
  const textMuted = isLight ? '#6070a0' : '#52526e'
  const textMain = isLight ? '#0f1830' : '#c8c8e0'
  const border = isLight ? '#c8d0e8' : '#1a1b2e'
  const cardBg = isLight ? '#ffffff' : '#10111e'

  const top10 = players.slice(0, 10)
  const maxVal = top10.reduce((acc, p) => {
    const stat = p.statistics[0]
    const val = type === 'goals' ? (stat?.goals.total ?? 0) : (stat?.goals.assists ?? 0)
    return Math.max(acc, val)
  }, 0)

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: cardBg, border: `1px solid ${border}` }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[1.5px]"
          style={{ color, fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {label}
        </span>
      </div>
      {top10.length === 0 ? (
        <div className="py-8 text-center text-[11px]" style={{ color: textMuted }}>No disponible</div>
      ) : (
        top10.map((p, idx) => {
          const stat = p.statistics[0]
          const val = type === 'goals' ? (stat?.goals.total ?? 0) : (stat?.goals.assists ?? 0)
          return (
            <div
              key={p.player.id}
              className="flex items-center gap-2.5 px-3 py-2"
              style={{ borderBottom: idx < top10.length - 1 ? `1px solid ${isLight ? '#e8eef8' : '#0d0e1c'}` : 'none' }}
            >
              <span className="text-[11px] w-5 text-center shrink-0" style={{ color: idx < 3 ? color : textMuted, fontWeight: idx < 3 ? 700 : 400 }}>
                {idx + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.player.photo}
                alt={p.player.name}
                width={28}
                height={28}
                className="rounded-full shrink-0 object-cover"
                style={{ border: `1px solid ${isLight ? '#c8d0e8' : '#1a1b2e'}` }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] truncate" style={{ color: textMain }}>{p.player.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {stat && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={stat.team.logo} alt={stat.team.name} width={12} height={12} className="shrink-0 object-contain" />
                      <span className="text-[9px] truncate" style={{ color: textMuted }}>{stat.team.name}</span>
                    </>
                  )}
                </div>
                <MiniBar value={val} max={maxVal} color={color} />
              </div>
              <span
                className="shrink-0 text-[14px] font-bold tabular-nums w-7 text-right"
                style={{ color, fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {val}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}

function LeagueStats({
  standings,
  isLight,
}: {
  standings: ApiStandingEntry[]
  isLight: boolean
}) {
  const border = isLight ? '#c8d0e8' : '#1a1b2e'
  const cardBg = isLight ? '#ffffff' : '#10111e'
  const textMuted = isLight ? '#6070a0' : '#52526e'
  const textMain = isLight ? '#0f1830' : '#c8c8e0'
  const textBright = isLight ? '#0f1830' : '#e8e8f8'

  if (!standings.length) return null

  const totalGF = standings.reduce((s, r) => s + r.all.goals.for, 0)
  const totalMatches = standings.reduce((s, r) => s + r.all.played, 0) / 2
  const avgGoals = totalMatches > 0 ? (totalGF / totalMatches).toFixed(2) : '—'

  const maxGF = standings.reduce((best, r) => r.all.goals.for > best.goals ? { name: r.team.name, goals: r.all.goals.for } : best, { name: '', goals: 0 })
  const minGC = standings.reduce((best, r) => r.all.goals.against < best.goals ? { name: r.team.name, goals: r.all.goals.against } : best, { name: '', goals: Infinity })
  const bestDiff = standings.reduce((best, r) => r.goalsDiff > best.diff ? { name: r.team.name, diff: r.goalsDiff } : best, { name: '', diff: -Infinity })
  const streak = longestWinningStreak(standings)

  const stats: Array<{ label: string; value: string }> = [
    { label: 'Total goles', value: `${totalGF}` },
    { label: 'Promedio goles/partido', value: `${avgGoals}` },
    { label: 'Más goleador', value: `${maxGF.name} (${maxGF.goals})` },
    { label: 'Menos goleado', value: `${minGC.name === '' ? '—' : `${minGC.name} (${minGC.goals})`}` },
    { label: 'Mejor diferencia', value: `${bestDiff.name} (+${bestDiff.diff})` },
    { label: 'Mejor racha actual', value: streak },
  ]

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: cardBg, border: `1px solid ${border}` }}
    >
      <div
        className="px-4 py-2.5"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[1.5px]"
          style={{ color: textMuted, fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Stats de la liga
        </span>
      </div>
      {stats.map(({ label, value }, i) => (
        <div
          key={label}
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: i < stats.length - 1 ? `1px solid ${isLight ? '#e8eef8' : '#0d0e1c'}` : 'none' }}
        >
          <span className="text-[11px]" style={{ color: textMuted }}>{label}</span>
          <span className="text-[12px] font-semibold text-right max-w-[55%] truncate" style={{ color: textBright }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function CompeticionClient({
  league,
  standings,
  pastFixtures,
  nextFixtures,
  scorers,
  assists,
}: Props) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [activeTab, setActiveTab] = useState<Tab>('clasificacion')

  // Colors
  const pageBg = isLight ? '#edf1f8' : '#060d18'
  const surfaceBg = isLight ? '#edf1f8' : '#0c0d18'
  const cardBg = isLight ? '#ffffff' : '#10111e'
  const border = isLight ? '#c8d0e8' : '#1a1b2e'
  const textMain = isLight ? '#0f1830' : '#d8d8ec'
  const textMuted = isLight ? '#6070a0' : '#52526e'
  const textBright = isLight ? '#0f1830' : '#e8e8f8'

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'clasificacion', label: 'Clasificación' },
    { id: 'partidos', label: 'Partidos' },
    { id: 'estadisticas', label: 'Estadísticas' },
  ]

  const sortedNext = [...nextFixtures].sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  )
  const sortedPast = [...pastFixtures].sort(
    (a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
  )

  return (
    <main className="relative z-10 min-h-screen" style={{ background: pageBg }}>

      {/* ── Header ── */}
      <div
        style={{
          background: isLight
            ? `linear-gradient(180deg, #dde5f4, #edf1f8)`
            : `linear-gradient(180deg, #07081a, #050610)`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5 pt-6 pb-5">

          {/* Back link */}
          <Link
            href="/competiciones"
            className="inline-flex items-center gap-1 mb-5 text-[11px] font-semibold uppercase tracking-[1px] transition-opacity hover:opacity-70"
            style={{ color: textMuted, fontFamily: "'Barlow Condensed', sans-serif", textDecoration: 'none' }}
          >
            ← Competiciones
          </Link>

          {/* League identity */}
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://media.api-sports.io/football/leagues/${league.id}.png`}
              alt={league.name}
              width={48}
              height={48}
              style={{ borderRadius: 4, objectFit: 'contain', flexShrink: 0 }}
            />
            <div>
              <div
                className="flex items-center gap-2 mb-0.5"
                style={{ color: textMuted, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
              >
                {league.flag && <span>{league.flag}</span>}
                <span>{league.country}</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    background: `${league.color}22`,
                    color: league.color,
                    border: `1px solid ${league.color}44`,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  2025/26
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 34,
                  fontWeight: 800,
                  color: textBright,
                  letterSpacing: 0.5,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                {league.name}
              </h1>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex items-end mt-6 gap-1" style={{ borderBottom: `1px solid ${border}`, marginBottom: -1 }}>
            {tabs.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="cursor-pointer transition-all duration-150 text-[11px] font-bold uppercase tracking-[1.5px] px-4 py-2.5"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    background: 'transparent',
                    border: 'none',
                    borderBottom: active ? `2px solid ${league.color}` : '2px solid transparent',
                    color: active ? league.color : textMuted,
                    marginBottom: -1,
                    letterSpacing: '1.5px',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1100px] mx-auto px-5 py-6 pb-20" style={{ background: surfaceBg }}>

        {/* ── Tab: CLASIFICACIÓN ── */}
        {activeTab === 'clasificacion' && (
          <div>
            <div
              className="rounded-lg overflow-hidden"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              <StandingsTable standings={standings} leagueColor={league.color} isLight={isLight} />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-5 mt-4 px-1">
              {[
                { color: league.color, label: 'Champions League' },
                { color: '#00c8b0', label: 'Europa / Conference League' },
                { color: '#e03a3a', label: 'Descenso' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[10px]" style={{ color: textMuted }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: PARTIDOS ── */}
        {activeTab === 'partidos' && (
          <div className="space-y-6">

            {/* Próximos */}
            <div>
              <h2
                className="text-[10px] font-bold uppercase tracking-[2px] mb-3"
                style={{ color: textMuted, fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Próximos partidos
              </h2>
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: cardBg, border: `1px solid ${border}` }}
              >
                {sortedNext.length === 0 ? (
                  <div className="py-8 text-center text-[12px]" style={{ color: textMuted }}>
                    No hay próximos partidos programados
                  </div>
                ) : (
                  sortedNext.map(f => (
                    <UpcomingFixtureCard key={f.fixture.id} fixture={f} isLight={isLight} />
                  ))
                )}
              </div>
            </div>

            {/* Últimos resultados */}
            <div>
              <h2
                className="text-[10px] font-bold uppercase tracking-[2px] mb-3"
                style={{ color: textMuted, fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Últimos resultados
              </h2>
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: cardBg, border: `1px solid ${border}` }}
              >
                {sortedPast.length === 0 ? (
                  <div className="py-8 text-center text-[12px]" style={{ color: textMuted }}>
                    Sin resultados recientes
                  </div>
                ) : (
                  sortedPast.map(f => (
                    <FixtureCard key={f.fixture.id} fixture={f} isLight={isLight} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: ESTADÍSTICAS ── */}
        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PlayerList players={scorers} type="goals" isLight={isLight} />
            <PlayerList players={assists} type="assists" isLight={isLight} />
            <LeagueStats standings={standings} isLight={isLight} />
          </div>
        )}
      </div>
    </main>
  )
}
