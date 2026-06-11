import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { getUnderstatLeague, understatCovers, type UnderstatRow } from '@/lib/understat'
import { resolvePlayerRadar, computeAxis } from './resolvePlayerRadar'
import type { PlayerSeasonRaw, PositionTag, ResolvedAxis } from './radar-types'
import type { PlayerData } from '@/types'

export interface RadarPoint extends ResolvedAxis { percentile: number | null }
export interface UnderstatRaw {
  xG: number; npxG: number; xA: number; shots: number; keyPasses: number; minutes: number
  xGChain: number; xGBuildup: number; npg: number
}
export interface PlayerRadar {
  position: PositionTag       // template actually applied (auto-detected or overridden)
  autoPosition: PositionTag   // the auto-detected template (for the selector default)
  leagueHasUnderstat: boolean
  axes: RadarPoint[]
  understat?: UnderstatRaw | null  // raw Understat numbers when matched
}

// Templates a user may manually pick from the radar profile selector.
export const SELECTABLE_TAGS: PositionTag[] = ['ST', 'WAM', 'AMF', 'MID', 'DMF', 'DEF', 'POR']

// ── name match (US ↔ our dataset) ────────────────────────────────────────────
const norm = (s?: string) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
const initLast = (s?: string) => { const t = norm(s).split(' ').filter(Boolean); return t.length >= 2 ? `${t[0][0]} ${t[t.length - 1]}` : norm(s) }

// ── position tags ─────────────────────────────────────────────────────────────
type Broad = 'POR' | 'DEF' | 'MID' | 'FWD'
// Auto-detect a midfield sub-profile from real season stats so the radar axes
// match how the player actually plays:
//   AMF (attacking mid)   → high key passes / assists / shots per game
//   DMF (defensive mid)   → high tackles + interceptions + duels, low shots
//   MID (central / b2b)    → the balanced default
export function mfSubProfile(p: PlayerData): PositionTag {
  const pj = Math.max(1, p.pj ?? 1)
  const keyPg = (p.keyPasses ?? p.passesKey ?? 0) / pj
  const astPg = (p.asist ?? 0) / pj
  const shotPg = (p.shotsTotal ?? 0) / pj
  const golPg = (p.goles ?? 0) / pj
  const tklIntPg = ((p.tacklesTotal ?? 0) + (p.interceptions ?? 0)) / pj
  const duelWonPg = (p.duelsWon ?? 0) / pj

  // Attacking signal: chance creation + goal threat.
  let att = 0
  if (keyPg >= 1.5) att += 2; else if (keyPg >= 1.0) att += 1
  if (astPg >= 0.25) att += 1
  if (shotPg >= 1.8 || golPg >= 0.25) att += 1

  // Defensive signal: ball-winning volume with little shooting.
  let def = 0
  if (tklIntPg >= 3.5) def += 2; else if (tklIntPg >= 2.5) def += 1
  if (duelWonPg >= 4) def += 1
  if (shotPg < 1.0 && golPg < 0.12) def += 1

  if (att >= 3 && att > def) return 'AMF'
  if (def >= 3 && def > att) return 'DMF'
  return 'MID'
}

export function tagFor(p: PlayerData): PositionTag {
  if (p.position === 'GK') return 'POR'
  if (p.position === 'DF') return 'DEF'
  if (p.position === 'MF') return mfSubProfile(p)
  // FW split into winger/attacking-mid (WAM) vs out-and-out striker (ST).
  // A pure striker is goal-dominant AND high shot volume; a WAM creates/carries
  // more (assists, key passes, dribbles) relative to finishing. We score several
  // creator signals so a goalscoring winger (e.g. Salah) still reads as WAM.
  if (p.position === 'FW') {
    const g = p.goles ?? 0, a = p.asist ?? 0
    const pj = Math.max(1, p.pj ?? 1)
    // Elite/high-volume finisher → pure striker (Mbappé, Haaland, Lewandowski),
    // even if technically gifted. ~18+ goals dominating assists.
    if (g >= 18 && g >= a) return 'ST'
    // Otherwise the winger/AM signal is mostly DRIBBLING + chance creation:
    // wingers carry the ball far more than centre-forwards.
    const dribPg = (p.dribblesSuccess ?? 0) / pj
    const keyPg = (p.keyPasses ?? 0) / pj
    const creatorShare = a / Math.max(1, g + a)
    let score = 0
    if (dribPg >= 2.5) score += 2
    else if (dribPg >= 1.5) score += 1
    if (keyPg >= 1.5) score++
    if (creatorShare >= 0.45) score++
    return score >= 2 ? 'WAM' : 'ST'
  }
  return 'ST'
}
const broad = (t: PositionTag): Broad => (t === 'POR' ? 'POR' : t === 'DEF' ? 'DEF' : (t === 'MID' || t === 'AMF' || t === 'DMF') ? 'MID' : 'FWD')
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

/** Build the per-position radar for an API-Football player id (current season).
 *  `override` forces a specific positional template (manual profile selector);
 *  otherwise the template is auto-detected from the player's stats. */
export async function getPlayerRadar(apiId: number, override?: PositionTag): Promise<PlayerRadar | null> {
  const player = PRIMARY_PLAYERS.find(p => p.apiId === apiId)
  if (!player) return null
  const autoTag = tagFor(player)
  const tag = override ?? autoTag
  // Percentile population is keyed off the BROAD position the player truly is
  // (auto-detected), not the chosen template — so e.g. viewing a striker through
  // the "Winger" template still ranks them against forwards.
  const tgtBroad = broad(autoTag)
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

  const understat: UnderstatRaw | null = usTarget ? {
    xG: usTarget.xG, npxG: usTarget.npxG, xA: usTarget.xA, shots: usTarget.shots,
    keyPasses: usTarget.key_passes, minutes: usTarget.minutes,
    xGChain: usTarget.xGChain, xGBuildup: usTarget.xGBuildup, npg: usTarget.npg,
  } : null

  return { position: tag, autoPosition: autoTag, leagueHasUnderstat: leagueHasUS, axes, understat }
}
