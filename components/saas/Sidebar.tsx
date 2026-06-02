'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useLang } from '@/contexts/LangContext'
import { avatarTintFor, initialsOf } from '@/lib/palette'
import { useTheme } from '@/contexts/ThemeContext'
import type { Plan } from '@/types'
import LockedPill from './LockedPill'
import TopSearch from './TopSearch'
import LangTogglePill from './LangTogglePill'
import ThemeTogglePill from './ThemeTogglePill'
import { ShareIcon, type PrimaryCta } from './Topbar'

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
  primaryCta?: PrimaryCta
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
  // by the legacy Navbar). 2x bigger after audit pass 1.
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 800,
        fontSize: 25,
        letterSpacing: '0.04em',
        color: 'var(--ts-text)',
        textTransform: 'uppercase',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-ball-alpha.png"
        alt="TopScorers"
        width={52}
        height={52}
        style={{ width: 52, height: 52, objectFit: 'contain', flexShrink: 0 }}
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

export default function Sidebar({ activeKey, plan = 'free', primaryCta }: SidebarProps) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const { user, isLoaded } = useUser()

  const pathname = usePathname() ?? ''
  const en = lang === 'en'

  const L = en
    ? {
        gStats: 'Statistics', gComp: 'Competitions', gMarket: 'Market & Community', lists: 'Lists',
        players: 'Players', compare: 'Compare', boot: 'Golden Boot',
        leagues: 'Leagues', standings: 'Standings', results: 'Results', wc: 'World Cup 2026',
        transfers: 'Transfers', polls: 'Polls', predictions: 'Predictions', fantasy: 'Fantasy',
        watchlist: 'My watchlist',
        upgradeTitle: 'API access + full data', upgradeCta: 'Upgrade plan', planPro: 'Pro plan · €6/mo',
      }
    : {
        gStats: 'Estadísticas', gComp: 'Competiciones', gMarket: 'Mercado y Comunidad', lists: 'Listas',
        players: 'Jugadores', compare: 'Comparador', boot: 'Bota de Oro',
        leagues: 'Ligas', standings: 'Clasificación', results: 'Resultados', wc: 'Mundial 2026',
        transfers: 'Transferencias', polls: 'Encuestas', predictions: 'Predicciones', fantasy: 'Fantasy',
        watchlist: 'Mi watchlist',
        upgradeTitle: 'Acceso API + datos completos', upgradeCta: 'Actualizar plan', planPro: 'Plan Pro · €6/mes',
      }

  // Active detection by exact path (home) or prefix (sub-routes).
  const isActive = (href: string) => {
    const home = `/${lang}`
    if (href === home) return pathname === home || pathname === `${home}/`
    return pathname === href || pathname.startsWith(href + '/')
  }

  const groups: Array<{ label: string; items: NavItem[] }> = [
    {
      label: L.gStats,
      items: [
        { id: 'players', icon: '👤', label: L.players,  href: `/${lang}` },
        { id: 'compare', icon: '⚖',  label: L.compare,  href: `/${lang}/comparador` },
        { id: 'stats',   icon: '🥇', label: L.boot,     href: `/${lang}/bota-de-oro` },
      ],
    },
    {
      label: L.gComp,
      items: [
        { id: 'leagues', icon: '🏆', label: L.leagues,   count: '30+', href: `/${lang}/competiciones` },
        { id: 'leagues', icon: '📋', label: L.standings,              href: `/${lang}/clasificacion` },
        { id: 'results', icon: '⚽', label: L.results,    live: 3,     href: `/${lang}/resultados` },
        { id: 'leagues', icon: '🌍', label: L.wc,                      href: `/${lang}/mundial-2026` },
      ],
    },
    {
      label: L.gMarket,
      items: [
        { id: 'transfers', icon: '↔', label: L.transfers, count: '24', href: `/${lang}/transferencias` },
        { id: 'stats',     icon: '🗳', label: L.polls,                  href: `/${lang}/encuestas` },
        { id: 'stats',     icon: '🔮', label: L.predictions,           href: `/${lang}/predicciones` },
        { id: 'stats',     icon: '🎮', label: L.fantasy,               href: `/${lang}/fantasy` },
      ],
    },
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
      <div
        style={{
          padding: '4px 8px 16px',
          borderBottom: '1px solid var(--ts-border-hot)',
          marginBottom: 16,
        }}
      >
        <Link href={`/${lang}`} style={{ textDecoration: 'none' }}>
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
          marginTop: 2,
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
          <span style={{ display: 'block', fontSize: 12, color: 'var(--ts-muted)' }}>
            {L.planPro}
          </span>
        </span>
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="var(--ts-muted)" strokeWidth={1.5} aria-hidden>
          <path d="M2 4l3 3 3-3" />
        </svg>
      </button>

      {/* Global search (relocated here from the removed top bar) */}
      <div style={{ marginTop: 12 }}>
        <TopSearch />
      </div>

      {/* nav */}
      <nav style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {groups.map(group => (
          <div key={group.label} style={{ display: 'contents' }}>
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
              {group.label}
            </div>
            {group.items.map((it, i) => (
              <MenuRow key={`${it.label}-${i}`} item={it} active={isActive(it.href)} />
            ))}
          </div>
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
          {L.lists}
        </div>
        <MenuRow
          item={{ id: 'watchlist', icon: '⭐', label: L.watchlist, href: `/${lang}/cuenta` }}
          active={isActive(`/${lang}/cuenta`)}
        />

        {/* Scout tools — gated. Items disabled with line-through + SCOUT pill
            for non-scout plans. (audit pass 1, item 12) */}
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
          {lang === 'en' ? 'Scout Tools' : 'Herramientas Scout'}
        </div>
        {(
          [
            { label: lang === 'en' ? 'Performance Alerts' : 'Alertas de rendimiento', href: `/${lang}/cuenta/alerts`, icon: '🔔' },
            { label: lang === 'en' ? 'Public API' : 'API pública',                    href: `/${lang}/cuenta/api`,    icon: '🔌' },
            { label: lang === 'en' ? 'CSV Export' : 'Exportar CSV',                   href: `/${lang}/cuenta/export`, icon: '⬇' },
          ] as const
        ).map(tool => {
          const unlocked = plan === 'scout'
          const inner = (
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <span style={{ width: 16, fontSize: 14, opacity: 0.85 }}>{tool.icon}</span>
              <span style={{ flex: 1, textDecoration: unlocked ? 'none' : 'line-through' }}>{tool.label}</span>
              <LockedPill tone="scout" size="xs" />
            </span>
          )
          const baseStyle = {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 10px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            color: unlocked ? 'var(--ts-text)' : 'var(--ts-faint)',
            textDecoration: 'none',
            cursor: unlocked ? 'pointer' : 'not-allowed',
            pointerEvents: unlocked ? 'auto' : 'none',
            opacity: unlocked ? 1 : 0.7,
          } as const
          return unlocked ? (
            <Link key={tool.href} href={tool.href} style={baseStyle}>{inner}</Link>
          ) : (
            <div key={tool.href} style={baseStyle} aria-disabled="true">{inner}</div>
          )
        })}
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
            {L.upgradeTitle} · <span style={{ color: 'var(--ts-primary)' }}>€18/mes</span>
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
            {L.upgradeCta}
          </Link>
        </div>
      )}

      {/* Controls relocated from the removed top bar: lang/theme + share */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ts-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <LangTogglePill />
        <ThemeTogglePill />
        {primaryCta && (
          primaryCta.href ? (
            <Link href={primaryCta.href} aria-label={primaryCta.label} title={primaryCta.label}
              style={{ marginLeft: 'auto', width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ts-card2)', color: 'var(--ts-text)', border: '1px solid var(--ts-border)', borderRadius: 8, textDecoration: 'none' }}>
              {primaryCta.icon === 'share' ? <ShareIcon /> : primaryCta.label}
            </Link>
          ) : (
            <button type="button" onClick={primaryCta.onClick} aria-label={primaryCta.label} title={primaryCta.label}
              style={{ marginLeft: 'auto', width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ts-card2)', color: 'var(--ts-text)', border: '1px solid var(--ts-border)', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
              {primaryCta.icon === 'share' ? <ShareIcon /> : primaryCta.label}
            </button>
          )
        )}
      </div>

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
