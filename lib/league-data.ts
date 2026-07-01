import type { PlayerData } from '@/types'
import { ALL_LEAGUES, type LeagueMeta } from '@/lib/api-football'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'
import { iig } from '@/lib/iig'

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

/**
 * Reverse lookup: a raw dataset `player.league` string → catalog metadata
 * (country + short code). Built from LEAGUE_DATA_ALIASES (id → dataset strings)
 * joined to ALL_LEAGUES (id → { name, country, short }). The first catalog
 * league claiming a dataset string wins, which is correct because the dataset
 * carries at most one competition per display string. Used to label the home
 * scope multi-select (e.g. "Süper Lig" → Turkey) without inventing anything.
 */
const DATASET_LEAGUE_META: Map<string, LeagueMeta> = (() => {
  const m = new Map<string, LeagueMeta>()
  const byId = new Map<number, LeagueMeta>(ALL_LEAGUES.map(l => [l.id, l]))
  for (const [idStr, names] of Object.entries(LEAGUE_DATA_ALIASES)) {
    const meta = byId.get(Number(idStr))
    if (!meta) continue
    for (const name of names) if (!m.has(name)) m.set(name, meta)
  }
  return m
})()

/** Catalog country for a raw dataset league string (undefined if unknown). */
export function leagueCountry(datasetLeague: string): string | undefined {
  return DATASET_LEAGUE_META.get(datasetLeague)?.country
}

/** api-football league id for a raw dataset league string (undefined if unknown).
 *  Lets the team pages pull standings / statistics / fixtures for that league. */
export function leagueIdForDatasetName(datasetLeague: string): number | undefined {
  return DATASET_LEAGUE_META.get(datasetLeague)?.id
}

/**
 * Human label for a dataset league string in the scope picker: the league name
 * plus its country when known (e.g. "Süper Lig · Turkey", "Super League ·
 * Greece"), which disambiguates the several "Super League"/"Premiership" names.
 */
export function leaguePickerLabel(datasetLeague: string): string {
  const country = leagueCountry(datasetLeague)
  return country ? `${datasetLeague} · ${country}` : datasetLeague
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

/**
 * Top scorers of a league, sorted by real goals (IIG breaks ties).
 * `limit` defaults to 8 to fit the side-by-side league summary.
 */
export function topScorersForLeague(
  league: LeagueMeta,
  limit = 8,
  season: PlayerData['season'] = '2526',
): PlayerData[] {
  return [...playersForLeague(league, season)]
    .sort((a, b) => (b.goles ?? 0) - (a.goles ?? 0) || iig(b) - iig(a))
    .slice(0, limit)
}

/**
 * Top assisters of a league, sorted by real assists. Players with 0 assists
 * are excluded so we never pad the list with non-creators.
 */
export function topAssistersForLeague(
  league: LeagueMeta,
  limit = 8,
  season: PlayerData['season'] = '2526',
): PlayerData[] {
  return [...playersForLeague(league, season)]
    .filter(p => (p.asist ?? 0) > 0)
    .sort((a, b) => (b.asist ?? 0) - (a.asist ?? 0) || (b.goles ?? 0) - (a.goles ?? 0))
    .slice(0, limit)
}

/**
 * Young prospects (U21) of a league, sorted by goal+assist contribution.
 * Uses the real `age` field (present on every row). Returns [] when none.
 */
export function youngProspectsForLeague(
  league: LeagueMeta,
  maxAge = 21,
  limit = 8,
  season: PlayerData['season'] = '2526',
): PlayerData[] {
  return [...playersForLeague(league, season)]
    .filter(p => typeof p.age === 'number' && p.age <= maxAge)
    .sort(
      (a, b) =>
        ((b.goles ?? 0) + (b.asist ?? 0)) - ((a.goles ?? 0) + (a.asist ?? 0)) ||
        iig(b) - iig(a),
    )
    .slice(0, limit)
}

/**
 * A club "row" derived honestly from the players we ship for a league.
 *
 * IMPORTANT — the static dataset has NO league table data: no points, no
 * W-D-L, no matches played as a team. What we DO have are real per-player
 * goals/assists. So this is NOT a standings table; it is a clubs ranking by
 * the aggregate attacking output of the league's tracked players. Fields are
 * limited to what is real (goals, assists, players counted, top scorer).
 */
export interface ClubRankRow {
  club: string
  goals: number
  assists: number
  /** How many of this club's players appear in our league dataset. */
  players: number
  /** This club's most prolific tracked scorer (for the crest + name). */
  topScorer: PlayerData
}

/**
 * Clubs of a league ranked by aggregate goals of their tracked players
 * (assists break ties). Honest "attacking output" ranking, NOT a standings.
 */
export function clubsRankedForLeague(
  league: LeagueMeta,
  limit = 10,
  season: PlayerData['season'] = '2526',
): ClubRankRow[] {
  const byClub = new Map<string, ClubRankRow>()
  for (const p of playersForLeague(league, season)) {
    const club = p.club
    const row = byClub.get(club)
    if (!row) {
      byClub.set(club, {
        club,
        goals: p.goles ?? 0,
        assists: p.asist ?? 0,
        players: 1,
        topScorer: p,
      })
    } else {
      row.goals += p.goles ?? 0
      row.assists += p.asist ?? 0
      row.players += 1
      if ((p.goles ?? 0) > (row.topScorer.goles ?? 0)) row.topScorer = p
    }
  }
  return Array.from(byClub.values())
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.players - a.players)
    .slice(0, limit)
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
