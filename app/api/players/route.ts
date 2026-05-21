import { NextRequest } from 'next/server'
import { getTopScorers, getTopAssists, LEAGUES } from '@/lib/api-football'
import { transformApiPlayer } from '@/lib/api-to-players'
import type { PlayerData, Tab } from '@/types'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const tab = (req.nextUrl.searchParams.get('tab') ?? 's') as Tab
  const season = Number(req.nextUrl.searchParams.get('season') ?? '2025')

  try {
    const results = await Promise.all(
      LEAGUES.map(league =>
        tab === 'a'
          ? getTopAssists(league.id, season)
          : getTopScorers(league.id, season)
      )
    )

    const players: PlayerData[] = []
    for (const leagueResults of results) {
      for (const res of leagueResults) {
        const p = transformApiPlayer(res, tab)
        if (p && p.pj > 0) players.push(p)
      }
    }

    return Response.json({ ok: true, data: players, count: players.length })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
