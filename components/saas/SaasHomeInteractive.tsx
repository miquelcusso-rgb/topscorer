'use client'
import { useState } from 'react'
import type { Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'
import KpiCard from './KpiCard'
import FilterBar from './FilterBar'
import PlayerTable from './PlayerTable'
import PlayerCardList from './PlayerCardList'

type LeagueFilterValue = 'big5' | 'big5pt' | 'all'

// A pre-shaped, MINIMAL view per league filter. We deliberately do NOT pass
// the full pools (hundreds of rows) from the server to this client component —
// that large RSC serialization was the cause of the Vercel 500 on /es. We only
// need the top 12 scorers + the top assist + a count per filter.
export interface PoolView {
  topScorers: PlayerData[] // already sorted desc, sliced to 12
  topAssist: PlayerData | null
  count: number
}

interface Props {
  lang: Lang
  pools: Record<LeagueFilterValue, PoolView>
}

export default function SaasHomeInteractive({ lang, pools }: Props) {
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilterValue>('big5')
  const view = pools[leagueFilter]
  const players = view.topScorers
  const topAssist = view.topAssist
  const leader = players[0]

  const labels =
    lang === 'en'
      ? {
          kLeaderGoals: 'Leader · Goals',
          kAssists: 'Top assists',
          kActive: 'Active scorers',
          kThisRound: 'Goals this round',
          fLeague: 'League',
          fSeason: 'Season',
          fPosition: 'Position',
          fAge: 'Age',
          fMin: 'Min. games',
          posAll: 'All',
          inScope: 'In scope',
        }
      : {
          kLeaderGoals: 'Líder · Goles',
          kAssists: 'Asistencias top',
          kActive: 'Goleadores activos',
          kThisRound: 'Goles en la jornada',
          fLeague: 'Liga',
          fSeason: 'Temporada',
          fPosition: 'Posición',
          fAge: 'Edad',
          fMin: 'Min. partidos',
          posAll: 'Todas',
          inScope: 'En el filtro',
        }

  const leagueLabelMap: Record<LeagueFilterValue, string> = {
    big5: lang === 'en' ? 'Top 5 Europe' : 'Top 5 Europa',
    big5pt: lang === 'en' ? 'Top 5 + Portugal' : 'Top 5 + Portugal',
    all: lang === 'en' ? 'All leagues' : 'Todas las ligas',
  }

  function cycleLeague() {
    const order: LeagueFilterValue[] = ['big5', 'big5pt', 'all']
    const i = order.indexOf(leagueFilter)
    setLeagueFilter(order[(i + 1) % order.length])
  }

  return (
    <>
      <div className="saas-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KpiCard
          label={labels.kLeaderGoals}
          value={leader?.goles ?? 0}
          subline={leader ? `${leader.name} · ${leader.club}` : ''}
          tone="primary"
          trend={{ delta: '↑ +3', tone: 'teal' }}
        />
        <KpiCard
          label={labels.kAssists}
          value={topAssist?.asist ?? 0}
          subline={topAssist ? `${topAssist.name} · ${topAssist.club}` : ''}
          tone="teal"
          trend={{ delta: '↑ +1', tone: 'teal' }}
        />
        <KpiCard
          label={labels.kActive}
          value={view.count}
          subline={labels.inScope}
          tone="primary"
          trend={{ delta: '↑ +12', tone: 'teal' }}
        />
        <KpiCard
          label={labels.kThisRound}
          value={86}
          subline="J36 · Top 5"
          tone="teal"
          trend={{ delta: lang === 'en' ? 'Avg: 71' : 'Promedio: 71', tone: 'primary' }}
        />
      </div>

      <FilterBar
        filters={[
          { key: 'league',   label: labels.fLeague,   value: leagueLabelMap[leagueFilter], active: true },
          { key: 'season',   label: labels.fSeason,   value: '25/26' },
          { key: 'position', label: labels.fPosition, value: labels.posAll },
          { key: 'age',      label: labels.fAge,      value: '18–40' },
          { key: 'minpj',    label: labels.fMin,      value: '5' },
        ]}
        onFilterClick={key => { if (key === 'league') cycleLeague() }}
        count={{ current: players.length, total: view.count }}
      />

      <div className="saas-desktop-table">
        <PlayerTable players={players} lang={lang} tab="goals" sortBy="goals" sortDir="desc" />
      </div>
      <PlayerCardList players={players} lang={lang} />
    </>
  )
}
