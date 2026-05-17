import { NextRequest } from 'next/server'
import { getTopScorers, getTopAssists } from '@/lib/api-football'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const league = Number(searchParams.get('league') ?? '140')
  const season = Number(searchParams.get('season') ?? '2025')
  const type = searchParams.get('type') ?? 'scorers' // 'scorers' | 'assists'

  try {
    const data = type === 'assists'
      ? await getTopAssists(league, season)
      : await getTopScorers(league, season)
    return Response.json({ ok: true, data })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
