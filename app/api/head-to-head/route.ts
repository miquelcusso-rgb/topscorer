import { NextRequest } from 'next/server'
import { getHeadToHead } from '@/lib/api-football'

export const revalidate = 86400

// Head-to-head record between two teams (a vs b). Defensive: missing ids → 400;
// any other failure or no meetings → ok:true with h2h:null so the UI hides.
export async function GET(req: NextRequest) {
  const a = Number(req.nextUrl.searchParams.get('a'))
  const b = Number(req.nextUrl.searchParams.get('b'))
  if (!a || !b) return Response.json({ ok: false, error: 'missing a/b' }, { status: 400 })
  try {
    const h2h = await getHeadToHead(a, b)
    return Response.json({ ok: true, h2h }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: true, h2h: null, error: String(err) })
  }
}
