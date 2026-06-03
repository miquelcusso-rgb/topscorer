import {
  getAllStandings, getAllFixtures, getTopScorers, getTopAssists,
  type ApiFixture,
} from '@/lib/api-football'

// The three UEFA club competitions. 2025/26 uses the single 36-team "league
// phase" (one standings table) + knockout play-off (Round of 32) → R16 → … → Final.
export const EURO_CUPS: Record<number, { id: number; name: { es: string; en: string }; color: string }> = {
  2:   { id: 2,   name: { es: 'Champions League',  en: 'Champions League' },  color: '#1a3a6e' },
  3:   { id: 3,   name: { es: 'Europa League',     en: 'Europa League' },     color: '#f77f00' },
  848: { id: 848, name: { es: 'Conference League', en: 'Conference League' }, color: '#38c47a' },
}
export const isEuroCup = (id: number): boolean => id in EURO_CUPS

const KO_ORDER = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final']
const isQualifying = (round: string) => /qualifying|play-?offs?$/i.test(round) && !/round of/i.test(round)
const isKnockout = (round: string) => KO_ORDER.some(k => round.toLowerCase().includes(k.toLowerCase()))

export interface EuroFixture {
  id: number; round: string; date: string; ts: number; status: string
  home: string; homeCrest: string; away: string; awayCrest: string
  hg: number | null; ag: number | null; hWin: boolean | null; aWin: boolean | null
}
export interface EuroStandingRow {
  rank: number; team: string; crest: string; played: number; w: number; d: number; l: number
  gf: number; ga: number; gd: number; pts: number; form: string; desc: string | null
}
export interface EuroScorer { name: string; club: string; photo: string; apiId: number; value: number }
export interface EuroCupData {
  leagueId: number; name: string; color: string
  standings: { name: string; rows: EuroStandingRow[] }[]
  leagueRounds: { round: string; fixtures: EuroFixture[] }[]
  knockout: { round: string; fixtures: EuroFixture[] }[]
  scorers: EuroScorer[]
  assists: EuroScorer[]
}

function mapFixture(f: ApiFixture): EuroFixture {
  return {
    id: f.fixture.id, round: f.league.round, date: f.fixture.date, ts: f.fixture.timestamp,
    status: f.fixture.status.short,
    home: f.teams.home.name, homeCrest: f.teams.home.logo, away: f.teams.away.name, awayCrest: f.teams.away.logo,
    hg: f.goals.home, ag: f.goals.away, hWin: f.teams.home.winner, aWin: f.teams.away.winner,
  }
}

export async function getEuroCupData(leagueId: number, lang: 'es' | 'en'): Promise<EuroCupData | null> {
  const meta = EURO_CUPS[leagueId]
  if (!meta) return null
  const [standingsRaw, fixturesRaw, scorersRaw, assistsRaw] = await Promise.all([
    getAllStandings(leagueId, 2025).catch(() => []),
    getAllFixtures(leagueId, 2025).catch(() => []),
    getTopScorers(leagueId, 2025).catch(() => []),
    getTopAssists(leagueId, 2025).catch(() => []),
  ])

  const standings = standingsRaw.map(group => ({
    name: group[0]?.group ?? meta.name[lang],
    rows: group.map(e => ({
      rank: e.rank, team: e.team.name, crest: e.team.logo, played: e.all.played,
      w: e.all.win, d: e.all.draw, l: e.all.lose, gf: e.all.goals.for, ga: e.all.goals.against,
      gd: e.goalsDiff, pts: e.points, form: e.form ?? '', desc: e.description,
    })),
  }))

  // Group league-phase fixtures by matchday, knockout by round (proper order).
  const main = fixturesRaw.filter(f => !isQualifying(f.league.round))
  const byRound = new Map<string, EuroFixture[]>()
  for (const f of main) {
    const r = f.league.round
    if (!byRound.has(r)) byRound.set(r, [])
    byRound.get(r)!.push(mapFixture(f))
  }
  const leagueRounds = [...byRound.entries()]
    .filter(([r]) => !isKnockout(r))
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
    .map(([round, fixtures]) => ({ round, fixtures: fixtures.sort((x, y) => x.ts - y.ts) }))
  const knockout = KO_ORDER
    .map(round => {
      const entry = [...byRound.entries()].find(([r]) => r.toLowerCase().includes(round.toLowerCase()))
      return entry ? { round, fixtures: entry[1].sort((x, y) => x.ts - y.ts) } : null
    })
    .filter((x): x is { round: string; fixtures: EuroFixture[] } => !!x)

  const scorers: EuroScorer[] = scorersRaw.slice(0, 20).map(p => ({
    name: p.player.name, club: p.statistics[0]?.team?.name ?? '', photo: p.player.photo,
    apiId: p.player.id, value: p.statistics[0]?.goals?.total ?? 0,
  }))
  const assists: EuroScorer[] = assistsRaw.slice(0, 15).map(p => ({
    name: p.player.name, club: p.statistics[0]?.team?.name ?? '', photo: p.player.photo,
    apiId: p.player.id, value: p.statistics[0]?.goals?.assists ?? 0,
  }))

  return { leagueId, name: meta.name[lang], color: meta.color, standings, leagueRounds, knockout, scorers, assists }
}
