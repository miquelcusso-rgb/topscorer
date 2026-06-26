import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/plans'
import { checkQuota, incrementUsage } from '@/lib/usage'

// GET → report remaining CSV-export quota for the current month (no mutation)
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const plan = getUserPlan(user.publicMetadata)

  const quota = await checkQuota(userId, plan, 'csv_export')
  return NextResponse.json(quota)
}

// POST → consume one CSV export if quota allows. Returns 429 when exhausted.
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const plan = getUserPlan(user.publicMetadata)

  const quota = await checkQuota(userId, plan, 'csv_export')
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: plan === 'free'
          ? `Has alcanzado tu límite de ${quota.limit} exportaciones CSV este mes. Mejora a Pro (25/mes) o Scout (ilimitado).`
          : `Has alcanzado tu límite de ${quota.limit} exportaciones este mes. Mejora a Scout para exportaciones ilimitadas.`,
        ...quota,
      },
      { status: 429 },
    )
  }

  // Unlimited plans (Scout/Team) don't need a counter row, but we still record for analytics
  const used = await incrementUsage(userId, 'csv_export')
  return NextResponse.json({
    allowed: true,
    used,
    limit: quota.limit,
    remaining: quota.limit === null ? null : Math.max(0, quota.limit - used),
  })
}
