import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendWeeklyDigest } from '@/lib/email'
import { PLAYERS } from '@/data/players'

/** Sunday morning weekly digest cron. */
function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const fromHeader = req.headers.get('authorization')
  if (fromHeader === `Bearer ${expected}`) return true
  return new URL(req.url).searchParams.get('secret') === expected
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sb = createServerClient()

  // 1. Get subscribers due for a digest (last_sent_at null or > 6 days ago)
  const sixDaysAgo = new Date(Date.now() - 6 * 86_400_000).toISOString()
  const { data: subs, error: subsErr } = await sb
    .from('newsletter_subscriptions')
    .select('clerk_id, email, language, last_sent_at')
    .eq('enabled', true)
    .or(`last_sent_at.is.null,last_sent_at.lt.${sixDaysAgo}`)
    .limit(200)
  if (subsErr) return NextResponse.json({ error: subsErr.message }, { status: 500 })
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: 'no_subscribers_due' })
  }

  // 2. Common payload pieces (cached): top rumor + featured poll
  const [{ data: rumorRow }, { data: pollRow }] = await Promise.all([
    sb.from('rumors').select('id, headline_es, headline_en, from_club, to_club, likelihood')
      .eq('is_active', true).order('likelihood', { ascending: false }).limit(1).maybeSingle(),
    sb.from('polls').select('id, question_es, question_en, total_votes')
      .eq('is_active', true).eq('is_featured', true).gt('ends_at', new Date().toISOString())
      .order('starts_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  // Index static players for quick watchlist hydration (G+A snapshot per name+season)
  const playerIndex = new Map<string, { goals: number; assists: number; club: string }>()
  for (const p of PLAYERS) {
    playerIndex.set(`${p.name}::${p.season}`, { goals: p.goles, assists: p.asist, club: p.club })
  }

  let sent = 0
  let failed = 0
  for (const sub of subs) {
    try {
      // Fetch user's watchlist (top 5)
      const { data: wl } = await sb
        .from('watchlists')
        .select('player_name, season')
        .eq('clerk_id', sub.clerk_id)
        .order('created_at', { ascending: false })
        .limit(5)

      const watchlistRows = (wl ?? []).map(w => {
        const stat = playerIndex.get(`${w.player_name}::${w.season}`)
        return {
          player_name: w.player_name,
          club: stat?.club,
          goals: stat?.goals,
          assists: stat?.assists,
        }
      })

      // Recipient name from email local part as fallback
      const nameFallback = sub.email.split('@')[0]
      const lang = (sub.language === 'en' ? 'en' : 'es') as 'es' | 'en'

      await sendWeeklyDigest({
        to: sub.email,
        name: nameFallback,
        lang,
        watchlistRows,
        topRumor: rumorRow ? {
          headline: (lang === 'es' ? rumorRow.headline_es : rumorRow.headline_en) ?? 'Rumor',
          from_club: rumorRow.from_club ?? undefined,
          to_club: rumorRow.to_club ?? undefined,
          likelihood: rumorRow.likelihood,
          url: `https://www.top-scorers.com/${lang}/rumores/${rumorRow.id}`,
        } : undefined,
        featuredPoll: pollRow ? {
          question: (lang === 'es' ? pollRow.question_es : pollRow.question_en),
          url: `https://www.top-scorers.com/${lang}/encuestas/${pollRow.id}`,
          total_votes: pollRow.total_votes ?? 0,
        } : undefined,
      })

      // Stamp last_sent_at
      await sb.from('newsletter_subscriptions')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('clerk_id', sub.clerk_id)
      sent++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total_due: subs.length })
}
