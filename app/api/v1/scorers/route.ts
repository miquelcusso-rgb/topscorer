import { NextRequest } from 'next/server'
import { withApiAuth, jsonResponse } from '@/lib/api-auth'
import { PLAYERS } from '@/data/players'
import { enrich } from '@/lib/utils'
import { slugify } from '@/lib/slugify'
import type { Season } from '@/types'

export const revalidate = 3600

// GET /api/v1/scorers?league=Premier%20League&season=2526&limit=20
export const GET = withApiAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const league = searchParams.get('league')?.toLowerCase()
  const season = (searchParams.get('season') ?? '2526') as Season
  const limit  = Math.min(Number(searchParams.get('limit') ?? 20), 100)

  let rows = PLAYERS.filter(p => p.season === season && p.tab === 's')
  if (league) rows = rows.filter(p => p.league.toLowerCase() === league)

  const ranked = rows
    .map(enrich)
    .sort((a, b) => b.goles - a.goles || b.asist - a.asist)
    .slice(0, limit)
    .map((e, i) => ({
      rank: i + 1,
      name: e.name,
      slug: slugify(e.name),
      club: e.club,
      league: e.league,
      goals: e.goles,
      assists: e.asist,
      appearances: e.pj,
      goals_per_90: e.pj > 0 ? Number((e.goles / (e.pj * 0.9)).toFixed(2)) : 0,
    }))

  return jsonResponse(ranked, { count: ranked.length, season, league: league ?? 'all' })
})
