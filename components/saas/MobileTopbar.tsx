'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MobileNav from './MobileNav'
import ThemeTogglePill from './ThemeTogglePill'
import LangTogglePill from './LangTogglePill'
import type { SidebarActiveKey } from './Sidebar'

// Visible only on <768px (CSS in globals.css). Hamburger opens MobileNav
// drawer with the same nav items as the desktop Sidebar.

interface Props {
  activeKey: SidebarActiveKey
  lang: 'es' | 'en'
}

export default function MobileTopbar({ activeKey, lang }: Props) {
  const [open, setOpen] = useState(false)

  // Body scroll lock when drawer open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Esc closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header
        className="saas-mobile-topbar"
        style={{
          display: 'none', // toggled to flex by media query
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--ts-surface)',
          borderBottom: '1px solid var(--ts-border)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="saas-tap-target"
          style={{
            width: 44, height: 44,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', color: 'var(--ts-text)', cursor: 'pointer',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link
          href={`/${lang}`}
          style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 800,
            letterSpacing: '0.18em',
            fontSize: 16,
            color: 'var(--ts-text)',
            textDecoration: 'none',
          }}
        >
          TOP·SCORERS
        </Link>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <LangTogglePill />
          <ThemeTogglePill />
        </div>
      </header>

      <MobileNav open={open} onClose={() => setOpen(false)} activeKey={activeKey} lang={lang} />
    </>
  )
}
