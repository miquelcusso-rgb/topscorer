'use client'
import { useState } from 'react'

export interface SeasonRow {
  s: string
  club: string
  league: string
  pj: number
  g: number
  a: number
  min: number
  trophies: string
  current?: boolean
}

interface SeasonTableProps {
  title: string
  subtitle: string
  rows: SeasonRow[]
  scopes?: string[]
}

const GRID = '85px 1fr 90px 40px 38px 38px 60px 50px 70px'

export default function SeasonTable({
  title,
  subtitle,
  rows,
  scopes = ['Liga', 'UCL', 'Total'],
}: SeasonTableProps) {
  const [scope, setScope] = useState<string>(scopes[scopes.length - 1] ?? 'Total')

  const totals = rows.reduce(
    (acc, r) => {
      acc.pj += r.pj
      acc.g += r.g
      acc.a += r.a
      acc.min += r.min
      return acc
    },
    { pj: 0, g: 0, a: 0, min: 0 },
  )
  const mPerG = totals.g > 0 ? Math.round(totals.min / totals.g) : 0

  return (
    <div
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--ts-divider)',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)' }}>
            {title}
          </h3>
          <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2 }}>{subtitle}</div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 2,
            background: 'var(--ts-card2)',
            borderRadius: 6,
          }}
        >
          {scopes.map(s => {
            const active = s === scope
            return (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 4,
                  fontFamily: 'inherit',
                  background: active ? 'var(--ts-surface)' : 'transparent',
                  color: active ? 'var(--ts-text)' : 'var(--ts-muted)',
                }}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 8,
          padding: '8px 18px',
          background: 'var(--ts-card2)',
          fontSize: 10,
          color: 'var(--ts-muted)',
          letterSpacing: '0.06em',
          fontWeight: 600,
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--ts-divider)',
        }}
      >
        <span>Temp.</span>
        <span>Club</span>
        <span>Liga</span>
        <span style={{ textAlign: 'right' }}>PJ</span>
        <span style={{ textAlign: 'right', color: 'var(--ts-primary)' }}>G</span>
        <span style={{ textAlign: 'right', color: 'var(--ts-teal)' }}>A</span>
        <span style={{ textAlign: 'right' }}>Min</span>
        <span style={{ textAlign: 'right' }}>M/G</span>
        <span style={{ textAlign: 'right' }}>Trofeos</span>
      </div>

      {rows.map(r => (
        <div
          key={r.s}
          style={{
            display: 'grid',
            gridTemplateColumns: GRID,
            gap: 8,
            padding: '10px 18px',
            alignItems: 'center',
            fontSize: 12,
            borderBottom: '1px solid var(--ts-hairline)',
            background: r.current ? 'var(--ts-primary-soft)' : 'transparent',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              fontSize: 11,
              fontWeight: r.current ? 700 : 600,
              color: r.current ? 'var(--ts-primary)' : 'var(--ts-text)',
            }}
          >
            {r.s}
            {r.current && (
              <span style={{ marginLeft: 5, fontSize: 9, color: 'var(--ts-teal)' }}>●</span>
            )}
          </span>
          <span style={{ color: 'var(--ts-text)', fontWeight: 500 }}>{r.club}</span>
          <span style={{ color: 'var(--ts-muted)', fontSize: 11 }}>{r.league}</span>
          <span style={{ textAlign: 'right', color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {r.pj}
          </span>
          <span
            style={{
              textAlign: 'right',
              color: 'var(--ts-primary)',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {r.g}
          </span>
          <span
            style={{
              textAlign: 'right',
              color: 'var(--ts-teal)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {r.a}
          </span>
          <span
            style={{
              textAlign: 'right',
              color: 'var(--ts-muted)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: 11,
            }}
          >
            {r.min.toLocaleString()}
          </span>
          <span
            style={{
              textAlign: 'right',
              color: 'var(--ts-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {r.g > 0 ? Math.round(r.min / r.g) : '—'}
          </span>
          <span style={{ textAlign: 'right', color: 'var(--ts-text)', fontSize: 11 }}>
            {r.trophies}
          </span>
        </div>
      ))}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 8,
          padding: '12px 18px',
          alignItems: 'center',
          fontSize: 12,
          background: 'var(--ts-card2)',
          fontWeight: 700,
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 11,
            color: 'var(--ts-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Total
        </span>
        <span style={{ color: 'var(--ts-text)' }}>Carrera</span>
        <span style={{ color: 'var(--ts-muted)', fontSize: 11 }}>{rows.length} temp.</span>
        <span style={{ textAlign: 'right', color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>
          {totals.pj}
        </span>
        <span style={{ textAlign: 'right', color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {totals.g}
        </span>
        <span style={{ textAlign: 'right', color: 'var(--ts-teal)', fontVariantNumeric: 'tabular-nums' }}>
          {totals.a}
        </span>
        <span
          style={{
            textAlign: 'right',
            color: 'var(--ts-muted)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: 11,
          }}
        >
          {totals.min.toLocaleString()}
        </span>
        <span style={{ textAlign: 'right', color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {mPerG}
        </span>
        <span style={{ textAlign: 'right', color: 'var(--ts-primary)', fontSize: 11 }}>
          {rows.filter(r => r.trophies.includes('🏆')).length} 🏆
        </span>
      </div>
    </div>
  )
}
