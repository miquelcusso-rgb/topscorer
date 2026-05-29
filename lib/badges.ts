/**
 * 5-tier badge system. Earned via engagement (votes, comments, picks, account age).
 * Tier is derived from `points` in user_stats; the SQL function
 * recompute_user_points() updates points after each contribution.
 *
 * Points formula (mirrored in lib/supabase recompute_user_points):
 *   votes × 1 + comments × 2 + picks_correct × 3 + (days_since_join / 10)
 */
import type { Lang } from '@/lib/i18n'

export type BadgeTier =
  | 'amateur'
  | 'profesional'
  | 'crack_champions'
  | 'top_mundial'
  | 'estratosferico'

export interface BadgeDef {
  tier: BadgeTier
  minPoints: number
  /** Visible label per locale */
  label: { es: string; en: string }
  /** Short slug shown in compact spaces */
  short: { es: string; en: string }
  /** One-liner explainer for tooltips */
  blurb: { es: string; en: string }
  /** Brand color (text + glow) */
  color: string
  /** Soft bg */
  bg: string
  /** Decorative icon (emoji — fine for badges) */
  icon: string
}

// Ordered ascending. Adjust thresholds without changing tier identifiers.
export const BADGES: BadgeDef[] = [
  {
    tier: 'amateur',
    minPoints: 0,
    label:  { es: 'Amateur',                en: 'Amateur' },
    short:  { es: 'Amateur',                en: 'Amateur' },
    blurb:  { es: 'Recién aterrizado en la comunidad.', en: 'Just landed in the community.' },
    color:  '#9aa6c8',
    bg:     'rgba(154,166,200,.10)',
    icon:   '⚽',
  },
  {
    tier: 'profesional',
    minPoints: 25,
    label:  { es: 'Profesional',            en: 'Pro' },
    short:  { es: 'Pro',                    en: 'Pro' },
    blurb:  { es: 'Participa con criterio.', en: 'Contributes regularly.' },
    color:  '#38c47a',
    bg:     'rgba(56,196,122,.12)',
    icon:   '🎯',
  },
  {
    tier: 'crack_champions',
    minPoints: 100,
    label:  { es: 'Crack de Champions',     en: 'Champions Crack' },
    short:  { es: 'Crack UCL',              en: 'UCL Crack' },
    blurb:  { es: 'Voz reconocida en cada hilo.', en: 'Recognised voice in every thread.' },
    color:  '#00c8b0',
    bg:     'rgba(0,200,176,.12)',
    icon:   '🏆',
  },
  {
    tier: 'top_mundial',
    minPoints: 500,
    label:  { es: 'Top Mundial',            en: 'World Class' },
    short:  { es: 'Top Mundial',            en: 'World Class' },
    blurb:  { es: 'De los mejores del planeta.', en: 'One of the very best.' },
    color:  '#f0c040',
    bg:     'rgba(240,192,64,.14)',
    icon:   '🌍',
  },
  {
    tier: 'estratosferico',
    minPoints: 2000,
    label:  { es: 'Estratosférico',         en: 'Stratospheric' },
    short:  { es: 'Estratosférico',         en: 'Stratospheric' },
    blurb:  { es: 'Leyenda viva del foro.',  en: 'Living legend of the forum.' },
    color:  '#a060ff',
    bg:     'rgba(160,96,255,.14)',
    icon:   '🚀',
  },
]

/** Resolve the tier achieved with the given points. */
export function tierFromPoints(points: number): BadgeDef {
  let result = BADGES[0]
  for (const b of BADGES) {
    if (points >= b.minPoints) result = b
  }
  return result
}

/** Next tier the user is chasing (null if already at top). */
export function nextTier(points: number): BadgeDef | null {
  const current = tierFromPoints(points)
  const idx = BADGES.findIndex(b => b.tier === current.tier)
  return idx >= 0 && idx < BADGES.length - 1 ? BADGES[idx + 1] : null
}

/** Progress towards the next tier, 0-1 (1 if maxed out). */
export function progressToNext(points: number): number {
  const cur = tierFromPoints(points)
  const next = nextTier(points)
  if (!next) return 1
  return Math.min(1, (points - cur.minPoints) / (next.minPoints - cur.minPoints))
}

/** Human-friendly label in the active language. */
export function badgeLabel(tier: BadgeTier, lang: Lang = 'es'): string {
  const b = BADGES.find(x => x.tier === tier) ?? BADGES[0]
  return b.label[lang]
}
