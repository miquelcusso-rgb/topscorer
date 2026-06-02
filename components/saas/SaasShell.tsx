'use client'
import type { ReactNode, CSSProperties } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { getPalette, cssVars } from '@/lib/palette'
import Sidebar, { type SidebarActiveKey } from './Sidebar'
import { type PrimaryCta } from './Topbar'
import MobileTopbar from './MobileTopbar'
import LangTogglePill from './LangTogglePill'
import ThemeTogglePill from './ThemeTogglePill'
import WorldCupWidget from './WorldCupWidget'
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
        }}
      >
        <MobileTopbar activeKey={activeKey} lang={lang} primaryCta={primaryCta} />
        {/* Top-right controls: language + theme, with the World Cup countdown below. */}
        <div className="saas-topright" style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 24px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <LangTogglePill />
              <ThemeTogglePill />
            </div>
            <WorldCupWidget lang={lang === 'en' ? 'en' : 'es'} scale={1.3} />
          </div>
        </div>
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
          {children}
        </div>
      </main>
    </div>
  )
}
