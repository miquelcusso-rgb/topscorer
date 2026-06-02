import { NextRequest } from 'next/server'
import { PLAYERS } from '@/data/players'
import { ALL_LEAGUES } from '@/lib/api-football'
import { slugify } from '@/lib/slugify'

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
}
export interface SearchLeagueHit {
  name: string
  slug: string
}

// Build a deduped player index once at module init (static dataset).
const PLAYER_INDEX = (() => {
  const seen = new Set<string>()
  const out: (SearchPlayerHit & { _n: string; _c: string; _f: string })[] = []
  for (const p of PLAYERS) {
    const slug = slugify(p.name)
    if (seen.has(slug)) continue
    seen.add(slug)
    out.push({
      name: p.name,
      fullName: p.fullName,
      slug,
      club: p.club,
      league: p.league,
      flag: p.flag,
      photo: p.photo,
      age: p.age,
      _n: norm(p.name),
      _c: norm(p.club),
      _f: norm(p.fullName ?? ''),
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

export async function GET(req: NextRequest) {
  const q = norm(req.nextUrl.searchParams.get('q') ?? '')
  if (q.length < 2) {
    return Response.json({ ok: true, players: [], leagues: [] })
  }

  // Players: common-name OR full/real-name match first (ranked by startsWith),
  // then club match. All accent-insensitive via norm().
  const nameHits = PLAYER_INDEX.filter(p => p._n.includes(q) || p._f.includes(q))
  nameHits.sort((a, b) => {
    const as = a._n.startsWith(q) || a._f.startsWith(q) ? 0 : 1
    const bs = b._n.startsWith(q) || b._f.startsWith(q) ? 0 : 1
    return as - bs || a._n.localeCompare(b._n)
  })
  const clubHits = PLAYER_INDEX.filter(p => !p._n.includes(q) && !p._f.includes(q) && p._c.includes(q))
  const players = [...nameHits, ...clubHits].slice(0, 8).map(({ _n, _c, _f, ...rest }) => rest)

  const leagues = LEAGUE_INDEX.filter(l => l._n.includes(q))
    .sort((a, b) => (a._n.startsWith(q) ? 0 : 1) - (b._n.startsWith(q) ? 0 : 1))
    .slice(0, 4)
    .map(({ _n, ...rest }) => rest)

  return Response.json({ ok: true, players, leagues })
}
