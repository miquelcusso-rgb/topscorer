import { notFound } from 'next/navigation'
import { isLocale, type Lang } from '@/lib/i18n'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'
import SaasShell from '@/components/saas/SaasShell'
import IdentityCard from '@/components/player/IdentityCard'
import ProfileTabs from '@/components/player/ProfileTabs'
import RadarCard from '@/components/player/RadarCard'
import MatchTable, { type MatchRow } from '@/components/player/MatchTable'
import SeasonTable, { type SeasonRow } from '@/components/player/SeasonTable'
import ContractCard from '@/components/player/ContractCard'
import ValuationCard from '@/components/player/ValuationCard'
import NationalTeamCard from '@/components/player/NationalTeamCard'

const SAMPLE_MATCHES: MatchRow[] = [
  { j: 36, vs: 'Arsenal',     ha: 'H', hs: 2, as: 1, min: 78, g: 1, a: 0, sht: 4, xg: 0.8, r: 8.4, live: true },
  { j: 35, vs: 'Newcastle',   ha: 'A', hs: 0, as: 4, min: 90, g: 2, a: 1, sht: 5, xg: 1.6, r: 9.1 },
  { j: 34, vs: 'Liverpool',   ha: 'H', hs: 1, as: 1, min: 90, g: 1, a: 0, sht: 3, xg: 0.9, r: 7.8 },
  { j: 33, vs: 'Aston Villa', ha: 'A', hs: 1, as: 3, min: 88, g: 0, a: 1, sht: 2, xg: 0.4, r: 7.2 },
  { j: 32, vs: 'Chelsea',     ha: 'H', hs: 2, as: 2, min: 90, g: 1, a: 0, sht: 4, xg: 1.1, r: 7.9 },
  { j: 31, vs: 'Brighton',    ha: 'A', hs: 0, as: 5, min: 82, g: 2, a: 0, sht: 6, xg: 1.8, r: 8.7 },
  { j: 30, vs: 'West Ham',    ha: 'H', hs: 1, as: 0, min: 90, g: 1, a: 0, sht: 3, xg: 0.7, r: 7.6 },
  { j: 29, vs: 'Tottenham',   ha: 'A', hs: 1, as: 2, min: 90, g: 0, a: 1, sht: 2, xg: 0.5, r: 7.1 },
  { j: 28, vs: 'Brentford',   ha: 'H', hs: 3, as: 0, min: 85, g: 3, a: 0, sht: 7, xg: 2.3, r: 9.4 },
  { j: 27, vs: 'Fulham',      ha: 'A', hs: 1, as: 1, min: 90, g: 1, a: 1, sht: 4, xg: 1.2, r: 8.2 },
]

const SAMPLE_SEASONS: SeasonRow[] = [
  { s: '25/26', club: 'Man City', league: 'Premier', pj: 32, g: 28, a: 6, min: 2780, trophies: '◯', current: true },
  { s: '24/25', club: 'Man City', league: 'Premier', pj: 35, g: 31, a: 7, min: 3050, trophies: '🏆 PL' },
  { s: '23/24', club: 'Man City', league: 'Premier', pj: 38, g: 36, a: 8, min: 3320, trophies: '🏆 PL · UCL' },
  { s: '22/23', club: 'Man City', league: 'Premier', pj: 35, g: 36, a: 8, min: 3050, trophies: '🏆 PL · UCL · FA' },
  { s: '21/22', club: 'Dortmund', league: 'Bundes.', pj: 24, g: 22, a: 7, min: 1980, trophies: '◯' },
  { s: '20/21', club: 'Dortmund', league: 'Bundes.', pj: 28, g: 27, a: 4, min: 2400, trophies: '🏆 Pokal' },
  { s: '19/20', club: 'Dortmund', league: 'Bundes.', pj: 18, g: 13, a: 1, min: 1180, trophies: '◯' },
]

export default async function V2PlayerPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: rawLang, slug } = await params
  if (!isLocale(rawLang)) notFound()
  const lang: Lang = rawLang

  const player =
    PLAYERS.find(p => slugify(p.name) === slug) ??
    PLAYERS.find(p => p.name.toLowerCase().includes('haaland')) ??
    PLAYERS[0]
  if (!player) notFound()

  const labels =
    lang === 'en'
      ? {
          breadcrumb: ['Players', player.club, player.name],
          cta: '↗ Share',
          perf: 'Performance profile',
          vsTop: 'vs. Top-5 Europe forwards',
          matchTitle: 'Stats per matchday',
          matchSub: `Last 10 matches · ${player.club} · 25/26`,
          seasonTitle: 'Stats per season',
          seasonSub: 'Full career · 7 seasons · 226 matches',
        }
      : {
          breadcrumb: ['Jugadores', player.club, player.name],
          cta: '↗ Compartir',
          perf: 'Perfil de rendimiento',
          vsTop: 'vs. delanteros Top-5 Europa',
          matchTitle: 'Estadísticas por jornada',
          matchSub: `Últimos 10 partidos · ${player.club} · Temporada 25/26`,
          seasonTitle: 'Estadísticas por temporada',
          seasonSub: 'Carrera completa · 7 temporadas · 226 partidos',
        }

  return (
    <SaasShell
      activeKey="players"
      breadcrumb={labels.breadcrumb}
      primaryCta={{ label: labels.cta }}
    >
      <IdentityCard
        player={player}
        liveText={`Jugando · ${player.club.slice(0, 3).toUpperCase()} 2-1 ARS · 78'`}
      />
      <ProfileTabs />
      <div className="saas-profile-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr 320px', gap: 18 }}>
        <RadarCard
          title={labels.perf}
          subtitle={labels.vsTop}
          axes={[
            { label: 'Goles',      value: player.goles, pct: 95 },
            { label: 'xG',         value: (player.goles - 1).toFixed(1), pct: 92 },
            { label: 'Disparos',   value: player.shotsTotal ?? 90, pct: 88 },
            { label: 'Conversión', value: '23%', pct: 86 },
            { label: 'Asist.',     value: player.asist, pct: 42 },
            { label: 'H-T',        value: 3, pct: 80 },
          ]}
          stats={[
            { value: 7, label: 'Racha', tone: 'primary' },
            { value: 3, label: 'H-T' },
            { value: '23%', label: 'Conv.', tone: 'teal' },
            { value: 99, label: 'M/G' },
          ]}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <MatchTable
            title={labels.matchTitle}
            subtitle={labels.matchSub}
            rows={SAMPLE_MATCHES}
          />
          <SeasonTable
            title={labels.seasonTitle}
            subtitle={labels.seasonSub}
            rows={SAMPLE_SEASONS}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ContractCard
            rows={[
              ['Club', player.club],
              ['Desde', 'Jun 2022'],
              ['Hasta', player.contractUntil ?? 'Jun 2027'],
              ['Tiempo restante', '1 año 1 mes'],
              ['Cláusula', player.releaseClause ?? '—'],
              ['Salario anual', '€20M brutos'],
              ['Agente', 'Rafaela Pimenta'],
            ]}
          />
          <ValuationCard
            big={player.marketValue ?? '€180M'}
            delta="↑ +€20M (3m)"
            history={[
              { date: 'May 26', value: 180, label: '€180M', width: 100 },
              { date: 'Feb 26', value: 160, label: '€160M', width: 89 },
              { date: 'Sep 25', value: 180, label: '€180M', width: 100 },
              { date: 'May 25', value: 200, label: '€200M', width: 111 },
              { date: 'Sep 24', value: 180, label: '€180M', width: 100 },
              { date: 'Sep 23', value: 170, label: '€170M', width: 94 },
            ]}
          />
          <NationalTeamCard
            title={`Selección ${player.flag ?? ''}`}
            stats={[
              { value: 37, label: 'Partidos' },
              { value: 33, label: 'Goles', tone: 'primary' },
              { value: 5, label: 'Asist.', tone: 'teal' },
              { value: 'Capitán', label: 'Rol' },
            ]}
            footer="Debut: 5 sep 2019 vs Malta · Próx.: Mundial 2026"
          />
        </div>
      </div>
    </SaasShell>
  )
}
