/**
 * World Cup 2026 — frozen tournament data.
 *
 * The tournament ended on 19-jul-2026, so every number below is final and can
 * never change again. It is read from `data/wc2026-snapshot.json` (captured with
 * `scripts/wc-snapshot.mjs`) instead of api-football, which means the World Cup
 * nation pages cost ZERO api-football requests per ISR regen and can no longer
 * be blanked by a daily-quota exhaustion the way the bracket was on 20-jul.
 *
 * Server-only: the snapshot is ~250 KB and must never reach the client bundle.
 */
import snapshot from '@/data/wc2026-snapshot.json'
import type { ApiFixture } from '@/lib/api-football'

/** One scorer of one nation at the 2026 World Cup. */
export interface WcNationScorer {
  id: number
  name: string
  photo: string
  goals: number
  assists: number
  apps: number
  minutes: number
  position: string | null
}

interface WcSnapshot {
  capturedAt: string
  fixtures: ApiFixture[]
  scorers: Array<{ player: { id: number; name: string }; statistics: Array<{ team: { id: number; name: string }; goals: { total: number | null; assists: number | null } }> }>
  nationScorers: Record<string, WcNationScorer[]>
}

const SNAP = snapshot as unknown as WcSnapshot

/** Date the tournament data was frozen — drives `dateModified`. */
export const WC_CAPTURED_AT = SNAP.capturedAt

/** Every scorer of one nation, best first. Empty when the nation never scored. */
export function nationWcScorers(teamId: number | null): WcNationScorer[] {
  if (teamId == null) return []
  return SNAP.nationScorers[String(teamId)] ?? []
}

/**
 * A player's rank in the tournament-wide Golden Boot race, or null when they
 * finished outside the top-20 the endpoint reports. Ties share a rank (two
 * players on 7 goals are both 3rd), which is how the award is actually read.
 */
export function goldenBootRank(playerId: number): number | null {
  const rows = SNAP.scorers
  const idx = rows.findIndex(r => r.player.id === playerId)
  if (idx < 0) return null
  const goals = rows[idx].statistics[0]?.goals?.total ?? 0
  return rows.filter(r => (r.statistics[0]?.goals?.total ?? 0) > goals).length + 1
}

/** Total goals scored in the tournament by every nation that reached the top-20. */
export function goldenBootWinner(): { name: string; goals: number; team: string } | null {
  const top = SNAP.scorers[0]
  if (!top) return null
  return {
    name: top.player.name,
    goals: top.statistics[0]?.goals?.total ?? 0,
    team: top.statistics[0]?.team?.name ?? '',
  }
}

export interface WcCampaignMatch {
  date: string
  round: string
  opponent: string
  home: boolean
  scored: number
  conceded: number
  /** 'W' | 'D' | 'L' — from the 90'/AET score; a shoot-out is still a draw. */
  result: 'W' | 'D' | 'L'
  /** Set only when the tie went to penalties. */
  penalties?: { for: number; against: number }
}

export interface WcCampaign {
  matches: WcCampaignMatch[]
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  /** Raw api-football round label of the last match played. */
  lastRound: string
}

/**
 * One nation's full 2026 World Cup run, derived from the frozen fixture list.
 * This is the per-nation content that no other page on the site repeats — the
 * antidote to the near-duplicate nation-page pattern.
 */
export function nationWcCampaign(teamId: number | null): WcCampaign | null {
  if (teamId == null) return null
  const played = SNAP.fixtures
    .filter(f =>
      (f.teams.home.id === teamId || f.teams.away.id === teamId) &&
      ['FT', 'AET', 'PEN'].includes(f.fixture.status.short))
    .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)

  if (played.length === 0) return null

  const matches: WcCampaignMatch[] = played.map(f => {
    const home = f.teams.home.id === teamId
    const scored = (home ? f.goals.home : f.goals.away) ?? 0
    const conceded = (home ? f.goals.away : f.goals.home) ?? 0
    const pen = f.score.penalty
    const hasPens = pen != null && pen.home != null && pen.away != null
    return {
      date: f.fixture.date,
      round: f.league.round,
      opponent: home ? f.teams.away.name : f.teams.home.name,
      home,
      scored,
      conceded,
      result: scored > conceded ? 'W' : scored < conceded ? 'L' : 'D',
      ...(hasPens
        ? { penalties: { for: (home ? pen!.home : pen!.away) ?? 0, against: (home ? pen!.away : pen!.home) ?? 0 } }
        : {}),
    }
  })

  return {
    matches,
    played: matches.length,
    won: matches.filter(m => m.result === 'W').length,
    drawn: matches.filter(m => m.result === 'D').length,
    lost: matches.filter(m => m.result === 'L').length,
    goalsFor: matches.reduce((s, m) => s + m.scored, 0),
    goalsAgainst: matches.reduce((s, m) => s + m.conceded, 0),
    lastRound: matches[matches.length - 1].round,
  }
}

/** How a nation's tournament ended. `eliminated` carries the round label. */
export type StageKind = 'champion' | 'runner-up' | 'third' | 'fourth' | 'eliminated'

export interface StageResult {
  /** Display label: "Champions" / "Round of 16" / "Octavos de final". */
  label: string
  kind: StageKind
}

/**
 * How far a nation got, from the round of its last match plus whether it won
 * that match (winning the final ⇒ champion, losing it ⇒ runner-up).
 *
 * The `kind` matters for prose: "went out at the round of 16" is right for
 * Mexico but nonsense for Spain, who went out at nothing — they won it.
 */
export function stageReached(campaign: WcCampaign, lang: 'es' | 'en'): StageResult {
  const en = lang === 'en'
  const last = campaign.matches[campaign.matches.length - 1]
  const round = last.round.toLowerCase()
  const wonLast = last.result === 'W' || (last.penalties != null && last.penalties.for > last.penalties.against)

  if (round.includes('3rd')) {
    return wonLast
      ? { label: en ? 'Third place' : 'Tercer puesto', kind: 'third' }
      : { label: en ? 'Fourth place' : 'Cuarto puesto', kind: 'fourth' }
  }
  if (round === 'final') {
    return wonLast
      ? { label: en ? 'Champions' : 'Campeona', kind: 'champion' }
      : { label: en ? 'Runners-up' : 'Subcampeona', kind: 'runner-up' }
  }
  const label =
    round.includes('semi') ? (en ? 'Semi-finals' : 'Semifinales')
    : round.includes('quarter') ? (en ? 'Quarter-finals' : 'Cuartos de final')
    : round.includes('round of 16') ? (en ? 'Round of 16' : 'Octavos de final')
    : round.includes('round of 32') ? (en ? 'Round of 32' : 'Dieciseisavos de final')
    : (en ? 'Group stage' : 'Fase de grupos')
  return { label, kind: 'eliminated' }
}

/**
 * The clause describing how the run ended, ready to drop into a sentence after
 * the nation's goal tally ("…in 8 matches **and won the tournament**").
 */
export function outcomeClause(stage: StageResult, lang: 'es' | 'en'): string {
  const en = lang === 'en'
  switch (stage.kind) {
    case 'champion':   return en ? 'and won the tournament' : 'y ganó el torneo'
    case 'runner-up':  return en ? 'and lost the final' : 'y perdió la final'
    case 'third':      return en ? 'and finished third' : 'y terminó en tercer lugar'
    case 'fourth':     return en ? 'and finished fourth' : 'y terminó en cuarto lugar'
    default:
      return en
        ? `and went out at the ${stage.label.toLowerCase()}`
        : `y cayó en ${stage.label.toLowerCase()}`
  }
}

/** Localized label for one api-football round string. */
export function roundLabel(round: string, lang: 'es' | 'en'): string {
  if (lang === 'en') return round
  const r = round.toLowerCase()
  const group = round.match(/group stage\s*-\s*(\d+)/i)
  if (group) return `Fase de grupos · J${group[1]}`
  if (r.includes('3rd')) return 'Tercer puesto'
  if (r.includes('semi')) return 'Semifinales'
  if (r.includes('quarter')) return 'Cuartos de final'
  if (r.includes('round of 16')) return 'Octavos de final'
  if (r.includes('round of 32')) return 'Dieciseisavos de final'
  if (r === 'final') return 'Final'
  return round
}
