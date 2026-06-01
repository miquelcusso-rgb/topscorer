import { notFound } from 'next/navigation'
import { isLocale, type Lang } from '@/lib/i18n'
import { PLAYERS } from '@/data/players'
import SaasShell from '@/components/saas/SaasShell'
import KpiCard from '@/components/saas/KpiCard'
import FilterBar from '@/components/saas/FilterBar'
import PlayerTable from '@/components/saas/PlayerTable'
import V2PositionTabs from './position-tabs'

export default async function V2Page({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  if (!isLocale(rawLang)) notFound()
  const lang: Lang = rawLang

  // Take top scorers from existing dataset.
  const players = [...PLAYERS]
    .filter(p => p.tab === 's' && p.season === '2526')
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 12)

  const labels =
    lang === 'en'
      ? {
          breadcrumb: ['Statistics', 'Scorers'],
          cta: '+ New list',
          h1: 'Top scorers · Europe top leagues',
          sub: 'Season 25/26 · MD36',
          kLeaderGoals: 'Leader · Goals',
          kAssists: 'Top assists',
          kActive: 'Active scorers',
          kThisRound: 'Goals this round',
        }
      : {
          breadcrumb: ['Estadísticas', 'Goleadores'],
          cta: '+ Crear lista',
          h1: 'Top scorers · Europe top leagues',
          sub: 'Temporada 25/26 · J36',
          kLeaderGoals: 'Líder · Goles',
          kAssists: 'Asistencias top',
          kActive: 'Goleadores activos',
          kThisRound: 'Goles en la jornada',
        }

  const leader = players[0]
  const topAssist = [...PLAYERS]
    .filter(p => p.season === '2526')
    .sort((a, b) => b.asist - a.asist)[0]

  return (
    <SaasShell
      activeKey="stats"
      breadcrumb={labels.breadcrumb}
      primaryCta={{ label: labels.cta, href: `/${lang}/cuenta` }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-0.012em',
              color: 'var(--ts-text)',
            }}
          >
            {labels.h1}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ts-muted)' }}>
            {labels.sub}
          </p>
        </div>
        <V2PositionTabs lang={lang} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
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
          value={PLAYERS.length}
          subline="En 12 ligas"
          tone="primary"
          trend={{ delta: '↑ +12', tone: 'teal' }}
        />
        <KpiCard
          label={labels.kThisRound}
          value={86}
          subline="J36 · Top 5"
          tone="teal"
          trend={{ delta: 'Promedio: 71', tone: 'primary' }}
        />
      </div>

      <FilterBar
        filters={[
          { key: 'league',   label: 'Liga',          value: 'Top 5 Europa', active: true },
          { key: 'season',   label: 'Temporada',     value: '25/26' },
          { key: 'position', label: 'Posición',      value: 'Todas' },
          { key: 'age',      label: 'Edad',          value: '18–40' },
          { key: 'minpj',    label: 'Min. partidos', value: '5' },
        ]}
        count={{ current: players.length, total: PLAYERS.length }}
      />

      <PlayerTable players={players} lang={lang} tab="goals" sortBy="goals" sortDir="desc" />
    </SaasShell>
  )
}
