'use client'
import { useState, useEffect } from 'react'

interface Injury { type: string; reason: string; date: string; league: string }
interface Sidelined { type: string; start: string; end: string | null }

interface Data { injuries: Injury[]; sidelined: Sidelined[]; loaded: boolean }

// Shared fetch hook — both the availability badge and the history list read the
// same endpoint (server-side cache dedupes), so each renders independently in
// its own tab without prop-drilling across the tab boundary.
function useInjuryData(apiId?: number): Data {
  const [data, setData] = useState<Data>({ injuries: [], sidelined: [], loaded: false })
  useEffect(() => {
    if (!apiId) { setData({ injuries: [], sidelined: [], loaded: true }); return }
    let cancel = false
    fetch(`/api/player-injuries?id=${apiId}`)
      .then(r => r.json())
      .then(j => { if (!cancel) setData({ injuries: j.injuries ?? [], sidelined: j.sidelined ?? [], loaded: true }) })
      .catch(() => { if (!cancel) setData({ injuries: [], sidelined: [], loaded: true }) })
    return () => { cancel = true }
  }, [apiId])
  return data
}

// 🟢 Available / 🔴 Injured pill. Only shows once data has loaded AND there is
// a positive signal (a current injury record present → Injured; loaded with
// none → Available). Hidden entirely when there's no apiId.
export function AvailabilityBadge({ apiId, en }: { apiId?: number; en: boolean }) {
  const { injuries, loaded } = useInjuryData(apiId)
  if (!apiId || !loaded) return null
  // `/injuries?player=&season=` returns EVERY injury record of the season, incl.
  // long-healed knocks → it was marking almost everyone "Injured". Only treat as
  // currently injured when there's a record dated within the last ~5 weeks.
  const RECENT_MS = 35 * 86_400_000
  const injured = injuries.some(i => {
    if (!i.date) return false
    const t = new Date(i.date).getTime()
    return !isNaN(t) && Date.now() - t < RECENT_MS
  })
  const label = injured ? (en ? 'Injured' : 'Lesionado') : (en ? 'Available' : 'Disponible')
  const color = injured ? 'var(--ts-red)' : 'var(--ts-teal)'
  return (
    <div
      title={injured && injuries[0]?.type ? injuries[0].type : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.02em',
        background: injured ? 'var(--ts-red-soft, rgba(220,60,60,0.12))' : 'var(--ts-teal-soft)',
        color,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {injured ? '🔴' : '🟢'} {label}
    </div>
  )
}

// "Injuries & suspensions" history list (sidelined timeline). Hidden when empty.
export function InjuryHistory({ apiId, en }: { apiId?: number; en: boolean }) {
  const { sidelined, loaded } = useInjuryData(apiId)
  if (!loaded || sidelined.length === 0) return null

  const card: React.CSSProperties = { background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }
  const head: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }
  const fmt = (d: string) => { if (!d) return ''; const x = new Date(d); return isNaN(x.getTime()) ? d : x.toLocaleDateString(en ? 'en-US' : 'es-ES', { month: 'short', year: 'numeric' }) }
  const isSuspension = (t: string) => /suspend|ban|sanc|red card|tarjeta/i.test(t)

  return (
    <div style={card}>
      <div style={head}>🩹 {en ? 'Injuries & suspensions' : 'Lesiones y sanciones'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sidelined.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < sidelined.length - 1 ? '1px solid var(--ts-hairline)' : 'none' }}>
            <span style={{ fontSize: 13 }}>{isSuspension(s.type) ? '🟥' : '🩹'}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--ts-text)' }}>{s.type}</span>
            <span style={{ flexShrink: 0, fontSize: 11, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(s.start)}{s.end ? ` – ${fmt(s.end)}` : (en ? ' – now' : ' – actual')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
