'use client'
import { useState, useEffect } from 'react'

interface ScoutData {
  contractExpires?: string
  joined?: string
  foot?: string
  agent?: string
  outfitter?: string
  tmId?: number | null
}

const FOOT: Record<string, { es: string; en: string }> = {
  right: { es: 'Derecho', en: 'Right' }, left: { es: 'Izquierdo', en: 'Left' }, both: { es: 'Ambos', en: 'Both' },
}

// Reformat TM "dd/mm/yyyy" → "mmm yyyy" for compactness; pass through otherwise.
function fmtDate(d?: string, en?: boolean): string | undefined {
  if (!d) return undefined
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return d
  const months = en
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${months[Number(m[2]) - 1]} ${m[3]}`
}

export default function ScoutPanel({ name, en, releaseClause }: { name: string; en: boolean; releaseClause?: string | null }) {
  const [data, setData] = useState<ScoutData | null>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let cancel = false
    fetch(`/api/player-scout?name=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok) setData(j) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoaded(true) })
    return () => { cancel = true }
  }, [name])

  const rows: Array<[string, string]> = []
  if (data?.contractExpires) rows.push([en ? 'Contract until' : 'Contrato hasta', fmtDate(data.contractExpires, en) ?? data.contractExpires])
  if (releaseClause) rows.push([en ? 'Release clause' : 'Cláusula', releaseClause])
  if (data?.joined) rows.push([en ? 'At club since' : 'En el club desde', fmtDate(data.joined, en) ?? data.joined])
  if (data?.foot) rows.push([en ? 'Foot' : 'Pie', FOOT[data.foot.toLowerCase()]?.[en ? 'en' : 'es'] ?? data.foot])
  if (data?.agent) rows.push([en ? 'Agency' : 'Agencia', data.agent])
  if (data?.outfitter) rows.push([en ? 'Kit brand' : 'Marca', data.outfitter])

  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
          {en ? 'Scout report' : 'Informe scout'}
        </span>
      </div>
      {!loaded ? (
        <div style={{ fontSize: 12, color: 'var(--ts-faint)' }}>{en ? 'Loading scouting data…' : 'Cargando datos de scout…'}</div>
      ) : rows.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--ts-faint)' }}>{en ? 'No scouting data available.' : 'Sin datos de scout disponibles.'}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
          {rows.map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{k}</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 19, lineHeight: 1, color: 'var(--ts-text)' }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--ts-faint)' }}>
        {en ? 'Source: Transfermarkt · public data only' : 'Fuente: Transfermarkt · solo datos públicos'}
      </div>
    </div>
  )
}
