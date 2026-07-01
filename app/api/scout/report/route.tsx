import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { resolvePlayerProfile } from '@/lib/resolve-player'
import { getUserPlan } from '@/lib/plans'
import { iig, leagueCoef } from '@/lib/iig'
import { seasonShort } from '@/lib/season'

// Scout-tier per-player PDF scouting report. Node runtime (react-pdf). Gated on
// the Scout plan. Built from the same static/real stats the fiche uses — no
// external call. Author/brand: Furiosa Studio.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GOLD = '#b8860b'
const s = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: '#1a1a1a', fontFamily: 'Helvetica' },
  eyebrow: { fontSize: 9, letterSpacing: 2, color: GOLD, textTransform: 'uppercase' },
  h1: { fontSize: 26, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  sub: { fontSize: 11, color: '#555', marginTop: 2 },
  section: { marginTop: 22 },
  secTitle: { fontSize: 10, letterSpacing: 1.5, color: '#888', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Helvetica-Bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: '1px solid #eee' },
  bigNum: { fontSize: 34, fontFamily: 'Helvetica-Bold', color: GOLD },
  compRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  footer: { position: 'absolute', bottom: 28, left: 40, right: 40, fontSize: 8, color: '#999', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 8 },
})

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  if (getUserPlan(user.publicMetadata) !== 'scout') {
    return NextResponse.json({ error: 'Scout plan required' }, { status: 403 })
  }

  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 })
  const resolved = await resolvePlayerProfile(slug)
  if (!resolved) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const p = resolved.base
  const coef = leagueCoef(p.league)
  const goles = p.goles ?? 0, asist = p.asist ?? 0
  const rating = typeof p.rating === 'number' && p.rating > 0 ? p.rating : 0
  const r1 = (v: number) => Math.round(v * 10) / 10
  const generated = new Date().toISOString().slice(0, 10)

  const trend = (resolved.seasons ?? [])
    .filter(x => x.season)
    .map(x => ({ code: x.season as string, iig: iig(x) }))
    .filter((x, i, a) => a.findIndex(y => y.code === x.code) === i)
    .sort((a, b) => a.code.localeCompare(b.code))

  const stat = (label: string, value: string | number) => (
    <View style={s.row}><Text>{label}</Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>{value}</Text></View>
  )

  const doc = (
    <Document author="Furiosa Studio" title={`Scout report — ${p.fullName || p.name}`}>
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>TopScorers · Scout report</Text>
        <Text style={s.h1}>{p.fullName || p.name}</Text>
        <Text style={s.sub}>{[p.club, p.league, p.position, p.nationality].filter(Boolean).join('  ·  ')}{p.age ? `  ·  ${p.age}` : ''}</Text>

        <View style={s.section}>
          <Text style={s.secTitle}>Índice de Impacto del Goleador (IIG)</Text>
          <Text style={s.bigNum}>{iig(p)}</Text>
          <View style={{ marginTop: 10 }}>
            <View style={s.compRow}><Text>Finalización (goles × coef. liga: {goles} × {coef.toFixed(2)})</Text><Text style={{ fontFamily: 'Helvetica-Bold', color: GOLD }}>+{r1(goles * coef)}</Text></View>
            <View style={s.compRow}><Text>Calidad ((nota − 6) × 3{rating ? `: (${rating.toFixed(2)} − 6) × 3` : ''})</Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>+{r1(rating ? (rating - 6) * 3 : 0)}</Text></View>
            <View style={s.compRow}><Text>Creación (asistencias × 0,5: {asist} × 0,5)</Text><Text style={{ fontFamily: 'Helvetica-Bold' }}>+{r1(asist * 0.5)}</Text></View>
            <View style={s.compRow}><Text>Coeficiente de liga</Text><Text>{p.league} · {coef.toFixed(2)}</Text></View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.secTitle}>Temporada</Text>
          {stat('Goles', goles)}
          {stat('Asistencias', asist)}
          {stat('Partidos', p.pj ?? 0)}
          {rating ? stat('Nota media', rating.toFixed(2)) : null}
          {p.minutes ? stat('Minutos', p.minutes) : null}
          {p.marketValue ? stat('Valor de mercado (curado)', p.marketValue) : null}
        </View>

        {trend.length >= 2 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Tendencia IIG por temporada</Text>
            {trend.map(t => (
              <View key={t.code} style={s.compRow}><Text>{seasonShort(t.code)}</Text><Text style={{ fontFamily: 'Helvetica-Bold', color: GOLD }}>{t.iig}</Text></View>
            ))}
          </View>
        )}

        <Text style={s.footer}>Generado el {generated} · IIG y estadísticas de temporada reales · por Furiosa Studio · top-scorers.com</Text>
      </Page>
    </Document>
  )

  const buffer = await renderToBuffer(doc)
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="scout-report-${slug}.pdf"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
