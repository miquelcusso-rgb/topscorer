'use client'
import { useState, useMemo } from 'react'
import type { Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'
import KpiCard from './KpiCard'
import FilterBar from './FilterBar'
import PositionTable from './PositionTable'
import { type PositionTabId, TAB_LABELS, TAB_ACCENT } from '@/lib/position-stats'

type LeagueFilterValue = 'big5' | 'big5pt' | 'all'

const BIG5 = ['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1']
const BIG5_PT = [...BIG5, 'Primeira Liga']

const POS_ICON: Record<PositionTabId, string> = {
  fw: '⚽', ast: '🅰', mf: '⇄', df: '🛡', gk: '🧤',
}
// Porteros (gk) removed — the topscorers/topassists feed barely lists keepers,
// so the GK ranking would be too sparse to be useful.
const POS_ORDER: PositionTabId[] = ['fw', 'ast', 'mf', 'df']

interface Props {
  lang: Lang
  positionPools: Record<PositionTabId, PlayerData[]>
  defaultPos?: PositionTabId
}

export default function SaasHomeInteractive({ lang, positionPools, defaultPos }: Props) {
  const [pos, setPos] = useState<PositionTabId>(defaultPos ?? 'fw')
  const [league, setLeague] = useState<LeagueFilterValue>('big5')

  const leagueMatch = useMemo(() => {
    if (league === 'big5') return (p: PlayerData) => BIG5.includes(p.league)
    if (league === 'big5pt') return (p: PlayerData) => BIG5_PT.includes(p.league)
    return () => true
  }, [league])

  const pool = positionPools[pos] ?? []
  const filtered = useMemo(() => pool.filter(leagueMatch), [pool, leagueMatch])
  const players = filtered.slice(0, 12)
  const leader = players[0]
  const accent = TAB_ACCENT[pos]

  const t = lang === 'en'
    ? { season: 'Season', position: 'Position', age: 'Age', minpj: 'Min. games', league: 'League',
        leader: 'Leader', topAssist: 'Top assist', avgAge: 'Avg age' }
    : { season: 'Temporada', position: 'Posición', age: 'Edad', minpj: 'Min. partidos', league: 'Liga',
        leader: 'Líder', topAssist: 'Asist. top', avgAge: 'Edad media' }

  const posLabel = TAB_LABELS[lang === 'en' ? 'en' : 'es'][pos]
  const leagueLabel = league === 'big5' ? (lang === 'en' ? 'Top 5 Europe' : 'Top 5 Europa')
    : league === 'big5pt' ? 'Top 5 + Portugal'
    : (lang === 'en' ? 'All leagues' : 'Todas las ligas')

  const topAssist = [...filtered].sort((a, b) => (b.asist ?? 0) - (a.asist ?? 0))[0]
  const avgAge = filtered.length
    ? Math.round(filtered.reduce((s, p) => s + (p.age ?? 0), 0) / filtered.length)
    : 0
  const leaderMetric = pos === 'ast' ? (leader?.asist ?? 0)
    : pos === 'df' || pos === 'gk' ? (leader?.pj ?? 0)
    : (leader?.goles ?? 0)
  const leaderMetricLabel = pos === 'ast' ? (lang === 'en' ? 'assists' : 'asist.')
    : pos === 'df' || pos === 'gk' ? (lang === 'en' ? 'apps' : 'PJ')
    : (lang === 'en' ? 'goals' : 'goles')

  function cycleLeague() {
    const order: LeagueFilterValue[] = ['big5', 'big5pt', 'all']
    setLeague(order[(order.indexOf(league) + 1) % order.length])
  }

  return (
    <>
      {/* Position tabs (controlled) */}
      <div className="saas-position-tabs" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {POS_ORDER.map(id => {
          const isActive = id === pos
          const a = TAB_ACCENT[id]
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPos(id)}
              style={{
                padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: isActive ? 600 : 500,
                background: isActive ? `var(--ts-${a}-soft)` : 'transparent',
                color: isActive ? `var(--ts-${a})` : 'var(--ts-text)',
                border: `1px solid ${isActive ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
                cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 13, opacity: isActive ? 1 : 0.7 }}>{POS_ICON[id]}</span>
              {TAB_LABELS[lang === 'en' ? 'en' : 'es'][id]}
            </button>
          )
        })}
      </div>

      {/* KPIs */}
      <div className="saas-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KpiCard
          label={`${t.leader} · ${posLabel}`}
          value={leaderMetric}
          subline={leader ? `${leader.name} · ${leader.club}` : '—'}
          tone={accent}
          trend={{ delta: leaderMetricLabel, tone: accent }}
        />
        <KpiCard
          label={t.topAssist}
          value={topAssist?.asist ?? 0}
          subline={topAssist ? `${topAssist.name} · ${topAssist.club}` : '—'}
          tone="teal"
          trend={{ delta: '↑ +1', tone: 'teal' }}
        />
        <KpiCard
          label={lang === 'en' ? 'In scope' : 'En el filtro'}
          value={filtered.length}
          subline={`${posLabel} · ${leagueLabel}`}
          tone="primary"
          trend={{ delta: leagueLabel, tone: 'primary' }}
        />
        <KpiCard
          label={t.avgAge}
          value={avgAge || '—'}
          subline={posLabel}
          tone="teal"
          trend={{ delta: lang === 'en' ? 'years' : 'años', tone: 'primary' }}
        />
      </div>

      <FilterBar
        filters={[
          { key: 'league',   label: t.league,   value: leagueLabel, active: true },
          { key: 'season',   label: t.season,   value: '25/26' },
          { key: 'position', label: t.position, value: posLabel },
          { key: 'age',      label: t.age,      value: '16–40' },
          { key: 'minpj',    label: t.minpj,    value: '3' },
        ]}
        onFilterClick={key => { if (key === 'league') cycleLeague() }}
        count={{ current: players.length, total: filtered.length }}
      />

      <PositionTable players={players} tab={pos} lang={lang === 'en' ? 'en' : 'es'} />
    </>
  )
}
