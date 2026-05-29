import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// POST /api/comments/[id]/like  — idempotent toggle
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = createServerClient()

  // Already liked? unlike. Else like.
  const { data: existing } = await sb
    .from('comment_likes')
    .select('comment_id')
    .eq('comment_id', id)
    .eq('clerk_id', userId)
    .maybeSingle()

  let liked: boolean
  if (existing) {
    await sb.from('comment_likes').delete().eq('comment_id', id).eq('clerk_id', userId)
    liked = false
  } else {
    await sb.from('comment_likes').insert({ comment_id: id, clerk_id: userId })
    liked = true
  }

  // Refresh likes_count
  const { count } = await sb.from('comment_likes').select('comment_id', { count: 'exact', head: true }).eq('comment_id', id)
  await sb.from('comments').update({ likes_count: count ?? 0 }).eq('id', id)

  return NextResponse.json({ liked, likes_count: count ?? 0 })
}
