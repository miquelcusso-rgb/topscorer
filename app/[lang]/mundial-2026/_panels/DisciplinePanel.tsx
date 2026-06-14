'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import type { BookedPlayer } from '@/lib/api-football'
import { t } from './shared'

// ─── Discipline (Disciplina) ──────────────────────────────────────────────────
// Most-booked ranking from /players/topyellowcards (yellows + reds).

export default function DisciplinePanel() {
  const { lang } = useLang()
  const [players, setPlayers] = useState<BookedPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/football/yellowcards?league=1&season=2026')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data)) setPlayers(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
          🟨 {t(lang, 'Disciplina del Mundial 2026', '2026 World Cup discipline')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: 0, lineHeight: 1.6 }}>
          {t(lang,
            'Jugadores con más tarjetas del Mundial 2026. Una acumulación de amarillas conlleva sanción.',
            'Most-booked players at the 2026 World Cup. Accumulated yellow cards lead to a suspension.')}
        </p>
      </div>

      {loading && <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando tarjetas…', 'Loading cards…')}</div>}

      {!loading && players.length === 0 && (
        <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
            {t(lang, 'Sin tarjetas todavía', 'No cards yet')}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto' }}>
            {t(lang,
              'El ranking de tarjetas del Mundial 2026 se llenará desde el primer partido.',
              'The 2026 World Cup booking ranking will fill from the first match.')}
          </p>
        </div>
      )}

      {!loading && players.length > 0 && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid var(--ts-border)', background: 'var(--ts-card2)' }}>
            <span style={{ width: 22, flexShrink: 0 }} />
            <span style={{ width: 28, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)' }}>{t(lang, 'Jugador', 'Player')}</span>
            <span style={{ width: 38, flexShrink: 0, textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--ts-muted)' }}>🟨</span>
            <span style={{ width: 38, flexShrink: 0, textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--ts-muted)' }}>🟥</span>
          </div>
          {players.map((p, i) => (
            <Link
              key={p.id}
              href={`/${lang}/jugadores/${slugify(p.name)}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, width: 22, flexShrink: 0, textAlign: 'center', color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={p.name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{p.team}</div>
              </div>
              <span style={{ width: 38, flexShrink: 0, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif", fontVariantNumeric: 'tabular-nums' }}>{p.yellow}</span>
              <span style={{ width: 38, flexShrink: 0, textAlign: 'center', fontSize: 16, fontWeight: 700, color: p.red > 0 ? 'var(--ts-red)' : 'var(--ts-faint)', fontFamily: "'Barlow Condensed', sans-serif", fontVariantNumeric: 'tabular-nums' }}>{p.red}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
