'use client'
import { useState, useEffect } from 'react'
import type { PlayerData } from '@/types'

interface Row { season: string; club: string; league: string; pj?: number; goles?: number; asist?: number; rating?: number }

const fmtSeason = (s: string) => (s.length === 4 ? `${s.slice(0, 2)}/${s.slice(2)}` : s)

// Consolidated career block: summary totals + a per-season evolution chart
// (goals + assists, club shown below each season) + the full history table.
// Bundled seasons are merged with the full real career fetched on demand.
export default function PlayerCareer({ apiId, seasons, en }: { apiId?: number; seasons: PlayerData[]; en: boolean }) {
  const [career, setCareer] = useState<Row[]>([])
  const [loading, setLoading] = useState(!!apiId)
  useEffect(() => {
    if (!apiId) return
    let cancel = false
    fetch(`/api/player-career?id=${apiId}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok && Array.isArray(j.data)) setCareer(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [apiId])

  // Merge static (bundled) + career (real, overrides), newest first.
  const byKey = new Map<string, Row>()
  for (const s of seasons) byKey.set(s.season, { season: s.season, club: s.club, league: s.league, pj: s.pj, goles: s.goles, asist: s.asist, rating: s.rating })
  for (const c of career) byKey.set(c.season, c)
  const rows = [...byKey.values()].sort((a, b) => Number(b.season) - Number(a.season))
  const chrono = [...rows].reverse() // oldest → newest for the chart

  // Career totals / averages.
  const tApps = rows.reduce((s, r) => s + (r.pj ?? 0), 0)
  const tG = rows.reduce((s, r) => s + (r.goles ?? 0), 0)
  const tA = rows.reduce((s, r) => s + (r.asist ?? 0), 0)
  const gpg = tApps ? (tG / tApps).toFixed(2) : '—'
  const best = rows.reduce<Row | null>((b, r) => ((r.goles ?? 0) > (b?.goles ?? -1) ? r : b), null)
  const maxG = Math.max(1, ...chrono.map(r => Math.max(r.goles ?? 0, r.asist ?? 0)))

  const summary: Array<[string, string | number, 'primary' | 'teal' | 'text']> = [
    [en ? 'Seasons' : 'Temporadas', rows.length, 'text'],
    [en ? 'Apps' : 'Partidos', tApps, 'text'],
    [en ? 'Goals' : 'Goles', tG, 'primary'],
    [en ? 'Assists' : 'Asistencias', tA, 'teal'],
    [en ? 'Goals/game' : 'Goles/partido', gpg, 'primary'],
    [en ? 'Best season' : 'Mejor temp.', best ? `${best.goles}` : '—', 'text'],
  ]
  const color = (t: string) => (t === 'primary' ? 'var(--ts-primary)' : t === 'teal' ? 'var(--ts-teal)' : 'var(--ts-text)')

  const card: React.CSSProperties = { background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }
  const head: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 12 }

  if (loading && rows.length === 0) {
    return <div id="seasons" style={{ ...card, scrollMarginTop: 80, textAlign: 'center', color: 'var(--ts-faint)', fontSize: 12 }}>{en ? 'Loading career…' : 'Cargando trayectoria…'}</div>
  }
  if (rows.length === 0) {
    return <div id="seasons" style={{ ...card, scrollMarginTop: 80, color: 'var(--ts-muted)', fontSize: 13 }}>{en ? 'No career data yet.' : 'Aún no hay datos de trayectoria.'}</div>
  }

  return (
    <div id="seasons" style={{ display: 'flex', flexDirection: 'column', gap: 18, scrollMarginTop: 80 }}>
      {/* Career summary */}
      <div style={card}>
        <div style={head}>{en ? 'Career totals' : 'Totales de carrera'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 12 }}>
          {summary.map(([label, value, tone], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 26, lineHeight: 1, color: color(tone), fontVariantNumeric: 'tabular-nums' }}>{value}</span>
              <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution chart — goals (gold) + assists (teal) per season, club below */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <span style={head as React.CSSProperties}>{en ? 'Evolution · per season' : 'Evolución · por temporada'}</span>
          <span style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--ts-muted)' }}>
            <span><span style={{ color: 'var(--ts-primary)' }}>■</span> {en ? 'Goals' : 'Goles'}</span>
            <span><span style={{ color: 'var(--ts-teal)' }}>■</span> {en ? 'Assists' : 'Asist.'}</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', overflowX: 'auto', paddingBottom: 4, minHeight: 150 }}>
          {chrono.map((r, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 34, flex: '1 0 34px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 110 }}>
                <div title={`${r.goles ?? 0} ${en ? 'goals' : 'goles'}`} style={{ width: 9, height: `${Math.max(2, ((r.goles ?? 0) / maxG) * 100)}%`, background: 'var(--ts-primary)', borderRadius: '2px 2px 0 0' }} />
                <div title={`${r.asist ?? 0} ${en ? 'assists' : 'asist.'}`} style={{ width: 9, height: `${Math.max(2, ((r.asist ?? 0) / maxG) * 100)}%`, background: 'var(--ts-teal)', borderRadius: '2px 2px 0 0' }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{r.goles ?? 0}</span>
              <span style={{ fontSize: 9, color: 'var(--ts-muted)' }}>{fmtSeason(r.season)}</span>
              <span style={{ fontSize: 8, color: 'var(--ts-faint)', textAlign: 'center', lineHeight: 1.1, maxWidth: 44, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.club}>{r.club}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full history table */}
      <div style={card}>
        <div style={head}>{en ? 'Career history' : 'Trayectoria'}</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                {[en ? 'Season' : 'Temp.', en ? 'Club' : 'Club', en ? 'League' : 'Liga', 'PJ', en ? 'Goals' : 'Goles', en ? 'Assists' : 'Asist.', en ? 'Rating' : 'Nota'].map((h, i) => (
                  <th key={i} style={{ textAlign: i <= 2 ? 'left' : 'right', padding: '8px 10px', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ts-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--ts-hairline)' }}>
                  <td style={{ padding: '9px 10px', fontWeight: 600 }}>{fmtSeason(r.season)}</td>
                  <td style={{ padding: '9px 10px' }}>{r.club}</td>
                  <td style={{ padding: '9px 10px', color: 'var(--ts-muted)' }}>{r.league}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.pj ?? '—'}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>{r.goles ?? 0}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--ts-teal)', fontVariantNumeric: 'tabular-nums' }}>{r.asist ?? 0}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.rating != null ? r.rating.toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
