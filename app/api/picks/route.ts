import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/picks  → list user's recent picks (pending + recently resolved)
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = createServerClient()
  const { data, error } = await sb
    .from('picks')
    .select('id, fixture_id, league_id, pick, kickoff, status, points, result_home, result_away')
    .eq('clerk_id', userId)
    .order('kickoff', { ascending: false })
    .limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/picks  body: { fixture_id, league_id?, pick: 'home'|'draw'|'away', kickoff }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const fixture_id = Number(body.fixture_id)
  const league_id  = body.league_id ? Number(body.league_id) : null
  const pick = String(body.pick ?? '')
  const kickoff = String(body.kickoff ?? '')

  if (!fixture_id || !['home', 'draw', 'away'].includes(pick) || !kickoff) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
  if (new Date(kickoff) <= new Date()) {
    return NextResponse.json({ error: 'pick_after_kickoff_forbidden' }, { status: 410 })
  }

  const sb = createServerClient()
  const { error } = await sb.from('picks').upsert(
    { clerk_id: userId, fixture_id, league_id, pick, kickoff, status: 'pending', points: 0 },
    { onConflict: 'clerk_id,fixture_id' },
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
