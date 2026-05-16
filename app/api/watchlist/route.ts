import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

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
