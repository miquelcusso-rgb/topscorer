'use client'
import { useState, useRef, useEffect } from 'react'

export interface FilterOption { value: string; label: string }
export interface FilterChip {
  key: string
  label: string
  value: string
  active?: boolean
  /** Options for the dropdown menu. If omitted, clicking cycles (legacy). */
  options?: FilterOption[]
}

interface FilterBarProps {
  filters: FilterChip[]
  count: { current: number; total: number }
  view?: 'list' | 'grid'
  onViewChange?: (v: 'list' | 'grid') => void
  onFilterClick?: (key: string) => void
  /** Pick a specific value from a chip's dropdown. */
  onFilterSelect?: (key: string, value: string) => void
  addStatLabel?: string
  /** Stats available to add as a column, + handler. */
  statOptions?: FilterOption[]
  onAddStat?: (value: string) => void
}

// A chip that opens a dropdown menu to pick a value.
function Dropdown({ chip, onSelect, onFilterClick }: {
  chip: FilterChip
  onSelect?: (key: string, value: string) => void
  onFilterClick?: (key: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const active = chip.active === true
  const hasMenu = !!chip.options?.length && !!onSelect
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { if (hasMenu) setOpen(o => !o); else onFilterClick?.(chip.key) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 12,
          background: active ? 'var(--ts-primary-soft)' : 'transparent',
          color: active ? 'var(--ts-primary)' : 'var(--ts-text)',
          border: `1px solid ${active ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
          borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ color: 'var(--ts-muted)', fontWeight: 500 }}>{chip.label}:</span>
        <span style={{ fontWeight: 600 }}>{chip.value}</span>
        <svg width={9} height={9} viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path d="M2 3l2.5 2.5L7 3" />
        </svg>
      </button>
      {open && hasMenu && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, minWidth: 160,
          background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 8,
          boxShadow: '0 10px 28px rgba(0,0,0,.16)', overflow: 'hidden', padding: 4,
        }}>
          {chip.options!.map(o => {
            const sel = o.label === chip.value
            return (
              <button key={o.value} type="button"
                onClick={() => { onSelect!(chip.key, o.value); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', fontSize: 12,
                  background: sel ? 'var(--ts-card2)' : 'transparent', color: 'var(--ts-text)',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontWeight: sel ? 700 : 500,
                }}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function FilterBar({
  filters, count, view: viewProp, onViewChange, onFilterClick, onFilterSelect,
  addStatLabel = '+ Añadir stat', statOptions, onAddStat,
}: FilterBarProps) {
  const [internalView, setInternalView] = useState<'list' | 'grid'>('list')
  const view = viewProp ?? internalView
  const setView = (v: 'list' | 'grid') => { if (onViewChange) onViewChange(v); else setInternalView(v) }

  const [statOpen, setStatOpen] = useState(false)
  const statRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (statRef.current && !statRef.current.contains(e.target as Node)) setStatOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="saas-filter-bar saas-filter-chips" style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
      background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, flexWrap: 'wrap',
    }}>
      {filters.map(f => (
        <Dropdown key={f.key} chip={f} onSelect={onFilterSelect} onFilterClick={onFilterClick} />
      ))}

      {/* Add a stat column */}
      {statOptions?.length && onAddStat ? (
        <div ref={statRef} style={{ position: 'relative' }}>
          <button type="button" onClick={() => setStatOpen(o => !o)}
            style={{ padding: '6px 10px', fontSize: 12, color: 'var(--ts-muted)', cursor: 'pointer',
              border: '1px dashed var(--ts-border)', borderRadius: 6, background: 'transparent', fontFamily: 'inherit' }}>
            {addStatLabel}
          </button>
          {statOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, minWidth: 180, maxHeight: 280, overflowY: 'auto',
              background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 8,
              boxShadow: '0 10px 28px rgba(0,0,0,.16)', padding: 4,
            }}>
              {statOptions.map(o => (
                <button key={o.value} type="button"
                  onClick={() => { onAddStat(o.value); setStatOpen(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', fontSize: 12,
                    background: 'transparent', color: 'var(--ts-text)', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <span style={{ padding: '6px 10px', fontSize: 12, color: 'var(--ts-muted)', border: '1px dashed var(--ts-border)', borderRadius: 6 }}>
          {addStatLabel}
        </span>
      )}

      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 12, color: 'var(--ts-muted)' }}>{count.current} / {count.total}</span>
      <div style={{ width: 1, height: 18, background: 'var(--ts-border)' }} />
      <div style={{ display: 'flex', gap: 4, padding: 2, background: 'var(--ts-card2)', borderRadius: 6 }}>
        {(['list', 'grid'] as const).map(v => {
          const active = view === v
          return (
            <button key={v} type="button" onClick={() => setView(v)} aria-label={v === 'list' ? 'List view' : 'Grid view'}
              style={{ width: 28, height: 24, fontSize: 12, border: 'none', borderRadius: 4, cursor: 'pointer',
                background: active ? 'var(--ts-surface)' : 'transparent', color: active ? 'var(--ts-text)' : 'var(--ts-muted)', fontFamily: 'inherit' }}>
              {v === 'list' ? '☰' : '⊞'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
