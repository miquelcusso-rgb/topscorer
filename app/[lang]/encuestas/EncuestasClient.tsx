'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'

interface PollOption { key: string; label_es: string; label_en: string }
interface Poll {
  id: string
  question_es: string
  question_en: string
  options: PollOption[]
  category: string
  starts_at: string
  ends_at: string
  total_votes: number
  is_featured: boolean
}

export default function EncuestasClient() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const es = lang === 'es'

  const bg     = isLight ? '#f4f6ff' : '#060d18'
  const card   = isLight ? '#ffffff' : '#0d0e1c'
  const cardHi = isLight ? '#fffdf2' : '#1a1500'
  const border = isLight ? '#d8deef' : '#1a1c2e'
  const text1  = isLight ? '#0f1830' : '#e8e8f8'
  const text2  = isLight ? '#33405e' : '#9aa6c8'
  const muted  = isLight ? '#6070a0' : '#5a5c80'

  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/polls').then(r => r.json()).then(j => setPolls(j.data ?? [])).finally(() => setLoading(false))
  }, [])

  const featured = polls.find(p => p.is_featured) ?? polls[0]
  const rest = polls.filter(p => p !== featured)

  function timeLeft(ends_at: string) {
    const ms = new Date(ends_at).getTime() - Date.now()
    if (ms <= 0) return es ? 'Cerrada' : 'Closed'
    const d = Math.floor(ms / 86_400_000)
    const h = Math.floor((ms / 3_600_000) % 24)
    if (d > 0) return es ? `Cierra en ${d}d ${h}h` : `Closes in ${d}d ${h}h`
    return es ? `Cierra en ${h}h` : `Closes in ${h}h`
  }

  return (
    <main style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#f0c040', textTransform: 'uppercase', marginBottom: 8 }}>
          {es ? 'Comunidad · Encuestas' : 'Community · Polls'}
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 900, color: text1, lineHeight: 1.05, letterSpacing: 1.5,
          textTransform: 'uppercase', marginBottom: 10,
        }}>
          {es ? 'Las encuestas de la semana' : 'This week’s polls'}
        </h1>
        <p style={{ fontSize: 14, color: text2, lineHeight: 1.6, marginBottom: 28, maxWidth: 620 }}>
          {es
            ? 'Vota, pica con la comunidad, suma puntos y sube de badge. Cada lunes generamos nuevas preguntas.'
            : 'Vote, banter with the community, earn points and level up. New questions every Monday.'}
        </p>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: muted }}>{es ? 'Cargando…' : 'Loading…'}</div>
        ) : polls.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: muted }}>{es ? 'No hay encuestas activas.' : 'No active polls.'}</div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <Link
                href={`/${lang}/encuestas/${featured.id}`}
                style={{ textDecoration: 'none', display: 'block', marginBottom: 18 }}
              >
                <article style={{
                  background: cardHi, border: `1px solid #f0c04055`,
                  borderRadius: 12, padding: 24,
                  boxShadow: '0 6px 30px rgba(240,192,64,.08)',
                }}>
                  <div style={{ fontSize: 10, color: '#f0c040', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                    {es ? '★ Encuesta destacada' : '★ Featured'}
                  </div>
                  <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 'clamp(22px, 3.4vw, 30px)', fontWeight: 700, color: text1,
                    lineHeight: 1.2, letterSpacing: 0.3, marginBottom: 12,
                  }}>
                    {es ? featured.question_es : featured.question_en}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: 12, color: muted }}>
                    <span>🗳️ {featured.total_votes} {es ? 'votos' : 'votes'}</span>
                    <span>· {timeLeft(featured.ends_at)}</span>
                    <span style={{ marginLeft: 'auto', color: '#f0c040', fontWeight: 700 }}>
                      {es ? 'Votar →' : 'Vote →'}
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Grid of remaining polls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rest.map(p => (
                <Link
                  key={p.id}
                  href={`/${lang}/encuestas/${p.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <article style={{
                    background: card, border: `1px solid ${border}`,
                    borderRadius: 10, padding: 16, height: '100%',
                  }}>
                    <h3 style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 16, fontWeight: 700, color: text1,
                      lineHeight: 1.25, letterSpacing: 0.2, marginBottom: 10,
                    }}>
                      {es ? p.question_es : p.question_en}
                    </h3>
                    <div className="flex items-center gap-2" style={{ fontSize: 11, color: muted }}>
                      <span>🗳️ {p.total_votes}</span>
                      <span>·</span>
                      <span>{timeLeft(p.ends_at)}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}

        <p style={{ fontSize: 11, color: muted, marginTop: 28, textAlign: 'center' }}>
          {es
            ? 'Cada voto suma 1 punto a tu badge. Empieza en Amateur y sube hasta Estratosférico.'
            : 'Each vote earns 1 point towards your badge. Start at Amateur, climb to Stratospheric.'}
        </p>
      </div>
    </main>
  )
}
