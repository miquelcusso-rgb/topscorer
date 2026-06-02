'use client'
import { useState, useEffect } from 'react'

interface Trophy { title: string; country: string; count: number }
interface Transfer { date: string; type: string; from: string; to: string }

// Palmarés (titles won, grouped + counted) + transfer history. Real API-Football
// data, fetched on demand. Hidden gracefully when a player has neither.
export default function PlayerHonors({ apiId, en }: { apiId?: number; en: boolean }) {
  const [trophies, setTrophies] = useState<Trophy[]>([])
  const [totalWon, setTotalWon] = useState(0)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!apiId) { setLoaded(true); return }
    let cancel = false
    fetch(`/api/player-honors?id=${apiId}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok) { setTrophies(j.trophies ?? []); setTotalWon(j.totalWon ?? 0); setTransfers(j.transfers ?? []) } })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoaded(true) })
    return () => { cancel = true }
  }, [apiId])

  if (!loaded || (trophies.length === 0 && transfers.length === 0)) return null

  const card: React.CSSProperties = { background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }
  const head: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }
  const fmt = (d: string) => { const x = new Date(d); return isNaN(x.getTime()) ? d : x.toLocaleDateString(en ? 'en-US' : 'es-ES', { month: 'short', year: 'numeric' }) }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
      {/* Palmarés */}
      {trophies.length > 0 && (
        <div style={card}>
          <div style={{ ...head, display: 'flex', justifyContent: 'space-between' }}>
            <span>🏆 {en ? 'Honours' : 'Palmarés'}</span>
            <span style={{ color: 'var(--ts-primary)' }}>{totalWon} {en ? 'titles' : 'títulos'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {trophies.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < trophies.length - 1 ? '1px solid var(--ts-hairline)' : 'none' }}>
                <span style={{ fontSize: 13 }}>🏅</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--ts-text)' }}>{t.title}
                  <span style={{ color: 'var(--ts-faint)', fontSize: 11 }}> · {t.country}</span>
                </span>
                {t.count > 1 && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>×{t.count}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer history */}
      {transfers.length > 0 && (
        <div style={card}>
          <div style={head}>↔ {en ? 'Transfer history' : 'Historial de fichajes'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {transfers.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < transfers.length - 1 ? '1px solid var(--ts-hairline)' : 'none' }}>
                <span style={{ width: 64, flexShrink: 0, fontSize: 11, color: 'var(--ts-muted)' }}>{fmt(t.date)}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--ts-text)' }}>
                  {t.from} <span style={{ color: 'var(--ts-faint)' }}>→</span> <strong>{t.to}</strong>
                </span>
                <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ts-muted)', background: 'var(--ts-card2)', border: '1px solid var(--ts-border)', borderRadius: 5, padding: '2px 6px' }}>
                  {t.type === 'Free' ? (en ? 'Free' : 'Libre') : t.type === 'N/A' ? '—' : t.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
