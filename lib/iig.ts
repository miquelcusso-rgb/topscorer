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

/**
 * League-strength coefficient — SINGLE SOURCE OF TRUTH for "how hard is this
 * competition" across the whole app. A multiplier in ~0.6–1.0, keyed by the RAW
 * `player.league` strings as they appear in `data/*` (resolved through the
 * registry in `lib/api-football.ts` / `lib/league-data.ts`, so every league the
 * dataset ships maps to a value here).
 *
 * Proxy / rationale (UEFA association-coefficient tiers + broad consensus):
 *   1.00  Big-5 Europe top flight (ENG/ESP/ITA/GER/FRA)
 *   0.92  Eredivisie / Primeira Liga — strongest "best of the rest" in Europe
 *   0.85  Süper Lig, Belgium Pro League, Championship (England 2), Scotland,
 *         Greece, Brazil — strong second-tier-strength competitions
 *   0.80  Big-5 second divisions (2.Bundesliga, Serie B, Ligue 2, Segunda) +
 *         Austria/Switzerland top flights
 *   0.75  Liga MX, Liga Profesional (Argentina), Ekstraklasa, Scandinavian top
 *         flights (Superligaen/Allsvenskan/Eliteserien)
 *   0.70  J1 League, K League, MLS, Eerste Divisie, Liga Portugal 2, 1. Lig
 *   0.65  Other Americas / Asia / Oceania top flights, Greek 2nd division
 *
 * Unknown / unlisted leagues default to DEFAULT_LEAGUE_COEF (a sensible mid-low
 * ~0.72) so a never-before-seen league string is treated as mid-pack, never
 * given Big-5 weight by accident.
 */
export const LEAGUE_COEF: Record<string, number> = {
  // ── Big-5 Europe (1.00) ──────────────────────────────────────────────────
  'La Liga': 1.0,
  'LaLiga': 1.0,
  'Premier League': 1.0,
  'Bundesliga': 1.0,        // Germany (id 78). Austria's also ships as "Bundesliga"
  'Serie A': 1.0,           // Italy (id 135)
  'Ligue 1': 1.0,
  // ── Strongest "best of the rest" in Europe (0.92) ────────────────────────
  'Eredivisie': 0.92,
  'Primeira Liga': 0.92,
  // ── Strong second-tier strength (0.85) ───────────────────────────────────
  'Süper Lig': 0.85,
  'Pro League': 0.85,       // Belgium (id 144). Saudi also ships as "Pro League"
  'Belgian Pro League': 0.85,
  'Championship': 0.85,     // England 2nd division — strong, near top-flight level
  'Premiership': 0.85,      // Scotland
  'Scottish Premiership': 0.85,
  'Super League': 0.85,     // Greece (id 197, the one with dataset coverage)
  'Brasileirão Serie A': 0.85,
  // ── Big-5 second divisions + Austria/Switzerland top flights (0.80) ──────
  '2. Bundesliga': 0.8,
  'Serie B': 0.8,
  'Ligue 2': 0.8,
  'Segunda División': 0.8,
  'Swiss Super League': 0.8,
  'Austrian Bundesliga': 0.8,
  // ── Solid mid leagues (0.75) ──────────────────────────────────────────────
  'Liga MX': 0.75,
  'Liga Profesional': 0.75, // Argentina
  'Ekstraklasa': 0.75,
  'Superligaen': 0.75,
  'Allsvenskan': 0.75,
  'Eliteserien': 0.75,
  // ── Developing / growing leagues (0.70) ──────────────────────────────────
  'J1 League': 0.7,
  'K League 1': 0.7,
  'MLS': 0.7,
  'Eerste Divisie': 0.7,    // Netherlands 2nd division
  'Liga Portugal 2': 0.7,
  '1. Lig': 0.7,            // Turkey 2nd division
  // ── Other top flights / lower second divisions (0.65) ────────────────────
  'Primera División': 0.65, // Chile / Uruguay
  'Categoría Primera A': 0.65, // Colombia
  'A-League': 0.65,         // Australia
  'Super League (China)': 0.65,
  'Super League 2': 0.65,   // Greece 2nd division
  'Scottish Championship': 0.65,
}

export const DEFAULT_LEAGUE_COEF = 0.72

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
