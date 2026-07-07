'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MobileNav from './MobileNav'
import ThemeTogglePill from './ThemeTogglePill'
import LangTogglePill from './LangTogglePill'
import type { SidebarActiveKey } from './Sidebar'
import type { PrimaryCta } from './Topbar'
import { ShareIcon } from './Topbar'

// Visible only on <768px (CSS in globals.css). Hamburger opens MobileNav
// drawer with the same nav items as the desktop Sidebar. Mirrors the
// desktop Topbar's `primaryCta` when it's an icon (e.g. Share) so the
// action is always reachable on mobile.

interface Props {
  activeKey: SidebarActiveKey
  lang: 'es' | 'en'
  primaryCta?: PrimaryCta
}

export default function MobileTopbar({ activeKey, lang, primaryCta }: Props) {
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
          // safe-area: con viewport-fit=cover el topbar entra bajo el notch en
          // standalone/landscape sin este padding (sensación nativa, no bug visual)
          padding: '8px calc(10px + env(safe-area-inset-right)) 8px calc(10px + env(safe-area-inset-left))',
          paddingTop: 'calc(8px + env(safe-area-inset-top))',
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 800,
            letterSpacing: '0.08em',
            fontSize: 20,
            color: 'var(--ts-text)',
            textDecoration: 'none',
            marginLeft: -4,
          }}
        >
          {/* Ball gets equal optical spacing around it; the wordmark is nudged
              left (small gap + negative marginLeft) so the lockup reads centred. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-ball-alpha_2.png" alt="" width={36} height={36} style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ marginLeft: -2 }}>TOP·SCORERS</span>
        </Link>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <LangTogglePill />
          <ThemeTogglePill />
          {primaryCta?.icon === 'share' && (
            primaryCta.href ? (
              <Link
                href={primaryCta.href}
                aria-label={primaryCta.label}
                style={{
                  width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--ts-card2)', color: 'var(--ts-text)',
                  border: '1px solid var(--ts-border)', borderRadius: 8, textDecoration: 'none',
                }}
              >
                <ShareIcon />
              </Link>
            ) : (
              <button
                type="button"
                aria-label={primaryCta.label}
                onClick={primaryCta.onClick}
                style={{
                  width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--ts-card2)', color: 'var(--ts-text)',
                  border: '1px solid var(--ts-border)', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <ShareIcon />
              </button>
            )
          )}
        </div>
      </header>

      <MobileNav open={open} onClose={() => setOpen(false)} activeKey={activeKey} lang={lang} />
    </>
  )
}
