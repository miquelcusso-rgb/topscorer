'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'

interface Fixture {
  fixture: { id: number; date: string; status: { short: string }; }
  league: { id: number; name: string; logo: string }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
}

interface MyPick {
  fixture_id: number
  pick: 'home' | 'draw' | 'away'
  status: string
  points: number
  result_home: number | null
  result_away: number | null
}

const LEAGUES: { id: number; name: string; flag: string }[] = [
  { id: 140, name: 'La Liga',        flag: '🇪🇸' },
  { id:  39, name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id:  78, name: 'Bundesliga',     flag: '🇩🇪' },
  { id: 135, name: 'Serie A',        flag: '🇮🇹' },
  { id:  61, name: 'Ligue 1',        flag: '🇫🇷' },
]

export default function PrediccionesClient() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const { isSignedIn } = useUser()
  const isLight = theme === 'light'
  const es = lang === 'es'

  const bg     = isLight ? '#faf8f2' : '#0a0908'
  const card   = isLight ? '#ffffff' : '#15130f'
  const border = isLight ? '#e6dfce' : '#211e18'
  const text1  = isLight ? '#1c1608' : '#f0ebe0'
  const text2  = isLight ? '#6e6655' : '#b5ab95'
  const muted  = isLight ? '#8a7f68' : '#9a917e'

  const [activeLeague, setActiveLeague] = useState(LEAGUES[0])
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [myPicks, setMyPicks] = useState<Record<number, MyPick>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/football/fixtures?league=${activeLeague.id}&season=2025&next=10`)
      .then(r => r.json())
      .then(j => setFixtures(j.ok ? j.data : []))
      .finally(() => setLoading(false))
  }, [activeLeague.id])

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/picks').then(r => r.json()).then(j => {
      const map: Record<number, MyPick> = {}
      for (const p of j.data ?? []) map[p.fixture_id] = p
      setMyPicks(map)
    })
  }, [isSignedIn])

  async function pick(fix: Fixture, choice: 'home' | 'draw' | 'away') {
    setSubmitting(fix.fixture.id)
    try {
      const r = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture_id: fix.fixture.id,
          league_id: fix.league.id,
          pick: choice,
          kickoff: fix.fixture.date,
        }),
      })
      if (r.ok) {
        setMyPicks(prev => ({
          ...prev,
          [fix.fixture.id]: {
            fixture_id: fix.fixture.id,
            pick: choice, status: 'pending', points: 0,
            result_home: null, result_away: null,
          },
        }))
      } else if (r.status === 410) {
        alert(es ? 'El partido ya empezó.' : 'Match has already started.')
      }
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <main style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#00c8b0', textTransform: 'uppercase', marginBottom: 8 }}>
          {es ? 'Comunidad · Predicciones' : 'Community · Predictions'}
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 900, color: text1,
          lineHeight: 1.05, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10,
        }}>
          {es ? 'Picks de la jornada' : 'Matchday picks'}
        </h1>
        <p style={{ fontSize: 14, color: text2, lineHeight: 1.6, marginBottom: 28, maxWidth: 620 }}>
          {es
            ? 'Predice ganador (1·X·2) en cada partido. 3 puntos por acierto. Los puntos suman a tu badge y al ranking semanal.'
            : 'Pick the winner (1·X·2) for each match. 3 points per correct call. Points feed your badge and the weekly leaderboard.'}
        </p>

        {/* League tabs */}
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 22 }}>
          {LEAGUES.map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLeague(l)}
              style={{
                padding: '6px 14px', borderRadius: 999,
                background: activeLeague.id === l.id ? '#00c8b01f' : 'transparent',
                border: `1px solid ${activeLeague.id === l.id ? '#00c8b055' : border}`,
                color: activeLeague.id === l.id ? '#00c8b0' : muted,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5,
              }}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>

        {!isSignedIn && (
          <div style={{ padding: 14, background: 'rgba(0,200,176,.06)', border: '1px dashed rgba(0,200,176,.3)', borderRadius: 8, marginBottom: 18, fontSize: 13, color: text2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span>{es ? 'Inicia sesión para hacer picks.' : 'Sign in to make picks.'}</span>
            <SignInButton mode="modal">
              <button style={{ background: '#00c8b0', color: '#fff', padding: '5px 14px', borderRadius: 5, fontWeight: 700, cursor: 'pointer' }}>
                {es ? 'Entrar' : 'Sign in'}
              </button>
            </SignInButton>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: muted }}>{es ? 'Cargando…' : 'Loading…'}</div>
        ) : fixtures.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: muted }}>{es ? 'Sin partidos próximos.' : 'No upcoming matches.'}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fixtures.map(fix => {
              const my = myPicks[fix.fixture.id]
              const locked = !!my || new Date(fix.fixture.date) <= new Date()
              const date = new Date(fix.fixture.date)
              return (
                <article key={fix.fixture.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span style={{ width: 84, fontSize: 11, color: muted }}>
                      {date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short' })}
                      <br />
                      {date.toLocaleTimeString(lang === 'en' ? 'en-GB' : 'es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: text1, fontWeight: 600, marginBottom: 2 }}>
                        {fix.teams.home.name} <span style={{ color: muted, fontWeight: 400 }}>vs</span> {fix.teams.away.name}
                      </div>
                      {my && (
                        <div style={{ fontSize: 11, color: my.status === 'correct' ? '#38c47a' : my.status === 'wrong' ? '#e03a3a' : '#f0c040' }}>
                          {es ? 'Tu pick' : 'Your pick'}: {my.pick === 'home' ? fix.teams.home.name : my.pick === 'away' ? fix.teams.away.name : (es ? 'Empate' : 'Draw')}
                          {my.status !== 'pending' && my.result_home != null && my.result_away != null && (
                            <span> · {my.result_home}-{my.result_away} ({my.status === 'correct' ? '+3 pts' : '0 pts'})</span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Pick buttons */}
                    <div className="flex items-center gap-1.5">
                      {(['home', 'draw', 'away'] as const).map(c => {
                        const isMine = my?.pick === c
                        const label = c === 'home' ? '1' : c === 'draw' ? 'X' : '2'
                        return (
                          <button
                            key={c}
                            onClick={() => !locked && isSignedIn && pick(fix, c)}
                            disabled={locked || !isSignedIn || submitting === fix.fixture.id}
                            style={{
                              width: 36, height: 36, borderRadius: 6,
                              background: isMine ? '#00c8b0' : 'transparent',
                              color: isMine ? '#fff' : muted,
                              border: `1px solid ${isMine ? '#00c8b0' : border}`,
                              fontSize: 13, fontWeight: 700, cursor: (locked || !isSignedIn) ? 'not-allowed' : 'pointer',
                              fontFamily: "'Bebas Neue', cursive", letterSpacing: 1,
                              opacity: (locked && !isMine) ? 0.4 : 1,
                            }}
                          >{label}</button>
                        )
                      })}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <p style={{ fontSize: 11, color: muted, marginTop: 24, textAlign: 'center' }}>
          {es
            ? 'Los picks se cierran al iniciar el partido. Resultados se resuelven automáticamente cada noche.'
            : 'Picks lock at kickoff. Results resolve automatically every night.'}
          {' · '}
          <Link href={`/${lang}/clasificacion`} style={{ color: muted, textDecoration: 'underline' }}>
            {es ? 'Ver ranking' : 'See leaderboard'}
          </Link>
        </p>
      </div>
    </main>
  )
}
