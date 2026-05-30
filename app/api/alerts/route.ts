import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'
import { isScout } from '@/lib/plans'

// GET /api/alerts → list current user's performance alert subscriptions.
// POST /api/alerts → create one. Body: { player_slug, player_name, alert_type }
// DELETE /api/alerts?id=… → delete by id (must own it).
//
// Scout plan gated.

const ALERT_TYPES = ['goal', 'brace', 'hat_trick', 'assist', 'rating_85'] as const
type AlertType = (typeof ALERT_TYPES)[number]

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sb = createServerClient()
  const { data, error } = await sb
    .from('performance_alerts')
    .select('id, player_slug, player_name, alert_type, enabled, created_at, last_fired_at')
    .eq('clerk_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (!isScout(user?.publicMetadata as Record<string, unknown> | undefined)) {
    return NextResponse.json({ error: 'scout_required' }, { status: 403 })
  }

  const email = user?.emailAddresses?.[0]?.emailAddress
  if (!email) return NextResponse.json({ error: 'no_email' }, { status: 400 })

  const body = (await req.json().catch(() => null)) as
    | { player_slug?: string; player_name?: string; alert_type?: string }
    | null
  if (!body?.player_slug || !body.player_name || !body.alert_type) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
  if (!ALERT_TYPES.includes(body.alert_type as AlertType)) {
    return NextResponse.json({ error: 'invalid_alert_type' }, { status: 400 })
  }

  const sb = createServerClient()

  // Quota: max 50 active alerts per Scout user.
  const { count } = await sb
    .from('performance_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('clerk_id', userId)
    .eq('enabled', true)
  if ((count ?? 0) >= 50) {
    return NextResponse.json({ error: 'quota_exceeded', limit: 50 }, { status: 429 })
  }

  const { data, error } = await sb
    .from('performance_alerts')
    .upsert(
      {
        clerk_id: userId,
        email,
        player_slug: body.player_slug,
        player_name: body.player_name,
        alert_type: body.alert_type,
        enabled: true,
      },
      { onConflict: 'clerk_id,player_slug,alert_type' },
    )
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })

  const sb = createServerClient()
  const { error } = await sb
    .from('performance_alerts')
    .delete()
    .eq('id', Number(id))
    .eq('clerk_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
