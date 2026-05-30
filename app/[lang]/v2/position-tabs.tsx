'use client'
import { useState } from 'react'
import type { Lang } from '@/lib/i18n'

type PositionTabId = 'fw' | 'ast' | 'mf' | 'df' | 'gk'

interface PositionTabsProps {
  lang: Lang
  active?: PositionTabId
  onChange?: (id: PositionTabId) => void
}

export default function V2PositionTabs({ lang, active: activeProp, onChange }: PositionTabsProps) {
  const [internal, setInternal] = useState<PositionTabId>('fw')
  const active = activeProp ?? internal
  const set = (id: PositionTabId) => {
    if (onChange) onChange(id)
    else setInternal(id)
  }

  const labels: Record<PositionTabId, string> =
    lang === 'en'
      ? { fw: 'Forwards', ast: 'Assisters', mf: 'Midfielders', df: 'Defenders', gk: 'Keepers' }
      : { fw: 'Delanteros', ast: 'Asistentes', mf: 'Centrocampistas', df: 'Defensas', gk: 'Porteros' }

  const tabs: Array<{ id: PositionTabId; icon: string }> = [
    { id: 'fw',  icon: '⚽' },
    { id: 'ast', icon: '🅰' },
    { id: 'mf',  icon: '⇄' },
    { id: 'df',  icon: '🛡' },
    { id: 'gk',  icon: '🧤' },
  ]

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tabs.map(tab => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => set(tab.id)}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              background: isActive ? 'var(--ts-teal-soft)' : 'transparent',
              color: isActive ? 'var(--ts-teal)' : 'var(--ts-text)',
              border: `1px solid ${isActive ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13, opacity: isActive ? 1 : 0.7 }}>{tab.icon}</span>
            {labels[tab.id]}
          </button>
        )
      })}
    </div>
  )
}
