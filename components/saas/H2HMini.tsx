'use client'
import { useState, useEffect } from 'react'

interface Recent {
  date: string; league: string
  homeId: number; homeName: string; awayId: number; awayName: string
  homeGoals: number | null; awayGoals: number | null
}
interface H2H { total: number; aWins: number; bWins: number; draws: number; recent: Recent[] }

// Reusable compact head-to-head block between two teams. `aName`/`bName` label
// the tally bar (a = teamA perspective). Lazy-fetches and renders nothing until
// there's a record. Fully defensive. Drop in anywhere two team ids are known.
export default function H2HMini({
  teamAId, teamBId, aName, bName, en,
}: { teamAId: number; teamBId: number; aName: string; bName: string; en: boolean }) {
  const [h, setH] = useState<H2H | null>(null)
  useEffect(() => {
    if (!teamAId || !teamBId || teamAId === teamBId) return
    let cancel = false
    fetch(`/api/head-to-head?a=${teamAId}&b=${teamBId}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok && j.h2h) setH(j.h2h) })
      .catch(() => {})
    return () => { cancel = true }
  }, [teamAId, teamBId])

  if (!h) return null
  const tot = h.total || 1
  const fmt = (d: string) => { const x = new Date(d); return isNaN(x.getTime()) ? d : x.toLocaleDateString(en ? 'en-US' : 'es-ES', { year: 'numeric', month: 'short' }) }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 8 }}>
        {en ? 'Head-to-head' : 'Cara a cara'} <span style={{ color: 'var(--ts-faint)' }}>· {h.total}</span>
      </div>
      {/* Tally bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--ts-muted)' }}>
        <span style={{ width: 80, textAlign: 'right', fontWeight: 700, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{aName}</span>
        <div style={{ flex: 1, display: 'flex', height: 14, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--ts-border)' }}>
          {h.aWins > 0 && <div style={{ width: `${(h.aWins / tot) * 100}%`, background: 'var(--ts-primary)' }} title={`${aName} ${h.aWins}`} />}
          {h.draws > 0 && <div style={{ width: `${(h.draws / tot) * 100}%`, background: 'var(--ts-muted)' }} title={`${en ? 'Draws' : 'Empates'} ${h.draws}`} />}
          {h.bWins > 0 && <div style={{ width: `${(h.bWins / tot) * 100}%`, background: 'var(--ts-teal)' }} title={`${bName} ${h.bWins}`} />}
        </div>
        <span style={{ width: 80, fontWeight: 700, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bName}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 6, fontSize: 11, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
        <span><strong style={{ color: 'var(--ts-primary)' }}>{h.aWins}</strong> {en ? 'W' : 'V'}</span>
        <span><strong>{h.draws}</strong> {en ? 'D' : 'E'}</span>
        <span><strong style={{ color: 'var(--ts-teal)' }}>{h.bWins}</strong> {en ? 'W' : 'V'}</span>
      </div>
      {/* Recent meetings */}
      {h.recent.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {h.recent.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < h.recent.length - 1 ? '1px solid var(--ts-hairline)' : 'none', fontSize: 11 }}>
              <span style={{ width: 64, flexShrink: 0, color: 'var(--ts-faint)' }}>{fmt(m.date)}</span>
              <span style={{ flex: 1, minWidth: 0, textAlign: 'right', color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.homeName}</span>
              <span style={{ flexShrink: 0, fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{m.homeGoals ?? '-'} : {m.awayGoals ?? '-'}</span>
              <span style={{ flex: 1, minWidth: 0, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.awayName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
