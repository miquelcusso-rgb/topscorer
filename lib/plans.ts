import type { Plan } from '@/types'

export { Plan }

export function getUserPlan(publicMetadata?: Record<string, unknown>): Plan {
  const plan = publicMetadata?.plan as Plan | undefined
  return plan || 'free'
}

export function isPro(publicMetadata?: Record<string, unknown>): boolean {
  const plan = getUserPlan(publicMetadata)
  return plan === 'pro' || plan === 'team' || plan === 'scout'
}

export function isTeam(publicMetadata?: Record<string, unknown>): boolean {
  return getUserPlan(publicMetadata) === 'team'
}

export function isScout(publicMetadata?: Record<string, unknown>): boolean {
  return getUserPlan(publicMetadata) === 'scout'
}

// Free tier expanded to match (and slightly exceed) the major competitors
// (FotMob, FBref, Transfermarkt — all free for these basics).
export const FREE_ROW_LIMIT = 25
export const PRO_ROW_LIMIT = 50
export const PRO_EXTENDED_LIMIT = 100

// ─── Approved tier matrix (Miqui + SEO, 2026-06) ────────────────────────────
// Single source of truth for the per-plan caps enforced across the app.
// `null` = unlimited. Keep in sync with /pricing copy.

/** Private watchlist size cap per plan. */
export const WATCHLIST_CAP: Record<Plan, number | null> = {
  free:  5,
  pro:   25,
  scout: null,
  team:  null,
}

/** Saved-comparisons cap per plan. */
export const SAVED_COMPARISON_CAP: Record<Plan, number | null> = {
  free:  5,
  pro:   null,
  scout: null,
  team:  null,
}

/** Monthly CSV-export cap per plan. */
export const CSV_EXPORT_CAP: Record<Plan, number | null> = {
  free:  3,
  pro:   25,
  scout: null,
  team:  null,
}
// All loaded seasons available to free (data goes back to 2010/11 in the UI
// dropdown; deep historic seasons are fetched live from API-Football on demand
// and cached. Backfill of the static dataset is a separate ongoing task).
export const FREE_SEASONS: string[] = [
  '2526','2425','2324','2223','2122','2021',
  '1920','1819','1718','1617','1516','1415',
  '1314','1213','1112','1011',
]
