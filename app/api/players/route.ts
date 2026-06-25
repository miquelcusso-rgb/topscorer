import { NextRequest } from 'next/server'
import { getTopScorers, getTopAssists, LEAGUES, LEAGUES_2, LEAGUES_EURO } from '@/lib/api-football'
import { transformApiPlayer } from '@/lib/api-to-players'
import type { PlayerData, Tab } from '@/types'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const tab = (req.nextUrl.searchParams.get('tab') ?? 's') as Tab
  const season = Number(req.nextUrl.searchParams.get('season') ?? '2025')
  const include2nd = req.nextUrl.searchParams.get('second') === '1'
  const includeEuro = req.nextUrl.searchParams.get('euro') === '1'

  const leaguesToFetch = [
    ...LEAGUES,
    ...(include2nd ? LEAGUES_2 : []),
    ...(includeEuro ? LEAGUES_EURO : []),
  ]

  try {
    const results = await Promise.all(
      leaguesToFetch.map(league =>
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

    return Response.json({ ok: true, data: players, count: players.length }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
