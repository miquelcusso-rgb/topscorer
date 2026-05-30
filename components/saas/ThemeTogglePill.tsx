'use client'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeTogglePill() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'relative',
        width: 56,
        height: 28,
        borderRadius: 14,
        border: '1px solid var(--ts-border)',
        background: 'var(--ts-card2)',
        padding: 2,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: dark ? 2 : 30,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--ts-surface)',
          boxShadow: '0 1px 2px rgba(0,0,0,.18)',
          transition: 'left .18s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ts-primary)',
        }}
      >
        {dark ? (
          <svg width={12} height={12} viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <path d="M10 7.5A4 4 0 1 1 4.5 2a4 4 0 0 0 5.5 5.5z" />
          </svg>
        ) : (
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
            <circle cx={6} cy={6} r={2.4} fill="currentColor" />
            <g strokeLinecap="round">
              <path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11M2.3 2.3l1 1M8.7 8.7l1 1M2.3 9.7l1-1M8.7 3.3l1-1" />
            </g>
          </svg>
        )}
      </span>
    </button>
  )
}
