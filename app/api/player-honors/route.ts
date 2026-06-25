import { NextRequest } from 'next/server'
import { getPlayerHonors } from '@/lib/api-football'

export const revalidate = 86400

export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return Response.json({ ok: false, error: 'missing id' }, { status: 400 })
  try {
    return Response.json({ ok: true, ...(await getPlayerHonors(id)) }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
