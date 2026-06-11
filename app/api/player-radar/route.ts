import { NextRequest } from 'next/server'
import { getPlayerRadar } from '@/lib/radar/getPlayerRadar'
import type { PositionTag } from '@/lib/radar/radar-types'

export const revalidate = 86400

const VALID_TAGS: PositionTag[] = ['POR', 'DEF', 'MID', 'AMF', 'DMF', 'ST', 'WAM']

export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return Response.json({ ok: false, error: 'missing id' }, { status: 400 })
  const profileParam = req.nextUrl.searchParams.get('profile')
  const override = profileParam && VALID_TAGS.includes(profileParam as PositionTag)
    ? (profileParam as PositionTag)
    : undefined
  try {
    const radar = await getPlayerRadar(id, override)
    if (!radar) return Response.json({ ok: false, error: 'no player' }, { status: 404 })
    return Response.json({ ok: true, ...radar })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
