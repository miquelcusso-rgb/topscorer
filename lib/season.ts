// ─── Current-season single source of truth (SSOT) ───────────────────────────
// "Nothing purely hardcoded, always fresh." The current European football
// season ("25/26" / "2025/26" / code "2526") used to be a literal scattered
// across ~20+ display/copy sites. When the season rolls to 26/27 they all go
// stale. This module derives the current season FROM THE DATE so it auto-rolls,
// and exposes display helpers. Dataset season codes (the "2526" strings used to
// filter PLAYERS rows) are DATA and live with the data — this file owns the
// DISPLAY / "which season is current" decision only.
//
// Cross-checked against the rest of the codebase so the notion stays consistent:
//   • lib/player-identity.ts  CURRENT_SEASON_FLOOR = 2324 (≤ current, history cutoff)
//   • lib/api-to-players.ts   SEASON_MAP { 2025: '2526', … }
//   • lib/understat.ts        default season '2526'
//   • lib/plans.ts            FREE_SEASONS[0] === '2526'
// All use the same 4-digit code shape; CURRENT_SEASON_CODE matches FREE_SEASONS[0].

/** 4-digit season code, e.g. '2526' for the 2025/26 season. */
export type SeasonCode = string

/**
 * Force a specific 4-digit code if ever needed (e.g. to freeze copy mid-roll).
 * Default `null` → derive from the date. Set to e.g. '2526' to override.
 */
// 2026-07-09 (Miqui): la derivación por fecha saltó a '2627' el 1-jul pero el
// DATASET sigue en 25/26 (FREE_SEASONS[0]='2526', filtros season==='2526') →
// la home mostraba "Temporada 26/27" sobre datos 25/26. Congelado a '2526'
// hasta que la 26/27 ruede de verdad (dataset + api-football, ~agosto).
// TODO: quitar el override cuando arranque la temporada nueva.
export const SEASON_OVERRIDE: SeasonCode | null = '2526'

/**
 * Derive the current 4-digit season code from a date. European football seasons
 * start ~July/August, so from July (month index 7, 1-based) onward we're in the
 * YY/YY+1 season; before that we're still in the (YY-1)/YY season.
 *   • Aug 2025 → '2526'  • Jun 2026 → '2526'  • Jul 2026 → '2627'
 */
export function seasonCodeForDate(date: Date): SeasonCode {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 1-based
  const startYear = month >= 7 ? year : year - 1
  const yy = (n: number) => String(n % 100).padStart(2, '0')
  return `${yy(startYear)}${yy(startYear + 1)}`
}

/**
 * The current season code. Override wins; otherwise derived from `new Date()`.
 * `new Date()` (not `Date.now()`) is fine in app runtime — the workflow-script
 * ban on `Date.now()` does not apply here.
 */
export const CURRENT_SEASON_CODE: SeasonCode =
  SEASON_OVERRIDE ?? seasonCodeForDate(new Date())

/** '2526' → '25/26' */
export function seasonShort(code: SeasonCode): string {
  return `${code.slice(0, 2)}/${code.slice(2, 4)}`
}

/** '2526' → '2025/26' (assumes 21st-century codes). */
export function seasonLong(code: SeasonCode): string {
  return `20${code.slice(0, 2)}/${code.slice(2, 4)}`
}

/** '25/26' for the current season. */
export const CURRENT_SEASON_SHORT: string = seasonShort(CURRENT_SEASON_CODE)
/** '2025/26' for the current season. */
export const CURRENT_SEASON_LONG: string = seasonLong(CURRENT_SEASON_CODE)
