'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import type { ApiFixture, ApiPlayerResponse } from '@/lib/api-football'
import { t } from './shared'

// ─── Live data panel (Resultados) ─────────────────────────────────────────────

export default function LiveDataPanel() {
  const { lang } = useLang()
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [scorers, setScorers] = useState<ApiPlayerResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/football/fixtures?league=1&season=2026&last=8').then(r => r.json()),
      fetch('/api/football/topscorers?league=1&season=2026').then(r => r.json()),
    ]).then(([fix, sc]) => {
      if (fix.ok) setFixtures(fix.data)
      if (sc.ok) setScorers(sc.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>
        {t(lang, 'Cargando datos del torneo...', 'Loading tournament data...')}
      </div>
    )
  }

  const hasData = fixtures.length > 0 || scorers.length > 0

  if (!hasData) {
    return (
      <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
          {t(lang, 'Datos en tiempo real — disponibles al inicio del torneo', 'Live data — available when the tournament starts')}
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 400, margin: '0 auto' }}>
          {t(
            lang,
            'Los resultados, clasificaciones y estadísticas de goleadores aparecerán aquí desde el 11 de junio de 2026, actualizados cada 30 minutos.',
            'Results, standings and scorer stats will appear here from June 11, 2026, updated every 30 minutes.',
          )}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {/* Fixtures */}
      <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ts-border)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
            {t(lang, 'Últimos partidos', 'Latest matches')}
          </span>
        </div>
        {fixtures.slice().reverse().map(f => (
          <div key={f.fixture.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)' }}>
            <Link href={`/${lang}/mundial-2026/partido/${f.fixture.id}`} aria-label={t(lang, 'Ver detalle del partido', 'View match detail')} style={{ fontSize: 10, flexShrink: 0, color: 'var(--ts-muted)', width: 32, textDecoration: 'none', cursor: 'pointer' }}>
              {['FT', 'AET', 'PEN'].includes(f.fixture.status.short) ? 'FIN' : f.fixture.status.short}
            </Link>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <Link href={`/${lang}/mundial-2026/${slugify(f.teams.home.name)}`} style={{ fontSize: 11, color: f.teams.home.winner ? 'var(--ts-text)' : 'var(--ts-muted)', textDecoration: 'none', cursor: 'pointer' }}>{f.teams.home.name}</Link>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.teams.home.logo} alt="" width={14} height={14} style={{ objectFit: 'contain', flexShrink: 0 }} />
            </div>
            <Link href={`/${lang}/mundial-2026/partido/${f.fixture.id}`} style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums', color: 'var(--ts-text)', width: 40, textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>
              {f.goals.home} - {f.goals.away}
            </Link>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.teams.away.logo} alt="" width={14} height={14} style={{ objectFit: 'contain', flexShrink: 0 }} />
              <Link href={`/${lang}/mundial-2026/${slugify(f.teams.away.name)}`} style={{ fontSize: 11, color: f.teams.away.winner ? 'var(--ts-text)' : 'var(--ts-muted)', textDecoration: 'none', cursor: 'pointer' }}>{f.teams.away.name}</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Top scorers — clickable to player pages */}
      <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ts-border)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
            {t(lang, 'Goleadores del torneo', 'Tournament scorers')}
          </span>
        </div>
        {scorers.slice(0, 10).map((p, i) => {
          const stat = p.statistics[0]
          return (
            <Link
              key={p.player.id}
              href={`/${lang}/jugadores/${slugify(p.player.name)}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, width: 20, flexShrink: 0, color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.player.photo} alt={p.player.name} width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.player.name}</div>
                <div style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{stat?.team?.name}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{stat?.goals?.total ?? 0}</span>
                <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--ts-muted)' }}>{t(lang, 'goles', 'goals')}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
