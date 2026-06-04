'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'
import CommentsThread from '@/components/CommentsThread'

interface Rumor {
  id: string
  player_name: string
  player_slug: string | null
  from_club: string | null
  to_club: string | null
  league: string | null
  likelihood: number
  status: 'rumor' | 'agreed' | 'confirmed' | 'failed'
  headline_es: string | null
  headline_en: string | null
  summary_es: string | null
  summary_en: string | null
  fee_estimate: string | null
  comments_count: number
  views_count: number
  last_seen_at: string
}

const STATUS: Record<string, { es: string; en: string; color: string }> = {
  rumor:     { es: 'Rumor',      en: 'Rumour',    color: '#b5ab95' },
  agreed:    { es: 'Acordado',   en: 'Agreed',    color: '#f0c040' },
  confirmed: { es: 'Confirmado', en: 'Confirmed', color: '#38c47a' },
  failed:    { es: 'Descartado', en: 'Failed',    color: '#e03a3a' },
}

export default function RumorDetailClient({ id }: { id: string }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const es = lang === 'es'

  const bg     = isLight ? '#f8f7f3' : '#0a0908'
  const card   = isLight ? '#ffffff' : '#15130f'
  const border = isLight ? '#e6dfce' : '#2a2620'
  const text1  = isLight ? '#1c1608' : '#efe9dc'
  const text2  = isLight ? '#6e6655' : '#b5ab95'
  const muted  = isLight ? '#8a7f68' : '#9a917e'

  const [rumor, setRumor] = useState<Rumor | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/rumors/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then(j => { if (j?.data) setRumor(j.data) })
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return (
    <main style={{ background: bg, minHeight: '100vh', padding: '60px 20px', textAlign: 'center' }}>
      <p style={{ color: text2 }}>{es ? 'Rumor no encontrado.' : 'Rumour not found.'}</p>
      <Link href={`/${lang}/rumores`} style={{ color: '#f0c040', marginTop: 10, display: 'inline-block' }}>
        ← {es ? 'Volver al mercado' : 'Back to market'}
      </Link>
    </main>
  )

  if (loading || !rumor) return (
    <main style={{ background: bg, minHeight: '100vh', padding: 40, textAlign: 'center', color: muted }}>
      {es ? 'Cargando…' : 'Loading…'}
    </main>
  )

  const headline = (es ? rumor.headline_es : rumor.headline_en) ?? `${rumor.player_name}: ${rumor.from_club} → ${rumor.to_club}`
  const summary  = es ? rumor.summary_es : rumor.summary_en
  const st = STATUS[rumor.status]

  return (
    <main style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
        <Link
          href={`/${lang}/rumores`}
          style={{ fontSize: 12, color: muted, textDecoration: 'none', display: 'inline-block', marginBottom: 18 }}
        >
          ← {es ? 'Mercado' : 'Market'}
        </Link>

        {/* Header card */}
        <article style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 22, marginBottom: 18 }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 10 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              letterSpacing: 0.8, textTransform: 'uppercase',
              background: `${st.color}1f`, color: st.color, border: `1px solid ${st.color}55`,
            }}>{st[lang]}</span>
            {rumor.fee_estimate && <span style={{ fontSize: 12, color: muted }}>{rumor.fee_estimate}</span>}
            {rumor.league && <span style={{ fontSize: 12, color: muted }}>· {rumor.league}</span>}
            <span style={{ fontSize: 11, color: muted, marginLeft: 'auto' }}>
              {new Date(rumor.last_seen_at).toLocaleString(lang === 'en' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: text1,
            lineHeight: 1.15, letterSpacing: 0.3, marginBottom: 14,
          }}>{headline}</h1>

          {summary && (
            <p style={{ fontSize: 15, color: text2, lineHeight: 1.65, marginBottom: 18 }}>{summary}</p>
          )}

          {/* Move triangle: from -> player -> to */}
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 18 }}>
            {rumor.from_club && (
              <span style={{ fontSize: 13, color: text2 }}>
                <strong style={{ color: text1 }}>{rumor.from_club}</strong>
              </span>
            )}
            <span style={{ fontSize: 16, color: st.color }}>→</span>
            <span style={{ fontSize: 13, color: text2 }}>
              {rumor.player_slug ? (
                <Link href={`/${lang}/jugadores/${rumor.player_slug}`} style={{ color: '#f0c040', textDecoration: 'none' }}>
                  {rumor.player_name}
                </Link>
              ) : <strong style={{ color: text1 }}>{rumor.player_name}</strong>}
            </span>
            <span style={{ fontSize: 16, color: st.color }}>→</span>
            {rumor.to_club && (
              <span style={{ fontSize: 13, color: text2 }}>
                <strong style={{ color: text1 }}>{rumor.to_club}</strong>
              </span>
            )}
          </div>

          {/* Likelihood bar */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 10, letterSpacing: 2, color: muted, textTransform: 'uppercase' }}>
                {es ? 'Probabilidad' : 'Likelihood'}
              </span>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: st.color }}>
                {rumor.likelihood}%
              </span>
            </div>
            <div style={{ height: 8, background: isLight ? '#ece6d8' : '#2a2620', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${rumor.likelihood}%`, height: '100%', background: st.color, borderRadius: 999, transition: 'width .3s' }} />
            </div>
          </div>
        </article>

        {/* Share */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <button
            onClick={() => {
              const url = `https://www.top-scorers.com/${lang}/rumores/${rumor.id}`
              if (navigator.share) navigator.share({ title: headline, url }).catch(() => navigator.clipboard.writeText(url))
              else navigator.clipboard.writeText(url).then(() => alert(es ? 'Enlace copiado' : 'Link copied'))
            }}
            style={{
              background: 'transparent', border: `1px solid ${border}`,
              padding: '6px 16px', borderRadius: 6, color: muted, fontSize: 12, cursor: 'pointer',
            }}
          >
            ↗ {es ? 'Compartir' : 'Share'}
          </button>
        </div>

        <CommentsThread targetType="rumor" targetId={rumor.id} />
      </div>
    </main>
  )
}
