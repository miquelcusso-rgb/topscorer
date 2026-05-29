import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/polls/[id]/vote  body: { option_key }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { option_key } = await req.json().catch(() => ({}))
  if (!option_key || typeof option_key !== 'string') {
    return NextResponse.json({ error: 'missing_option_key' }, { status: 400 })
  }

  const sb = createServerClient()

  // Validate that the option_key exists in the poll, and the poll is still open
  const { data: poll } = await sb.from('polls').select('options, ends_at, is_active').eq('id', id).maybeSingle()
  if (!poll || !poll.is_active) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (new Date(poll.ends_at) < new Date()) return NextResponse.json({ error: 'poll_closed' }, { status: 410 })
  const validKeys = new Set((poll.options as Array<{ key: string }>).map(o => o.key))
  if (!validKeys.has(option_key)) return NextResponse.json({ error: 'invalid_option' }, { status: 400 })

  const { error } = await sb.rpc('cast_vote', { p_clerk_id: userId, p_poll_id: id, p_option_key: option_key })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Recompute points (fire-and-forget)
  void sb.rpc('recompute_user_points', { p_clerk_id: userId })

  return NextResponse.json({ ok: true, voted: option_key })
}
