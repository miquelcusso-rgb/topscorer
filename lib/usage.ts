import { createServerClient } from '@/lib/supabase'
import { CSV_EXPORT_CAP } from '@/lib/plans'
import type { Plan } from '@/types'

// ─── Monthly quota limits per plan ──────────────────────────────────────────
// null = unlimited. CSV caps live in lib/plans.ts (single source of truth).
export const QUOTAS: Record<'csv_export' | 'api_request', Record<Plan, number | null>> = {
  // Approved matrix: Free 3/mo · Pro 25/mo · Scout/Team unlimited.
  csv_export: CSV_EXPORT_CAP,
  api_request: {
    free:   0,
    pro:    0,       // API access is Scout-only
    scout:  50_000,  // Scout: 50K requests / month — sized to fit our API-Football budget
    team:   50_000,
  },
}

type Metric = keyof typeof QUOTAS

/** Current billing period as 'YYYY-MM' in UTC */
export function currentPeriod(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Read the current month's count for a metric (0 if none) */
export async function getUsage(clerkId: string, metric: Metric): Promise<number> {
  const sb = createServerClient()
  const { data } = await sb
    .from('usage_monthly')
    .select('count')
    .eq('clerk_id', clerkId)
    .eq('period', currentPeriod())
    .eq('metric', metric)
    .maybeSingle()
  return data?.count ?? 0
}

export interface QuotaCheck {
  allowed: boolean
  used: number
  limit: number | null   // null = unlimited
  remaining: number | null
}

/** Check whether a user (by plan) may perform one more action of `metric` */
export async function checkQuota(
  clerkId: string,
  plan: Plan,
  metric: Metric,
): Promise<QuotaCheck> {
  const limit = QUOTAS[metric][plan]
  const used = await getUsage(clerkId, metric)

  if (limit === null) {
    return { allowed: true, used, limit: null, remaining: null }
  }
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  }
}

/** Atomically increment a usage counter (race-safe via SQL function) */
export async function incrementUsage(
  clerkId: string,
  metric: Metric,
  amount = 1,
): Promise<number> {
  const sb = createServerClient()
  const { data, error } = await sb.rpc('increment_usage', {
    p_clerk_id: clerkId,
    p_period:   currentPeriod(),
    p_metric:   metric,
    p_amount:   amount,
  })
  if (error) throw new Error(error.message)
  return (data as number) ?? 0
}
