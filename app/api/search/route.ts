import { NextRequest } from 'next/server'
import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { ALL_LEAGUES } from '@/lib/api-football'
import { SEARCH_INDEX } from '@/data/search-index'
import { slugify } from '@/lib/slugify'
import { playerSlug } from '@/lib/player-slug'
import { clubLogo } from '@/lib/club-logos'
import { flagFor } from '@/lib/flags'
import { playerApiId, playerPhoto } from '@/lib/player-photo'

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

type IndexedHit = SearchPlayerHit & { _n: string; _c: string; _f: string; _sn: string; _fsn: string; _rich: boolean; _mins: number; _hasId: boolean }

// Last token = surname. Players are stored with the API's abbreviated names
// ("A. Isak", "J. David"), so surname matching is what makes searching by the
// common name work.
const surname = (s: string) => { const t = s.split(' ').filter(Boolean); return t[t.length - 1] ?? s }

// Build a DEDUPED player index once at module init, KEYED BY API-FOOTBALL ID.
// Two tiers feed it:
//  1) the static dataset (PRIMARY_PLAYERS) — rich, canonical clean slugs;
//  2) the full server-only SEARCH_INDEX — every first-division player with apps
//     (Gavi, Fermín, rotation players…), so the search isn't limited to the
//     minutes-capped dataset. Index-only players get a `name-<apiId>` slug that
//     the profile page resolves live from API-Football.
//
// ROOT-CAUSE FIX (recurring data-quality bug): a curated dataset row often has
// NO `apiId` and a NAME VARIANT vs the canonical search-index entry for the same
// player ("Michael Olise"/Bayern/FW vs "M. Olise"/19617; "Alejandro Grimaldo"/DF
// vs "Álex Grimaldo"/563). When dedup was keyed by raw `p.apiId` alone, the
// id-less curated row never matched the index id, so the SAME player surfaced
// TWICE — once with the wrong club/position and no photo (initials). We now
// resolve every candidate to its API id via playerApiId() (name/fullName/
// first-last + conservative full-name-prefix) and collapse same-id candidates
// into one, preferring: an id + a photo + the canonical (search-index) club/pos,
// while keeping the rich dataset's clean slug so the comparador's local lookup
// (playerSlug) still resolves to the full multi-season profile.
const PLAYER_INDEX = (() => {
  const byId = new Map<number, IndexedHit>()  // resolved API id → chosen hit
  const noId: IndexedHit[] = []               // unresolvable rows (kept as-is)
  const slugSeen = new Set<string>()

  // Nationality → flag is only known on the curated dataset (PRIMARY_PLAYERS);
  // the server-only SEARCH_INDEX carries NO nationality, so index-only players
  // (the bulk of hits) would render WITHOUT a flag — the exact inconsistency the
  // dropdown shows (some rows flagged, some not). Build a FLAG_BY_ID map from the
  // curated rows so we can backfill a flag onto a matching search-index hit by
  // its API id. (Rows with no curated nationality still resolve gracefully — the
  // UI reserves the flag column and shows a neutral placeholder.)
  const flagById = new Map<number, string>()
  for (const p of PRIMARY_PLAYERS) {
    const f = p.flag ?? flagFor(p.nationality)
    if (!f) continue
    const id = playerApiId(p)
    if (id != null && !flagById.has(id)) flagById.set(id, f)
  }

  // Score a candidate so the richer/canonical one wins a same-id collision.
  const cand = (h: IndexedHit) => (h._hasId ? 1e9 : 0) + (h.photo ? 1e6 : 0) + (h._rich ? 1e3 : 0) + h._mins

  const add = (id: number | undefined, hit: IndexedHit) => {
    if (id == null) { if (!slugSeen.has(hit.slug)) { slugSeen.add(hit.slug); noId.push(hit) }; return }
    const cur = byId.get(id)
    if (!cur) { byId.set(id, hit); return }
    // Merge same-id candidates: keep the richer base, but always backfill a
    // photo and canonical club/pos from whichever side has them. Prefer the
    // rich dataset's clean slug (cur._rich) so existing profile URLs hold.
    const better = cand(hit) > cand(cur) ? hit : cur
    const other = better === hit ? cur : hit
    byId.set(id, {
      ...better,
      slug: cur._rich ? cur.slug : better.slug,
      photo: better.photo ?? other.photo,
      // Canonical club/pos: prefer the search-index (non-rich) values, which are
      // the live, correct ones (e.g. Olise → Bayern München / MF).
      club: (!hit._rich ? hit.club : !cur._rich ? cur.club : better.club),
      league: (!hit._rich ? hit.league : !cur._rich ? cur.league : better.league),
      pos: (!hit._rich ? hit.pos : !cur._rich ? cur.pos : better.pos) ?? better.pos ?? other.pos,
      flag: better.flag ?? other.flag,
      age: better.age ?? other.age,
      _mins: Math.max(cur._mins, hit._mins),
      _hasId: true,
    })
  }

  for (const p of PRIMARY_PLAYERS) {
    const slug = playerSlug(p)
    const id = playerApiId(p)
    add(id, {
      name: p.name, fullName: p.fullName, slug,
      club: p.club, league: p.league, flag: p.flag ?? flagFor(p.nationality),
      photo: playerPhoto(p), age: p.age, pos: p.position,
      _n: norm(p.name), _c: norm(p.club), _f: norm(p.fullName ?? ''),
      _sn: surname(norm(p.name)), _fsn: surname(norm(p.fullName ?? '')),
      _rich: true, _mins: p.minutes ?? 0, _hasId: id != null,
    })
  }
  for (const p of SEARCH_INDEX) {
    const slug = `${slugify(p.name)}-${p.id}`
    add(p.id, {
      name: p.name, fullName: p.fullName, slug,
      club: p.club, league: p.league, photo: p.photo, age: p.age, pos: p.pos,
      flag: flagById.get(p.id),
      _n: norm(p.name), _c: norm(p.club), _f: norm(p.fullName ?? ''),
      _sn: surname(norm(p.name)), _fsn: surname(norm(p.fullName ?? '')),
      _rich: false, _mins: p.mins ?? 0, _hasId: true,
    })
  }
  return [...byId.values(), ...noId]
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
    .map(({ _n, _c, _f, _sn, _fsn, _rich, _mins, _hasId, ...rest }) => rest)

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
