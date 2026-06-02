'use client'
import { useState, useEffect } from 'react'
import RadarCard from './RadarCard'

interface RadarPoint { axisId: string; label: string; percentile: number | null; rawValue: number | null; source: string | null; status: string; isProxy: boolean; note?: string }
interface Data { position: string; leagueHasUnderstat: boolean; axes: RadarPoint[] }

const POS_LABEL: Record<string, { es: string; en: string }> = {
  POR: { es: 'Portero', en: 'Goalkeeper' }, DEF: { es: 'Defensa', en: 'Defender' },
  MID: { es: 'Centrocampista', en: 'Midfielder' }, ST: { es: 'Delantero', en: 'Forward' },
  WAM: { es: 'Extremo / mediapunta', en: 'Winger / AM' },
}
const SRC_LABEL: Record<string, string> = { understat: 'Understat (xG)', api_football: 'API-Football' }

export default function PlayerRadar({ apiId, en }: { apiId?: number; en: boolean }) {
  const [data, setData] = useState<Data | null>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!apiId) { setLoaded(true); return }
    let cancel = false
    fetch(`/api/player-radar?id=${apiId}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok) setData(j) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoaded(true) })
    return () => { cancel = true }
  }, [apiId])

  if (!loaded) return <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18, textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{en ? 'Loading radar…' : 'Cargando radar…'}</div>
  if (!data) return null

  const usable = data.axes.filter(a => a.percentile != null)
  if (usable.length < 3) return null

  const posLabel = POS_LABEL[data.position]?.[en ? 'en' : 'es'] ?? data.position
  const radarAxes = usable.map(a => ({
    label: a.label + (a.isProxy ? ' *' : ''),
    value: a.percentile as number,
    pct: a.percentile as number,
  }))
  // Bottom stats = the player's 3 strongest axes (by percentile).
  const top3 = [...usable].sort((a, b) => (b.percentile ?? 0) - (a.percentile ?? 0)).slice(0, 3)
  const stats = top3.map(a => ({ value: `${a.percentile}`, label: a.label, tone: 'primary' as const }))

  const proxies = data.axes.filter(a => a.isProxy && a.percentile != null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <RadarCard
        title={en ? `Performance profile · ${posLabel}` : `Perfil de rendimiento · ${posLabel}`}
        subtitle={en ? 'Percentile vs same position in the league' : 'Percentil vs su posición en la liga'}
        axes={radarAxes}
        stats={stats}
      />
      {proxies.length > 0 && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 8 }}>
            * {en ? 'Approximated axes' : 'Ejes aproximados'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {proxies.map(a => (
              <div key={a.axisId} style={{ fontSize: 11, color: 'var(--ts-muted)' }}>
                <strong style={{ color: 'var(--ts-text)' }}>{a.label}</strong> — {en ? 'via' : 'vía'} {SRC_LABEL[a.source ?? ''] ?? a.source}
                {a.note ? ` · ${a.note}` : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
