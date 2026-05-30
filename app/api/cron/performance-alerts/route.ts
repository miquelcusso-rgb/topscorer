import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendPerformanceAlert } from '@/lib/email'
import { PLAYERS } from '@/data/players'
import { slugify } from '@/lib/slugify'

// Performance Alerts cron — Scout feature.
// Schedule: ideally every 30 min during match days. For MVP we keep it cheap
// and run hourly (vercel.json: `0 * * * *`).
//
// Strategy (MVP, no live API call here): compare current-season stats in our
// dataset against the last alert event for each subscribed player. If the
// player's goals/assists/rating crossed an alert threshold since the last
// event, fire one email (idempotent via performance_alert_events).
//
// Future: replace with API-Football live feed for true match-event triggers.

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const h = req.headers.get('authorization')
  if (h === `Bearer ${expected}`) return true
  return new URL(req.url).searchParams.get('secret') === expected
}

interface AlertRow {
  id: number
  clerk_id: string
  email: string
  player_slug: string
  player_name: string
  alert_type: 'goal' | 'brace' | 'hat_trick' | 'assist' | 'rating_85'
  enabled: boolean
  last_fired_at: string | null
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sb = createServerClient()

  const { data: alerts, error } = await sb
    .from('performance_alerts')
    .select('id, clerk_id, email, player_slug, player_name, alert_type, enabled, last_fired_at')
    .eq('enabled', true)
    .limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: 'no_active_alerts' })
  }

  // Index current-season players by slug for quick lookup.
  const bySlug = new Map<string, (typeof PLAYERS)[number]>()
  for (const p of PLAYERS) {
    if (p.season === '2526') bySlug.set(slugify(p.name), p)
  }

  // Synthetic "match_id" for MVP: anchor on current dataset goals total. This
  // makes the alert idempotent until the player's goals increase next time
  // data is refreshed.
  let sent = 0
  const errors: string[] = []

  for (const a of alerts as AlertRow[]) {
    const p = bySlug.get(a.player_slug)
    if (!p) continue
    const matchId = `goals_${p.goles}_assists_${p.asist}`

    const trigger =
      (a.alert_type === 'goal'      && p.goles >= 1) ||
      (a.alert_type === 'brace'     && p.goles >= 2) ||
      (a.alert_type === 'hat_trick' && p.goles >= 3) ||
      (a.alert_type === 'assist'    && p.asist >= 1) ||
      (a.alert_type === 'rating_85' && (p.rating ?? 0) >= 8.5)
    if (!trigger) continue

    // Idempotency check.
    const { data: existing } = await sb
      .from('performance_alert_events')
      .select('id')
      .eq('player_slug', a.player_slug)
      .eq('match_id', matchId)
      .eq('alert_type', a.alert_type)
      .maybeSingle()
    if (existing) continue

    try {
      await sendPerformanceAlert({
        to: a.email,
        playerName: a.player_name,
        playerSlug: a.player_slug,
        alertType: a.alert_type,
        matchInfo: `${p.club} · ${p.league}`,
        goals: p.goles,
        assists: p.asist,
        rating: p.rating,
      })
      await sb.from('performance_alert_events').insert({
        player_slug: a.player_slug,
        match_id: matchId,
        alert_type: a.alert_type,
        details: { club: p.club, league: p.league, goals: p.goles, assists: p.asist },
      })
      await sb
        .from('performance_alerts')
        .update({ last_fired_at: new Date().toISOString() })
        .eq('id', a.id)
      sent++
    } catch (e) {
      errors.push(`${a.player_slug}/${a.alert_type}: ${(e as Error).message}`)
    }
  }

  return NextResponse.json({ ok: true, sent, errors: errors.slice(0, 10), considered: alerts.length })
}
