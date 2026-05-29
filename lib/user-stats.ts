import { createServerClient } from '@/lib/supabase'
import { tierFromPoints, type BadgeDef } from '@/lib/badges'

export interface UserStats {
  clerk_id: string
  points: number
  votes_count: number
  comments_count: number
  picks_correct: number
  picks_total: number
  joined_at: string
  updated_at: string
}

/** Fetch a user's stats. Returns null if the user has never engaged. */
export async function getUserStats(clerkId: string): Promise<UserStats | null> {
  const sb = createServerClient()
  const { data } = await sb.from('user_stats').select('*').eq('clerk_id', clerkId).maybeSingle()
  return (data as UserStats | null) ?? null
}

/** Recompute and persist a user's points + badge tier from raw activity. */
export async function recomputePoints(clerkId: string): Promise<number> {
  const sb = createServerClient()
  const { data, error } = await sb.rpc('recompute_user_points', { p_clerk_id: clerkId })
  if (error) throw new Error(error.message)
  return (data as number) ?? 0
}

/** Convenience: badge for a points value (defaults to 0 for fresh users) */
export function badgeForPoints(points: number | undefined): BadgeDef {
  return tierFromPoints(points ?? 0)
}

/** Cheap snapshot to attach to a comment payload */
export async function ensureUserStats(clerkId: string): Promise<UserStats> {
  const sb = createServerClient()
  const existing = await getUserStats(clerkId)
  if (existing) return existing
  const { data, error } = await sb
    .from('user_stats')
    .insert({ clerk_id: clerkId })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as UserStats
}
