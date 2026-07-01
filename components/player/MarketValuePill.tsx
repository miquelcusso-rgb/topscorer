'use client'
import { useState, useEffect } from 'react'

// Headline market value on the fiche. Owner rule: prefer the FRESH Transfermarkt
// value (latest point of the real market-value history) over the curated fallback;
// falls back to the curated value while loading / if TM has none. Reuses the same
// /api/player-market-value endpoint (7d server-cached) the chart uses.
export default function MarketValuePill({ name, fallback }: { name: string; fallback?: string }) {
  const [val, setVal] = useState<string | undefined>(fallback)
  const [fromTm, setFromTm] = useState(false)
  useEffect(() => {
    let cancel = false
    fetch(`/api/player-market-value?name=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(j => {
        if (cancel || !j.ok || !Array.isArray(j.points) || !j.points.length) return
        const cur = j.points[j.points.length - 1]
        if (cur?.label) { setVal(cur.label); setFromTm(true) }
      })
      .catch(() => {})
    return () => { cancel = true }
  }, [name])

  if (!val) return null
  return (
    <span>
      Valor: <strong style={{ color: 'var(--ts-text)' }}>{val}</strong>
      {fromTm && <span style={{ fontSize: 10, color: 'var(--ts-faint)' }}> · Transfermarkt</span>}
    </span>
  )
}
