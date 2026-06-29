import { NextRequest } from 'next/server'
import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { rankScore } from '@/lib/iig'
import { playerSlug } from '@/lib/player-slug'
import { playerPhoto } from '@/lib/player-photo'
import { flagFor } from '@/lib/flags'
import { canonicalClubName } from '@/lib/club-colors'

// Top players of a club for the home "My team" featured block (PRO). Reads only
// the static current-season dataset (no external API call → free on the Vercel
// free tier) and is CDN-cached a day. Returns a small, already-trimmed payload.
export const dynamic = 'force-dynamic'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export interface TeamScorer {
  name: string
  slug: string
  goles: number
  asist: number
  pj: number
  position: string | null
  photo: string | null
  flag: string | null
}

export async function GET(req: NextRequest) {
  const club = req.nextUrl.searchParams.get('club')?.trim()
  if (!club) return Response.json({ ok: false, error: 'missing club' }, { status: 400 })
  // Canonicalise both sides so every accent/short-form variant of a club
  // ("PSG"/"Paris Saint Germain", "Atletico"/"Atlético") matches.
  const nc = norm(canonicalClubName(club))
  try {
    const pool = (Array.isArray(PRIMARY_PLAYERS) ? PRIMARY_PLAYERS : [])
      .filter(p => p && p.season === '2526' && norm(canonicalClubName(p.club || '')) === nc)
    // Rank by rankScore (IIG when meaningful, else rating·coef) so non-scorers
    // are ordered sensibly too, then take the top 6.
    const players: TeamScorer[] = [...pool]
      .sort((a, b) => rankScore(b) - rankScore(a))
      .slice(0, 6)
      .map(p => ({
        name: p.name,
        slug: playerSlug(p),
        goles: p.goles ?? 0,
        asist: p.asist ?? 0,
        pj: p.pj ?? 0,
        position: p.position ?? null,
        photo: playerPhoto(p) ?? null,
        flag: p.flag ?? flagFor(p.nationality) ?? null,
      }))
    return Response.json({ ok: true, club, players }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    })
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
