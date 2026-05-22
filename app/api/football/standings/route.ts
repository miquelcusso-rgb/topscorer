import { NextRequest } from 'next/server'
import { getStandings, type ApiStandingEntry } from '@/lib/api-football'
import { getFDStandings, FD_LEAGUE_MAP } from '@/lib/football-data-org'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const league = Number(searchParams.get('league') ?? '140')
  const season = Number(searchParams.get('season') ?? '2025')

  try {
    // Try football-data.org first for Big 5 leagues when token is available
    if (FD_LEAGUE_MAP[league] && process.env.FOOTBALL_DATA_TOKEN) {
      try {
        const fdData = await getFDStandings(league)
        if (fdData && fdData.length > 0) {
          const data: ApiStandingEntry[] = fdData.map(fd => ({
            rank: fd.position,
            team: { id: fd.team.id, name: fd.team.name, logo: fd.team.crest },
            points: fd.points,
            goalsDiff: fd.goalDifference,
            form: fd.form ?? '',
            description: null,
            all: {
              played: fd.playedGames,
              win: fd.won,
              draw: fd.draw,
              lose: fd.lost,
              goals: { for: fd.goalsFor, against: fd.goalsAgainst },
            },
            home: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
            away: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
          }))
          return Response.json({ ok: true, data })
        }
      } catch {
        // fall through to API-Football
      }
    }

    // Fallback: API-Football
    const data = await getStandings(league, season)
    return Response.json({ ok: true, data })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
