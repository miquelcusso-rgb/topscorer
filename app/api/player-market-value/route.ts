import { NextRequest } from 'next/server'
import { marketValueByName, tmMarketValue } from '@/lib/transfermarkt'

export const revalidate = 604800

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name') ?? ''
  const tmId = Number(req.nextUrl.searchParams.get('tmId'))
  try {
    if (tmId) return Response.json({ ok: true, tmId, points: await tmMarketValue(tmId) })
    if (!name) return Response.json({ ok: false, error: 'missing name' }, { status: 400 })
    const { tmId: id, points } = await marketValueByName(name)
    return Response.json({ ok: true, tmId: id, points })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
