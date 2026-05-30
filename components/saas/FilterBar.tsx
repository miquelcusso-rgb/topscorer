'use client'
import { useState } from 'react'

export interface FilterChip {
  key: string
  label: string
  value: string
  active?: boolean
}

interface FilterBarProps {
  filters: FilterChip[]
  count: { current: number; total: number }
  view?: 'list' | 'grid'
  onViewChange?: (v: 'list' | 'grid') => void
  onFilterClick?: (key: string) => void
  addFilterLabel?: string
}

export default function FilterBar({
  filters,
  count,
  view: viewProp,
  onViewChange,
  onFilterClick,
  addFilterLabel = '+ Añadir filtro',
}: FilterBarProps) {
  const [internalView, setInternalView] = useState<'list' | 'grid'>('list')
  const view = viewProp ?? internalView
  const setView = (v: 'list' | 'grid') => {
    if (onViewChange) onViewChange(v)
    else setInternalView(v)
  }

  return (
    <div
      className="saas-filter-bar saas-filter-chips"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 14px',
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 10,
        flexWrap: 'wrap',
      }}
    >
      {filters.map(f => {
        const active = f.active === true
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterClick?.(f.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              fontSize: 12,
              background: active ? 'var(--ts-primary-soft)' : 'transparent',
              color: active ? 'var(--ts-primary)' : 'var(--ts-text)',
              border: `1px solid ${active ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ color: 'var(--ts-muted)', fontWeight: 500 }}>{f.label}:</span>
            <span style={{ fontWeight: 600 }}>{f.value}</span>
            <svg width={9} height={9} viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path d="M2 3l2.5 2.5L7 3" />
            </svg>
          </button>
        )
      })}
      <span
        style={{
          padding: '6px 10px',
          fontSize: 12,
          color: 'var(--ts-muted)',
          cursor: 'pointer',
          border: '1px dashed var(--ts-border)',
          borderRadius: 6,
        }}
      >
        {addFilterLabel}
      </span>

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 12, color: 'var(--ts-muted)' }}>
        {count.current} / {count.total}
      </span>
      <div style={{ width: 1, height: 18, background: 'var(--ts-border)' }} />
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 2,
          background: 'var(--ts-card2)',
          borderRadius: 6,
        }}
      >
        {(['list', 'grid'] as const).map(v => {
          const active = view === v
          return (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-label={v === 'list' ? 'List view' : 'Grid view'}
              style={{
                width: 28,
                height: 24,
                fontSize: 12,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: active ? 'var(--ts-surface)' : 'transparent',
                color: active ? 'var(--ts-text)' : 'var(--ts-muted)',
                fontFamily: 'inherit',
              }}
            >
              {v === 'list' ? '☰' : '⊞'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
