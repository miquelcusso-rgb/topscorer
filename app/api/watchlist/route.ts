import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan, WATCHLIST_CAP } from '@/lib/plans'

// Caps per plan live in lib/plans.ts (single source of truth, mirrors /pricing).
// Approved matrix: Free 5 · Pro 25 · Scout/Team unlimited.
async function getCap(userId: string): Promise<number | null> {
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  return WATCHLIST_CAP[getUserPlan(user.publicMetadata)]
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = createServerClient()
  const { data, error } = await sb
    .from('watchlists')
    .select('*')
    .eq('clerk_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { player_name, season, tab, note } = body

  const sb = createServerClient()

  // Enforce plan cap. `null` means unlimited.
  const cap = await getCap(userId)
  if (cap !== null) {
    // Don't reject if user is updating an existing row — only reject net-new entries past cap
    const { data: existing } = await sb
      .from('watchlists')
      .select('player_name, season, tab')
      .eq('clerk_id', userId)
    const already = (existing ?? []).some(
      r => r.player_name === player_name && r.season === season && r.tab === tab,
    )
    if (!already && (existing?.length ?? 0) >= cap) {
      return NextResponse.json({ error: 'watchlist_full', cap }, { status: 409 })
    }
  }

  const { data, error } = await sb
    .from('watchlists')
    .upsert(
      { clerk_id: userId, player_name, season, tab, note: note ?? null },
      { onConflict: 'clerk_id,player_name,season,tab' },
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const player_name = searchParams.get('player_name')
  const season = searchParams.get('season')
  const tab = searchParams.get('tab')

  if (!player_name || !season || !tab) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const sb = createServerClient()
  const { error } = await sb
    .from('watchlists')
    .delete()
    .eq('clerk_id', userId)
    .eq('player_name', player_name)
    .eq('season', season)
    .eq('tab', tab)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
