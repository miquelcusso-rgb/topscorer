import { NextRequest } from 'next/server'
import { getPlayerDetails } from '@/lib/api-football'
import { apiDetailToPlayer } from '@/lib/resolve-player'

export const revalidate = 7200

// Live single-player lookup by API-Football id → our PlayerData shape. Used by
// the comparador to load players that aren't in the (minutes-capped) static
// dataset, so any searchable player can be compared with full data.
export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return Response.json({ ok: false, error: 'missing id' }, { status: 400 })
  try {
    const detail = await getPlayerDetails(id, 2025)
    if (!detail) return Response.json({ ok: false, error: 'not found' }, { status: 404 })
    const player = apiDetailToPlayer(detail)
    if (!player) return Response.json({ ok: false, error: 'no stats' }, { status: 404 })
    return Response.json({ ok: true, player }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
