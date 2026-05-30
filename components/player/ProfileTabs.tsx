'use client'
import { useState } from 'react'

export type ProfileTab = 'overview' | 'history'

interface ProfileTabsProps {
  tabs?: Array<{ id: ProfileTab; label: string; href?: string }>
  active?: ProfileTab
  onChange?: (tab: ProfileTab) => void
  /** Slug used to build the Comparar link `?p1=<slug>`. */
  compareHref?: string
  compareLabel?: string
}

const DEFAULT_TABS: Array<{ id: ProfileTab; label: string; href?: string }> = [
  { id: 'overview', label: 'Resumen' },
  // Scroll-link to the SeasonTable (id="seasons" anchor on the page)
  { id: 'history',  label: 'Histórico', href: '#seasons' },
]

export default function ProfileTabs({
  tabs = DEFAULT_TABS,
  active: activeProp,
  onChange,
  compareHref,
  compareLabel = '↗ Comparar este jugador',
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
        alignItems: 'center',
        gap: 4,
        borderBottom: '1px solid var(--ts-border)',
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === active
        const baseStyle = {
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
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
        } as const
        if (tab.href) {
          return (
            <a key={tab.id} href={tab.href} style={baseStyle}>
              {tab.label}
            </a>
          )
        }
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={baseStyle}
          >
            {tab.label}
          </button>
        )
      })}
      <div style={{ flex: 1 }} />
      {compareHref && (
        <a
          href={compareHref}
          style={{
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--ts-text)',
            background: 'var(--ts-card2)',
            border: '1px solid var(--ts-border)',
            borderRadius: 6,
            textDecoration: 'none',
            marginBottom: 6,
          }}
        >
          {compareLabel}
        </a>
      )}
    </div>
  )
}
