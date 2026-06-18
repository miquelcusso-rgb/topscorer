import { NextRequest } from 'next/server'
import { getNewsWithVisuals } from '@/lib/news'

export const revalidate = 1200

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'es'
  const scope = req.nextUrl.searchParams.get('scope') === 'worldcup' ? 'worldcup' : 'general'
  try {
    // Strip the raw RSS/agency `image` before it leaves the server — clients only
    // ever get the license-aware `visual` (player headshot or club crest, or
    // none → branded placeholder). No agency rehosting, no generic scenes.
    const items = (await getNewsWithVisuals(lang, scope)).map(({ image: _drop, ...rest }) => rest)
    return Response.json({ ok: true, items }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err), items: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
