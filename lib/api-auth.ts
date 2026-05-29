import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from '@/lib/api-keys'
import { clerkClient } from '@clerk/nextjs/server'
import { getUserPlan } from '@/lib/plans'
import { checkQuota, incrementUsage } from '@/lib/usage'

export interface ApiContext {
  clerkId: string
  keyId: string
  plan: string
}

type Handler = (req: NextRequest, ctx: ApiContext) => Promise<NextResponse> | NextResponse

/**
 * Wrap a public API v1 handler with:
 *  - Bearer API-key authentication
 *  - Scout/Team plan gating (API access is Scout-only)
 *  - Monthly request quota enforcement (see QUOTAS in lib/usage.ts) with usage increment
 *  - Standard rate-limit headers
 */
export function withApiAuth(handler: Handler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // 1. Extract bearer token
    const authHeader = req.headers.get('authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
    if (!token) {
      return errorResponse(401, 'missing_api_key', 'Provide your API key as: Authorization: Bearer <key>')
    }

    // 2. Verify key
    const verified = await verifyApiKey(token)
    if (!verified) {
      return errorResponse(401, 'invalid_api_key', 'The provided API key is invalid or revoked.')
    }

    // 3. Resolve plan from Clerk
    const clerk = await clerkClient()
    let plan = 'free'
    try {
      const user = await clerk.users.getUser(verified.clerkId)
      plan = getUserPlan(user.publicMetadata)
    } catch {
      return errorResponse(403, 'account_error', 'Could not resolve the account for this key.')
    }

    // 4. Gate: API access is Scout/Team only
    const quota = await checkQuota(verified.clerkId, plan as Parameters<typeof checkQuota>[1], 'api_request')
    if (quota.limit === 0) {
      return errorResponse(403, 'plan_required', 'API access requires the Scout plan.')
    }
    if (!quota.allowed) {
      const res = errorResponse(429, 'quota_exceeded', `Monthly API quota of ${quota.limit} requests reached.`)
      res.headers.set('X-RateLimit-Limit', String(quota.limit))
      res.headers.set('X-RateLimit-Remaining', '0')
      return res
    }

    // 5. Count this request, then run handler
    const used = await incrementUsage(verified.clerkId, 'api_request')

    const res = await handler(req, { clerkId: verified.clerkId, keyId: verified.keyId, plan })
    if (quota.limit !== null) {
      res.headers.set('X-RateLimit-Limit', String(quota.limit))
      res.headers.set('X-RateLimit-Remaining', String(Math.max(0, quota.limit - used)))
    }
    return res
  }
}

export function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status })
}

export function jsonResponse(data: unknown, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) })
}
