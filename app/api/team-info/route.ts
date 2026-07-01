import { NextRequest } from 'next/server'
import { findTeamBySlug } from '@/lib/team-data'
import { getTeamInfo } from '@/lib/api-football'
import { getClubSummary } from '@/lib/wikipedia'

// Lazy enrichment for a team page: club facts (founded, stadium, capacity,
// country) from api-football + a short history from Wikipedia. Fetched on the
// client after first paint so the ~650 team pages don't each make an external
// call at build. Both sources are individually cached (7d / 30d) and fully
// defensive — a missing source just omits its section. Author: Furiosa Studio.

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  const langParam = req.nextUrl.searchParams.get('lang')
  const lang: 'es' | 'en' = langParam === 'en' ? 'en' : 'es'
  if (!slug) return Response.json({ ok: false, error: 'missing slug' }, { status: 400 })

  const team = findTeamBySlug(slug)
  if (!team) return Response.json({ ok: false, error: 'unknown team' }, { status: 404 })

  try {
    const [info, history] = await Promise.all([
      team.teamId ? getTeamInfo(team.teamId) : Promise.resolve(null),
      getClubSummary(team.name, lang),
    ])

    const facts = info
      ? {
          founded: info.team.founded ?? null,
          country: info.team.country ?? null,
          venue: info.venue.name ?? null,
          city: info.venue.city ?? null,
          capacity: info.venue.capacity ?? null,
        }
      : null

    return Response.json(
      {
        ok: true,
        slug,
        facts,
        history: history ? { extract: history.extract, url: history.url, title: history.title } : null,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400' } }
    )
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
