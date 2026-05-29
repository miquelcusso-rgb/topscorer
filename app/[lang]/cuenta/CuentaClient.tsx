'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'
import BadgeChip from '@/components/BadgeChip'
import { BADGES, type BadgeTier } from '@/lib/badges'

interface BadgeState {
  points: number
  votes_count: number
  comments_count: number
  picks_correct: number
  picks_total: number
  tier: BadgeTier
  next: BadgeTier | null
  points_to_next: number
  progress: number
}
interface Comparison { id: string; name: string; player_names: string[]; season: string; created_at: string }
interface WatchlistRow { player_name: string; season: string; tab: string; created_at: string }
interface PickRow { id: string; fixture_id: number; pick: 'home'|'draw'|'away'; status: string; points: number; kickoff: string; result_home: number|null; result_away: number|null }

export default function CuentaClient() {
  const { user, isLoaded } = useUser()
  const { lang } = useLang()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const es = lang === 'es'

  const bg     = isLight ? '#f4f6ff' : '#060d18'
  const card   = isLight ? '#ffffff' : '#0d0e1c'
  const border = isLight ? '#d8deef' : '#1a1c2e'
  const text1  = isLight ? '#0f1830' : '#e8e8f8'
  const text2  = isLight ? '#33405e' : '#9aa6c8'
  const muted  = isLight ? '#6070a0' : '#5a5c80'

  const [badge, setBadge] = useState<BadgeState | null>(null)
  const [comps, setComps] = useState<Comparison[]>([])
  const [watch, setWatch] = useState<WatchlistRow[]>([])
  const [picks, setPicks] = useState<PickRow[]>([])
  const [newsletterOn, setNewsletterOn] = useState(false)
  const [newsletterSaving, setNewsletterSaving] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) return
    fetch('/api/badges/me').then(r => r.ok ? r.json() : null).then(j => {
      if (!j) return
      setBadge({
        points: j.stats?.points ?? 0,
        votes_count: j.stats?.votes_count ?? 0,
        comments_count: j.stats?.comments_count ?? 0,
        picks_correct: j.stats?.picks_correct ?? 0,
        picks_total: j.stats?.picks_total ?? 0,
        tier: j.tier, next: j.next, points_to_next: j.points_to_next, progress: j.progress,
      })
    })
    fetch('/api/comparisons').then(r => r.json()).then(j => setComps(j.data ?? []))
    fetch('/api/watchlist').then(r => r.json()).then(j => setWatch(Array.isArray(j) ? j : (j.data ?? [])))
    fetch('/api/picks').then(r => r.json()).then(j => setPicks(j.data ?? []))
    fetch('/api/newsletter').then(r => r.ok ? r.json() : null).then(j => { if (j) setNewsletterOn(!!j.enabled) })
  }, [isLoaded, user])

  async function toggleNewsletter() {
    setNewsletterSaving(true)
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !newsletterOn, language: lang }),
      })
      if (r.ok) setNewsletterOn(!newsletterOn)
    } finally {
      setNewsletterSaving(false)
    }
  }

  if (isLoaded && !user) {
    return (
      <main style={{ background: bg, minHeight: '100vh', padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: text2, marginBottom: 16 }}>{es ? 'Inicia sesión para ver tu cuenta.' : 'Sign in to view your account.'}</p>
        <Link href={`/${lang}/sign-in`} style={{ background: '#f0c040', color: '#05060c', padding: '8px 18px', borderRadius: 5, fontWeight: 700, textDecoration: 'none' }}>
          {es ? 'Entrar' : 'Sign in'}
        </Link>
      </main>
    )
  }
  if (!isLoaded || !badge) return <main style={{ background: bg, minHeight: '100vh', padding: 40, textAlign: 'center', color: muted }}>{es ? 'Cargando…' : 'Loading…'}</main>

  const plan = (user!.publicMetadata?.plan as string) ?? 'free'

  const Section = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
    <section style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
      <header className="flex items-center justify-between gap-2" style={{ marginBottom: 10 }}>
        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14, fontWeight: 700, color: text1,
          textTransform: 'uppercase', letterSpacing: 1.5, margin: 0,
        }}>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )

  return (
    <main style={{ background: bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '36px 20px 80px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#f0c040', textTransform: 'uppercase', marginBottom: 8 }}>
          {es ? 'Tu cuenta' : 'Your account'}
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: text1,
          lineHeight: 1.05, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 22,
        }}>
          {user?.firstName || user?.username || (es ? 'Futbolero' : 'Footy fan')}
        </h1>

        {/* Profile + badge progress */}
        <section style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 22 }}>
          <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 14 }}>
            <div className="flex items-center gap-3">
              <BadgeChip tier={badge.tier} lang={lang} />
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: text1 }}>{badge.points} pts</span>
            </div>
            <span style={{
              fontSize: 11, color: plan === 'free' ? muted : '#f0c040',
              fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1.5,
              textTransform: 'uppercase', fontWeight: 700,
              padding: '4px 10px', borderRadius: 999,
              background: plan === 'free' ? 'transparent' : 'rgba(240,192,64,.1)',
              border: `1px solid ${plan === 'free' ? border : '#f0c04055'}`,
            }}>
              {es ? `Plan ${plan}` : `${plan} plan`}
            </span>
          </div>
          {badge.next && (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: muted, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {es ? 'Próximo nivel' : 'Next tier'}: <BadgeChip tier={badge.next} lang={lang} compact />
                </span>
                <span style={{ fontSize: 12, color: muted }}>{badge.points_to_next} pts</span>
              </div>
              <div style={{ height: 6, background: isLight ? '#e2e8f4' : '#1a1c2e', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${badge.progress * 100}%`, height: '100%', background: '#f0c040', borderRadius: 999, transition: 'width .3s' }} />
              </div>
            </>
          )}
          <div className="grid grid-cols-4 gap-2" style={{ marginTop: 14, fontSize: 11, color: muted, textAlign: 'center' }}>
            <div><div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: text1 }}>{badge.votes_count}</div>{es ? 'Votos' : 'Votes'}</div>
            <div><div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: text1 }}>{badge.comments_count}</div>{es ? 'Coment.' : 'Comments'}</div>
            <div><div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: text1 }}>{badge.picks_correct}/{badge.picks_total}</div>{es ? 'Picks' : 'Picks'}</div>
            <div><div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: text1 }}>{user?.publicMetadata?.favoriteClub ? '★' : '—'}</div>{es ? 'Club fav.' : 'Fav club'}</div>
          </div>
        </section>

        {/* Watchlist */}
        <Section
          title={`${es ? 'Watchlist' : 'Watchlist'} (${watch.length})`}
          action={<Link href={`/${lang}/jugadores`} style={{ fontSize: 11, color: muted, textDecoration: 'underline' }}>{es ? 'Añadir →' : 'Add →'}</Link>}
        >
          {watch.length === 0 ? (
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>{es ? 'Sin jugadores guardados. Añade desde su ficha.' : 'No players saved yet. Add from a player page.'}</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 0, listStyle: 'none', margin: 0 }}>
              {watch.slice(0, 5).map(w => (
                <li key={`${w.player_name}-${w.season}-${w.tab}`} style={{ fontSize: 13, color: text2, padding: '6px 0', borderBottom: `1px solid ${border}` }}>
                  ⭐ {w.player_name} <span style={{ color: muted }}>· {w.season}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Saved comparisons */}
        <Section
          title={`${es ? 'Comparaciones guardadas' : 'Saved comparisons'} (${comps.length})`}
          action={<Link href={`/${lang}/estadisticas/comparador`} style={{ fontSize: 11, color: muted, textDecoration: 'underline' }}>{es ? 'Nueva →' : 'New →'}</Link>}
        >
          {comps.length === 0 ? (
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>{es ? 'Aún no has guardado ninguna.' : 'No comparisons saved yet.'}</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 0, listStyle: 'none', margin: 0 }}>
              {comps.slice(0, 5).map(c => (
                <li key={c.id} style={{ fontSize: 13, color: text2, padding: '6px 0', borderBottom: `1px solid ${border}` }}>
                  ⚖️ {c.name} <span style={{ color: muted }}>· {c.player_names.join(' vs ')}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Recent picks */}
        <Section
          title={es ? 'Predicciones recientes' : 'Recent picks'}
          action={<Link href={`/${lang}/predicciones`} style={{ fontSize: 11, color: muted, textDecoration: 'underline' }}>{es ? 'Hacer picks →' : 'Make picks →'}</Link>}
        >
          {picks.length === 0 ? (
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>{es ? 'Aún no has hecho ninguna predicción.' : 'No picks yet.'}</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 0, listStyle: 'none', margin: 0 }}>
              {picks.slice(0, 5).map(p => {
                const col = p.status === 'correct' ? '#38c47a' : p.status === 'wrong' ? '#e03a3a' : muted
                return (
                  <li key={p.id} style={{ fontSize: 13, color: text2, padding: '6px 0', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between' }}>
                    <span>🎯 {p.pick.toUpperCase()} <span style={{ color: muted }}>· {new Date(p.kickoff).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short' })}</span></span>
                    <span style={{ color: col, fontWeight: 600 }}>
                      {p.status === 'pending' ? (es ? 'Pendiente' : 'Pending') : `${p.result_home}-${p.result_away} (+${p.points} pts)`}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        {/* Plan management */}
        <Section
          title={es ? 'Plan y facturación' : 'Plan & billing'}
          action={plan !== 'free' ? <a href="https://billing.stripe.com/p/login/aEUcODcrXcQQ5RC4gg" target="_blank" rel="noopener" style={{ fontSize: 11, color: muted, textDecoration: 'underline' }}>{es ? 'Gestionar →' : 'Manage →'}</a> : null}
        >
          {plan === 'free' ? (
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ fontSize: 13, color: text2 }}>
              <span>{es ? 'Estás en el plan gratuito. Pásate a Pro para desbloquear extras de comunidad y sin anuncios.' : 'You are on the free plan. Upgrade to Pro for community perks and ads-free.'}</span>
              <Link href={`/${lang}/pricing`} style={{ background: '#f0c040', color: '#05060c', padding: '6px 14px', borderRadius: 4, fontWeight: 700, fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {es ? 'Ver planes' : 'See plans'}
              </Link>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: text2, margin: 0 }}>
              {es ? `Suscripción ${plan} activa.` : `${plan} subscription active.`}
              {(user?.publicMetadata?.planExpiry as string) && (
                <span style={{ color: muted }}> · {es ? 'Renueva' : 'Renews'} {new Date(user?.publicMetadata?.planExpiry as string).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES')}</span>
              )}
            </p>
          )}
        </Section>

        {/* Newsletter opt-in */}
        <Section title={es ? 'Newsletter semanal' : 'Weekly newsletter'}>
          <div className="flex items-center justify-between gap-3 flex-wrap" style={{ fontSize: 13, color: text2 }}>
            <span style={{ maxWidth: 480 }}>
              {es
                ? 'Resumen cada domingo: tu watchlist, el rumor del momento y la encuesta destacada. Cancelas cuando quieras.'
                : 'Sunday recap: your watchlist, the hottest rumour and the featured poll. Unsubscribe anytime.'}
            </span>
            <button
              onClick={toggleNewsletter}
              disabled={newsletterSaving}
              style={{
                padding: '6px 16px', borderRadius: 999,
                background: newsletterOn ? '#38c47a' : 'transparent',
                color: newsletterOn ? '#05060c' : muted,
                border: `1px solid ${newsletterOn ? '#38c47a' : border}`,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer',
                opacity: newsletterSaving ? 0.5 : 1,
              }}
            >
              {newsletterOn ? (es ? '✓ Suscrito' : '✓ Subscribed') : (es ? 'Suscribirse' : 'Subscribe')}
            </button>
          </div>
        </Section>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
          <Link href={`/${lang}/clasificacion`} style={{ fontSize: 12, color: muted, textDecoration: 'none', padding: '6px 12px', borderRadius: 5, border: `1px solid ${border}` }}>
            🏆 {es ? 'Ranking comunidad' : 'Leaderboard'}
          </Link>
          {(plan === 'scout' || plan === 'team') && (
            <Link href={`/${lang}/cuenta/api`} style={{ fontSize: 12, color: '#a060ff', textDecoration: 'none', padding: '6px 12px', borderRadius: 5, border: `1px solid #a060ff55`, background: 'rgba(160,96,255,.08)' }}>
              🔑 {es ? 'Claves API' : 'API keys'}
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
