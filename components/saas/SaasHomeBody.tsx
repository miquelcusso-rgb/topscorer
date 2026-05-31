import { PLAYERS } from '@/data/players'
import type { Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'
import SaasShell from './SaasShell'
import SaasHomeInteractive from './SaasHomeInteractive'
import { POSITION_FILTER, sortValue, type PositionTabId } from '@/lib/position-stats'

interface HeadingOverride {
  breadcrumb: string[]
  h1: string
  sub: string
}

// Minimal fields shipped to the client (avoids the large RSC payload that
// previously crashed /es on Vercel). Rich stats are mostly empty in the dataset
// anyway, so a trimmed object keeps the payload small.
function trim(p: PlayerData): PlayerData {
  return {
    name: p.name, club: p.club, league: p.league, age: p.age,
    pj: p.pj, goles: p.goles, asist: p.asist, season: p.season,
    src: p.src, tab: p.tab, position: p.position, flag: p.flag,
    photo: p.photo, minutes: p.minutes, nationality: p.nationality,
    // real advanced stats (needed by per-position columns + last-5)
    rating: p.rating, shotsTotal: p.shotsTotal, shotsOn: p.shotsOn,
    passes: p.passes, keyPasses: p.keyPasses, passAccuracy: p.passAccuracy,
    tacklesTotal: p.tacklesTotal, interceptions: p.interceptions,
    duelsWon: p.duelsWon, duelsTotal: p.duelsTotal,
    saves: p.saves, goalsConceded: p.goalsConceded,
  }
}

// Per-position pools: top 30 of each position across ALL leagues, sorted by
// that position's key metric. The client filters by league + shows top 12.
function buildPositionPools(season: PlayerData[]): Record<PositionTabId, PlayerData[]> {
  const tabs: PositionTabId[] = ['fw', 'ast', 'mf', 'df', 'gk']
  const out = {} as Record<PositionTabId, PlayerData[]>
  for (const tab of tabs) {
    const pool = season
      .filter(POSITION_FILTER[tab])
      .sort((a, b) => sortValue(tab, b) - sortValue(tab, a))
      .slice(0, 30)
      .map(trim)
    out[tab] = pool
  }
  return out
}

export default function SaasHomeBody({
  lang,
  defaultPos,
  heading,
}: {
  lang: Lang
  defaultPos?: PositionTabId
  heading?: HeadingOverride
}) {
  const season = (Array.isArray(PLAYERS) ? PLAYERS : []).filter(
    p => p && p.season === '2526'
  )
  const positionPools = buildPositionPools(season)

  const cta = lang === 'en' ? '+ New list' : '+ Crear lista'
  const labels = heading ?? (
    lang === 'en'
      ? {
          breadcrumb: ['Statistics', 'Players'],
          h1: 'Player rankings · Europe top leagues',
          sub: 'Season 25/26 · MD36 · by position',
        }
      : {
          breadcrumb: ['Estadísticas', 'Jugadores'],
          h1: 'Rankings por jugador · Top ligas de Europa',
          sub: 'Temporada 25/26 · J36 · por posición',
        }
  )

  return (
    <SaasShell
      activeKey="stats"
      breadcrumb={labels.breadcrumb}
      primaryCta={{ label: cta, href: `/${lang}/watchlist` }}
    >
      <div className="saas-page-header" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.012em', color: 'var(--ts-text)' }}>
          {labels.h1}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ts-muted)' }}>{labels.sub}</p>
      </div>

      <SaasHomeInteractive lang={lang} positionPools={positionPools} defaultPos={defaultPos} />
    </SaasShell>
  )
}
