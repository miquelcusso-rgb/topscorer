import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'

// Vercel cron secret: set CRON_SECRET in env; Vercel auto-injects via Authorization header.
// We also accept ?secret=<CRON_SECRET> for manual runs.

interface ApiFootballTransfer {
  player: { id: number; name: string }
  transfers: Array<{
    date: string
    type: string                  // 'Free', 'Loan', 'N/A', or fee like 'EUR 80m'
    teams: { in: { id: number; name: string; logo: string }; out: { id: number; name: string; logo: string } }
  }>
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const fromHeader = req.headers.get('authorization')
  if (fromHeader === `Bearer ${expected}`) return true
  const url = new URL(req.url)
  return url.searchParams.get('secret') === expected
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) return NextResponse.json({ error: 'missing_api_football_key' }, { status: 500 })

  // Pull recent transfers from API-Football across the leagues we cover.
  // Free tier: limit to a small set to stay within quota.
  const leagueIds = [39, 140, 78, 135, 61] // PL, La Liga, BL, SA, L1
  const upserts: Array<{
    player_name: string
    player_slug: string
    from_club: string | null
    to_club: string | null
    league: string | null
    source: string
    likelihood: number
    status: string
    fee_estimate: string | null
    last_seen_at: string
  }> = []

  for (const lid of leagueIds) {
    try {
      const res = await fetch(`https://v3.football.api-sports.io/transfers?league=${lid}&season=2025`, {
        headers: { 'x-apisports-key': apiKey },
        next: { revalidate: 21600 },
      })
      if (!res.ok) continue
      const json = (await res.json()) as { response?: ApiFootballTransfer[] }
      const items = json.response ?? []
      for (const item of items.slice(0, 12)) {
        const t = item.transfers?.[0]
        if (!t) continue
        const fee = t.type && /^EUR/i.test(t.type) ? t.type.replace(/^EUR\s*/i, '€').toUpperCase() : null
        upserts.push({
          player_name: item.player.name,
          player_slug: slugify(item.player.name),
          from_club: t.teams?.out?.name ?? null,
          to_club: t.teams?.in?.name ?? null,
          league: null,
          source: 'api-football',
          likelihood: t.type?.toLowerCase().includes('loan') ? 70 : 85,
          status: 'confirmed',
          fee_estimate: fee,
          last_seen_at: new Date().toISOString(),
        })
      }
    } catch {
      // swallow per-league errors; keep going
    }
  }

  if (!upserts.length) return NextResponse.json({ ok: true, upserted: 0, note: 'no transfers fetched' })

  const sb = createServerClient()
  // Manual dedup-or-touch (rumors has a partial unique index on player+from+to+source)
  let upserted = 0
  for (const u of upserts) {
    const { data: existing } = await sb
      .from('rumors')
      .select('id, last_seen_at')
      .eq('player_name', u.player_name)
      .eq('source', u.source)
      .eq('is_active', true)
      .maybeSingle()
    if (existing) {
      await sb.from('rumors').update({ last_seen_at: u.last_seen_at, status: u.status, likelihood: u.likelihood }).eq('id', existing.id)
    } else {
      await sb.from('rumors').insert(u)
      upserted++
    }
  }

  return NextResponse.json({ ok: true, upserted, scanned_leagues: leagueIds.length })
}
