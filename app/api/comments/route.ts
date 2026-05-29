import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { moderateComment } from '@/lib/comments-moderation'
import { tierFromPoints } from '@/lib/badges'

export const revalidate = 0

// GET /api/comments?target_type=rumor&target_id=<uuid>&limit=50
// Returns comments + author badge tier (computed from user_stats).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const target_type = searchParams.get('target_type')
  const target_id = searchParams.get('target_id')
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200)

  if (target_type !== 'rumor' && target_type !== 'poll') {
    return NextResponse.json({ error: 'invalid_target_type' }, { status: 400 })
  }
  if (!target_id) return NextResponse.json({ error: 'missing_target_id' }, { status: 400 })

  const sb = createServerClient()
  const { data: comments, error } = await sb
    .from('comments')
    .select('id, clerk_id, display_name, body, language, parent_id, likes_count, created_at')
    .eq('target_type', target_type)
    .eq('target_id', target_id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Hydrate badge tier per author (single query for all authors)
  const clerkIds = Array.from(new Set((comments ?? []).map(c => c.clerk_id)))
  let pointsMap: Record<string, number> = {}
  if (clerkIds.length) {
    const { data: stats } = await sb.from('user_stats').select('clerk_id, points').in('clerk_id', clerkIds)
    pointsMap = Object.fromEntries((stats ?? []).map(s => [s.clerk_id, s.points]))
  }

  const enriched = (comments ?? []).map(c => ({
    ...c,
    tier: tierFromPoints(pointsMap[c.clerk_id] ?? 0).tier,
    points: pointsMap[c.clerk_id] ?? 0,
  }))

  return NextResponse.json({ data: enriched, count: enriched.length })
}

// POST /api/comments  body: { target_type, target_id, body, language?, parent_id? }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const target_type = String(body.target_type ?? '')
  const target_id = String(body.target_id ?? '')
  const text = String(body.body ?? '')
  const language = body.language === 'en' ? 'en' : 'es'
  const parent_id = body.parent_id ?? null

  if (target_type !== 'rumor' && target_type !== 'poll') {
    return NextResponse.json({ error: 'invalid_target_type' }, { status: 400 })
  }
  if (!target_id) return NextResponse.json({ error: 'missing_target_id' }, { status: 400 })

  const mod = moderateComment(text)
  if (!mod.ok) return NextResponse.json({ error: 'moderation', reason: mod.reason }, { status: 400 })

  // Fetch display name from Clerk (best effort)
  let displayName: string | null = null
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    displayName = (user.firstName || user.username || 'Futbolero').toString().slice(0, 40)
  } catch { /* ignore */ }

  const sb = createServerClient()
  const { data, error } = await sb.rpc('post_comment', {
    p_clerk_id: userId,
    p_display_name: displayName,
    p_target_type: target_type,
    p_target_id: target_id,
    p_body: mod.cleaned,
    p_language: language,
    p_parent_id: parent_id,
  })
  if (error) {
    if (error.message?.includes('rate_limited')) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update points (fire and forget)
  void sb.rpc('recompute_user_points', { p_clerk_id: userId })

  return NextResponse.json({ id: data }, { status: 201 })
}
