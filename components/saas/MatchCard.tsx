'use client'
import { useState, useEffect } from 'react'
import Avatar from './Avatar'
import H2HMini from './H2HMini'

interface Summary {
  date: string; status: string; venue?: string; league: string; round?: string
  home: { id: number; name: string; logo: string; goals: number | null }
  away: { id: number; name: string; logo: string; goals: number | null }
  scorers: { minute: number; teamId: number; player: string; assist?: string }[]
  stats: { label: string; home: string | number; away: string | number }[]
  mvp?: { name: string; team: string; rating: number; photo?: string }
}

const pctNum = (v: string | number) => { const n = parseFloat(String(v)); return isNaN(n) ? 0 : n }

// Auto match-summary card: score, scorers (+assist), key stats bars, auto MVP.
// Reusable in Results and the World Cup section. Self-fetches by fixture id.
export default function MatchCard({ fixtureId, lang }: { fixtureId: number; lang: 'es' | 'en' }) {
  const en = lang === 'en'
  const [s, setS] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancel = false
    fetch(`/api/match-summary?fixture=${fixtureId}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok) setS(j.summary) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [fixtureId])

  if (loading) return <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{en ? 'Loading summary…' : 'Cargando resumen…'}</div>
  if (!s) return <div style={{ padding: '16px 0', fontSize: 12, color: 'var(--ts-muted)' }}>{en ? 'Summary not available.' : 'Resumen no disponible.'}</div>

  const Team = ({ t, align }: { t: Summary['home']; align: 'left' | 'right' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: align === 'right' ? 'flex-start' : 'flex-end', flexDirection: align === 'right' ? 'row' : 'row-reverse' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={t.logo} alt="" width={26} height={26} style={{ objectFit: 'contain', flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts-text)' }}>{t.name}</span>
    </div>
  )

  return (
    <div style={{ background: 'var(--ts-card2)', border: '1px solid var(--ts-border)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ts-muted)', textAlign: 'center' }}>
        {s.league}{s.round ? ` · ${s.round}` : ''}{s.venue ? ` · ${s.venue}` : ''}
      </div>
      {/* Score line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Team t={s.home} align="left" />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {s.home.goals ?? '-'} : {s.away.goals ?? '-'}
        </div>
        <Team t={s.away} align="right" />
      </div>

      {/* Scorers */}
      {s.scorers.length > 0 && (
        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
          {[s.home, s.away].map((t, side) => (
            <div key={side} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, textAlign: side === 0 ? 'right' : 'left' }}>
              {s.scorers.filter(g => g.teamId === t.id).map((g, i) => (
                <span key={i} style={{ color: 'var(--ts-text)' }}>
                  ⚽ {g.player} <span style={{ color: 'var(--ts-faint)' }}>{g.minute}&apos;{g.assist ? ` · ${en ? 'a' : 'a'} ${g.assist}` : ''}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Key stats bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {s.stats.map((st, i) => {
          const h = pctNum(st.home), a = pctNum(st.away), tot = h + a || 1
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <span style={{ width: 36, textAlign: 'right', fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{st.home}</span>
              <div style={{ flex: 1, display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--ts-hairline)' }}>
                <div style={{ width: `${(h / tot) * 100}%`, background: 'var(--ts-primary)' }} />
                <div style={{ width: `${(a / tot) * 100}%`, background: 'var(--ts-teal)' }} />
              </div>
              <span style={{ width: 36, fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{st.away}</span>
              <span style={{ width: 64, textAlign: 'center', color: 'var(--ts-muted)' }}>{st.label}</span>
            </div>
          )
        })}
      </div>

      {/* MVP */}
      {s.mvp && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)', borderRadius: 8 }}>
          <Avatar name={s.mvp.name} size={32} photo={s.mvp.photo} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>MVP</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)' }}>{s.mvp.name} <span style={{ color: 'var(--ts-muted)', fontWeight: 400 }}>· {s.mvp.team}</span></div>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>{s.mvp.rating.toFixed(2)}</div>
        </div>
      )}

      {/* Head-to-head (renders only when these two teams have a meeting history) */}
      <H2HMini teamAId={s.home.id} teamBId={s.away.id} aName={s.home.name} bName={s.away.name} en={en} />
    </div>
  )
}
