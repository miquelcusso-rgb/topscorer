'use client'
import { useState } from 'react'

export type ProfileTab = 'overview' | 'shots' | 'matches' | 'history' | 'compare'

interface ProfileTabsProps {
  tabs?: Array<{ id: ProfileTab; label: string }>
  active?: ProfileTab
  onChange?: (tab: ProfileTab) => void
}

const DEFAULT_TABS: Array<{ id: ProfileTab; label: string }> = [
  { id: 'overview', label: 'Resumen' },
  { id: 'shots',    label: 'Tiros' },
  { id: 'matches',  label: 'Partidos' },
  { id: 'history',  label: 'Histórico' },
  { id: 'compare',  label: 'Comparar' },
]

export default function ProfileTabs({
  tabs = DEFAULT_TABS,
  active: activeProp,
  onChange,
}: ProfileTabsProps) {
  const [internal, setInternal] = useState<ProfileTab>(tabs[0]?.id ?? 'overview')
  const active = activeProp ?? internal
  const setActive = (t: ProfileTab) => {
    if (onChange) onChange(t)
    else setInternal(t)
  }
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--ts-border)',
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--ts-primary)' : 'var(--ts-muted)',
              cursor: 'pointer',
              borderBottom: isActive ? '2px solid var(--ts-primary)' : '2px solid transparent',
              marginBottom: -1,
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
