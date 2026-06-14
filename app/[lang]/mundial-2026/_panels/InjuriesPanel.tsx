'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LangContext'
import type { TeamInjuryGroup } from '@/lib/api-football'
import { t } from './shared'

// ─── Injuries (Bajas) ─────────────────────────────────────────────────────────
// League-wide injuries grouped by national team. Empty before the tournament →
// graceful empty state that auto-fills as records appear.

export default function InjuriesPanel() {
  const { lang } = useLang()
  const [groups, setGroups] = useState<TeamInjuryGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/football/injuries?league=1&season=2026')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data)) setGroups(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
          🏥 {t(lang, 'Bajas del Mundial 2026', '2026 World Cup injuries')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: 0, lineHeight: 1.6 }}>
          {t(lang,
            'Jugadores lesionados o sancionados por selección, actualizado durante el torneo.',
            'Injured or suspended players by national team, updated during the tournament.')}
        </p>
      </div>

      {loading && <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando bajas…', 'Loading injuries…')}</div>}

      {!loading && groups.length === 0 && (
        <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
            {t(lang, 'Sin bajas reportadas todavía', 'No injuries reported yet')}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto' }}>
            {t(lang,
              'Las bajas por lesión o sanción aparecerán aquí, agrupadas por selección, a medida que se confirmen durante el Mundial 2026.',
              'Injury and suspension news will appear here, grouped by national team, as it is confirmed during the 2026 World Cup.')}
          </p>
        </div>
      )}

      {!loading && groups.length > 0 && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {groups.map(g => (
            <div key={g.teamId} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: '1px solid var(--ts-border)', background: 'var(--ts-card2)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {g.teamLogo ? <img src={g.teamLogo} alt="" width={20} height={20} style={{ objectFit: 'contain', flexShrink: 0 }} /> : null}
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>{g.team}</span>
              </div>
              {g.players.map(pl => (
                <div key={`${pl.playerId}-${pl.reason}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: '1px solid var(--ts-divider)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {pl.photo ? <img src={pl.photo} alt={pl.player} width={26} height={26} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> : null}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.player}</div>
                    <div style={{ fontSize: 10, color: 'var(--ts-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.reason || pl.type}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
