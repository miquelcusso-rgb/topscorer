import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { isPro, isScout, isTeam } from '@/lib/plans'

export const revalidate = 3600 // was 60 — too aggressive for the Vercel free tier (ISR writes)

// Early access window per plan:
//  - free  → polls become visible when starts_at <= now
//  - pro   → 24h before
//  - scout → 48h before
// The weekly cron creates polls with starts_at = now + 48h, so Scout sees
// them immediately, Pro 24h later, Free 48h later.
async function getEarlyHours(): Promise<number> {
  const { userId } = await auth()
  if (!userId) return 0
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const meta = user.publicMetadata
    if (isScout(meta) || isTeam(meta)) return 48
    if (isPro(meta)) return 24
  } catch { /* default 0 */ }
  return 0
}

// GET /api/polls?featured=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured') === '1'
  const includeClosed = searchParams.get('include_closed') === '1'

  const earlyHours = await getEarlyHours()
  const visibleThreshold = new Date(Date.now() + earlyHours * 3600_000).toISOString()

  const sb = createServerClient()
  let q = sb
    .from('polls')
    .select('id, question_es, question_en, options, category, starts_at, ends_at, total_votes, is_featured')
    .lte('starts_at', visibleThreshold)
    .order('is_featured', { ascending: false })
    .order('ends_at', { ascending: true })
    .limit(50)

  if (!includeClosed) q = q.gt('ends_at', new Date().toISOString())
  if (featured) q = q.eq('is_featured', true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count: data?.length ?? 0, early_access_hours: earlyHours })
}
