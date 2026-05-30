'use client'
import Link from 'next/link'
import LangTogglePill from './LangTogglePill'
import ThemeTogglePill from './ThemeTogglePill'

export interface PrimaryCta {
  label: string
  href?: string
  onClick?: () => void
}

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
      style={{
        height: 60,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderBottom: '1px solid var(--ts-border)',
        background: 'var(--ts-surface)',
        fontFamily: 'DM Sans, sans-serif',
        flexShrink: 0,
      }}
    >
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

      {primaryCta && (
        primaryCta.href ? (
          <Link
            href={primaryCta.href}
            style={{
              padding: '7px 12px',
              background: 'var(--ts-primary)',
              color: 'var(--ts-bg)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {primaryCta.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={primaryCta.onClick}
            style={{
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
            }}
          >
            {primaryCta.label}
          </button>
        )
      )}
    </header>
  )
}
