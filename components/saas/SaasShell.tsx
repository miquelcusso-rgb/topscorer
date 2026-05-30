'use client'
import type { ReactNode, CSSProperties } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { getPalette, cssVars } from '@/lib/palette'
import Sidebar, { type SidebarActiveKey } from './Sidebar'
import Topbar, { type PrimaryCta } from './Topbar'
import MobileTopbar from './MobileTopbar'
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
      }}
    >
      <Sidebar activeKey={activeKey} plan={plan} />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--ts-bg)',
        }}
      >
        <MobileTopbar activeKey={activeKey} lang={lang} />
        <Topbar breadcrumb={breadcrumb} primaryCta={primaryCta} />
        <div
          className="saas-main-content"
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            flex: 1,
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
