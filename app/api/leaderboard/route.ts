import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { clerkClient } from '@clerk/nextjs/server'
import { tierFromPoints } from '@/lib/badges'

export const revalidate = 300

// GET /api/leaderboard?limit=50
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100)

  const sb = createServerClient()
  const { data, error } = await sb
    .from('user_stats')
    .select('clerk_id, points, votes_count, comments_count, picks_correct')
    .gt('points', 0)
    .order('points', { ascending: false })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Hydrate display name from Clerk (small batch)
  let nameMap: Record<string, string> = {}
  try {
    const clerk = await clerkClient()
    const users = await clerk.users.getUserList({ userId: (data ?? []).map(r => r.clerk_id), limit })
    nameMap = Object.fromEntries((users.data ?? []).map(u => [u.id, u.firstName || u.username || 'Futbolero']))
  } catch { /* ignore */ }

  const rows = (data ?? []).map((r, i) => ({
    rank: i + 1,
    display_name: nameMap[r.clerk_id] ?? 'Futbolero',
    points: r.points,
    votes: r.votes_count,
    comments: r.comments_count,
    picks: r.picks_correct,
    tier: tierFromPoints(r.points).tier,
  }))

  return NextResponse.json({ data: rows, count: rows.length })
}
