'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useUser } from '@clerk/nextjs'
import BadgeChip from '@/components/BadgeChip'
import { BADGES, tierFromPoints, nextTier, progressToNext, type BadgeTier } from '@/lib/badges'

interface Row {
  rank: number
  display_name: string
  points: number
  votes: number
  comments: number
  picks: number
  tier: BadgeTier
}

interface MyBadge {
  points: number
  tier: BadgeTier
  next: BadgeTier | null
  points_to_next: number
  progress: number
}

export default function ClasificacionClient() {
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

  const [rows, setRows] = useState<Row[]>([])
  const [me, setMe] = useState<MyBadge | null>(null)

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(j => setRows(j.data ?? []))
    if (isSignedIn) {
      fetch('/api/badges/me').then(r => r.ok ? r.json() : null).then(j => {
        if (!j) return
        setMe({
          points: j.stats?.points ?? 0,
          tier: j.tier,
          next: j.next,
          points_to_next: j.points_to_next,
          progress: j.progress,
        })
      })
    }
  }, [isSignedIn])

  return (
    <main style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#00c8b0', textTransform: 'uppercase', marginBottom: 8 }}>
          {es ? 'Comunidad · Ranking' : 'Community · Ranking'}
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 900, color: text1,
          lineHeight: 1.05, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10,
        }}>
          {es ? 'Top de la comunidad' : 'Community leaderboard'}
        </h1>
        <p style={{ fontSize: 14, color: text2, lineHeight: 1.6, marginBottom: 28, maxWidth: 600 }}>
          {es
            ? 'Cada voto, comentario y predicción acertada suma puntos. Sube de nivel y luce tu badge en cada discusión.'
            : 'Every vote, comment and correct pick earns points. Level up and flash your badge in every discussion.'}
        </p>

        {/* My progress */}
        {me && (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 10 }}>
              <div className="flex items-center gap-2">
                <BadgeChip tier={me.tier} lang={lang} />
                <span style={{ fontSize: 13, color: text2 }}>
                  {me.points} pts
                </span>
              </div>
              {me.next && (
                <span style={{ fontSize: 11, color: muted }}>
                  {es ? `${me.points_to_next} pts para ` : `${me.points_to_next} pts to `}
                  <BadgeChip tier={me.next} lang={lang} compact />
                </span>
              )}
            </div>
            <div style={{ height: 6, background: isLight ? '#ece6d8' : '#211e18', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${me.progress * 100}%`, height: '100%', background: '#f0c040', borderRadius: 999, transition: 'width .3s' }} />
            </div>
          </div>
        )}

        {/* All tiers reference */}
        <details style={{ marginBottom: 22 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12, color: muted, letterSpacing: 1, textTransform: 'uppercase' }}>
            {es ? 'Niveles y umbrales' : 'Tiers and thresholds'}
          </summary>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 0, listStyle: 'none', marginTop: 10 }}>
            {BADGES.map(b => (
              <li key={b.tier} className="flex items-center gap-3" style={{ fontSize: 13, color: text2 }}>
                <BadgeChip tier={b.tier} lang={lang} />
                <span>{b.minPoints}+ pts · {b.blurb[lang]}</span>
              </li>
            ))}
          </ul>
        </details>

        {/* Leaderboard */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
          {rows.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: muted, fontSize: 13 }}>
              {es ? 'Aún no hay puntuaciones. Sé el primero.' : 'No scores yet. Be the first.'}
            </div>
          ) : rows.map(r => (
            <div
              key={r.rank}
              className="flex items-center gap-3"
              style={{ padding: '10px 14px', borderBottom: `1px solid ${border}` }}
            >
              <span style={{ width: 28, fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: r.rank <= 3 ? '#f0c040' : muted, textAlign: 'right' }}>
                {r.rank}
              </span>
              <strong style={{ fontSize: 14, color: text1, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.display_name}
              </strong>
              <BadgeChip tier={r.tier} lang={lang} compact />
              <span style={{ fontSize: 11, color: muted, width: 80, textAlign: 'right' }}>
                💬 {r.comments} · 🗳️ {r.votes}
              </span>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: tierFromPoints(r.points).color, width: 56, textAlign: 'right' }}>
                {r.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
