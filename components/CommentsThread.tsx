'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'
import BadgeChip from '@/components/BadgeChip'
import type { BadgeTier } from '@/lib/badges'

interface Comment {
  id: string
  clerk_id: string
  display_name: string | null
  body: string
  language: 'es' | 'en'
  parent_id: string | null
  likes_count: number
  created_at: string
  tier: BadgeTier
  points: number
}

interface Props {
  targetType: 'rumor' | 'poll'
  targetId: string
}

export default function CommentsThread({ targetType, targetId }: Props) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { user, isLoaded } = useUser()
  const isSignedIn = isLoaded && !!user
  const es = lang === 'es'

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const card    = isLight ? '#ffffff' : '#0d0e1c'
  const border  = isLight ? '#d8deef' : '#1a1c2e'
  const text1   = isLight ? '#0f1830' : '#e8e8f8'
  const text2   = isLight ? '#33405e' : '#9aa6c8'
  const muted   = isLight ? '#6070a0' : '#5a5c80'
  const inputBg = isLight ? '#f4f6ff' : '#07070f'

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch(`/api/comments?target_type=${targetType}&target_id=${targetId}`)
    if (r.ok) {
      const j = await r.json()
      setComments(j.data ?? [])
    }
    setLoading(false)
  }, [targetType, targetId])

  useEffect(() => { load() }, [load])

  async function post() {
    if (!text.trim()) return
    setError(null); setPosting(true)
    try {
      const r = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, body: text, language: lang }),
      })
      if (r.status === 429) {
        setError(es ? 'Espera un momento antes de comentar de nuevo.' : 'Wait a moment before commenting again.')
      } else if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        if (j.reason === 'banned_word')     setError(es ? 'Tu comentario contiene lenguaje no permitido.' : 'Your comment contains disallowed language.')
        else if (j.reason === 'too_many_links') setError(es ? 'Solo se permite un enlace por comentario.' : 'Only one link per comment allowed.')
        else if (j.reason === 'blocked_host')   setError(es ? 'Ese dominio está bloqueado.' : 'That domain is blocked.')
        else if (j.reason === 'too_long')   setError(es ? 'Demasiado largo (máx 800).' : 'Too long (max 800).')
        else setError(es ? 'No se pudo publicar.' : 'Could not post.')
      } else {
        setText('')
        await load()
      }
    } finally {
      setPosting(false)
    }
  }

  async function like(id: string) {
    if (!isSignedIn) return
    const r = await fetch(`/api/comments/${id}/like`, { method: 'POST' })
    if (r.ok) {
      const j = await r.json()
      setComments(prev => prev.map(c => c.id === id ? { ...c, likes_count: j.likes_count } : c))
    }
  }

  async function report(id: string) {
    if (!isSignedIn) return
    const reason = prompt(es ? '¿Por qué reportas este comentario?' : 'Why are you reporting this comment?')
    if (reason === null) return
    const r = await fetch(`/api/comments/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    if (r.ok) alert(es ? 'Reporte enviado, gracias.' : 'Report sent, thanks.')
  }

  async function remove(id: string) {
    if (!confirm(es ? '¿Borrar tu comentario?' : 'Delete your comment?')) return
    const r = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (r.ok) setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <section style={{ marginTop: 32 }}>
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 20, fontWeight: 700, color: text1,
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
          borderBottom: `1px solid ${border}`, paddingBottom: 6,
        }}
      >
        {es ? `Comentarios (${comments.length})` : `Comments (${comments.length})`}
      </h2>

      {/* Compose */}
      {isSignedIn ? (
        <div style={{ marginBottom: 18 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={es ? 'Comparte tu opinión…' : 'Share your take…'}
            maxLength={800}
            rows={3}
            style={{
              width: '100%',
              background: inputBg,
              border: `1px solid ${border}`,
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              color: text1,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div className="flex items-center justify-between gap-3" style={{ marginTop: 6 }}>
            <span style={{ fontSize: 11, color: muted }}>
              {text.length}/800 · {es ? 'sin spam, sin links acortados' : 'no spam, no shortened links'}
            </span>
            <button
              onClick={post}
              disabled={posting || !text.trim()}
              style={{
                background: '#f0c040', color: '#05060c',
                padding: '6px 18px', borderRadius: 6,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                letterSpacing: 0.5, cursor: 'pointer',
                opacity: posting || !text.trim() ? 0.5 : 1,
              }}
            >
              {posting ? (es ? 'Publicando…' : 'Posting…') : (es ? 'Publicar' : 'Post')}
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: '#e03a3a', marginTop: 6 }}>{error}</div>}
        </div>
      ) : (
        <div
          style={{
            padding: '14px 16px', borderRadius: 8,
            background: card, border: `1px solid ${border}`,
            marginBottom: 18, fontSize: 13, color: text2,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
          }}
        >
          <span>{es ? 'Inicia sesión para comentar.' : 'Sign in to comment.'}</span>
          <SignInButton mode="modal">
            <button
              style={{
                background: '#f0c040', color: '#05060c',
                padding: '5px 14px', borderRadius: 5,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: 0.5, cursor: 'pointer',
              }}
            >
              {es ? 'Entrar' : 'Sign in'}
            </button>
          </SignInButton>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: muted, fontSize: 13 }}>
          {es ? 'Cargando…' : 'Loading…'}
        </div>
      ) : comments.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: muted, fontSize: 13, background: card, border: `1px dashed ${border}`, borderRadius: 8 }}>
          {es ? 'Sé el primero en comentar.' : 'Be the first to comment.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map(c => (
            <article
              key={c.id}
              style={{ background: card, border: `1px solid ${border}`, borderRadius: 8, padding: '12px 14px' }}
            >
              <header className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 6 }}>
                <strong style={{ fontSize: 13, color: text1, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.3 }}>
                  {c.display_name ?? (es ? 'Futbolero' : 'Footy fan')}
                </strong>
                <BadgeChip tier={c.tier} lang={lang} compact />
                <span style={{ fontSize: 10, color: muted, marginLeft: 'auto' }}>
                  {new Date(c.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'es-ES', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </header>
              <p style={{ fontSize: 14, color: text2, lineHeight: 1.55, whiteSpace: 'pre-wrap', margin: 0 }}>{c.body}</p>
              <footer className="flex items-center gap-3" style={{ marginTop: 8 }}>
                <button
                  onClick={() => like(c.id)}
                  disabled={!isSignedIn}
                  style={{ fontSize: 11, color: muted, background: 'transparent', cursor: isSignedIn ? 'pointer' : 'not-allowed' }}
                >
                  ♥ {c.likes_count}
                </button>
                <button
                  onClick={() => report(c.id)}
                  disabled={!isSignedIn}
                  style={{ fontSize: 11, color: muted, background: 'transparent', cursor: isSignedIn ? 'pointer' : 'not-allowed' }}
                >
                  ⚐ {es ? 'Reportar' : 'Report'}
                </button>
                {isSignedIn && user?.id === c.clerk_id && (
                  <button
                    onClick={() => remove(c.id)}
                    style={{ fontSize: 11, color: '#e03a3a', background: 'transparent', cursor: 'pointer', marginLeft: 'auto' }}
                  >
                    {es ? 'Borrar' : 'Delete'}
                  </button>
                )}
              </footer>
            </article>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: muted, marginTop: 14, textAlign: 'center' }}>
        {es
          ? 'Modera con sentido. 3 reportes ocultan un comentario automáticamente.'
          : 'Keep it civil. 3 reports auto-hide a comment.'}
        {' · '}
        <Link href={`/${lang}/wiki`} style={{ color: muted, textDecoration: 'underline' }}>
          {es ? 'Cómo funcionan los badges' : 'How badges work'}
        </Link>
      </p>
    </section>
  )
}
