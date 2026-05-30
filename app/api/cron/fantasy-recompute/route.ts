import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'

// Recompute fantasy points weekly. Formula:
//   raw = goals*4 + assists*3 + max(0, (rating-7))*2
//   per pick: raw * (captain ? 2 : 1)
//   team.points_total = sum(picks)

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const h = req.headers.get('authorization')
  if (h === `Bearer ${expected}`) return true
  return new URL(req.url).searchParams.get('secret') === expected
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sb = createServerClient()

  // Index current-season players by slug
  const bySlug = new Map<string, (typeof PLAYERS)[number]>()
  for (const p of PLAYERS) {
    if (p.season === '2526') bySlug.set(slugify(p.name), p)
  }

  const { data: picks, error } = await sb
    .from('fantasy_team_picks')
    .select('id, team_id, player_slug, captain')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!picks || picks.length === 0) return NextResponse.json({ ok: true, recomputed: 0 })

  type R = { id: number; team_id: number; player_slug: string; captain: boolean }
  const teamTotals = new Map<number, number>()
  const updates: Array<{ id: number; points: number }> = []

  for (const pk of picks as R[]) {
    const p = bySlug.get(pk.player_slug)
    if (!p) { updates.push({ id: pk.id, points: 0 }); continue }
    const raw = p.goles * 4 + p.asist * 3 + Math.max(0, (p.rating ?? 0) - 7) * 2
    const points = Math.round(raw * (pk.captain ? 2 : 1))
    updates.push({ id: pk.id, points })
    teamTotals.set(pk.team_id, (teamTotals.get(pk.team_id) ?? 0) + points)
  }

  // Apply pick updates one-by-one (small dataset; can be batched if it grows).
  for (const u of updates) {
    await sb.from('fantasy_team_picks').update({ points: u.points }).eq('id', u.id)
  }
  for (const [teamId, total] of teamTotals) {
    await sb.from('fantasy_teams').update({ points_total: total, updated_at: new Date().toISOString() }).eq('id', teamId)
  }

  return NextResponse.json({ ok: true, recomputed: updates.length, teams: teamTotals.size })
}
