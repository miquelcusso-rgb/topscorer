'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'
import CommentsThread from '@/components/CommentsThread'

interface Option { key: string; label_es: string; label_en: string }
interface Poll {
  id: string
  question_es: string
  question_en: string
  options: Option[]
  category: string
  ends_at: string
  total_votes: number
  is_featured: boolean
}

interface State {
  poll: Poll | null
  tally: Record<string, number>
  myVote: string | null
  total: number
  loading: boolean
  notFound: boolean
}

export default function EncuestaDetailClient({ id }: { id: string }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const { isSignedIn } = useUser()
  const isLight = theme === 'light'
  const es = lang === 'es'

  const bg     = isLight ? '#f4f6ff' : '#060d18'
  const card   = isLight ? '#ffffff' : '#0d0e1c'
  const border = isLight ? '#d8deef' : '#1a1c2e'
  const text1  = isLight ? '#0f1830' : '#e8e8f8'
  const text2  = isLight ? '#33405e' : '#9aa6c8'
  const muted  = isLight ? '#6070a0' : '#5a5c80'

  const [state, setState] = useState<State>({ poll: null, tally: {}, myVote: null, total: 0, loading: true, notFound: false })
  const [voting, setVoting] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch(`/api/polls/${id}`)
    if (r.status === 404) { setState(s => ({ ...s, loading: false, notFound: true })); return }
    const j = await r.json()
    setState({ poll: j.data, tally: j.tally ?? {}, myVote: j.my_vote ?? null, total: j.total ?? 0, loading: false, notFound: false })
  }, [id])

  useEffect(() => { load() }, [load])

  async function vote(option_key: string) {
    setVoting(true)
    try {
      const r = await fetch(`/api/polls/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_key }),
      })
      if (r.ok) await load()
      else if (r.status === 410) alert(es ? 'Encuesta cerrada' : 'Poll closed')
      else if (r.status === 401) alert(es ? 'Inicia sesión para votar' : 'Sign in to vote')
    } finally {
      setVoting(false)
    }
  }

  if (state.notFound) return (
    <main style={{ background: bg, minHeight: '100vh', padding: 60, textAlign: 'center' }}>
      <p style={{ color: text2 }}>{es ? 'Encuesta no encontrada.' : 'Poll not found.'}</p>
      <Link href={`/${lang}/encuestas`} style={{ color: '#f0c040' }}>← {es ? 'Volver a encuestas' : 'Back to polls'}</Link>
    </main>
  )

  if (state.loading || !state.poll) return (
    <main style={{ background: bg, minHeight: '100vh', padding: 40, textAlign: 'center', color: muted }}>
      {es ? 'Cargando…' : 'Loading…'}
    </main>
  )

  const p = state.poll
  const closed = new Date(p.ends_at) < new Date()
  const total = state.total || 0
  const showResults = !!state.myVote || closed

  return (
    <main style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
        <Link href={`/${lang}/encuestas`} style={{ fontSize: 12, color: muted, display: 'inline-block', marginBottom: 18 }}>
          ← {es ? 'Encuestas' : 'Polls'}
        </Link>

        <article style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 22, marginBottom: 18 }}>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: text1,
            lineHeight: 1.2, letterSpacing: 0.3, marginBottom: 14,
          }}>{es ? p.question_es : p.question_en}</h1>

          <div style={{ fontSize: 11, color: muted, marginBottom: 16 }}>
            🗳️ {total} {es ? 'votos' : 'votes'} · {closed
              ? (es ? 'Cerrada' : 'Closed')
              : (es ? `Cierra ${new Date(p.ends_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
                    : `Closes ${new Date(p.ends_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`)}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {p.options.map(opt => {
              const count = state.tally[opt.key] ?? 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const mine = state.myVote === opt.key
              const label = es ? opt.label_es : opt.label_en

              return showResults ? (
                <div
                  key={opt.key}
                  style={{
                    position: 'relative', padding: '10px 14px', borderRadius: 8,
                    background: card, border: `1px solid ${mine ? '#f0c040' : border}`,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: `${pct}%`,
                    background: mine ? 'rgba(240,192,64,.18)' : 'rgba(154,166,200,.12)',
                    transition: 'width .4s ease',
                  }} />
                  <div className="flex items-center justify-between" style={{ position: 'relative' }}>
                    <span style={{ fontSize: 14, color: text1, fontWeight: mine ? 700 : 500 }}>
                      {mine && '✓ '}{label}
                    </span>
                    <span style={{ fontSize: 13, color: muted, fontFamily: "'Bebas Neue', cursive" }}>
                      {pct}% <span style={{ fontSize: 10, opacity: 0.7 }}>({count})</span>
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  key={opt.key}
                  onClick={() => isSignedIn ? vote(opt.key) : null}
                  disabled={voting || !isSignedIn}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'transparent', border: `1px solid ${border}`,
                    color: text1, fontSize: 14, cursor: isSignedIn ? 'pointer' : 'not-allowed',
                    textAlign: 'left', transition: 'background .15s, border-color .15s',
                  }}
                  onMouseEnter={e => { if (isSignedIn) { e.currentTarget.style.background = 'rgba(240,192,64,.08)'; e.currentTarget.style.borderColor = '#f0c04055' } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = border }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {!isSignedIn && !closed && (
            <div style={{ marginTop: 14, padding: 12, background: 'rgba(240,192,64,.06)', border: '1px dashed rgba(240,192,64,.3)', borderRadius: 8, textAlign: 'center', fontSize: 13, color: text2 }}>
              <SignInButton mode="modal">
                <button style={{ background: '#f0c040', color: '#05060c', padding: '5px 14px', borderRadius: 5, fontWeight: 700, cursor: 'pointer' }}>
                  {es ? 'Entrar para votar' : 'Sign in to vote'}
                </button>
              </SignInButton>
            </div>
          )}
        </article>

        <CommentsThread targetType="poll" targetId={p.id} />
      </div>
    </main>
  )
}
