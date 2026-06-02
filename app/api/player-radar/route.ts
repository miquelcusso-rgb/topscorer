import { NextRequest } from 'next/server'
import { getPlayerRadar } from '@/lib/radar/getPlayerRadar'

export const revalidate = 86400

export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return Response.json({ ok: false, error: 'missing id' }, { status: 400 })
  try {
    const radar = await getPlayerRadar(id)
    if (!radar) return Response.json({ ok: false, error: 'no player' }, { status: 404 })
    return Response.json({ ok: true, ...radar })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
