import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

// Fantasy Lite — minimal SaaS-grade fantasy: each user has 1 team per season,
// 5 player slots, 1 captain (×2 points). Points = goals×4 + assists×3 +
// (rating-7)×2 if rating exists, recomputed weekly by cron.

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sb = createServerClient()
  const { data: team, error } = await sb
    .from('fantasy_teams')
    .select('id, team_name, season, points_total, created_at, fantasy_team_picks(id, player_slug, player_name, slot, captain, points)')
    .eq('clerk_id', userId)
    .eq('season', '2526')
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: team ?? null })
}

interface UpsertBody {
  team_name?: string
  picks?: Array<{ player_slug: string; player_name: string; slot: number; captain?: boolean }>
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as UpsertBody | null
  if (!body) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const teamName = (body.team_name ?? '').trim()
  const picks = body.picks ?? []
  if (teamName.length < 2 || teamName.length > 32) {
    return NextResponse.json({ error: 'bad_team_name' }, { status: 400 })
  }
  if (picks.length !== 5) {
    return NextResponse.json({ error: 'need_5_picks' }, { status: 400 })
  }
  const slots = new Set(picks.map(p => p.slot))
  if (slots.size !== 5 || picks.some(p => p.slot < 1 || p.slot > 5)) {
    return NextResponse.json({ error: 'bad_slots' }, { status: 400 })
  }
  if (picks.filter(p => p.captain).length !== 1) {
    return NextResponse.json({ error: 'exactly_one_captain' }, { status: 400 })
  }

  const sb = createServerClient()
  // Upsert team
  const { data: team, error: teamErr } = await sb
    .from('fantasy_teams')
    .upsert(
      { clerk_id: userId, season: '2526', team_name: teamName, updated_at: new Date().toISOString() },
      { onConflict: 'clerk_id,season' },
    )
    .select('id')
    .single()
  if (teamErr || !team) return NextResponse.json({ error: teamErr?.message ?? 'team_upsert_failed' }, { status: 500 })

  // Replace picks atomically (delete all, insert fresh).
  await sb.from('fantasy_team_picks').delete().eq('team_id', team.id)
  const { error: picksErr } = await sb.from('fantasy_team_picks').insert(
    picks.map(p => ({
      team_id: team.id,
      player_slug: p.player_slug,
      player_name: p.player_name,
      slot: p.slot,
      captain: !!p.captain,
    })),
  )
  if (picksErr) return NextResponse.json({ error: picksErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, team_id: team.id })
}
