'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'
import Avatar from '@/components/saas/Avatar'
import { clubLogo } from '@/lib/club-logos'

interface Rumor {
  id: string
  player_name: string
  player_slug: string | null
  player_photo: string | null
  from_club: string | null
  to_club: string | null
  league: string | null
  source: string
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

type StatusFilter = 'all' | 'rumor' | 'agreed' | 'confirmed'
type LeagueFilter = 'all' | 'La Liga' | 'Premier League' | 'Bundesliga' | 'Serie A' | 'Ligue 1'

const STATUS_STYLE: Record<Rumor['status'], { es: string; en: string; color: string }> = {
  rumor:     { es: 'Rumor',      en: 'Rumour',    color: '#b5ab95' },
  agreed:    { es: 'Acordado',   en: 'Agreed',    color: '#f0c040' },
  confirmed: { es: 'Confirmado', en: 'Confirmed', color: '#38c47a' },
  failed:    { es: 'Descartado', en: 'Failed',    color: '#e03a3a' },
}

export default function RumoresClient() {
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

  const [rumors, setRumors] = useState<Rumor[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [league, setLeague] = useState<LeagueFilter>('all')

  useEffect(() => {
    setLoading(true)
    const url = new URL('/api/rumors', window.location.origin)
    url.searchParams.set('limit', '50')
    if (status !== 'all') url.searchParams.set('status', status)
    fetch(url.toString())
      .then(r => r.json())
      .then(j => setRumors(j.data ?? []))
      .finally(() => setLoading(false))
  }, [status])

  const filtered = useMemo(() => (
    league === 'all' ? rumors : rumors.filter(r => r.league === league)
  ), [rumors, league])

  function Pill({ active, onClick, children, accent }: { active: boolean; onClick: () => void; children: React.ReactNode; accent?: string }) {
    const col = accent ?? '#f0c040'
    return (
      <button
        onClick={onClick}
        style={{
          padding: '4px 12px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: active ? 700 : 500,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          background: active ? `${col}1f` : 'transparent',
          color: active ? col : muted,
          border: `1px solid ${active ? col + '55' : border}`,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <main style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Hero */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#00c8b0', textTransform: 'uppercase', marginBottom: 8 }}>
          {es ? 'Rumores · Mercado de fichajes' : 'Rumours · Transfer market'}
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 900, color: text1, lineHeight: 1.05, letterSpacing: 1.5,
          textTransform: 'uppercase', marginBottom: 10,
        }}>
          {es ? 'Mercado en vivo' : 'Live transfer feed'}
        </h1>
        <p style={{ fontSize: 14, color: text2, lineHeight: 1.6, marginBottom: 28, maxWidth: 600 }}>
          {es
            ? 'Rumores, acuerdos y confirmaciones. Cada operación tiene un % de probabilidad y un hilo para que comentes. Súbete los goles, no las apuestas.'
            : 'Rumours, agreements and confirmations. Every move has a likelihood % and a comments thread. Bring the takes, not the bets.'}
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: muted, letterSpacing: 2, textTransform: 'uppercase', marginRight: 4 }}>
            {es ? 'Estado' : 'Status'}
          </span>
          {(['all', 'rumor', 'agreed', 'confirmed'] as StatusFilter[]).map(s => (
            <Pill key={s} active={status === s} onClick={() => setStatus(s)} accent={s === 'all' ? undefined : STATUS_STYLE[s as Rumor['status']]?.color}>
              {s === 'all' ? (es ? 'Todos' : 'All') : STATUS_STYLE[s as Rumor['status']]?.[lang]}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 10, color: muted, letterSpacing: 2, textTransform: 'uppercase', marginRight: 4 }}>
            {es ? 'Liga' : 'League'}
          </span>
          {(['all', 'La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1'] as LeagueFilter[]).map(l => (
            <Pill key={l} active={league === l} onClick={() => setLeague(l)}>
              {l === 'all' ? (es ? 'Todas' : 'All') : l}
            </Pill>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', color: muted, padding: 40 }}>{es ? 'Cargando…' : 'Loading…'}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: muted, padding: 40 }}>{es ? 'Sin rumores que coincidan.' : 'No rumours match.'}</div>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0, listStyle: 'none' }}>
            {filtered.map(r => {
              const headline = (es ? r.headline_es : r.headline_en) ?? `${r.player_name}: ${r.from_club ?? '?'} → ${r.to_club ?? '?'}`
              const summary  = (es ? r.summary_es : r.summary_en) ?? ''
              const st = STATUS_STYLE[r.status]
              return (
                <li key={r.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <Link
                    href={`/${lang}/rumores/${r.id}`}
                    style={{ display: 'block', padding: '14px 16px', textDecoration: 'none' }}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      {/* Player photo */}
                      <Avatar name={r.player_name} photo={r.player_photo ?? undefined} size={46} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                            letterSpacing: 0.6, textTransform: 'uppercase',
                            background: `${st.color}1f`, color: st.color, border: `1px solid ${st.color}55`,
                          }}>{st[lang]}</span>
                          {r.fee_estimate && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ts-primary)' }}>{r.fee_estimate}</span>
                          )}
                          {r.league && <span style={{ fontSize: 11, color: muted }}>· {r.league}</span>}
                        </div>
                        {/* From → To clubs with crests + direction */}
                        {(r.from_club || r.to_club) && (
                          <div className="flex items-center gap-2" style={{ marginBottom: 6, flexWrap: 'wrap' }}>
                            {r.from_club && (
                              <span className="flex items-center gap-1" style={{ fontSize: 12, color: muted }}>
                                {clubLogo(r.from_club) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={clubLogo(r.from_club)!} alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain' }} />}
                                {r.from_club}
                              </span>
                            )}
                            <span style={{ color: st.color, fontWeight: 800, fontSize: 14 }}>→</span>
                            {r.to_club && (
                              <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 700, color: text1 }}>
                                {clubLogo(r.to_club) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={clubLogo(r.to_club)!} alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain' }} />}
                                {r.to_club}
                              </span>
                            )}
                          </div>
                        )}
                        <h3 style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 18, fontWeight: 700, color: text1,
                          lineHeight: 1.2, letterSpacing: 0.3, margin: 0, marginBottom: 4,
                        }}>{headline}</h3>
                        {summary && (
                          <p style={{ fontSize: 13, color: text2, lineHeight: 1.5, margin: 0 }}>{summary}</p>
                        )}
                        <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>
                          💬 {r.comments_count} · {new Date(r.last_seen_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                      {/* Likelihood gauge */}
                      <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
                        <div style={{
                          fontFamily: "'Bebas Neue', cursive",
                          fontSize: 28, lineHeight: 1, color: st.color,
                        }}>{r.likelihood}<span style={{ fontSize: 14 }}>%</span></div>
                        <div style={{ fontSize: 9, color: muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
                          {es ? 'Prob.' : 'Prob.'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <p style={{ fontSize: 11, color: muted, marginTop: 28, textAlign: 'center' }}>
          {es
            ? 'Los rumores son orientativos y se refrescan automáticamente desde fuentes públicas. Comenta con respeto.'
            : 'Rumours are indicative and refresh automatically from public sources. Keep comments respectful.'}
        </p>
      </div>
    </main>
  )
}
