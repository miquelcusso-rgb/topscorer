'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import type { ApiPlayerResponse } from '@/lib/api-football'
import { type Lang, t } from './shared'
import { goldenBootFaqs } from '../wc-faqs'
import WcFaqList from './WcFaqList'
import WcAd from './WcAd'

// ─── World Cup Golden Boot (Bota de Oro del Mundial) ──────────────────────────
// The star section during the tournament: live top scorers of the World Cup
// itself (league 1 = FIFA World Cup, season 2026).

// Reusable scorer rows → player pages. Shared by the Golden Boot tab + Overview.
export function WcScorerList({ scorers, lang, limit }: { scorers: ApiPlayerResponse[]; lang: Lang; limit: number }) {
  return (
    <>
      {scorers.slice(0, limit).map((p, i) => {
        const stat = p.statistics[0]
        return (
          <Link
            key={p.player.id}
            href={`/${lang}/jugadores/${slugify(p.player.name)}`}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, width: 22, flexShrink: 0, textAlign: 'center', color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.player.photo} alt={p.player.name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.player.name}</div>
              <div style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{stat?.team?.name}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
              {stat?.goals?.assists ? <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{stat.goals.assists} {t(lang, 'asist', 'ast')}</span> : null}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{stat?.goals?.total ?? 0}</span>
                <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--ts-muted)' }}>{t(lang, 'goles', 'goals')}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </>
  )
}

export default function GoldenBootPanel({ initial = [], updated }: { initial?: ApiPlayerResponse[]; updated?: string }) {
  const { lang } = useLang()
  const [scorers, setScorers] = useState<ApiPlayerResponse[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)

  // Only client-fetch if the server didn't already seed us (keeps scorers in the
  // initial HTML for SEO when data exists; refreshes live when it doesn't). When
  // seeded, `loading` already starts false — no synchronous setState needed.
  useEffect(() => {
    if (initial.length > 0) return
    let cancelled = false
    fetch('/api/football/topscorers?league=1&season=2026')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data)) setScorers(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [initial.length])

  const leader = scorers[0]
  const leaderName = leader?.player?.name
  const leaderGoals = leader?.statistics[0]?.goals?.total ?? 0
  const leaderTeam = leader?.statistics[0]?.team?.name
  // Lead summary: directly answers the head query using the live leader. Derived
  // from the seeded scorers (no extra fetch); falls back gracefully pre-data.
  const leadSummary = leaderName
    ? t(lang,
        `${leaderName}${leaderTeam ? ` (${leaderTeam})` : ''} lidera la clasificación actual de goleadores de la Bota de Oro del Mundial 2026 con ${leaderGoals} ${leaderGoals === 1 ? 'gol' : 'goles'}.`,
        `${leaderName}${leaderTeam ? ` (${leaderTeam})` : ''} leads the current top scorers standings for the 2026 World Cup Golden Boot with ${leaderGoals} ${leaderGoals === 1 ? 'goal' : 'goals'}.`)
    : t(lang,
        'La carrera por la Bota de Oro del Mundial 2026 arranca el 11 de junio; aquí verás en directo la clasificación actual de goleadores y sus goles.',
        'The 2026 World Cup Golden Boot race kicks off on June 11; this page shows the current top scorers standings live and their goal tally.')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
          🥇 {t(lang, 'Bota de Oro del Mundial 2026', '2026 World Cup Golden Boot')}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ts-text)', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.55 }}>
          {leadSummary}
        </p>
        {updated && (
          <p style={{ fontSize: 11, color: 'var(--ts-faint)', margin: '0 0 6px' }}>
            {t(lang, `Actualizado ${updated}`, `Updated ${updated}`)}
          </p>
        )}
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: 0, lineHeight: 1.6 }}>
          {t(lang,
            'Clasificación actual de goleadores del Mundial 2026 en tiempo real. La Bota de Oro premia al jugador con más goles del torneo; en caso de empate, decide quien dé más asistencias y juegue menos minutos.',
            'Current top scorers standings of the 2026 World Cup, live. The Golden Boot goes to the tournament’s top scorer; ties are broken by most assists, then fewest minutes played.')}
        </p>
      </div>

      {loading && <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando goleadores…', 'Loading scorers…')}</div>}

      {!loading && scorers.length === 0 && (
        <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
            {t(lang, 'La carrera por la Bota de Oro arranca el 11 de junio', 'The Golden Boot race kicks off on June 11')}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto 14px' }}>
            {t(lang,
              'Los goleadores del Mundial 2026 aparecerán aquí en directo desde el primer partido. Mientras tanto, sigue la Bota de Oro europea de clubes.',
              'The 2026 World Cup scorers will appear here live from the first match. Meanwhile, follow the European club Golden Shoe.')}
          </p>
          <Link href={`/${lang}/bota-de-oro`} style={{ fontSize: 12, fontWeight: 700, color: 'var(--ts-primary)', textDecoration: 'none' }}>
            {t(lang, 'Bota de Oro europea (clubes) →', 'European club Golden Shoe →')}
          </Link>
        </div>
      )}

      {!loading && leader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 14, background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={leader.player.photo} alt={leader.player.name} width={56} height={56} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--ts-primary)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-primary)', fontWeight: 700 }}>{t(lang, 'Líder · Bota de Oro', 'Leader · Golden Boot')}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leader.player.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ts-muted)' }}>{leader.statistics[0]?.team?.name}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{leader.statistics[0]?.goals?.total ?? 0}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'goles', 'goals')}</div>
          </div>
        </div>
      )}

      {!loading && scorers.length > 0 && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
          <WcScorerList scorers={scorers} lang={lang} limit={25} />
        </div>
      )}

      {/* In-content ad between the ranking and the FAQ (self-gates for Pro) */}
      <WcAd />

      {/* FAQ — visible answers mirror the FAQPage JSON-LD (GEO citable content) */}
      <WcFaqList
        faqs={goldenBootFaqs(lang, leaderName, leaderName ? leaderGoals : undefined)}
        lang={lang}
        title={t(lang, 'Preguntas frecuentes — Bota de Oro', 'FAQ — Golden Boot')}
      />
    </div>
  )
}
