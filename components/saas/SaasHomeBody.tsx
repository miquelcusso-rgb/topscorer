import { PLAYERS } from '@/data/players'
import type { Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'
import SaasShell from './SaasShell'
import SaasHomeInteractive, { type PoolView } from './SaasHomeInteractive'
import V2PositionTabs from '@/app/[lang]/v2/position-tabs'

// Big-5 leagues — used by the "Top 5 Europa" filter preset. Matches the
// league strings stored on PLAYERS entries.
const BIG5 = ['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1'] as const
const BIG5_PLUS_PT = [...BIG5, 'Primeira Liga'] as const

// Build a MINIMAL view for one league scope: top 12 scorers + top assist +
// count. We pass only this to the client component — NOT the hundreds of rows
// in the pool. Passing large arrays server→client was the cause of the Vercel
// 500 ("Error running the exported function") on /es.
function buildView(seasonPool: PlayerData[], filter: (p: PlayerData) => boolean): PoolView {
  const pool = seasonPool.filter(filter)
  const topScorers = [...pool].sort((a, b) => (b.goles ?? 0) - (a.goles ?? 0)).slice(0, 12)
  const topAssist = [...pool].sort((a, b) => (b.asist ?? 0) - (a.asist ?? 0))[0] ?? null
  return { topScorers, topAssist, count: pool.length }
}

// Server component. Heavy data prep here; only tiny shaped views cross the
// server→client boundary.
export default function SaasHomeBody({ lang }: { lang: Lang }) {
  const seasonPool = (Array.isArray(PLAYERS) ? PLAYERS : []).filter(
    p => p && p.tab === 's' && p.season === '2526'
  )

  const pools: Record<'big5' | 'big5pt' | 'all', PoolView> = {
    big5:   buildView(seasonPool, p => (BIG5 as readonly string[]).includes(p.league)),
    big5pt: buildView(seasonPool, p => (BIG5_PLUS_PT as readonly string[]).includes(p.league)),
    all:    buildView(seasonPool, () => true),
  }

  const labels =
    lang === 'en'
      ? {
          breadcrumb: ['Statistics', 'Scorers'],
          cta: '+ New list',
          h1: 'Top scorers · Europe top leagues',
          sub: 'Season 25/26 · MD36',
        }
      : {
          breadcrumb: ['Estadísticas', 'Goleadores'],
          cta: '+ Crear lista',
          h1: 'Top scorers · Europe top leagues',
          sub: 'Temporada 25/26 · J36',
        }

  return (
    <SaasShell
      activeKey="stats"
      breadcrumb={labels.breadcrumb}
      primaryCta={{ label: labels.cta, href: `/${lang}/watchlist` }}
    >
      <div
        className="saas-page-header"
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

      <SaasHomeInteractive lang={lang} pools={pools} />
    </SaasShell>
  )
}
