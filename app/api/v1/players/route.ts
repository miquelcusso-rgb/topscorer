import { NextRequest } from 'next/server'
import { withApiAuth, jsonResponse, errorResponse } from '@/lib/api-auth'
import { PLAYERS } from '@/data/players'
import { enrich } from '@/lib/utils'
import { slugify } from '@/lib/slugify'
import type { Season, Position } from '@/types'

export const revalidate = 3600

// GET /api/v1/players?league=La%20Liga&position=FW&season=2526&limit=50
export const GET = withApiAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const league   = searchParams.get('league')?.toLowerCase()
  const position = searchParams.get('position')?.toUpperCase() as Position | undefined
  const season   = (searchParams.get('season') ?? '2526') as Season
  const limit    = Math.min(Number(searchParams.get('limit') ?? 100), 500)

  if (limit < 1) return errorResponse(400, 'bad_request', 'limit must be a positive integer.')

  let rows = PLAYERS.filter(p => p.season === season)
  if (league)   rows = rows.filter(p => p.league.toLowerCase() === league || p.club.toLowerCase() === league)
  if (position) rows = rows.filter(p => p.position === position)

  const data = rows.slice(0, limit).map(p => {
    const e = enrich(p)
    return {
      name: e.name,
      slug: slugify(e.name),
      club: e.club,
      league: e.league,
      season: e.season,
      age: e.age,
      position: e.position ?? null,
      nationality: e.nationality ?? null,
      appearances: e.pj,
      goals: e.goles,
      assists: e.asist,
      goals_per_90: e.pj > 0 ? Number((e.goles / (e.pj * 0.9)).toFixed(2)) : 0,
      assists_per_90: e.pj > 0 ? Number((e.asist / (e.pj * 0.9)).toFixed(2)) : 0,
      market_value: e.marketValue ?? null,
      rating: e.rating ?? null,
    }
  })

  return jsonResponse(data, { count: data.length, season, league: league ?? 'all', position: position ?? 'all' })
})
