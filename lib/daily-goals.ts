/**
 * "Who scored today" — the data behind /daily.
 *
 * Quota budget (api-football, Pro plan 7.500/day). This page is deliberately
 * cheap, because the site has been running close to its daily ceiling:
 *   - 1 request per date per 30 min for the fixture list (all leagues in one
 *     call), so ≤48/day, and fewer whenever the walk-back hits a cached date.
 *   - 1 request per finished match per DAY for its goal events, capped at
 *     MAX_MATCHES. A finished match is immutable, so the 24 h cache means the
 *     same match is never fetched twice.
 * Worst case ≈ 48 + 16 = ~64 requests/day, under 1 % of the plan.
 */
import {
  getFixturesByDate, getFixtureGoals, ALL_LEAGUES, WORLD_CUP,
  type ApiFixture, type GoalEvent,
} from '@/lib/api-football'

/** Leagues we surface, best-known first — ALL_LEAGUES is already ordered by
 *  tier (Big-5 → rest of Europe → second divisions → Americas → Asia → UEFA). */
const TRACKED = [WORLD_CUP, ...ALL_LEAGUES]
const PRIORITY = new Map(TRACKED.map((l, i) => [l.id, i]))

/** Hard cap on matches we pull events for — the page's only unbounded cost. */
const MAX_MATCHES = 16
/** How many days back to look before giving up (mid-season this is always 0). */
const MAX_LOOKBACK = 6

const FINISHED = ['FT', 'AET', 'PEN']

export interface DailyGoal {
  player: string
  playerId: number | null
  minute: number
  extra: number | null
  /** 'penalty' and 'own' are worth showing — they change how a goal reads. */
  kind: 'goal' | 'penalty' | 'own'
  assist?: string
  scoringTeam: string
  opponent: string
  leagueId: number
  leagueName: string
  leagueCountry: string
  fixtureId: number
  homeName: string
  awayName: string
  homeGoals: number
  awayGoals: number
}

export interface DailyDigest {
  /** The date the goals belong to (YYYY-MM-DD, UTC). */
  date: string
  /** False when we had to fall back to an earlier day (no results yet today). */
  isToday: boolean
  goals: DailyGoal[]
  matchCount: number
  leagueCount: number
  /** Players who scored more than once that day, best first. */
  multiScorers: { player: string; playerId: number | null; goals: number; team: string }[]
  /** True when the day had more qualifying matches than MAX_MATCHES. */
  truncated: boolean
  /** UTC ISO timestamp of assembly — drives the visible "updated" line. */
  fetchedAt: string
}

function utcDate(offsetDays: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - offsetDays)
  return d.toISOString().slice(0, 10)
}

/** Finished, tracked-league fixtures that actually produced goals. */
function qualifying(fixtures: ApiFixture[]): ApiFixture[] {
  return fixtures
    .filter(f =>
      PRIORITY.has(f.league.id) &&
      FINISHED.includes(f.fixture.status.short) &&
      ((f.goals.home ?? 0) + (f.goals.away ?? 0)) > 0)
    .sort((a, b) =>
      (PRIORITY.get(a.league.id) ?? 999) - (PRIORITY.get(b.league.id) ?? 999) ||
      b.fixture.timestamp - a.fixture.timestamp)
}

function kindOf(detail: string): DailyGoal['kind'] {
  const d = detail.toLowerCase()
  if (d.includes('own')) return 'own'
  if (d.includes('penalty')) return 'penalty'
  return 'goal'
}

/**
 * Build the digest for the most recent day that actually had goals in a league
 * we track. Walking back matters: in a European off-season week a Monday can
 * legitimately have nothing, and an empty page would be worse than a page that
 * says "the last matchday with goals was Saturday".
 */
export async function getDailyDigest(): Promise<DailyDigest> {
  const fetchedAt = new Date().toISOString()

  for (let offset = 0; offset <= MAX_LOOKBACK; offset++) {
    const date = utcDate(offset)
    const all = await getFixturesByDate(date)
    const matches = qualifying(all)
    if (matches.length === 0) continue

    const truncated = matches.length > MAX_MATCHES
    const capped = matches.slice(0, MAX_MATCHES)

    const eventsPerMatch = await Promise.all(
      capped.map(f => getFixtureGoals(f.fixture.id).catch(() => [] as GoalEvent[])),
    )

    const goals: DailyGoal[] = []
    capped.forEach((f, i) => {
      for (const e of eventsPerMatch[i]) {
        // An own goal is credited by api-football to the team the SCORER plays
        // for, but it counts for their opponent. Attribute it the way a reader
        // expects: the scoring side is whoever got the goal.
        const scorerIsHome = e.teamId === f.teams.home.id
        const kind = kindOf(e.detail)
        const benefitsHome = kind === 'own' ? !scorerIsHome : scorerIsHome
        goals.push({
          player: e.player,
          playerId: e.playerId,
          minute: e.minute,
          extra: e.extra,
          kind,
          assist: e.assist,
          scoringTeam: benefitsHome ? f.teams.home.name : f.teams.away.name,
          opponent: benefitsHome ? f.teams.away.name : f.teams.home.name,
          leagueId: f.league.id,
          leagueName: f.league.name,
          leagueCountry: f.league.country,
          fixtureId: f.fixture.id,
          homeName: f.teams.home.name,
          awayName: f.teams.away.name,
          homeGoals: f.goals.home ?? 0,
          awayGoals: f.goals.away ?? 0,
        })
      }
    })

    // Nothing usable came back (quota, or an events endpoint hiccup): keep
    // walking rather than rendering a day that claims matches but shows no goals.
    if (goals.length === 0) continue

    goals.sort((a, b) =>
      (PRIORITY.get(a.leagueId) ?? 999) - (PRIORITY.get(b.leagueId) ?? 999) ||
      a.fixtureId - b.fixtureId ||
      a.minute - b.minute)

    // Multi-goal days are the story of the day — surface them.
    const tally = new Map<string, { player: string; playerId: number | null; goals: number; team: string }>()
    for (const g of goals) {
      if (g.kind === 'own') continue
      const key = `${g.playerId ?? g.player}|${g.scoringTeam}`
      const row = tally.get(key)
      if (row) row.goals++
      else tally.set(key, { player: g.player, playerId: g.playerId, goals: 1, team: g.scoringTeam })
    }

    return {
      date,
      isToday: offset === 0,
      goals,
      matchCount: new Set(goals.map(g => g.fixtureId)).size,
      leagueCount: new Set(goals.map(g => g.leagueId)).size,
      multiScorers: [...tally.values()].filter(r => r.goals > 1).sort((a, b) => b.goals - a.goals),
      truncated,
      fetchedAt,
    }
  }

  return {
    date: utcDate(0),
    isToday: true,
    goals: [],
    matchCount: 0,
    leagueCount: 0,
    multiScorers: [],
    truncated: false,
    fetchedAt,
  }
}
