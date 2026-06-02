import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { getUnderstatLeague, understatCovers, type UnderstatRow } from '@/lib/understat'
import { resolvePlayerRadar, computeAxis } from './resolvePlayerRadar'
import type { PlayerSeasonRaw, PositionTag, ResolvedAxis } from './radar-types'
import type { PlayerData } from '@/types'

export interface RadarPoint extends ResolvedAxis { percentile: number | null }
export interface PlayerRadar {
  position: PositionTag
  leagueHasUnderstat: boolean
  axes: RadarPoint[]
}

// ── name match (US ↔ our dataset) ────────────────────────────────────────────
const norm = (s?: string) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
const initLast = (s?: string) => { const t = norm(s).split(' ').filter(Boolean); return t.length >= 2 ? `${t[0][0]} ${t[t.length - 1]}` : norm(s) }

// ── position tags ─────────────────────────────────────────────────────────────
type Broad = 'POR' | 'DEF' | 'MID' | 'FWD'
function tagFor(p: PlayerData): PositionTag {
  if (p.position === 'GK') return 'POR'
  if (p.position === 'DF') return 'DEF'
  if (p.position === 'MF') return 'MID'
  // FW: a creator (more assists than goals) reads as a winger/AM → WAM.
  if (p.position === 'FW' && (p.asist ?? 0) > (p.goles ?? 0)) return 'WAM'
  return 'ST'
}
const broad = (t: PositionTag): Broad => (t === 'POR' ? 'POR' : t === 'DEF' ? 'DEF' : t === 'MID' ? 'MID' : 'FWD')
const afBroad = (p: PlayerData): Broad => (p.position === 'GK' ? 'POR' : p.position === 'DF' ? 'DEF' : p.position === 'MF' ? 'MID' : 'FWD')
function usBroad(pos: string): Broad | null {
  const u = pos.toUpperCase()
  if (u.includes('GK') || u.startsWith('G')) return 'POR'
  if (u.startsWith('D')) return 'DEF'
  if (u.startsWith('M')) return 'MID'
  if (u.startsWith('F')) return 'FWD'
  return null
}

// ── raw builders ──────────────────────────────────────────────────────────────
function rawFromAF(p: PlayerData, leagueHasUS: boolean, tag: PositionTag): PlayerSeasonRaw {
  return {
    player_id: p.apiId ?? 0, season: p.season, league_id: 0, position_group: tag, league_has_understat: leagueHasUS,
    af_minutes: p.minutes ?? null, af_shots_total: p.shotsTotal ?? null, af_shots_on: p.shotsOn ?? null,
    af_goals: p.goles ?? null, af_conceded: p.goalsConceded ?? null, af_assists: p.asist ?? null, af_saves: p.saves ?? null,
    af_passes_total: p.passes ?? null, af_passes_key: p.keyPasses ?? null, af_passes_accuracy: p.passAccuracy ?? null,
    af_tackles: p.tacklesTotal ?? null, af_blocks: p.blocks ?? null, af_interceptions: p.interceptions ?? null,
    af_duels_total: p.duelsTotal ?? null, af_duels_won: p.duelsWon ?? null,
    af_dribbles_att: p.dribblesAttempts ?? null, af_dribbles_succ: p.dribblesSuccess ?? null, af_dribbles_past: p.dribblesPast ?? null,
    af_fouls_committed: p.foulsCommitted ?? null, af_cards_yellow: p.yellowCards ?? null, af_cards_red: p.redCards ?? null,
  }
}
function mergeUS(raw: PlayerSeasonRaw, u?: UnderstatRow): PlayerSeasonRaw {
  if (!u) return raw
  return {
    ...raw,
    us_minutes: u.minutes, us_npxG: u.npxG, us_xG: u.xG, us_xA: u.xA, us_key_passes: u.key_passes,
    us_xGChain: u.xGChain, us_xGBuildup: u.xGBuildup, us_shots: u.shots, us_goals: u.goals, us_assists: u.assists, us_npg: u.npg,
  }
}
function rawFromUS(u: UnderstatRow, tag: PositionTag): PlayerSeasonRaw {
  return {
    player_id: Number(u.id) || 0, season: '2526', league_id: 0, position_group: tag, league_has_understat: true,
    us_minutes: u.minutes, us_npxG: u.npxG, us_xG: u.xG, us_xA: u.xA, us_key_passes: u.key_passes,
    us_xGChain: u.xGChain, us_xGBuildup: u.xGBuildup, us_shots: u.shots, us_goals: u.goals, us_assists: u.assists, us_npg: u.npg,
  }
}

const pctRank = (values: number[], target: number) =>
  values.length ? Math.round((values.filter(v => v <= target).length / values.length) * 100) : null

/** Build the per-position radar for an API-Football player id (current season). */
export async function getPlayerRadar(apiId: number): Promise<PlayerRadar | null> {
  const player = PRIMARY_PLAYERS.find(p => p.apiId === apiId)
  if (!player) return null
  const tag = tagFor(player)
  const tgtBroad = broad(tag)
  const leagueHasUS = understatCovers(player.league)

  const usRows = leagueHasUS ? await getUnderstatLeague(player.league, player.season) : []
  // Match the target player's US row by name (within the league).
  const tn = norm(player.name), tf = norm(player.fullName), til = initLast(player.fullName || player.name)
  const usTarget = usRows.find(u => norm(u.name) === tn || (tf && norm(u.name) === tf) || initLast(u.name) === til)

  const targetRaw = mergeUS(rawFromAF(player, leagueHasUS, tag), usTarget)
  const resolved = resolvePlayerRadar(targetRaw, tag)

  // Percentile populations (≥ minutes), built once per source.
  const afPop = PRIMARY_PLAYERS
    .filter(p => p.league === player.league && afBroad(p) === tgtBroad && (p.minutes ?? 0) >= 450)
    .map(p => rawFromAF(p, leagueHasUS, tag))
  const usPop = usRows
    .filter(u => usBroad(u.position) === tgtBroad && u.minutes >= 600)
    .map(u => rawFromUS(u, tag))

  const axes: RadarPoint[] = resolved.map(ax => {
    if (ax.rawValue == null || !ax.source) return { ...ax, percentile: null }
    const pop = ax.source === 'understat' ? usPop : afPop
    const vals = pop.map(r => computeAxis(ax.axisId, ax.source!, r)).filter((v): v is number => v != null)
    return { ...ax, percentile: pctRank(vals, ax.rawValue) }
  })

  return { position: tag, leagueHasUnderstat: leagueHasUS, axes }
}
