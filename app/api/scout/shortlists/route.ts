import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/plans'

// Scout-tier named player shortlists. Server-only (service role) filtered by
// Clerk clerk_id. Gated on the Scout plan.
async function requireScout(): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  if (getUserPlan(user.publicMetadata) !== 'scout') {
    return NextResponse.json({ error: 'Scout plan required' }, { status: 403 })
  }
  return { userId }
}

export async function GET() {
  const gate = await requireScout()
  if (gate instanceof NextResponse) return gate
  const sb = createServerClient()
  const { data, error } = await sb.from('scout_shortlists')
    .select('*').eq('clerk_id', gate.userId).order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const gate = await requireScout()
  if (gate instanceof NextResponse) return gate
  const { name } = await req.json().catch(() => ({}))
  if (!name?.trim()) return NextResponse.json({ error: 'missing name' }, { status: 400 })
  const sb = createServerClient()
  const { data, error } = await sb.from('scout_shortlists')
    .insert({ clerk_id: gate.userId, name: String(name).trim().slice(0, 60), players: [] })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Add or remove a player from a shortlist. Body: { id, add?:{slug,name,apiId}, remove?:slug }
export async function PATCH(req: NextRequest) {
  const gate = await requireScout()
  if (gate instanceof NextResponse) return gate
  const { id, add, remove } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const sb = createServerClient()
  const { data: row, error: e1 } = await sb.from('scout_shortlists')
    .select('players').eq('id', id).eq('clerk_id', gate.userId).single()
  if (e1 || !row) return NextResponse.json({ error: 'not found' }, { status: 404 })
  let players: Array<{ slug: string; name: string; apiId?: number }> = Array.isArray(row.players) ? row.players : []
  if (add?.slug) { if (!players.some(p => p.slug === add.slug)) players = [...players, { slug: add.slug, name: add.name ?? add.slug, apiId: add.apiId }] }
  if (remove) players = players.filter(p => p.slug !== remove)
  const { data, error } = await sb.from('scout_shortlists')
    .update({ players, updated_at: new Date().toISOString() })
    .eq('id', id).eq('clerk_id', gate.userId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const gate = await requireScout()
  if (gate instanceof NextResponse) return gate
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const sb = createServerClient()
  const { error } = await sb.from('scout_shortlists').delete().eq('id', id).eq('clerk_id', gate.userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
