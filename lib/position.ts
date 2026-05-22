import type { PlayerData, Position } from '@/types'
import type { Lang } from '@/lib/i18n'

const POS_LABELS: Record<Position, { es: string; en: string; short: string }> = {
  FW: { es: 'Delantero',      en: 'Forward',    short: 'DEL' },
  MF: { es: 'Centrocampista', en: 'Midfielder', short: 'MED' },
  DF: { es: 'Defensa',        en: 'Defender',   short: 'DEF' },
  GK: { es: 'Portero',        en: 'Goalkeeper', short: 'POR' },
}

/**
 * Infer a generic position when the exact one is unknown, using available stats.
 * Heuristic ordering favors the most distinctive signal first.
 */
export function inferPosition(p: Pick<PlayerData, 'goles' | 'asist' | 'pj' | 'keyPasses' | 'tab'>): Position {
  const pj = p.pj || 1
  const g90 = p.goles / (pj * 0.9)
  const a90 = p.asist / (pj * 0.9)

  // Strong goal output → forward
  if (g90 >= 0.35) return 'FW'
  // Playmaker signals → midfielder
  if (a90 >= 0.20 || (p.keyPasses ?? 0) > 0) return 'MF'
  // Goals present but modest, more than assists → forward-leaning
  if (p.goles > 0 && p.goles >= p.asist) return 'FW'
  // Default to a safe, understandable generic
  return 'MF'
}

/** Always returns a readable position. Uses the exact one if present, else infers. */
export function resolvePosition(
  p: Pick<PlayerData, 'position' | 'goles' | 'asist' | 'pj' | 'keyPasses' | 'tab'>,
): { code: Position; exact: boolean } {
  if (p.position) return { code: p.position, exact: true }
  return { code: inferPosition(p), exact: false }
}

export function positionLabel(
  p: Pick<PlayerData, 'position' | 'goles' | 'asist' | 'pj' | 'keyPasses' | 'tab'>,
  lang: Lang = 'es',
): string {
  const { code } = resolvePosition(p)
  return POS_LABELS[code][lang]
}

export function positionShort(
  p: Pick<PlayerData, 'position' | 'goles' | 'asist' | 'pj' | 'keyPasses' | 'tab'>,
): string {
  return POS_LABELS[resolvePosition(p).code].short
}
