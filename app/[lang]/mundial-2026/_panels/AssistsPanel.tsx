'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import type { ApiPlayerResponse } from '@/lib/api-football'
import { type Lang, t } from './shared'
import { assistsFaqs } from '../wc-faqs'
import WcFaqList from './WcFaqList'

// ─── Top assists (Asistentes) ─────────────────────────────────────────────────
// Twin of the Golden Boot list but ranked by assists (the headline number).
// Reuses the same row layout as WcScorerList; goals shown as the secondary stat.

function WcAssistList({ players, lang, limit }: { players: ApiPlayerResponse[]; lang: Lang; limit: number }) {
  return (
    <>
      {players.slice(0, limit).map((p, i) => {
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
              {stat?.goals?.total ? <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{stat.goals.total} {t(lang, 'goles', 'goals')}</span> : null}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{stat?.goals?.assists ?? 0}</span>
                <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--ts-muted)' }}>{t(lang, 'asist', 'ast')}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </>
  )
}

export default function AssistsPanel({ initial = [] }: { initial?: ApiPlayerResponse[] }) {
  const { lang } = useLang()
  const [players, setPlayers] = useState<ApiPlayerResponse[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)

  useEffect(() => {
    // Always refetch live — don't trust a possibly-stale empty seed baked at build.
    let cancelled = false
    fetch('/api/football/topscorers?league=1&season=2026&type=assists')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data) && j.data.length) setPlayers(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const leader = players[0]
  const leaderName = leader?.player?.name
  const leaderAssists = leader?.statistics[0]?.goals?.assists ?? 0
  const leaderTeam = leader?.statistics[0]?.team?.name
  // Lead summary: directly answers "quién da más asistencias" with the live
  // leader. Derived from the seeded/fetched data; graceful pre-data fallback.
  const leadSummary = leaderName
    ? t(lang,
        `${leaderName}${leaderTeam ? ` (${leaderTeam})` : ''} lidera las asistencias del Mundial 2026 con ${leaderAssists} ${leaderAssists === 1 ? 'asistencia' : 'asistencias'}.`,
        `${leaderName}${leaderTeam ? ` (${leaderTeam})` : ''} leads the 2026 World Cup for assists with ${leaderAssists}.`)
    : t(lang,
        'El ranking de asistencias del Mundial 2026 arranca el 11 de junio; aquí verás en directo al jugador con más asistencias.',
        'The 2026 World Cup assists ranking opens on June 11; this page shows the live assists leader.')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
          🅰️ {t(lang, 'Máximos asistentes del Mundial 2026', '2026 World Cup top assists')}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ts-text)', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.55 }}>
          {leadSummary}
        </p>
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: 0, lineHeight: 1.6 }}>
          {t(lang,
            'Jugadores con más asistencias del Mundial 2026 en tiempo real. La asistencia es el último pase antes de un gol.',
            'Players with the most assists at the 2026 World Cup, live. An assist is the final pass before a goal.')}
        </p>
      </div>

      {loading && <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando asistentes…', 'Loading assists…')}</div>}

      {!loading && players.length === 0 && (
        <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
            {t(lang, 'Los asistentes aparecerán desde el primer partido', 'Assists will appear from the first match')}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto' }}>
            {t(lang,
              'El ranking de asistencias del Mundial 2026 se actualiza en directo durante el torneo.',
              'The 2026 World Cup assists ranking updates live throughout the tournament.')}
          </p>
        </div>
      )}

      {!loading && players.length > 0 && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
          <WcAssistList players={players} lang={lang} limit={25} />
        </div>
      )}

      {/* FAQ — visible answers mirror the FAQPage JSON-LD (GEO citable content) */}
      <WcFaqList
        faqs={assistsFaqs(lang, leaderName, leaderName ? leaderAssists : undefined)}
        lang={lang}
        title={t(lang, 'Preguntas frecuentes — Asistencias', 'FAQ — Assists')}
      />
    </div>
  )
}
