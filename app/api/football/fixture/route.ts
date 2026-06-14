import { NextRequest } from 'next/server'
import { getMatchDetail } from '@/lib/api-football'

// Single fixture detail (header + lineups + events + per-player stats + team
// statistics) in one round-trip. Short revalidate — a match can be live.
export const revalidate = 300

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = Number(searchParams.get('id') ?? '0')

  if (!id) {
    return Response.json({ ok: false, error: 'missing id' }, { status: 400 })
  }

  try {
    const data = await getMatchDetail(id)
    return Response.json({ ok: true, data })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
