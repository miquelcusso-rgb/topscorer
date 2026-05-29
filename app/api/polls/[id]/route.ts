import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/polls/[id] — poll + per-option counts + my vote (if signed in)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  const sb = createServerClient()

  const { data: poll, error } = await sb.from('polls').select('*').eq('id', id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!poll) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const { data: votes } = await sb.from('votes').select('option_key').eq('poll_id', id)
  const tally: Record<string, number> = {}
  for (const v of votes ?? []) tally[v.option_key] = (tally[v.option_key] ?? 0) + 1

  let myVote: string | null = null
  if (userId) {
    const { data: mine } = await sb.from('votes').select('option_key').eq('poll_id', id).eq('clerk_id', userId).maybeSingle()
    myVote = mine?.option_key ?? null
  }

  return NextResponse.json({ data: poll, tally, my_vote: myVote, total: votes?.length ?? 0 })
}
