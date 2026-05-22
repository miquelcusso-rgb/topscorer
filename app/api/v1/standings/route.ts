import { NextRequest } from 'next/server'
import { withApiAuth, jsonResponse, errorResponse } from '@/lib/api-auth'
import { getStandings, ALL_LEAGUES } from '@/lib/api-football'

export const revalidate = 21600

// GET /api/v1/standings?league=PD&season=2025   (league = short code or numeric id)
export const GET = withApiAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const leagueParam = searchParams.get('league')
  const season = Number(searchParams.get('season') ?? 2025)

  if (!leagueParam) {
    return errorResponse(400, 'bad_request', 'Missing required parameter: league (short code or numeric id).')
  }

  // Resolve league id from short code, name, or numeric id
  let leagueId: number | undefined
  if (/^\d+$/.test(leagueParam)) {
    leagueId = Number(leagueParam)
  } else {
    const meta = ALL_LEAGUES.find(
      l => l.short.toLowerCase() === leagueParam.toLowerCase() ||
           l.name.toLowerCase() === leagueParam.toLowerCase(),
    )
    leagueId = meta?.id
  }

  if (!leagueId) {
    return errorResponse(404, 'league_not_found', `Unknown league "${leagueParam}". Use a short code (e.g. PD, PL) or numeric id.`)
  }

  try {
    const standings = await getStandings(leagueId, season)
    const data = standings.map(row => ({
      rank: row.rank,
      team: row.team.name,
      team_id: row.team.id,
      played: row.all.played,
      win: row.all.win,
      draw: row.all.draw,
      lose: row.all.lose,
      goals_for: row.all.goals.for,
      goals_against: row.all.goals.against,
      goal_diff: row.goalsDiff,
      points: row.points,
      form: row.form ?? null,
    }))
    return jsonResponse(data, { count: data.length, league_id: leagueId, season })
  } catch {
    return errorResponse(502, 'upstream_error', 'Could not fetch standings at this time.')
  }
})
