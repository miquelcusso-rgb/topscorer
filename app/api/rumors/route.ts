import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const revalidate = 3600 // was 60 — client rotates over the pool, so hourly freshness is plenty (free-tier ISR)

// GET /api/rumors?status=rumor&min_likelihood=0&limit=50
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const league = searchParams.get('league')
  const club = searchParams.get('club')
  const minL = Number(searchParams.get('min_likelihood') ?? 0)
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100)

  const sb = createServerClient()
  let q = sb
    .from('rumors')
    .select('*')
    .eq('is_active', true)
    .gte('likelihood', minL)
    .order('last_seen_at', { ascending: false }) // freshness first → newest rumours surface/rotate
    .order('likelihood', { ascending: false })
    .limit(limit)

  if (status) q = q.eq('status', status)
  if (league) q = q.eq('league', league)
  if (club) q = q.or(`from_club.eq.${club},to_club.eq.${club}`)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count: data?.length ?? 0 })
}
