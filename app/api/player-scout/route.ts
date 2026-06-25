import { NextRequest } from 'next/server'
import { scoutByName } from '@/lib/transfermarkt'

export const revalidate = 604800 // 7d

// Public scouting fields from Transfermarkt (contract, foot, joined, agent if
// public, kit brand). NEVER contact/personal data — only what TM shows openly.
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')?.trim()
  if (!name) return Response.json({ ok: false, error: 'missing name' }, { status: 400 })
  try {
    const data = await scoutByName(name)
    return Response.json({ ok: true, ...data }, {
      headers: { 'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=86400` },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
