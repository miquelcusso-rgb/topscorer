'use client'
import { useState, useEffect } from 'react'
import RadarCard from './RadarCard'

interface RadarPoint { axisId: string; label: string; labelEn: string; percentile: number | null; rawValue: number | null; source: string | null; status: string; isProxy: boolean; note?: string }
interface UnderstatRaw { xG: number; npxG: number; xA: number; shots: number; keyPasses: number; minutes: number; xGChain: number; xGBuildup: number; npg: number }
interface Data { position: string; autoPosition?: string; leagueHasUnderstat: boolean; axes: RadarPoint[]; understat?: UnderstatRaw | null }

const POS_LABEL: Record<string, { es: string; en: string }> = {
  POR: { es: 'Portero', en: 'Goalkeeper' }, DEF: { es: 'Defensa', en: 'Defender' },
  MID: { es: 'Centrocampista', en: 'Central mid' }, ST: { es: 'Delantero', en: 'Forward' },
  WAM: { es: 'Extremo / mediapunta', en: 'Winger / AM' },
  AMF: { es: 'Mediapunta', en: 'Attacking mid' }, DMF: { es: 'Mediocentro def.', en: 'Defensive mid' },
}
// Order shown in the manual profile selector.
const SELECTABLE: string[] = ['ST', 'WAM', 'AMF', 'MID', 'DMF', 'DEF', 'POR']

// Brand-styled positional-template picker. Defaults to the auto-detected template;
// choosing the auto value resets to follow auto-detection (onChange(null)).
function ProfileSelect({ value, auto, en, onChange }: {
  value: string
  auto?: string
  en: boolean
  onChange: (tag: string | null) => void
}) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, position: 'relative' }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ts-faint)' }}>
        {en ? 'Profile' : 'Perfil'}
      </span>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value === auto ? null : e.target.value)}
          aria-label={en ? 'Radar profile template' : 'Plantilla de perfil del radar'}
          style={{
            appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
            minHeight: 44, padding: '0 30px 0 12px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--ts-card2)', color: 'var(--ts-text)',
            border: '1px solid var(--ts-border)',
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            outline: 'none', lineHeight: '44px',
          }}
        >
          {SELECTABLE.map(tag => (
            <option key={tag} value={tag}>
              {(POS_LABEL[tag]?.[en ? 'en' : 'es'] ?? tag) + (tag === auto ? (en ? ' (auto)' : ' (auto)') : '')}
            </option>
          ))}
        </select>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="var(--ts-muted)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          style={{ position: 'absolute', right: 10, pointerEvents: 'none' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </label>
  )
}
const SRC_LABEL: Record<string, string> = { understat: 'Understat (xG)', api_football: 'API-Football' }

export default function PlayerRadar({ apiId, en }: { apiId?: number; en: boolean }) {
  const [data, setData] = useState<Data | null>(null)
  const [loaded, setLoaded] = useState(false)
  // Manually-selected positional template. null = follow auto-detection.
  const [profile, setProfile] = useState<string | null>(null)
  useEffect(() => {
    if (!apiId) { setLoaded(true); return }
    let cancel = false
    const qs = profile ? `&profile=${profile}` : ''
    fetch(`/api/player-radar?id=${apiId}${qs}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok) setData(j) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoaded(true) })
    return () => { cancel = true }
  }, [apiId, profile])

  if (!loaded) return <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18, textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{en ? 'Loading radar…' : 'Cargando radar…'}</div>
  if (!data) return null

  const usable = data.axes.filter(a => a.percentile != null)
  if (usable.length < 3) return null

  const lbl = (a: RadarPoint) => (en ? (a.labelEn || a.label) : a.label)
  const posLabel = POS_LABEL[data.position]?.[en ? 'en' : 'es'] ?? data.position
  const radarAxes = usable.map(a => ({
    label: lbl(a) + (a.isProxy ? ' *' : ''),
    value: a.percentile as number,
    pct: a.percentile as number,
  }))
  // Bottom stats = the player's 3 strongest axes (by percentile).
  const top3 = [...usable].sort((a, b) => (b.percentile ?? 0) - (a.percentile ?? 0)).slice(0, 3)
  const stats = top3.map(a => ({ value: `${a.percentile}`, label: lbl(a), tone: 'primary' as const }))

  const proxies = data.axes.filter(a => a.isProxy && a.percentile != null)
  const us = data.understat
  const f1 = (v?: number) => (v != null ? v.toFixed(1) : '—')
  const xgItems: Array<[string, string]> = us ? [
    ['xG', f1(us.xG)],
    ['npxG', f1(us.npxG)],
    ['xA', f1(us.xA)],
    [en ? 'Key P.' : 'P. clave', us.keyPasses != null ? String(us.keyPasses) : '—'],
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {us && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 8 }}>
            {en ? 'Expected (Understat)' : 'Esperado (Understat)'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {xgItems.map(([label, value], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 22, lineHeight: 1, color: i === 0 ? 'var(--ts-primary)' : i === 2 ? 'var(--ts-teal)' : 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                <span style={{ fontSize: 10, color: 'var(--ts-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <RadarCard
        title={en ? `Performance profile · ${posLabel}` : `Perfil de rendimiento · ${posLabel}`}
        subtitle={en ? 'Percentile vs same position in the league' : 'Percentil vs su posición en la liga'}
        axes={radarAxes}
        stats={stats}
        toolbar={<ProfileSelect value={data.position} auto={data.autoPosition} en={en} onChange={setProfile} />}
      />
      {proxies.length > 0 && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 8 }}>
            * {en ? 'Approximated axes' : 'Ejes aproximados'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {proxies.map(a => (
              <div key={a.axisId} style={{ fontSize: 11, color: 'var(--ts-muted)' }}>
                <strong style={{ color: 'var(--ts-text)' }}>{en ? (a.labelEn || a.label) : a.label}</strong> — {en ? 'via' : 'vía'} {SRC_LABEL[a.source ?? ''] ?? a.source}
                {a.note ? ` · ${a.note}` : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
