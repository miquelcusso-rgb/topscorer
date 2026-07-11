'use client'
import type { ReactNode, CSSProperties } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { getPalette, cssVars } from '@/lib/palette'
import Sidebar, { type SidebarActiveKey } from './Sidebar'
import { useClubAccent } from '@/lib/use-club-accent'
import { type PrimaryCta } from './Topbar'
import MobileTopbar from './MobileTopbar'
import Breadcrumbs from './Breadcrumbs'
import LangTogglePill from './LangTogglePill'
import ThemeTogglePill from './ThemeTogglePill'
import WorldCupWidget from './WorldCupWidget'
import TopSearch from './TopSearch'
import type { Plan } from '@/types'

interface SaasShellProps {
  activeKey: SidebarActiveKey
  breadcrumb: string[]
  primaryCta?: PrimaryCta
  plan?: Plan
  children: ReactNode
}

export default function SaasShell({
  activeKey,
  breadcrumb,
  primaryCta,
  plan = 'free',
  children,
}: SaasShellProps) {
  const { theme } = useTheme()
  const { lang } = useLang()
  const vars = cssVars(getPalette(theme)) as CSSProperties
  const accent = useClubAccent()
  // PRO "my club" topbar: club-colour wash + a subtle diagonal-stripe & grain
  // texture so the bar feels special and distinct from the body. Layer order:
  // stripes (top) · grain · colour wash (bottom). All low-alpha → text stays
  // readable. Falls back to the plain surface when no club / not Pro.
  const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"
  const topbarBg = accent
    ? `repeating-linear-gradient(135deg, color-mix(in srgb, ${accent} 22%, transparent) 0 1px, transparent 1px 11px), ${GRAIN}, color-mix(in srgb, ${accent} 14%, var(--ts-surface))`
    : 'var(--ts-surface)'
  return (
    <div
      className="saas-shell"
      style={{
        ...vars,
        display: 'flex',
        minHeight: 'calc(100vh - 0px)',
        background: 'var(--ts-bg)',
        color: 'var(--ts-text)',
        fontFamily: 'DM Sans, sans-serif',
        // Wide-screen: center the WHOLE app (sidebar + body) as one block, so
        // the left gutter sits to the left of the sidebar too. Cap at 1600 and
        // keep a small side gutter via padding so it never touches the edges,
        // even on ~1600px-wide displays (mobile sidebar layout unaffected).
        width: '100%',
        maxWidth: 1600,
        marginInline: 'auto',
        paddingInline: 'clamp(0px, 1.2vw, 20px)',
        boxSizing: 'border-box',
      }}
    >
      <Sidebar activeKey={activeKey} plan={plan} primaryCta={primaryCta} />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--ts-bg)',
          position: 'relative',
        }}
      >
        <MobileTopbar activeKey={activeKey} lang={lang} primaryCta={primaryCta} />
        {/* Top bar: multi-entity search (players · teams w/ crest · leagues) + toggles */}
        <header className="saas-topbar2" style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '10px 24px',
          borderBottom: accent ? `2px solid ${accent}` : '1px solid var(--ts-border)',
          background: topbarBg,
        }}>
          <TopSearch />
          <div style={{ flex: 1 }} />
          {/* World Cup countdown lives in the top bar (normal flow) so it never
              overlaps the page content below it (unchanged). */}
          <div className="saas-wc-float" style={{ flexShrink: 0 }}>
            <WorldCupWidget lang={lang === 'en' ? 'en' : 'es'} scale={1.05} />
          </div>
          <div className="saas-topbar2-toggles" style={{ display: 'flex', gap: 8 }}>
            <LangTogglePill />
            <ThemeTogglePill />
          </div>
        </header>
        <div
          className="saas-main-content"
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Breadcrumbs parts={breadcrumb} />
          {children}
        </div>
      </main>
    </div>
  )
}
