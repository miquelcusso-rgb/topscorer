'use client'
import { useState, useEffect } from 'react'
import CrestImg from '@/components/saas/CrestImg'

interface Point { date: string; value: number; label: string; club: string; crest?: string; age?: string }

const fmtVal = (v: number) => (v >= 1e6 ? `€${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M` : v >= 1e3 ? `€${Math.round(v / 1e3)}K` : `€${v}`)

// Market-value evolution chart (real Transfermarkt history): area line over time
// with the player's club spells shown below. Hidden gracefully if no data.
export default function MarketValueChart({ name, en }: { name: string; en: boolean }) {
  const [pts, setPts] = useState<Point[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let cancel = false
    fetch(`/api/player-market-value?name=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok && Array.isArray(j.points)) setPts(j.points) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoaded(true) })
    return () => { cancel = true }
  }, [name])

  if (!loaded || pts.length < 2) return null // nothing useful to show

  const W = 720, H = 200, padL = 8, padR = 8, padT = 24, padB = 18
  const innerW = W - padL - padR, innerH = H - padT - padB
  const ts = pts.map(p => new Date(p.date).getTime())
  const tMin = Math.min(...ts), tMax = Math.max(...ts)
  const vMax = Math.max(...pts.map(p => p.value)) || 1
  const x = (t: number) => padL + (tMax === tMin ? 0 : (t - tMin) / (tMax - tMin)) * innerW
  const y = (v: number) => padT + innerH - (v / vMax) * innerH
  const xy = pts.map(p => [x(new Date(p.date).getTime()), y(p.value)] as const)
  const line = xy.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ')
  const area = `${line} L${xy[xy.length - 1][0].toFixed(1)},${(padT + innerH).toFixed(1)} L${xy[0][0].toFixed(1)},${(padT + innerH).toFixed(1)} Z`

  const peak = pts.reduce((b, p) => (p.value > b.value ? p : b), pts[0])
  const current = pts[pts.length - 1]

  // Club spells (consecutive points at the same club).
  const spells: { club: string; crest?: string; from: string; to: string }[] = []
  for (const p of pts) {
    const last = spells[spells.length - 1]
    if (last && last.club === p.club) last.to = p.date
    else spells.push({ club: p.club, crest: p.crest, from: p.date, to: p.date })
  }

  // Year ticks.
  const yMin = new Date(tMin).getFullYear(), yMax = new Date(tMax).getFullYear()
  const years: number[] = []
  for (let yy = yMin; yy <= yMax; yy += Math.max(1, Math.ceil((yMax - yMin) / 6))) years.push(yy)

  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
          {en ? 'Market value' : 'Valor de mercado'}
        </span>
        <span style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: 'var(--ts-muted)' }}>{en ? 'Now' : 'Actual'}: <strong style={{ color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{current.label}</strong></span>
          <span style={{ color: 'var(--ts-muted)' }}>{en ? 'Peak' : 'Máximo'}: <strong style={{ color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>{peak.label}</strong></span>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="mvgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ts-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--ts-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#mvgrad)" />
        <path d={line} fill="none" stroke="var(--ts-primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* peak marker */}
        <circle cx={x(new Date(peak.date).getTime())} cy={y(peak.value)} r={3.5} fill="var(--ts-primary)" />
        {years.map(yy => {
          const px = x(new Date(`${yy}-06-01`).getTime())
          return <text key={yy} x={px} y={H - 4} fontSize="10" fill="var(--ts-faint)" textAnchor="middle">{yy}</text>
        })}
      </svg>

      {/* Club spells */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {spells.map((s, i) => (
          <span key={i} title={`${s.from} → ${s.to}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', background: 'var(--ts-card2)', border: '1px solid var(--ts-border)', borderRadius: 999, fontSize: 11, color: 'var(--ts-text)' }}>
            {s.crest && <CrestImg src={s.crest} alt={s.club} size={14} />}
            {s.club} <span style={{ color: 'var(--ts-faint)' }}>{new Date(s.from).getFullYear()}{new Date(s.to).getFullYear() !== new Date(s.from).getFullYear() ? `–${String(new Date(s.to).getFullYear()).slice(2)}` : ''}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
