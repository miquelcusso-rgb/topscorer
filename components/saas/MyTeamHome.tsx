'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { t, type Lang } from '@/lib/i18n'
import { clubLogo } from '@/lib/club-logos'
import { canonicalClubName } from '@/lib/club-colors'
import type { Plan } from '@/types'

// Home "My team" (Mi equipo) block.
//  • FREE perk  → pick a favourite team (persisted in localStorage 'ts-club',
//    the same key the sidebar "Mi club" uses, so the two stay in sync).
//  • PRO perk   → the picked team's top scorers, fetched on demand from
//    /api/team-scorers (static dataset, no external call → free tier). FREE
//    users see the crest + name + an upgrade teaser instead.
// Brand --ts-* tokens only, bilingual via t(). Author: Furiosa Studio.

interface TeamScorer {
  name: string; slug: string; goles: number; asist: number; pj: number
  position: string | null; photo: string | null; flag: string | null
}

const card: React.CSSProperties = {
  background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 16,
}
const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)',
}

export default function MyTeamHome({ lang }: { lang: Lang }) {
  const en = lang === 'en'
  const { user, isLoaded } = useUser()
  const plan: Plan = (isLoaded && user ? ((user.publicMetadata?.plan as Plan) || 'free') : 'free')
  const isPro = plan === 'pro' || plan === 'team' || plan === 'scout'

  const [club, setClub] = useState<string>('')
  const [scorers, setScorers] = useState<TeamScorer[] | null>(null)
  const [loading, setLoading] = useState(false)

  // The favourite team is chosen in the sidebar typeahead now — reflect it live.
  useEffect(() => {
    const read = () => { try { setClub(localStorage.getItem('ts-club') ?? '') } catch {} }
    read()
    window.addEventListener('ts-club-change', read)
    window.addEventListener('storage', read)
    return () => { window.removeEventListener('ts-club-change', read); window.removeEventListener('storage', read) }
  }, [])

  // PRO: fetch the club's top scorers when a team is set.
  useEffect(() => {
    if (!club || !isPro) { setScorers(null); return }
    let cancel = false
    setLoading(true)
    fetch(`/api/team-scorers?club=${encodeURIComponent(club)}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok) setScorers(j.players ?? []) })
      .catch(() => { if (!cancel) setScorers([]) })
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [club, isPro])

  const crest = club ? clubLogo(club) : undefined

  return (
    <section style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span aria-hidden style={{ fontSize: 15 }}>⚽</span>
        <span style={eyebrow}>{t('myteam_title', lang)}</span>
      </div>

      {!club ? (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--ts-muted)' }}>
          {en
            ? 'Pick your team in the sidebar (top-left) — it stays here with your club’s top scorers.'
            : 'Elige tu equipo en la barra lateral (arriba a la izquierda) — se queda aquí con los goleadores de tu club.'}
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isPro ? 14 : 8 }}>
            <div style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--ts-card2)', borderRadius: 10, overflow: 'hidden' }}>
              {crest
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={crest} alt="" width={48} height={48} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6, boxSizing: 'border-box' }} />
                : <span aria-hidden style={{ fontSize: 20 }}>🛡️</span>}
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, lineHeight: 1.05, color: 'var(--ts-text)' }}>
              {canonicalClubName(club)}
            </span>
          </div>

          {isPro ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 8 }}>
                {t('myteam_scorers', lang)}
              </div>
              {loading || scorers === null ? (
                <div style={{ fontSize: 13, color: 'var(--ts-faint)', padding: '8px 0' }}>{t('myteam_loading', lang)}</div>
              ) : scorers.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ts-muted)', padding: '8px 0' }}>{t('myteam_empty', lang)}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {scorers.map((p, i) => (
                    <Link key={p.slug + i} href={`/${lang}/jugadores/${p.slug}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', minHeight: 44,
                        borderBottom: i < scorers.length - 1 ? '1px solid var(--ts-hairline)' : 'none',
                        textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ width: 30, height: 30, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: 'var(--ts-card2)' }}>
                        {p.photo
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.photo} alt="" width={30} height={30} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : null}
                      </div>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.flag ? `${p.flag} ` : ''}{p.name}
                      </span>
                      <span style={{ flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {p.goles}<span style={{ fontSize: 11, color: 'var(--ts-muted)', fontWeight: 600 }}> G</span>
                      </span>
                      <span style={{ flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--ts-teal)', fontVariantNumeric: 'tabular-nums' }}>
                        {p.asist}<span style={{ fontSize: 11, color: 'var(--ts-muted)', fontWeight: 600 }}> A</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0 2px' }}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--ts-muted)' }}>{t('myteam_pro_teaser', lang)}</p>
              <Link href={`/${lang}/pricing`}
                style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '8px 16px',
                  borderRadius: 999, background: 'var(--ts-primary)', color: '#1a1a1a', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                {t('myteam_pro_cta', lang)} →
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}
