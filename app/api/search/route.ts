import { NextRequest } from 'next/server'
import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { ALL_LEAGUES } from '@/lib/api-football'
import { SEARCH_INDEX } from '@/data/search-index'
import { slugify } from '@/lib/slugify'
import { playerSlug } from '@/lib/player-slug'
import { clubLogo } from '@/lib/club-logos'
import { flagFor } from '@/lib/flags'

export const dynamic = 'force-dynamic'

// Normalize: lowercase + strip diacritics, for accent-insensitive matching.
function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

export interface SearchPlayerHit {
  name: string
  fullName?: string
  slug: string
  club: string
  league: string
  flag?: string
  photo?: string
  age?: number
  pos?: string
}
export interface SearchLeagueHit {
  name: string
  slug: string
}
export interface SearchClubHit {
  name: string
  league: string
  leagueSlug: string
  crest?: string
}

type IndexedHit = SearchPlayerHit & { _n: string; _c: string; _f: string; _sn: string; _fsn: string; _rich: boolean; _mins: number }

// Last token = surname. Players are stored with the API's abbreviated names
// ("A. Isak", "J. David"), so surname matching is what makes searching by the
// common name work.
const surname = (s: string) => { const t = s.split(' ').filter(Boolean); return t[t.length - 1] ?? s }

// Build a deduped player index once at module init. Two tiers:
//  1) the static dataset (PRIMARY_PLAYERS) — rich, canonical clean slugs;
//  2) the full server-only SEARCH_INDEX — every first-division player with apps
//     (Gavi, Fermín, rotation players…), so the search isn't limited to the
//     minutes-capped dataset. Index-only players get a `name-<apiId>` slug that
//     the profile page resolves live from API-Football.
const PLAYER_INDEX = (() => {
  const bySlug = new Set<string>()
  const byApiId = new Set<number>()
  const out: IndexedHit[] = []
  for (const p of PRIMARY_PLAYERS) {
    const slug = playerSlug(p)
    if (bySlug.has(slug)) continue
    bySlug.add(slug)
    if (p.apiId) byApiId.add(p.apiId)
    out.push({
      name: p.name, fullName: p.fullName, slug,
      club: p.club, league: p.league, flag: p.flag ?? flagFor(p.nationality), photo: p.photo, age: p.age, pos: p.position,
      _n: norm(p.name), _c: norm(p.club), _f: norm(p.fullName ?? ''),
      _sn: surname(norm(p.name)), _fsn: surname(norm(p.fullName ?? '')),
      _rich: true, _mins: p.minutes ?? 0,
    })
  }
  for (const p of SEARCH_INDEX) {
    if (byApiId.has(p.id)) continue // already covered by the rich dataset
    byApiId.add(p.id)
    out.push({
      name: p.name, fullName: p.fullName, slug: `${slugify(p.name)}-${p.id}`,
      club: p.club, league: p.league, photo: p.photo, age: p.age, pos: p.pos,
      _n: norm(p.name), _c: norm(p.club), _f: norm(p.fullName ?? ''),
      _sn: surname(norm(p.name)), _fsn: surname(norm(p.fullName ?? '')),
      _rich: false, _mins: p.mins ?? 0,
    })
  }
  return out
})()

const LEAGUE_INDEX: (SearchLeagueHit & { _n: string })[] = (() => {
  const seen = new Set<string>()
  const out: (SearchLeagueHit & { _n: string })[] = []
  for (const lg of ALL_LEAGUES) {
    const slug = slugify(lg.name)
    if (seen.has(slug)) continue
    seen.add(slug)
    out.push({ name: lg.name, slug, _n: norm(lg.name) })
  }
  return out
})()

// Distinct clubs (with crest), for the multi-entity search.
const CLUB_INDEX: (SearchClubHit & { _n: string })[] = (() => {
  const seen = new Set<string>()
  const out: (SearchClubHit & { _n: string })[] = []
  for (const p of PRIMARY_PLAYERS) {
    if (!p.club || seen.has(p.club)) continue
    seen.add(p.club)
    out.push({ name: p.club, league: p.league, leagueSlug: slugify(p.league), crest: clubLogo(p.club), _n: norm(p.club) })
  }
  return out
})()

export async function GET(req: NextRequest) {
  const q = norm(req.nextUrl.searchParams.get('q') ?? '')
  if (q.length < 2) {
    return Response.json({ ok: true, players: [], leagues: [], clubs: [] })
  }

  // Players: common-name OR full/real-name match first (ranked by startsWith),
  // then club match. All accent-insensitive via norm().
  // Relevance: exact name → name-prefix → full-name-prefix, then by minutes
  // played (a fame proxy that works across both tiers, so a Barça regular beats
  // an obscure namesake who happens to be in the capped dataset), then dataset.
  const rank = (p: IndexedHit) => ({
    // exact common/full name OR exact surname ("isak" → "A. Isak")
    exact: (p._n === q || p._f === q || p._sn === q || p._fsn === q) ? 0 : 1,
    surnameStarts: (p._sn.startsWith(q) || p._fsn.startsWith(q)) ? 0 : 1,
    nameStarts: (p._n.startsWith(q) || p._f.startsWith(q)) ? 0 : 1,
  })
  const nameHits = PLAYER_INDEX.filter(p => p._n.includes(q) || p._f.includes(q))
  nameHits.sort((a, b) => {
    const ra = rank(a), rb = rank(b)
    return ra.exact - rb.exact || ra.surnameStarts - rb.surnameStarts || ra.nameStarts - rb.nameStarts
      || b._mins - a._mins || (a._rich ? 0 : 1) - (b._rich ? 0 : 1) || a._n.localeCompare(b._n)
  })
  const clubHits = PLAYER_INDEX.filter(p => !p._n.includes(q) && !p._f.includes(q) && p._c.includes(q))
    .sort((a, b) => (a._rich ? 0 : 1) - (b._rich ? 0 : 1) || b._mins - a._mins)
  const players = [...nameHits, ...clubHits].slice(0, 8)
    .map(({ _n, _c, _f, _sn, _fsn, _rich, _mins, ...rest }) => rest)

  const clubs = CLUB_INDEX.filter(c => c._n.includes(q))
    .sort((a, b) => (a._n.startsWith(q) ? 0 : 1) - (b._n.startsWith(q) ? 0 : 1))
    .slice(0, 5)
    .map(({ _n, ...rest }) => rest)

  const leagues = LEAGUE_INDEX.filter(l => l._n.includes(q))
    .sort((a, b) => (a._n.startsWith(q) ? 0 : 1) - (b._n.startsWith(q) ? 0 : 1))
    .slice(0, 4)
    .map(({ _n, ...rest }) => rest)

  return Response.json({ ok: true, players, clubs, leagues })
}
