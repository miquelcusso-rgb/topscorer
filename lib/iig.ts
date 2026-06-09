import type { PlayerData } from '@/types'

/**
 * IIG — Índice de Impacto del Goleador (Striker Impact Index)
 * ───────────────────────────────────────────────────────────
 * A transparent, proprietary composite built ONLY from the real season stats
 * we already ship in `data/players.ts` (no per-match data, nothing invented).
 *
 * Formula:
 *   IIG = goles × leagueCoef  +  (rating − 6) × 3  +  asist × 0.5
 *
 * Rationale for each term:
 *   • goles × leagueCoef → finishing volume, weighted by how hard the league is.
 *     A goal in a Top-5 league counts more than one in a weaker competition.
 *   • (rating − 6) × 3   → all-round per-match quality. 6.0 is an "average" game
 *     in API-Football's rating scale, so anything above 6 adds, below subtracts.
 *   • asist × 0.5        → creative contribution, weighted lower than finishing
 *     because the metric is a *striker* impact index.
 *
 * Result is rounded to 1 decimal. When `rating` is missing the rating term is
 * dropped (treated as 0) so the index degrades gracefully to a league-weighted
 * goals + assists figure — still honest, never fabricated.
 */

// League difficulty coefficients. Covers every distinct `league` value present
// in the dataset, mapped to the difficulty tiers from `lib/api-football.ts`:
//   Top-5 Europe (LEAGUES Big-5)        → 1.0
//   Strong-but-second-tier strength     → 0.8 (Primeira Liga, Eredivisie, …)
//   Everything else                     → 0.6
export const LEAGUE_COEF: Record<string, number> = {
  // Top-5 Europe
  'La Liga': 1.0,
  'LaLiga': 1.0,
  'Premier League': 1.0,
  'Bundesliga': 1.0,
  'Serie A': 1.0,
  'Ligue 1': 1.0,
  // Second tier of difficulty (UEFA mid-ranked top divisions)
  'Primeira Liga': 0.8,
  'Eredivisie': 0.8,
  'Süper Lig': 0.8,
  'Pro League': 0.8,
  'Premiership': 0.8,
  // Remaining European / rest
  'Super League': 0.6,
  'Bundesliga (Austria)': 0.6,
  'Ekstraklasa': 0.6,
  'Superligaen': 0.6,
  'Allsvenskan': 0.6,
  'Eliteserien': 0.6,
}

export const DEFAULT_LEAGUE_COEF = 0.6

export function leagueCoef(league: string): number {
  return LEAGUE_COEF[league] ?? DEFAULT_LEAGUE_COEF
}

export function iig(player: PlayerData): number {
  const goles = player.goles ?? 0
  const asist = player.asist ?? 0
  const coef = leagueCoef(player.league)
  const ratingTerm =
    typeof player.rating === 'number' && player.rating > 0
      ? (player.rating - 6) * 3
      : 0
  const raw = goles * coef + ratingTerm + asist * 0.5
  return Math.round(Math.max(0, raw) * 10) / 10
}

// One-line, bilingual "how it's calculated" explainer for tooltips/UI.
export const IIG_LABEL: Record<'es' | 'en', string> = {
  es: 'IIG',
  en: 'IIG',
}

export const IIG_NAME: Record<'es' | 'en', string> = {
  es: 'Índice de Impacto del Goleador',
  en: 'Striker Impact Index',
}

export const IIG_EXPLAINER: Record<'es' | 'en', string> = {
  es: 'IIG = goles × coef. de liga + (nota − 6) × 3 + asistencias × 0,5. Índice derivado de estadísticas reales de la temporada.',
  en: 'IIG = goals × league coef + (rating − 6) × 3 + assists × 0.5. A derived index built from real season stats.',
}

// Ranking score for the cross-league "scouter" leaderboards. Now that ALL
// positions carry real stats (GKs/DFs/MFs with 0 goals but a real rating), a
// pure goals-based IIG would rank them at 0. So: use IIG when it is meaningful
// (> 0), otherwise fall back to a league-weighted rating term so a high-rated
// non-scorer still ranks above a 0-rated one. The fallback is scaled to stay
// BELOW any positive IIG (an IIG of 0.1 should still beat a pure-rating row),
// so scorers always lead, but non-scorers are ordered sensibly instead of tied
// at zero.
export function rankScore(player: PlayerData): number {
  const v = iig(player)
  if (v > 0) return v
  const rating = typeof player.rating === 'number' && player.rating > 0 ? player.rating : 0
  if (!rating) return 0
  // (rating − 6) × coef, clamped ≥ 0, then compressed into (0, ~1] so it sits
  // just under the lowest real IIG values.
  const r = Math.max(0, (rating - 6) * leagueCoef(player.league))
  return Math.min(0.99, r / 3)
}

// Convenience: sort a list of players by ranking score (IIG, else rating·coef),
// descending. Used by the cross-league scouter leaderboards.
export function byIig(a: PlayerData, b: PlayerData): number {
  return rankScore(b) - rankScore(a)
}
