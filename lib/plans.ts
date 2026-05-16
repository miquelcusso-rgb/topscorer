import type { Plan } from '@/types'

export { Plan }

export function getUserPlan(publicMetadata?: Record<string, unknown>): Plan {
  const plan = publicMetadata?.plan as Plan | undefined
  return plan || 'free'
}

export function isPro(publicMetadata?: Record<string, unknown>): boolean {
  const plan = getUserPlan(publicMetadata)
  return plan === 'pro' || plan === 'team'
}

export function isTeam(publicMetadata?: Record<string, unknown>): boolean {
  return getUserPlan(publicMetadata) === 'team'
}

export const FREE_ROW_LIMIT = 10
export const PRO_ROW_LIMIT = 25
export const PRO_EXTENDED_LIMIT = 50
export const FREE_SEASONS: string[] = ['2526', '2425']
