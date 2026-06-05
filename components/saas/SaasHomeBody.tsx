import { PRIMARY_PLAYERS, playerKey } from '@/lib/player-identity'
import type { Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'
import SaasShell from './SaasShell'
import SaasHomeInteractive from './SaasHomeInteractive'
import { getNews } from '@/lib/news'
import { POSITION_FILTER, sortValue, type PositionTabId } from '@/lib/position-stats'
import { computeHomeInsights } from '@/lib/home-insights'
import { getTopRumors } from '@/lib/home-rumor'
import { flagFor } from '@/lib/flags'

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
    src: p.src, tab: p.tab, position: p.position, flag: p.flag ?? flagFor(p.nationality),
    photo: p.photo, minutes: p.minutes, nationality: p.nationality,
    // real advanced stats (needed by per-position columns + last-5)
    rating: p.rating, shotsTotal: p.shotsTotal, shotsOn: p.shotsOn,
    passes: p.passes, keyPasses: p.keyPasses, passAccuracy: p.passAccuracy,
    tacklesTotal: p.tacklesTotal, interceptions: p.interceptions,
    duelsWon: p.duelsWon, duelsTotal: p.duelsTotal,
    saves: p.saves, goalsConceded: p.goalsConceded,
  }
}

const BIG5_LEAGUES = ['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1']
const PT = 'Primeira Liga'

// Per-position pools. The home league filter cycles Big-5 → Big-5+PT → All, so
// each scope must have ≥12 rows. We therefore guarantee representation by
// taking the top of EACH scope (not a single global top-N where weaker-league
// high-scorers like Messi/MLS would crowd out the Big-5). Deduped, trimmed.
function buildPositionPools(season: PlayerData[]): Record<PositionTabId, PlayerData[]> {
  const tabs: PositionTabId[] = ['fw', 'ast', 'mf', 'df', 'gk']
  const out = {} as Record<PositionTabId, PlayerData[]>
  for (const tab of tabs) {
    const all = season
      .filter(POSITION_FILTER[tab])
      .sort((a, b) => sortValue(tab, b) - sortValue(tab, a))
    const big5 = all.filter(p => BIG5_LEAGUES.includes(p.league)).slice(0, 20)
    const pt = all.filter(p => p.league === PT).slice(0, 6)
    const rest = all.slice(0, 20) // global top (covers "All leagues" scope)
    const seen = new Set<string>()
    const merged: PlayerData[] = []
    for (const p of [...big5, ...pt, ...rest]) {
      const k = playerKey(p)
      if (seen.has(k)) continue
      seen.add(k)
      merged.push(trim(p))
    }
    out[tab] = merged
  }
  return out
}

export default async function SaasHomeBody({
  lang,
  defaultPos,
  heading,
}: {
  lang: Lang
  defaultPos?: PositionTabId
  heading?: HeadingOverride
}) {
  // One entry per real player (identity-unified, current-season, carries photo).
  const season = (Array.isArray(PRIMARY_PLAYERS) ? PRIMARY_PLAYERS : []).filter(
    p => p && p.season === '2526'
  )
  const positionPools = buildPositionPools(season)
  // Small derived payload (hot striker + insights + standouts) — tiny + serializable.
  const insights = computeHomeInsights(season)
  // Editorial "rumor del día" — fetched at build (home is force-static); fully
  // defensive (null on any error), so it never breaks the build.
  const rumors = await getTopRumors(lang === 'en' ? 'en' : 'es', 3)
  // Top 3 headlines for the HOT NEWS strip + the freshest "breaking" item for the
  // home banner (defensive — empty on any error).
  let news: { title: string; link: string; source: string }[] = []
  let breaking: { title: string; link: string; source: string } | null = null
  try {
    const all = await getNews(lang === 'en' ? 'en' : 'es', 'general', 14)
    news = all.slice(0, 3).map(n => ({ title: n.title, link: n.link, source: n.source }))
    const b = all.find(n => n.isBreaking)
    if (b) breaking = { title: b.title, link: b.link, source: b.source }
  } catch { /* feeds down */ }

  const breadcrumb = heading?.breadcrumb ?? (lang === 'en' ? ['Statistics', 'Players'] : ['Estadísticas', 'Jugadores'])

  return (
    <SaasShell
      activeKey="stats"
      breadcrumb={breadcrumb}
    >
      <SaasHomeInteractive lang={lang} positionPools={positionPools} defaultPos={defaultPos} insights={insights} rumors={rumors} news={news} breaking={breaking} />
    </SaasShell>
  )
}
