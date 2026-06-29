import { PRIMARY_PLAYERS, playerKey } from '@/lib/player-identity'
import type { Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'
import SaasShell from './SaasShell'
import Footer from '@/components/Footer'
import SaasHomeInteractive from './SaasHomeInteractive'
import { getNewsWithVisuals } from '@/lib/news'
import { POSITION_FILTER, sortValue, type PositionTabId } from '@/lib/position-stats'
import { rankScore } from '@/lib/iig'
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

// Per-position pools for the cross-league "scouter". The home scope selector
// supports All leagues (global) · Top-5 Europe · a custom multi-select of any
// league in the dataset, so each league that appears must carry enough rows for
// its own Top-20 once a user filters to it. We therefore guarantee league
// representation by taking the top-N of EACH league present (ordered by
// rankScore — IIG when meaningful, else rating·coef, so high-rated non-scorers
// rank too), then merge with the Big-5 + global top. Deduped, trimmed.
//   • PER_LEAGUE_N covers any single custom league (its full Top-20 view).
//   • the global slice keeps the cross-league "All leagues" ranking honest.
const PER_LEAGUE_N = 22
const GLOBAL_N = 40
function buildPositionPools(season: PlayerData[]): Record<PositionTabId, PlayerData[]> {
  const tabs: PositionTabId[] = ['fw', 'ast', 'mf', 'df', 'gk']
  const out = {} as Record<PositionTabId, PlayerData[]>
  for (const tab of tabs) {
    const all = season
      .filter(POSITION_FILTER[tab])
      .sort((a, b) => sortValue(tab, b) - sortValue(tab, a))
    // Top-N per league (every league present in the dataset for this position),
    // ranked by rankScore so non-scorers are ordered sensibly, not by raw goals.
    const byLeague = new Map<string, PlayerData[]>()
    for (const p of [...all].sort((a, b) => rankScore(b) - rankScore(a))) {
      const arr = byLeague.get(p.league) ?? []
      if (arr.length < PER_LEAGUE_N) { arr.push(p); byLeague.set(p.league, arr) }
    }
    const perLeague = Array.from(byLeague.values()).flat()
    const big5 = all.filter(p => BIG5_LEAGUES.includes(p.league)).slice(0, 20)
    const pt = all.filter(p => p.league === PT).slice(0, 6)
    const rest = all.slice(0, GLOBAL_N) // global top (covers "All leagues" scope)
    const seen = new Set<string>()
    const merged: PlayerData[] = []
    for (const p of [...big5, ...pt, ...rest, ...perLeague]) {
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
  // Distinct club display-names for the "My team" picker (small string[] — a few
  // hundred names, cheap to serialize vs shipping the full per-club roster).
  const clubs = Array.from(new Set(season.map(p => p.club).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b))
  // Small derived payload (hot striker + insights + standouts) — tiny + serializable.
  const insights = computeHomeInsights(season)
  // Editorial "rumor del día" — fetched at build (home is force-static); fully
  // defensive (null on any error), so it never breaks the build.
  const rumors = await getTopRumors(lang === 'en' ? 'en' : 'es', 3)
  // Top 3 headlines for the HOT NEWS strip + the freshest "breaking" item for the
  // home banner (defensive — empty on any error).
  // Pass the license-aware `visual` (player headshot or club crest) — NOT the
  // raw RSS image, and never a generic scene. Undefined → branded placeholder.
  let news: { title: string; link: string; source: string; visual?: { url: string; license: 'agency' | 'crest' }; lang: 'es' | 'en' }[] = []
  let breaking: { title: string; link: string; source: string; lang: 'es' | 'en' }[] = []
  try {
    const all = await getNewsWithVisuals(lang === 'en' ? 'en' : 'es', 'general', 14)
    news = all.slice(0, 6).map(n => ({ title: n.title, link: n.link, source: n.source, visual: n.visual && { url: n.visual.url, license: n.visual.license }, lang: n.lang }))
    breaking = all.filter(n => n.isBreaking).slice(0, 5).map(b => ({ title: b.title, link: b.link, source: b.source, lang: b.lang }))
  } catch { /* feeds down */ }

  const breadcrumb = heading?.breadcrumb ?? (lang === 'en' ? ['Statistics', 'Players'] : ['Estadísticas', 'Jugadores'])

  return (
    <SaasShell
      activeKey="players"
      breadcrumb={breadcrumb}
    >
      <SaasHomeInteractive lang={lang} positionPools={positionPools} defaultPos={defaultPos} insights={insights} rumors={rumors} news={news} breaking={breaking} clubs={clubs} />
      <div style={{ marginTop: 32, marginLeft: -24, marginRight: -24, marginBottom: -24 }}>
        <Footer />
      </div>
    </SaasShell>
  )
}
