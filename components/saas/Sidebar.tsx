'use client'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useLang } from '@/contexts/LangContext'
import { avatarTintFor, initialsOf } from '@/lib/palette'
import { useTheme } from '@/contexts/ThemeContext'
import type { Plan } from '@/types'

export type SidebarActiveKey =
  | 'stats'
  | 'leagues'
  | 'players'
  | 'compare'
  | 'transfers'
  | 'results'
  | 'watchlist'
  | 'lists'

interface SidebarProps {
  activeKey: SidebarActiveKey
  plan?: Plan
}

interface NavItem {
  id: SidebarActiveKey
  icon: string
  label: string
  count?: string
  live?: number
  href: string
}

function Wordmark() {
  // Canonical brand: logo-ball.png is the official TopScorers mark (also used
  // by the legacy Navbar). Keep aspect square 34x34 next to the wordmark.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 800,
        fontSize: 17,
        letterSpacing: '0.04em',
        color: 'var(--ts-text)',
        textTransform: 'uppercase',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-ball.png"
        alt="TopScorers"
        width={28}
        height={28}
        style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
      />
      <span>
        TOP<span style={{ color: 'var(--ts-primary)' }}>·SCORERS</span>
      </span>
    </span>
  )
}

function MenuRow({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 6,
        background: active ? 'var(--ts-primary-soft)' : 'transparent',
        color: active ? 'var(--ts-primary)' : 'var(--ts-text)',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        textDecoration: 'none',
      }}
    >
      <span style={{ width: 16, opacity: 0.85, fontSize: 14 }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.live ? (
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            background: 'var(--ts-red)',
            color: 'var(--ts-bg)',
            borderRadius: 999,
            fontWeight: 700,
          }}
        >
          {item.live}●
        </span>
      ) : null}
      {item.count ? (
        <span
          style={{
            fontSize: 11,
            color: 'var(--ts-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {item.count}
        </span>
      ) : null}
    </Link>
  )
}

export default function Sidebar({ activeKey, plan = 'free' }: SidebarProps) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const { user, isLoaded } = useUser()

  const labels = lang === 'en'
    ? {
        menu: 'Menu', lists: 'Lists',
        stats: 'Statistics', leagues: 'Competitions', players: 'Players',
        compare: 'Compare', transfers: 'Transfers', results: 'Results',
        watchlist: 'My watchlist', f1: 'U-22 prospects', f2: 'Historic top scorers',
        upgradeTitle: 'API access + full data',
        upgradeCta: 'Upgrade plan',
        planPro: 'Pro plan · €6/mo',
      }
    : {
        menu: 'Menu', lists: 'Listas',
        stats: 'Estadísticas', leagues: 'Competiciones', players: 'Jugadores',
        compare: 'Comparador', transfers: 'Transferencias', results: 'Resultados',
        watchlist: 'Mi watchlist', f1: 'Sub-22 promesas', f2: 'Pichichi histórico',
        upgradeTitle: 'Acceso API + datos completos',
        upgradeCta: 'Actualizar plan',
        planPro: 'Plan Pro · €6/mes',
      }

  const items: NavItem[] = [
    { id: 'stats',     icon: '📊', label: labels.stats,     count: '384', href: `/${lang}/v2` },
    { id: 'leagues',   icon: '🏆', label: labels.leagues,   count: '12',  href: `/${lang}/competiciones` },
    { id: 'players',   icon: '👤', label: labels.players,                 href: `/${lang}/jugadores` },
    { id: 'compare',   icon: '⚖',  label: labels.compare,                 href: `/${lang}/comparador` },
    { id: 'transfers', icon: '↔',  label: labels.transfers, count: '24',  href: `/${lang}/transferencias` },
    { id: 'results',   icon: '⚽', label: labels.results,   live: 3,      href: `/${lang}/resultados` },
  ]

  const displayName = isLoaded && user
    ? user.fullName || user.firstName || user.username || (user.primaryEmailAddress?.emailAddress ?? 'User')
    : 'Invitado'
  const displayEmail = isLoaded && user
    ? (user.primaryEmailAddress?.emailAddress ?? '')
    : ''
  const userTint = avatarTintFor(displayName, theme)
  const userInitials = initialsOf(displayName) || 'TS'

  const showUpgrade = plan !== 'scout'

  return (
    <aside
      className="saas-sidebar"
      style={{
        width: 232,
        flexShrink: 0,
        alignSelf: 'stretch',
        background: 'var(--ts-sidebar)',
        borderRight: '1px solid var(--ts-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
        fontFamily: 'DM Sans, sans-serif',
        color: 'var(--ts-text)',
      }}
    >
      <div style={{ padding: '0 8px 18px' }}>
        <Link href={`/${lang}/v2`} style={{ textDecoration: 'none' }}>
          <Wordmark />
        </Link>
      </div>

      {/* workspace switcher */}
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px',
          background: 'var(--ts-card)',
          border: '1px solid var(--ts-border)',
          borderRadius: 8,
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          fontFamily: 'inherit',
          color: 'inherit',
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--ts-primary)',
            color: 'var(--ts-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          TS
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ts-text)' }}>
            Top-Scorers
          </span>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--ts-muted)' }}>
            {labels.planPro}
          </span>
        </span>
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="var(--ts-muted)" strokeWidth={1.5} aria-hidden>
          <path d="M2 4l3 3 3-3" />
        </svg>
      </button>

      {/* nav */}
      <nav style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div
          style={{
            padding: '6px 10px',
            fontSize: 10,
            color: 'var(--ts-faint)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {labels.menu}
        </div>
        {items.map(it => (
          <MenuRow key={it.id} item={it} active={it.id === activeKey} />
        ))}

        <div
          style={{
            padding: '14px 10px 6px',
            fontSize: 10,
            color: 'var(--ts-faint)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {labels.lists}
        </div>
        <MenuRow
          item={{
            id: 'watchlist',
            icon: '⭐',
            label: labels.watchlist,
            count: '8',
            href: `/${lang}/watchlist`,
          }}
          active={activeKey === 'watchlist'}
        />
        <MenuRow
          item={{ id: 'lists', icon: '📁', label: labels.f1, count: '24', href: `/${lang}/watchlist` }}
          active={false}
        />
        <MenuRow
          item={{ id: 'lists', icon: '📁', label: labels.f2, href: `/${lang}/watchlist` }}
          active={false}
        />
      </nav>

      <div style={{ flex: 1 }} />

      {showUpgrade && (
        <div
          style={{
            padding: 14,
            background: 'var(--ts-primary-soft)',
            borderRadius: 8,
            border: '1px solid var(--ts-border-hot)',
            marginTop: 14,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 10,
              color: 'var(--ts-primary)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            <svg width={11} height={11} viewBox="0 0 11 11" fill="currentColor" aria-hidden>
              <path d="M5.5 1L7 4l3 .4-2.2 2 .5 3-2.8-1.5L2.7 9.4l.5-3L1 4.4 4 4z" />
            </svg>
            Scout
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--ts-text)',
              fontWeight: 600,
              marginTop: 4,
              lineHeight: 1.3,
            }}
          >
            {labels.upgradeTitle} · <span style={{ color: 'var(--ts-primary)' }}>€18/mes</span>
          </div>
          <Link
            href={`/${lang}/pricing`}
            style={{
              display: 'block',
              textAlign: 'center',
              width: '100%',
              marginTop: 10,
              padding: '7px 10px',
              background: 'var(--ts-primary)',
              color: 'var(--ts-bg)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {labels.upgradeCta}
          </Link>
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--ts-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 6px 0',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: userTint.bg,
            color: userTint.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {userInitials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ts-text)',
              lineHeight: 1.1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </div>
          {displayEmail && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--ts-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayEmail}
            </div>
          )}
        </div>
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="var(--ts-muted)" strokeWidth={1.5} aria-hidden>
          <circle cx={7} cy={6} r={1.5} />
          <path d="M3 11c0-2 1.8-3 4-3s4 1 4 3" />
        </svg>
      </div>
    </aside>
  )
}
