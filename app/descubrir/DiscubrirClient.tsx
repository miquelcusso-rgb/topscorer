'use client'

import { useState, useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import type { EnrichedPlayer } from '@/types'

// Leagues that are "less visible" — hidden gem multiplier
const SMALL_LEAGUE_NAMES = new Set([
  'Championship',
  '2. Bundesliga',
  'Serie B',
  'Ligue 2',
  'Segunda División',
  'Liga Portugal 2',
  '1. Lig',
  'Primeira Liga',
  'Sueper Lig',
  'Super Liga Grecia',
])

function calculateDiscoveryScore(player: EnrichedPlayer): number {
  const pj = player.pj || 1
  const g90 = player.goles / (pj * 0.9)
  const a90 = player.asist / (pj * 0.9)
  const leagueMultiplier = SMALL_LEAGUE_NAMES.has(player.league) ? 1.4 : 1.0
  const ageMultiplier = player.age <= 21 ? 1.5 : player.age <= 24 ? 1.2 : 1.0
  const volumeBonus = pj >= 20 ? 1.1 : 1.0
  return (g90 * 3 + a90 * 2) * leagueMultiplier * ageMultiplier * volumeBonus
}

function generateReason(player: EnrichedPlayer): string {
  const pj = player.pj || 1
  const g90 = player.goles / (pj * 0.9)
  const reasons: string[] = []
  if (g90 > 0.7) reasons.push(`G/90 excepcional (${g90.toFixed(2)})`)
  if (player.age <= 21) reasons.push(`Solo ${player.age} años`)
  if (SMALL_LEAGUE_NAMES.has(player.league)) reasons.push('Destaca en liga de menor exposición')
  if (player.asist / pj > 0.4) reasons.push('Asistente clave para su equipo')
  return reasons.slice(0, 2).join(' · ') || 'Consistencia excepcional'
}

type PosFilter = 'all' | 'FW' | 'MF' | 'DF'
type LeagueFilter = 'all' | 'big' | 'small'
type AgeFilter = 'all' | 'u21' | 'u24'

interface Props {
  players: EnrichedPlayer[]
}

export default function DiscubrirClient({ players }: Props) {
  const { theme } = useTheme()
  const { lang } = useLang()
  const isLight = theme === 'light'

  const [posFilter, setPosFilter] = useState<PosFilter>('all')
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('all')
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all')

  // Compute scored list
  const scored = useMemo(() => {
    return players
      .filter(p => p.goles > 0 || p.asist > 0)
      .map(p => ({ player: p, score: calculateDiscoveryScore(p) }))
      .sort((a, b) => b.score - a.score)
  }, [players])

  const maxScore = scored.length > 0 ? scored[0].score : 1

  const filtered = useMemo(() => {
    return scored.filter(({ player: p }) => {
      if (posFilter !== 'all' && p.position !== posFilter) return false
      if (leagueFilter === 'big' && SMALL_LEAGUE_NAMES.has(p.league)) return false
      if (leagueFilter === 'small' && !SMALL_LEAGUE_NAMES.has(p.league)) return false
      if (ageFilter === 'u21' && p.age > 21) return false
      if (ageFilter === 'u24' && p.age > 24) return false
      return true
    }).slice(0, 48)
  }, [scored, posFilter, leagueFilter, ageFilter])

  // Design tokens
  const pageBg    = isLight ? '#f4f6ff' : '#060d18'
  const cardBg    = isLight ? '#ffffff' : '#10111e'
  const cardBorder = isLight ? 'rgba(0,0,0,.08)' : '#1a1b2e'
  const textPrimary = isLight ? '#0f1830' : '#d8d8ec'
  const textMuted   = isLight ? '#5060a0' : '#52526e'
  const filterBg    = isLight ? '#ffffff' : 'rgba(255,255,255,.04)'
  const filterBorder = isLight ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.1)'
  const filterActive = isLight ? '#0f1830' : '#eef4ff'
  const filterActiveBg = isLight ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.1)'

  function FilterBtn({
    active,
    onClick,
    children,
  }: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
  }) {
    return (
      <button
        onClick={onClick}
        style={{
          fontSize: 12,
          fontWeight: active ? 700 : 500,
          padding: '5px 12px',
          borderRadius: 6,
          border: `1px solid ${active ? (isLight ? 'rgba(0,0,0,.15)' : 'rgba(255,255,255,.15)') : filterBorder}`,
          background: active ? filterActiveBg : filterBg,
          color: active ? filterActive : textMuted,
          cursor: 'pointer',
          transition: 'all .15s',
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.5px',
        }}
      >
        {children}
      </button>
    )
  }

  function ScoreBadge({ score }: { score: number }) {
    const display = Math.min(score * 10, 10).toFixed(1)
    const high = score >= maxScore * 0.7
    return (
      <span
        style={{
          fontSize: 18,
          fontWeight: 800,
          fontFamily: "'Barlow Condensed', sans-serif",
          color: high ? '#f0c040' : '#00c8b0',
          letterSpacing: 0,
          minWidth: 36,
          textAlign: 'right',
        }}
      >
        {display}
      </span>
    )
  }

  function PosBadge({ pos }: { pos?: string }) {
    if (!pos) return null
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: 3,
          background: 'rgba(0,200,176,.08)',
          border: '1px solid rgba(0,200,176,.2)',
          color: '#00c8b0',
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.5px',
        }}
      >
        {pos}
      </span>
    )
  }

  const posLabels: Record<PosFilter, string> = {
    all: lang === 'es' ? 'Todos' : 'All',
    FW:  'FW',
    MF:  'MF',
    DF:  'DF',
  }
  const leagueLabels: Record<LeagueFilter, string> = {
    all:   lang === 'es' ? 'Todas' : 'All',
    big:   lang === 'es' ? 'Grandes' : 'Big 5',
    small: lang === 'es' ? '2ª Div' : '2nd Div',
  }
  const ageLabels: Record<AgeFilter, string> = {
    all:  lang === 'es' ? 'Todos' : 'All',
    u21:  'Sub-21',
    u24:  'Sub-24',
  }

  return (
    <div style={{ minHeight: '100vh', background: pageBg }}>
      <div className="max-w-[1100px] mx-auto px-5 py-10">

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '3px',
              color: '#00c8b0',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {lang === 'es' ? 'Basado en rendimiento por 90 min · Puntuamos 500+ jugadores semanalmente' : 'Based on per-90 performance · We score 500+ players weekly'}
          </div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 48,
              fontWeight: 900,
              color: textPrimary,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            {lang === 'es' ? 'RADAR DE' : 'TALENT'}{' '}
            <span style={{ color: '#f0c040' }}>
              {lang === 'es' ? 'TALENTOS' : 'RADAR'}
            </span>
          </h1>
          <p style={{ fontSize: 14, color: textMuted, maxWidth: 520 }}>
            {lang === 'es'
              ? 'Jugadores que los algoritmos marcan como excepcionales. Joyas ocultas en ligas de menor visibilidad con métricas de élite.'
              : 'Players flagged as exceptional by our algorithm. Hidden gems in lower-profile leagues with elite metrics.'}
          </p>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Position */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: textMuted, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', marginRight: 2 }}>
              {lang === 'es' ? 'Pos' : 'Pos'}
            </span>
            {(['all', 'FW', 'MF', 'DF'] as PosFilter[]).map(f => (
              <FilterBtn key={f} active={posFilter === f} onClick={() => setPosFilter(f)}>
                {posLabels[f]}
              </FilterBtn>
            ))}
          </div>
          {/* League */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: textMuted, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', marginRight: 2 }}>
              {lang === 'es' ? 'Liga' : 'League'}
            </span>
            {(['all', 'big', 'small'] as LeagueFilter[]).map(f => (
              <FilterBtn key={f} active={leagueFilter === f} onClick={() => setLeagueFilter(f)}>
                {leagueLabels[f]}
              </FilterBtn>
            ))}
          </div>
          {/* Age */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: textMuted, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', marginRight: 2 }}>
              {lang === 'es' ? 'Edad' : 'Age'}
            </span>
            {(['all', 'u21', 'u24'] as AgeFilter[]).map(f => (
              <FilterBtn key={f} active={ageFilter === f} onClick={() => setAgeFilter(f)}>
                {ageLabels[f]}
              </FilterBtn>
            ))}
          </div>
        </div>

        {/* Count */}
        {filtered.length > 0 && (
          <div style={{ fontSize: 12, color: textMuted, marginBottom: 16 }}>
            {filtered.length} {lang === 'es' ? 'jugadores encontrados' : 'players found'}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div
            className="rounded-lg p-12 text-center"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div style={{ fontSize: 14, color: textMuted }}>
              {lang === 'es' ? 'No hay jugadores con los filtros actuales.' : 'No players match the current filters.'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(({ player: p, score }, idx) => {
              const pj = p.pj || 1
              const g90 = (p.goles / (pj * 0.9)).toFixed(2)
              const a90 = (p.asist / (pj * 0.9)).toFixed(2)
              const reason = generateReason(p)
              const barWidth = Math.round((score / maxScore) * 100)
              const isSmallLeague = SMALL_LEAGUE_NAMES.has(p.league)

              return (
                <div
                  key={`${p.name}-${idx}`}
                  className="rounded-lg p-4 flex flex-col gap-2.5"
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    transition: 'border-color .15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      isLight ? 'rgba(240,192,64,.3)' : 'rgba(240,192,64,.25)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = cardBorder
                  }}
                >
                  {/* Top row: avatar placeholder + name + score */}
                  <div className="flex items-start gap-2.5">
                    {/* Avatar placeholder */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: isLight ? 'rgba(240,192,64,.12)' : 'rgba(240,192,64,.1)',
                        border: '1.5px solid rgba(240,192,64,.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 16,
                      }}
                    >
                      {p.flag ?? '⚽'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: textPrimary,
                          fontFamily: "'Barlow Condensed', sans-serif",
                          letterSpacing: '0.3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: textMuted, marginTop: 1 }}>
                        {p.club}
                        {isSmallLeague && (
                          <span
                            style={{
                              marginLeft: 4,
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '1px 4px',
                              borderRadius: 2,
                              background: 'rgba(0,200,176,.1)',
                              color: '#00c8b0',
                              fontFamily: "'Barlow Condensed', sans-serif",
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {lang === 'es' ? 'JOYA' : 'GEM'}
                          </span>
                        )}
                      </div>
                    </div>

                    <ScoreBadge score={score} />
                  </div>

                  {/* Position + League badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <PosBadge pos={p.position} />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: 'rgba(240,192,64,.08)',
                        border: '1px solid rgba(240,192,64,.18)',
                        color: isLight ? '#b08020' : '#c0a040',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        letterSpacing: '0.3px',
                      }}
                    >
                      {p.league}
                    </span>
                  </div>

                  {/* Key stats row */}
                  <div
                    className="flex gap-3"
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: isLight ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.03)',
                    }}
                  >
                    {[
                      { label: 'G/90', value: g90, color: '#f0c040' },
                      { label: 'A/90', value: a90, color: '#00c8b0' },
                      { label: 'PJ',   value: p.pj, color: textMuted },
                      { label: lang === 'es' ? 'Edad' : 'Age', value: p.age, color: p.age <= 21 ? '#a060ff' : p.age <= 24 ? '#38c47a' : textMuted },
                    ].map(stat => (
                      <div key={stat.label} className="flex-1 text-center">
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: stat.color,
                            fontFamily: "'Barlow Condensed', sans-serif",
                            lineHeight: 1,
                          }}
                        >
                          {stat.value}
                        </div>
                        <div style={{ fontSize: 8.5, color: textMuted, letterSpacing: '0.8px', marginTop: 2 }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Score bar */}
                  <div>
                    <div
                      style={{
                        height: 3,
                        borderRadius: 2,
                        background: isLight ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${barWidth}%`,
                          borderRadius: 2,
                          background: score >= maxScore * 0.7
                            ? 'linear-gradient(90deg, #f0c040, #f8d060)'
                            : 'linear-gradient(90deg, #00c8b0, #00e8c8)',
                          transition: 'width .3s',
                        }}
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div
                    style={{
                      fontSize: 10.5,
                      color: textMuted,
                      lineHeight: 1.4,
                      padding: '6px 8px',
                      borderRadius: 5,
                      background: isLight ? 'rgba(0,200,176,.04)' : 'rgba(0,200,176,.05)',
                      border: `1px solid ${isLight ? 'rgba(0,200,176,.15)' : 'rgba(0,200,176,.12)'}`,
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#00c8b0', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {lang === 'es' ? 'Por qué lo marcamos' : 'Why we flagged them'}
                    </span>
                    <br />
                    {reason}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Disclaimer */}
        <div
          style={{
            marginTop: 48,
            padding: '14px 18px',
            borderRadius: 8,
            background: isLight ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.03)',
            border: `1px solid ${cardBorder}`,
            fontSize: 11,
            color: textMuted,
            lineHeight: 1.6,
          }}
        >
          {lang === 'es'
            ? 'Este ranking es algorítmico basado en estadísticas de rendimiento, no una valoración subjetiva. El score pondera goles/90, asistencias/90, liga, edad y volumen de partidos. No representa una evaluación scout profesional.'
            : 'This ranking is algorithmic, based on performance statistics, not a subjective assessment. The score weights goals/90, assists/90, league tier, age, and match volume. It does not represent a professional scout evaluation.'}
        </div>
      </div>
    </div>
  )
}
