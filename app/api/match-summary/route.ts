import { NextRequest } from 'next/server'
import { getMatchSummary } from '@/lib/api-football'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('fixture'))
  if (!id) return Response.json({ ok: false, error: 'missing fixture' }, { status: 400 })
  try {
    return Response.json({ ok: true, summary: await getMatchSummary(id) }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
