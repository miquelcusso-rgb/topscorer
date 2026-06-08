import type { PlayerData } from '@/types'

// ─── SofaScore-style attribute overview ───────────────────────────────────────
// Derives 4–5 compact 0–100 attribute scores (Attacking, Creativity, Defending,
// Technical/Passing, plus Goalkeeping for keepers) from the REAL per-season
// stats we already ship. Scores are per-90 normalised against sensible reference
// ceilings (a "great season" for that metric in a top league), then capped at
// 100. This is a transparent heuristic for at-a-glance comparison — never an
// official rating. Returns null only when there's not enough data to score.

export interface AttributeScore {
  key: 'att' | 'cre' | 'def' | 'tec' | 'gk'
  es: string
  en: string
  score: number // 0–100
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

// Per-90 helper: scale a season total to a per-90 figure using minutes (falls
// back to appearances × 90, then to the raw value if neither is available).
function per90(total: number | undefined, p: PlayerData): number {
  if (total == null) return 0
  const mins = p.minutes && p.minutes > 0 ? p.minutes : (p.pj && p.pj > 0 ? p.pj * 90 : 0)
  if (!mins) return total
  return (total / mins) * 90
}

// Score a per-90 value against a reference ceiling (value that ≈ 100).
const vs = (v: number, ceiling: number) => clamp((v / ceiling) * 100)

export function isGoalkeeper(p: PlayerData): boolean {
  const pos = (p.position ?? '').toUpperCase()
  return pos === 'GK' || pos === 'POR' || pos === 'G'
}

/**
 * Compute the attribute overview for a player. Goalkeepers get a GK-oriented set
 * (Goalkeeping, Defending, Passing/Technical); outfielders get ATT/CRE/DEF/TEC.
 */
export function playerAttributes(p: PlayerData): AttributeScore[] {
  const gk = isGoalkeeper(p)

  // Shared building blocks (per-90 where it makes sense).
  const goals90 = per90(p.goles, p)
  const assists90 = per90(p.asist, p)
  const shots90 = per90(p.shotsTotal, p)
  const onTargetRatio = p.shotsTotal ? (p.shotsOn ?? 0) / p.shotsTotal : 0
  const keyPasses90 = per90(p.keyPasses, p)
  const tackles90 = per90(p.tacklesTotal, p)
  const interceptions90 = per90(p.interceptions, p)
  const duelWin = p.duelsTotal ? (p.duelsWon ?? 0) / p.duelsTotal : 0
  const dribbleSucc = p.dribblesAttempts ? (p.dribblesSuccess ?? 0) / p.dribblesAttempts : 0
  const passAcc = (p.passAccuracy ?? p.passesAccuracy ?? 0) / 100
  const ratingScore = p.rating != null ? clamp(((p.rating - 5.5) / 2.5) * 100) : 0 // 5.5→0, 8.0→100

  if (gk) {
    const saves90 = per90(p.saves, p)
    const conceded90 = per90(p.goalsConceded, p)
    // Fewer goals conceded per 90 is better → invert against a 2.0/90 ceiling.
    const cleanScore = p.goalsConceded != null ? clamp((1 - Math.min(conceded90, 2) / 2) * 100) : 0
    const out: AttributeScore[] = [
      { key: 'gk', es: 'Portería', en: 'Goalkeeping', score: Math.max(vs(saves90, 4), cleanScore, ratingScore) },
      { key: 'def', es: 'Solidez', en: 'Defending', score: Math.max(cleanScore, vs(interceptions90 + tackles90, 4)) },
      { key: 'tec', es: 'Juego de pies', en: 'Passing', score: Math.max(vs(passAcc * 100, 90), vs(per90(p.passes, p), 40)) },
    ]
    return out.filter(a => a.score > 0)
  }

  // Outfield attributes.
  const attacking = clamp(0.55 * vs(goals90, 0.9) + 0.30 * vs(shots90, 4.5) + 0.15 * (onTargetRatio * 100))
  const creativity = clamp(0.55 * vs(assists90, 0.5) + 0.45 * vs(keyPasses90, 2.5))
  const defending = clamp(0.40 * vs(tackles90, 3.5) + 0.35 * vs(interceptions90, 2.5) + 0.25 * (duelWin * 100))
  const technical = clamp(0.45 * vs(passAcc * 100, 92) + 0.30 * (dribbleSucc * 100) + 0.25 * ratingScore)

  const out: AttributeScore[] = [
    { key: 'att', es: 'Ataque', en: 'Attacking', score: attacking },
    { key: 'cre', es: 'Creación', en: 'Creativity', score: creativity },
    { key: 'def', es: 'Defensa', en: 'Defending', score: defending },
    { key: 'tec', es: 'Técnica', en: 'Technical', score: technical },
  ]
  // Drop attributes we genuinely couldn't score (no source stat at all).
  return out.filter(a => a.score > 0)
}
