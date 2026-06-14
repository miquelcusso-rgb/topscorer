import { NextRequest } from 'next/server'
import { getFixturePrediction } from '@/lib/api-football'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const fixture = Number(searchParams.get('fixture') ?? '0')

  if (!fixture) {
    return Response.json({ ok: false, error: 'missing fixture' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const data = await getFixturePrediction(fixture)
    return Response.json({ ok: true, data }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
