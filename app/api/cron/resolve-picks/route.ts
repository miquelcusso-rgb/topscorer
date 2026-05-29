import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Daily cron: resolves user picks whose fixture has finished.
 *  - Fetches pending picks whose kickoff < now() - 90 min
 *  - Batches per fixture_id (deduped) and queries API-Football for results
 *  - For each finished fixture, calls SQL fn resolve_pick() per user pick
 */

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const fromHeader = req.headers.get('authorization')
  if (fromHeader === `Bearer ${expected}`) return true
  const url = new URL(req.url)
  return url.searchParams.get('secret') === expected
}

interface ApiFixture {
  fixture: { id: number; status: { short: string } }
  goals: { home: number | null; away: number | null }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) return NextResponse.json({ error: 'missing_api_football_key' }, { status: 500 })

  const sb = createServerClient()
  const cutoff = new Date(Date.now() - 90 * 60_000).toISOString()
  const { data: pending } = await sb
    .from('picks')
    .select('id, fixture_id, clerk_id')
    .eq('status', 'pending')
    .lt('kickoff', cutoff)
    .limit(500)

  if (!pending || pending.length === 0) {
    return NextResponse.json({ ok: true, resolved: 0, note: 'no_pending_picks' })
  }

  // Dedup fixtures
  const fixtureIds = Array.from(new Set(pending.map(p => p.fixture_id)))
  const results = new Map<number, { home: number; away: number }>()

  // API-Football: /fixtures?id=X-Y-Z (max ~20)
  for (let i = 0; i < fixtureIds.length; i += 20) {
    const batch = fixtureIds.slice(i, i + 20)
    try {
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?ids=${batch.join('-')}`, {
        headers: { 'x-apisports-key': apiKey },
      })
      if (!res.ok) continue
      const json = (await res.json()) as { response?: ApiFixture[] }
      for (const f of json.response ?? []) {
        if (['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
            && f.goals.home != null && f.goals.away != null) {
          results.set(f.fixture.id, { home: f.goals.home, away: f.goals.away })
        }
      }
    } catch {
      // continue
    }
  }

  // Resolve each pending pick whose fixture has a result
  let resolved = 0
  for (const p of pending) {
    const r = results.get(p.fixture_id)
    if (!r) continue
    const { error } = await sb.rpc('resolve_pick', { p_pick_id: p.id, p_home: r.home, p_away: r.away })
    if (!error) resolved++
  }

  return NextResponse.json({ ok: true, pending: pending.length, finished_fixtures: results.size, resolved })
}
