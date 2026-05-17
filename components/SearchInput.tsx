'use client'

import { useState, useRef, useEffect } from 'react'
import type { EnrichedPlayer } from '@/types'

interface Props {
  pool: EnrichedPlayer[]
  pinned: Record<string, boolean>
  onAdd: (name: string) => void
}

export default function SearchInput({ pool, pinned, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const matches = query.trim().length > 0
    ? [...new Map(
        pool
          .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
          .map(p => [p.name, p])
      ).values()].slice(0, 8)
    : []

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref} style={{ minWidth: 220, maxWidth: 300 }}>
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] pointer-events-none" style={{ color: '#5a5a7a' }}>
          ⌕
        </span>
        <input
          type="text"
          value={query}
          placeholder="Buscar jugador…"
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          className="w-full pl-7 pr-3 py-1.5 text-[12px] rounded-sm outline-none transition-colors duration-150"
          style={{
            background: '#10111e',
            border: '1px solid #1a1b2e',
            color: '#e5e5f2',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#f0c040'; setOpen(true) }}
          onBlur={e => { e.currentTarget.style.borderColor = '#1a1b2e' }}
        />

        {open && matches.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 z-50 overflow-y-auto rounded-sm"
            style={{ background: '#0e0f1c', border: '1px solid #252740', maxHeight: 220, boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}
          >
            {matches.map(p => {
              const added = !!pinned[p.name]
              return (
                <div
                  key={p.name}
                  className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-[12px] transition-colors duration-100"
                  style={{ color: added ? '#5a5a7a' : '#e5e5f2' }}
                  onMouseEnter={e => { if (!added) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  onClick={() => {
                    if (!added) { onAdd(p.name); setQuery(''); setOpen(false) }
                  }}
                >
                  <span>
                    {p.flag && <span className="mr-1">{p.flag}</span>}
                    <strong>{p.name}</strong>{' '}
                    <span className="text-[10.5px]" style={{ color: '#5a5a7a' }}>{p.club} · {p.age}a</span>
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0"
                    style={{
                      color: added ? '#5a5a7a' : '#38c47a',
                      border: `1px solid ${added ? '#36364e' : 'rgba(56,196,122,.3)'}`,
                    }}
                  >
                    {added ? 'Ya añadido' : '+ Añadir'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
