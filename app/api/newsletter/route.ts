import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET → my subscription state
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = createServerClient()
  const { data } = await sb.from('newsletter_subscriptions').select('enabled, language').eq('clerk_id', userId).maybeSingle()
  return NextResponse.json({ enabled: data?.enabled ?? false, language: data?.language ?? 'es' })
}

// POST → opt in/out  body: { enabled: boolean, language?: 'es' | 'en' }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const enabled = body.enabled === true
  const language = body.language === 'en' ? 'en' : 'es'

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const email = user.emailAddresses[0]?.emailAddress
  if (!email) return NextResponse.json({ error: 'no_email_on_account' }, { status: 400 })

  const sb = createServerClient()
  const { error } = await sb.from('newsletter_subscriptions').upsert({
    clerk_id: userId, email, language, enabled,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, enabled, language })
}
