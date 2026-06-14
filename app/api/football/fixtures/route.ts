import { NextRequest } from 'next/server'
import { getFixtures, getNextFixtures, getAllFixtures } from '@/lib/api-football'

export const revalidate = 1800

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const league = Number(searchParams.get('league') ?? '140')
  const season = Number(searchParams.get('season') ?? '2025')
  const last = Number(searchParams.get('last') ?? '10')
  const next = searchParams.get('next')
  const all = searchParams.get('all')

  try {
    const data = all
      ? await getAllFixtures(league, season)
      : next
        ? await getNextFixtures(league, season, Number(next))
        : await getFixtures(league, season, last)
    return Response.json({ ok: true, data }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
