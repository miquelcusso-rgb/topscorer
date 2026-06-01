import type { PlayerData } from '@/types'
import { ALL_LEAGUES, type LeagueMeta } from '@/lib/api-football'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'

/**
 * League detail pages live at /[lang]/competiciones/[slug] where slug =
 * slugify(league.name). The catalog (`ALL_LEAGUES`) and the dataset
 * (`data/players.ts`) sometimes use different display strings for the same
 * competition (e.g. catalog "Premiership" vs dataset "Scottish Premiership",
 * catalog "Pro League"/Saudi vs dataset "Pro League (Saudi Arabia)"). This map
 * links each catalog league id → the set of `player.league` strings that belong
 * to it, so we can filter REAL players for a league without inventing anything.
 *
 * Only ids present here can resolve players; everything else degrades to a
 * graceful "datos próximamente" state.
 */
const LEAGUE_DATA_ALIASES: Record<number, string[]> = {
  140: ['La Liga', 'LaLiga'],            // Spain
  39:  ['Premier League'],               // England
  78:  ['Bundesliga'],                   // Germany
  135: ['Serie A'],                      // Italy
  61:  ['Ligue 1'],                      // France
  94:  ['Primeira Liga'],                // Portugal
  203: ['Süper Lig'],                    // Turkey
  197: ['Super League'],                 // Greece
  88:  ['Eredivisie'],                   // Netherlands
  144: ['Pro League', 'Belgian Pro League'], // Belgium
  179: ['Premiership', 'Scottish Premiership'], // Scotland
  207: ['Swiss Super League'],           // Switzerland
  218: ['Austrian Bundesliga'],          // Austria
  106: ['Ekstraklasa'],                  // Poland
  119: ['Superligaen'],                  // Denmark
  113: ['Allsvenskan'],                  // Sweden
  103: ['Eliteserien'],                  // Norway
  40:  ['Championship'],                 // England 2
  79:  ['2. Bundesliga'],                // Germany 2
  136: ['Serie B'],                      // Italy 2
  62:  ['Ligue 2'],                      // France 2
  141: ['Segunda División'],             // Spain 2
  95:  ['Liga Portugal 2'],              // Portugal 2
  204: ['1. Lig'],                       // Turkey 2
  199: ['Super League 2'],               // Greece 2
  89:  ['Eerste Divisie'],               // Netherlands 2
  180: ['Scottish Championship'],        // Scotland 2
  253: ['MLS'],                          // USA
  262: ['Liga MX'],                      // Mexico
  71:  ['Brasileirão Serie A'],          // Brazil
  128: ['Liga Profesional'],             // Argentina
  265: ['Primera División (Chile)'],     // Chile
  239: ['Categoría Primera A'],          // Colombia
  98:  ['J1 League'],                    // Japan
  292: ['K League 1'],                   // South Korea
  169: ['Super League (China)'],         // China
  188: ['A-League'],                     // Australia
  307: ['Pro League (Saudi Arabia)'],    // Saudi Arabia
}

export interface ResolvedLeague {
  league: LeagueMeta
  slug: string
}

/**
 * Canonical slug → catalog league. Multiple catalog leagues share a slug when
 * their `name` collides (e.g. several "Super League"); the FIRST in catalog
 * order wins so each slug maps to exactly one page. Greece's "Super League" is
 * first, so /competiciones/super-league is Greece — the one with data.
 */
const SLUG_TO_LEAGUE: Map<string, LeagueMeta> = (() => {
  const m = new Map<string, LeagueMeta>()
  for (const league of ALL_LEAGUES) {
    const slug = slugify(league.name)
    if (!m.has(slug)) m.set(slug, league)
  }
  return m
})()

export function leagueSlug(league: LeagueMeta): string {
  return slugify(league.name)
}

/** All distinct league slugs for generateStaticParams / sitemap. */
export function allLeagueSlugs(): string[] {
  return Array.from(SLUG_TO_LEAGUE.keys())
}

export function findLeagueBySlug(slug: string): LeagueMeta | undefined {
  return SLUG_TO_LEAGUE.get(slug)
}

/** Real players in this league for a season, sorted by goals desc. */
export function playersForLeague(league: LeagueMeta, season: PlayerData['season'] = '2526'): PlayerData[] {
  const accepted = new Set(LEAGUE_DATA_ALIASES[league.id] ?? [league.name])
  const seen = new Set<string>()
  return PLAYERS
    .filter(p => p.season === season && accepted.has(p.league))
    .filter(p => {
      // dedupe by player name (scorers + assists tables can list the same player)
      if (seen.has(p.name)) return false
      seen.add(p.name)
      return true
    })
}

/** Leagues that actually have players in the dataset (for cross-links). */
export function leaguesWithData(season: PlayerData['season'] = '2526'): ResolvedLeague[] {
  const out: ResolvedLeague[] = []
  const seenSlug = new Set<string>()
  for (const league of ALL_LEAGUES) {
    const slug = leagueSlug(league)
    if (seenSlug.has(slug)) continue
    if (playersForLeague(league, season).length > 0) {
      out.push({ league, slug })
      seenSlug.add(slug)
    }
  }
  return out
}
