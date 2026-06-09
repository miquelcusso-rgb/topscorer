'use client'
import { useState, useEffect } from 'react'

interface Prediction {
  homePct: number; drawPct: number; awayPct: number
  advice: string; winnerName: string | null
  homeName: string; awayName: string
}

// Compact win-probability bar for an UPCOMING fixture, fed by /predictions.
// Lazy-fetches on mount and renders nothing until (and unless) a prediction is
// available — so finished matches and the current season-ended state show no
// bar, but it lights up automatically once real WC fixtures exist. Fully
// defensive: any error → renders null.
export default function WinProbabilityBar({ fixtureId, en }: { fixtureId: number; en: boolean }) {
  const [p, setP] = useState<Prediction | null>(null)
  useEffect(() => {
    let cancel = false
    fetch(`/api/fixture-prediction?id=${fixtureId}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok && j.prediction) setP(j.prediction) })
      .catch(() => {})
    return () => { cancel = true }
  }, [fixtureId])

  if (!p) return null
  const seg = (pct: number, color: string, label: string) =>
    pct > 0 ? (
      <div
        title={`${label} ${pct}%`}
        style={{ width: `${pct}%`, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'var(--ts-bg)', minWidth: pct >= 12 ? undefined : 0, overflow: 'hidden' }}
      >
        {pct >= 12 ? `${pct}%` : ''}
      </div>
    ) : null

  return (
    <div style={{ padding: '6px 12px 10px', borderBottom: '1px solid var(--ts-divider)' }}>
      <div style={{ display: 'flex', height: 16, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--ts-border)' }}>
        {seg(p.homePct, 'var(--ts-primary)', en ? 'Home win' : 'Gana local')}
        {seg(p.drawPct, 'var(--ts-muted)', en ? 'Draw' : 'Empate')}
        {seg(p.awayPct, 'var(--ts-teal)', en ? 'Away win' : 'Gana visitante')}
      </div>
      {p.advice && (
        <div style={{ fontSize: 10, color: 'var(--ts-faint)', marginTop: 4, textAlign: 'center' }}>
          {en ? 'Tip' : 'Pronóstico'}: {p.advice}
        </div>
      )}
    </div>
  )
}
