'use client'
import Link from 'next/link'
import LangTogglePill from './LangTogglePill'
import ThemeTogglePill from './ThemeTogglePill'

export interface PrimaryCta {
  label: string
  href?: string
  onClick?: () => void
  /** If `'share'`, renders an icon-only square button (works on player profile,
   * mirrored to MobileTopbar so it's always visible). */
  icon?: 'share'
}

function ShareIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

export { ShareIcon }

interface TopbarProps {
  breadcrumb: string[]
  primaryCta?: PrimaryCta
  searchPlaceholder?: string
}

export default function Topbar({
  breadcrumb,
  primaryCta,
  searchPlaceholder = 'Buscar jugador, equipo, liga…',
}: TopbarProps) {
  return (
    <header
      className="saas-topbar"
      style={{
        height: 60,
        borderBottom: '1px solid var(--ts-border)',
        background: 'var(--ts-surface)',
        fontFamily: 'DM Sans, sans-serif',
        flexShrink: 0,
      }}
    >
      {/* Inner content capped + centered to match the body width on wide screens */}
      <div style={{
        height: '100%',
        maxWidth: 1480,
        marginInline: 'auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxSizing: 'border-box',
      }}>
      <span style={{ fontSize: 13, color: 'var(--ts-muted)' }}>
        {breadcrumb.map((part, i) => {
          const last = i === breadcrumb.length - 1
          return (
            <span key={i}>
              {i > 0 && <span style={{ color: 'var(--ts-faint)', margin: '0 6px' }}>/</span>}
              {last ? (
                <strong style={{ color: 'var(--ts-text)', fontWeight: 600 }}>{part}</strong>
              ) : (
                part
              )}
            </span>
          )
        })}
      </span>

      <div
        style={{
          flex: 1,
          maxWidth: 380,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 12px',
          background: 'var(--ts-card2)',
          border: '1px solid var(--ts-border)',
          borderRadius: 8,
          fontSize: 13,
          color: 'var(--ts-muted)',
        }}
      >
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
          <circle cx={6} cy={6} r={4.5} />
          <path d="M12.5 12.5l-3-3" />
        </svg>
        <span>{searchPlaceholder}</span>
        <kbd
          style={{
            marginLeft: 'auto',
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 10,
            padding: '1px 5px',
            background: 'var(--ts-surface)',
            borderRadius: 3,
            color: 'var(--ts-faint)',
            border: '1px solid var(--ts-border)',
          }}
        >
          ⌘K
        </kbd>
      </div>

      <div style={{ flex: 1 }} />
      <LangTogglePill />
      <ThemeTogglePill />

      {primaryCta && (() => {
        const isIcon = primaryCta.icon === 'share'
        const base = isIcon
          ? {
              padding: 0,
              width: 36,
              height: 36,
              background: 'var(--ts-card2)',
              color: 'var(--ts-text)',
              border: '1px solid var(--ts-border)',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }
          : {
              padding: '7px 12px',
              background: 'var(--ts-primary)',
              color: 'var(--ts-bg)',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
            }
        const inner = isIcon ? <ShareIcon /> : primaryCta.label
        return primaryCta.href ? (
          <Link href={primaryCta.href} aria-label={isIcon ? primaryCta.label : undefined} style={base}>
            {inner}
          </Link>
        ) : (
          <button type="button" onClick={primaryCta.onClick} aria-label={isIcon ? primaryCta.label : undefined} style={base}>
            {inner}
          </button>
        )
      })()}
      </div>
    </header>
  )
}
