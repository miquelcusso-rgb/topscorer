import { NextRequest } from 'next/server'
import { getTopYellowCards } from '@/lib/api-football'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const league = Number(searchParams.get('league') ?? '140')
  const season = Number(searchParams.get('season') ?? '2025')

  try {
    const data = await getTopYellowCards(league, season)
    return Response.json({ ok: true, data })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
