import { auth, currentUser } from '@clerk/nextjs/server'
import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { rankScore, iig } from '@/lib/iig'
import { isScout } from '@/lib/plans'

// GET /api/export → current-season dataset as a CSV download. Scout-gated.
// Server-side (no client data plumbing); one row per tracked player, ranked by
// impact, with the IIG index included. Author: Furiosa Studio.
export const dynamic = 'force-dynamic'

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('unauthorized', { status: 401 })
  const user = await currentUser()
  if (!isScout(user?.publicMetadata as Record<string, unknown> | undefined)) {
    return new Response('scout_required', { status: 403 })
  }

  const rows = (Array.isArray(PRIMARY_PLAYERS) ? PRIMARY_PLAYERS : [])
    .filter(p => p && p.season === '2526')
    .sort((a, b) => rankScore(b) - rankScore(a))

  const headers = ['Rank', 'Nombre', 'Club', 'Liga', 'País', 'Posición', 'Edad', 'PJ', 'Goles', 'Asistencias', 'Valoración', 'G/PJ', 'IIG']
  const body = rows.map((p, i) => [
    i + 1, p.name, p.club, p.league, p.nationality ?? '', p.position ?? '', p.age ?? '',
    p.pj ?? 0, p.goles ?? 0, p.asist ?? 0, p.rating ?? '',
    p.pj ? (p.goles / p.pj).toFixed(2) : '0', iig(p),
  ].map(csvCell).join(','))

  const csv = '﻿' + [headers.map(csvCell).join(','), ...body].join('\n')
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv;charset=utf-8;',
      'Content-Disposition': 'attachment; filename="topscorers-scout-export.csv"',
    },
  })
}
