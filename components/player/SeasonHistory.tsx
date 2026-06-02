'use client'
import { useState, useEffect } from 'react'
import type { PlayerData } from '@/types'

interface Row { season: string; club: string; league: string; pj?: number; goles?: number; asist?: number; rating?: number }

// Career history table (Trayectoria). Starts from the bundled seasons and, when
// the player has an API id, fetches the FULL real career on demand and merges it
// (real season rows override the bundled ones), so it isn't limited to the
// seasons shipped in the dataset (e.g. Messi's PSG / Inter Miami years).
export default function SeasonHistory({ apiId, seasons, en }: { apiId?: number; seasons: PlayerData[]; en: boolean }) {
  const [career, setCareer] = useState<Row[]>([])
  useEffect(() => {
    if (!apiId) return
    let cancel = false
    fetch(`/api/player-career?id=${apiId}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok && Array.isArray(j.data)) setCareer(j.data) })
      .catch(() => {})
    return () => { cancel = true }
  }, [apiId])

  const byKey = new Map<string, Row>()
  for (const s of seasons) byKey.set(s.season, { season: s.season, club: s.club, league: s.league, pj: s.pj, goles: s.goles, asist: s.asist, rating: s.rating })
  for (const c of career) byKey.set(c.season, c)
  const rows = [...byKey.values()].sort((a, b) => Number(b.season) - Number(a.season))

  const fmtSeason = (s: string) => (s.length === 4 ? `${s.slice(0, 2)}/${s.slice(2)}` : s)
  const cols: Array<[string, (r: Row) => string | number]> = [
    [en ? 'Season' : 'Temp.', r => fmtSeason(r.season)],
    [en ? 'Club' : 'Club', r => r.club],
    [en ? 'League' : 'Liga', r => r.league],
    [en ? 'Apps' : 'PJ', r => r.pj ?? '—'],
    [en ? 'Goals' : 'Goles', r => r.goles ?? 0],
    [en ? 'Assists' : 'Asist.', r => r.asist ?? 0],
    [en ? 'Rating' : 'Nota', r => (r.rating != null ? r.rating.toFixed(2) : '—')],
  ]

  return (
    <div id="seasons" style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18, scrollMarginTop: 80 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }}>
        {en ? 'Career history' : 'Trayectoria'}
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--ts-muted)', padding: '8px 0' }}>
          {en ? 'No season history available yet.' : 'Aún no hay histórico de temporadas.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                {cols.map(([h], i) => (
                  <th key={i} style={{ textAlign: i <= 2 ? 'left' : 'right', padding: '8px 10px', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ts-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--ts-hairline)' }}>
                  {cols.map(([, fn], ci) => (
                    <td key={ci} style={{
                      textAlign: ci <= 2 ? 'left' : 'right', padding: '9px 10px',
                      color: ci === 4 ? 'var(--ts-primary)' : ci === 5 ? 'var(--ts-teal)' : 'var(--ts-text)',
                      fontWeight: ci >= 3 ? 700 : 500, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                    }}>{fn(r)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
