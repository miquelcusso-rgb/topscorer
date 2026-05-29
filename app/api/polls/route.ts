import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const revalidate = 60

// GET /api/polls?status=active&featured=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured') === '1'
  const includeClosed = searchParams.get('include_closed') === '1'

  const sb = createServerClient()
  let q = sb
    .from('polls')
    .select('id, question_es, question_en, options, category, starts_at, ends_at, total_votes, is_featured')
    .order('is_featured', { ascending: false })
    .order('ends_at', { ascending: true })
    .limit(50)

  if (!includeClosed) q = q.gt('ends_at', new Date().toISOString())
  if (featured) q = q.eq('is_featured', true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count: data?.length ?? 0 })
}
