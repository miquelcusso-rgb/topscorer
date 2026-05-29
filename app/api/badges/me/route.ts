import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { ensureUserStats, recomputePoints } from '@/lib/user-stats'
import { tierFromPoints, nextTier, progressToNext } from '@/lib/badges'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await recomputePoints(userId).catch(() => null)
  const stats = await ensureUserStats(userId)
  const tier = tierFromPoints(stats.points)
  const next = nextTier(stats.points)
  return NextResponse.json({
    stats,
    tier: tier.tier,
    next: next?.tier ?? null,
    points_to_next: next ? next.minPoints - stats.points : 0,
    progress: progressToNext(stats.points),
  })
}
