import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserPlan, isScout, isTeam } from '@/lib/plans'
import { mintApiKey, listApiKeys, revokeApiKey } from '@/lib/api-keys'

// Only Scout/Team users may manage API keys
async function requireScout() {
  const { userId } = await auth()
  if (!userId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const meta = user.publicMetadata
  if (!isScout(meta) && !isTeam(meta)) {
    return { error: NextResponse.json({ error: 'API keys require the Scout plan.', plan: getUserPlan(meta) }, { status: 403 }) }
  }
  return { userId }
}

export async function GET() {
  const r = await requireScout()
  if ('error' in r) return r.error
  const keys = await listApiKeys(r.userId)
  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const r = await requireScout()
  if ('error' in r) return r.error
  const body = await req.json().catch(() => ({}))
  const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim().slice(0, 60) : 'API Key'

  // Cap: max 5 active keys per user
  const existing = await listApiKeys(r.userId)
  if (existing.filter(k => !k.revoked).length >= 5) {
    return NextResponse.json({ error: 'Máximo de 5 claves activas. Revoca una antes de crear otra.' }, { status: 400 })
  }

  const minted = await mintApiKey(r.userId, label)
  // plaintext returned ONCE
  return NextResponse.json(minted, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const r = await requireScout()
  if ('error' in r) return r.error
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing key id' }, { status: 400 })
  await revokeApiKey(r.userId, id)
  return NextResponse.json({ ok: true })
}
