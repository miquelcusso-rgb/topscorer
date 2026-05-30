import { PLAYERS } from '@/data/players'
import type { Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'
import SaasShell from './SaasShell'
import SaasHomeInteractive from './SaasHomeInteractive'
import V2PositionTabs from '@/app/[lang]/v2/position-tabs'

// Big-5 leagues — used by the "Top 5 Europa" filter preset. Matches the
// league strings stored on PLAYERS entries.
const BIG5 = ['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1'] as const
const BIG5_PLUS_PT = [...BIG5, 'Primeira Liga'] as const

// Server component that does the heavy data prep (no 18k-row client bundle),
// then hands the prepared slices to a client component for filter UX.
export default function SaasHomeBody({ lang }: { lang: Lang }) {
  const seasonPool = PLAYERS.filter(p => p.tab === 's' && p.season === '2526')

  const pools: Record<'big5' | 'big5pt' | 'all', PlayerData[]> = {
    big5: seasonPool.filter(p => (BIG5 as readonly string[]).includes(p.league)),
    big5pt: seasonPool.filter(p => (BIG5_PLUS_PT as readonly string[]).includes(p.league)),
    all: seasonPool,
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
