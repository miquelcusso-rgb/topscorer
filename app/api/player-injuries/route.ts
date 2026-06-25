import { NextRequest } from 'next/server'
import { getPlayerInjuries, getPlayerSidelined } from '@/lib/api-football'

export const revalidate = 21600

// Current injury status + sidelined/suspension history for one player.
// Defensive: any failure → ok:true with empty arrays, so the UI just hides the
// section rather than erroring.
export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return Response.json({ ok: false, error: 'missing id' }, { status: 400 })
  try {
    const [injuries, sidelined] = await Promise.all([
      getPlayerInjuries(id),
      getPlayerSidelined(id),
    ])
    return Response.json({ ok: true, injuries, sidelined }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: true, injuries: [], sidelined: [], error: String(err) })
  }
}
