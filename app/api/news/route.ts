import { NextRequest } from 'next/server'
import { getNews } from '@/lib/news'

export const revalidate = 1200

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'es'
  const scope = req.nextUrl.searchParams.get('scope') === 'worldcup' ? 'worldcup' : 'general'
  try {
    return Response.json({ ok: true, items: await getNews(lang, scope) }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err), items: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
