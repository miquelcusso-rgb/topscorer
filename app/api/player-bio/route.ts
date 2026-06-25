import { NextRequest } from 'next/server'
import { getPlayerBio } from '@/lib/wikipedia'

export const revalidate = 2592000 // 30d

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()
  const lang = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'es'
  if (!name) return Response.json({ ok: false, error: 'missing name' }, { status: 400 })
  try {
    const bio = await getPlayerBio(name, lang)
    return Response.json({ ok: true, bio }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
