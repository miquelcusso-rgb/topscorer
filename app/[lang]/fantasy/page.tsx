import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const es = lang === 'es'
  return {
    title: es ? 'Fantasy · TopScorers' : 'Fantasy · TopScorers',
    description: es
      ? 'Crea tu equipo Fantasy con 5 jugadores reales. Puntos automáticos por goles y asistencias cada semana.'
      : 'Build a 5-player Fantasy team. Real-world goals and assists score points every week.',
    alternates: {
      canonical: `/${lang}/fantasy`,
      languages: { es: '/es/fantasy', en: '/en/fantasy' },
    },
  }
}

interface TeamRow {
  team_name: string
  points_total: number
  fantasy_team_picks: Array<{ player_name: string; slot: number; captain: boolean; points: number }>
}

export default async function FantasyLanding({ params }: Props) {
  const { lang } = await params
  const es = lang === 'es'
  const { userId } = await auth()

  let myTeam: TeamRow | null = null
  if (userId) {
    const sb = createServerClient()
    const { data } = await sb
      .from('fantasy_teams')
      .select('team_name, points_total, fantasy_team_picks(player_name, slot, captain, points)')
      .eq('clerk_id', userId)
      .eq('season', '2526')
      .maybeSingle()
    myTeam = (data as unknown) as TeamRow | null
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', color: '#eef4ff' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f0c040' }}>
        TopScorers · Fantasy Lite
      </div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.01em', margin: '12px 0 8px' }}>
        {es ? 'Tu equipo, tus puntos' : 'Your team, your points'}
      </h1>
      <p style={{ fontSize: 16, color: '#9aa3b8', lineHeight: 1.55, marginBottom: 28, maxWidth: 640 }}>
        {es
          ? 'Pick 5 jugadores reales del Top 5 europeo + las ligas extra. Goles, asistencias y rating cuentan automáticamente cada semana. Capitán = ×2 puntos.'
          : 'Pick 5 real players from Europe Top-5 + extra leagues. Goals, assists and match rating auto-score every week. Captain = 2× points.'}
      </p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: es ? 'Goles' : 'Goals',     points: 4, color: '#f0c040' },
          { label: es ? 'Asistencias' : 'Assists',  points: 3, color: '#3ed6c2' },
          { label: es ? 'Nota ≥7' : 'Rating ≥7', points: 2, color: '#eef4ff' },
          { label: es ? 'Capitán' : 'Captain',  points: '×2', color: '#f0c040' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 10, color: '#9aa3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 6 }}>
              {s.points}
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
              {typeof s.points === 'number' ? (es ? 'puntos' : 'points') : ''}
            </div>
          </div>
        ))}
      </section>

      {myTeam ? (
        <section style={{ background: '#0c0d18', border: '1px solid rgba(240,192,64,.18)', borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#f0c040', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {es ? 'Tu equipo' : 'Your team'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{myTeam.team_name}</h2>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 800, color: '#f0c040' }}>
              {myTeam.points_total}
              <span style={{ fontSize: 13, color: '#9aa3b8', marginLeft: 8 }}>pts</span>
            </div>
          </div>
          <ul style={{ marginTop: 18, padding: 0, listStyle: 'none' }}>
            {myTeam.fantasy_team_picks?.sort((a, b) => a.slot - b.slot).map(p => (
              <li key={p.slot} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <span>
                  {p.captain ? <span style={{ color: '#f0c040', marginRight: 8, fontWeight: 700 }}>C</span> : null}
                  {p.player_name}
                </span>
                <span style={{ color: '#9aa3b8', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700 }}>
                  {p.points}
                </span>
              </li>
            ))}
          </ul>
          <Link href={`/${lang}/fantasy/team`} style={{ display: 'inline-block', marginTop: 18, background: '#f0c040', color: '#060d18', padding: '10px 22px', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}>
            {es ? 'Editar equipo' : 'Edit team'} →
          </Link>
        </section>
      ) : (
        <section style={{ background: '#0c0d18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>
            {es ? 'Aún no tienes equipo' : 'You don\'t have a team yet'}
          </h2>
          <p style={{ color: '#9aa3b8', fontSize: 14, lineHeight: 1.55 }}>
            {es ? 'Crea uno gratis. Solo necesitas cuenta TopScorers.' : 'Build one for free. Just needs a TopScorers account.'}
          </p>
          <Link href={`/${lang}/fantasy/team`} style={{ display: 'inline-block', background: '#f0c040', color: '#060d18', padding: '10px 22px', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}>
            {es ? 'Crear equipo' : 'Build my team'} →
          </Link>
        </section>
      )}

      <p style={{ fontSize: 12, color: '#475569' }}>by Furiosa Studio</p>
    </main>
  )
}
