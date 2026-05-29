import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { isPro } from '@/lib/plans'

const FREE_CAP = 5

// GET /api/comparisons  → list mine
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = createServerClient()
  const { data, error } = await sb
    .from('comparisons')
    .select('id, name, player_names, season, created_at')
    .eq('clerk_id', userId)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/comparisons  body: { name?, player_names: string[], season? }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = (typeof body.name === 'string' && body.name.trim()) ? body.name.trim().slice(0, 60) : 'Sin título'
  const player_names = Array.isArray(body.player_names) ? body.player_names.filter((x: unknown) => typeof x === 'string').slice(0, 6) : []
  const season = typeof body.season === 'string' ? body.season : '2526'

  if (player_names.length < 2) return NextResponse.json({ error: 'need_two_players' }, { status: 400 })

  const sb = createServerClient()

  // Enforce cap for free plan (Pro/Scout/Team: unlimited per pricing)
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  if (!isPro(user.publicMetadata)) {
    const { count } = await sb
      .from('comparisons')
      .select('id', { count: 'exact', head: true })
      .eq('clerk_id', userId)
    if ((count ?? 0) >= FREE_CAP) {
      return NextResponse.json({ error: 'free_cap_reached', cap: FREE_CAP }, { status: 409 })
    }
  }

  const { data, error } = await sb
    .from('comparisons')
    .insert({ clerk_id: userId, name, player_names, season })
    .select('id, name, player_names, season, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
