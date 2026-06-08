'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SidebarActiveKey } from './Sidebar'

interface Props {
  open: boolean
  onClose: () => void
  activeKey: SidebarActiveKey
  lang: 'es' | 'en'
}

// Mobile slide-in drawer (left). Mirrors the FULL desktop Sidebar nav: grouped
// section labels, icons, current-item highlight, plus the account/plan row with
// a "Go Pro" link. Bilingual ES/EN.

interface Item { icon: string; label: string; href: string; badge?: string }
interface Group { label: string; items: Item[] }

export default function MobileNav({ open, onClose, activeKey, lang }: Props) {
  void activeKey
  const en = lang === 'en'
  const pathname = usePathname() ?? ''

  const L = en
    ? {
        gStats: 'Statistics', gComp: 'Competitions', gMarket: 'Market & Community', gAccount: 'Account',
        players: 'Players', compare: 'Compare', boot: 'Golden Boot',
        leagues: 'Leagues', results: 'Results', wc: 'World Cup 2026', news: 'News', rumours: 'Rumours',
        transfers: 'Transfers', community: 'Community', polls: 'Polls', predictions: 'Predictions', fantasy: 'Fantasy',
        pricing: 'Pricing', account: 'My account', soon: 'soon',
        goPro: 'Go Pro', freePlan: 'Free plan',
      }
    : {
        gStats: 'Estadísticas', gComp: 'Competiciones', gMarket: 'Mercado y Comunidad', gAccount: 'Cuenta',
        players: 'Jugadores', compare: 'Comparador', boot: 'Bota de Oro',
        leagues: 'Competiciones', results: 'Resultados', wc: 'Mundial 2026', news: 'Noticias', rumours: 'Rumores',
        transfers: 'Transferencias', community: 'Comunidad', polls: 'Encuestas', predictions: 'Predicciones', fantasy: 'Fantasy',
        pricing: 'Pricing', account: 'Mi cuenta', soon: 'pronto',
        goPro: 'Hazte Pro', freePlan: 'Plan Gratis',
      }

  const groups: Group[] = [
    {
      label: L.gStats,
      items: [
        { icon: '👤', label: L.players, href: `/${lang}` },
        { icon: '⚖', label: L.compare, href: `/${lang}/comparador` },
        { icon: '🥇', label: L.boot, href: `/${lang}/bota-de-oro` },
      ],
    },
    {
      label: L.gComp,
      items: [
        { icon: '🏆', label: L.leagues, href: `/${lang}/competiciones` },
        { icon: '⚽', label: L.results, href: `/${lang}/resultados` },
        { icon: '🌍', label: L.wc, href: `/${lang}/mundial-2026` },
        { icon: '📰', label: L.news, href: `/${lang}/noticias` },
        { icon: '🔄', label: L.rumours, href: `/${lang}/rumores` },
      ],
    },
    {
      label: L.gMarket,
      items: [
        { icon: '↔', label: L.transfers, href: `/${lang}/transferencias` },
        { icon: '👥', label: L.community, href: `/${lang}/clasificacion` },
        { icon: '🗳', label: L.polls, href: `/${lang}/encuestas` },
        { icon: '🔮', label: L.predictions, href: `/${lang}/predicciones` },
        { icon: '🎮', label: L.fantasy, href: `/${lang}/fantasy`, badge: L.soon },
      ],
    },
    {
      label: L.gAccount,
      items: [
        { icon: '✦', label: L.pricing, href: `/${lang}/pricing` },
        { icon: '👤', label: L.account, href: `/${lang}/cuenta` },
      ],
    },
  ]

  const isActive = (href: string) => {
    const home = `/${lang}`
    if (href === home) return pathname === home || pathname === `${home}/`
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <div className="saas-mobile-backdrop" data-open={open} onClick={onClose} aria-hidden />
      <nav
        className="saas-mobile-nav"
        data-open={open}
        aria-label="Main menu"
        aria-hidden={!open}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--ts-border)', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, letterSpacing: '0.12em', fontSize: 14, color: 'var(--ts-text)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-ball-alpha_2.png" alt="" width={26} height={26} style={{ width: 26, height: 26, objectFit: 'contain' }} />
            <span>TOP·SCORERS</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="saas-tap-target"
            style={{
              width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', color: 'var(--ts-muted)', cursor: 'pointer', fontSize: 22, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Plan / account row + Go Pro (mirrors the sidebar account card) */}
        <Link
          href={`/${lang}/pricing`}
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, margin: '12px 12px 4px', padding: '10px 12px',
            background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10,
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ts-primary)', color: 'var(--ts-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>TS</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ts-text)' }}>Top-Scorers</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--ts-muted)' }}>{L.freePlan}</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', color: 'var(--ts-bg)', background: 'var(--ts-primary)', borderRadius: 6, padding: '4px 8px' }}>
            {L.goPro}
          </span>
        </Link>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px 20px' }}>
          {groups.map(group => (
            <div key={group.label} style={{ marginTop: 10 }}>
              <div style={{ padding: '4px 10px 6px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ts-faint)' }}>
                {group.label}
              </div>
              {group.items.map(item => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 12px', borderRadius: 8,
                      color: active ? 'var(--ts-primary)' : 'var(--ts-text)',
                      background: active ? 'var(--ts-primary-soft)' : 'transparent',
                      fontWeight: active ? 700 : 500, textDecoration: 'none',
                      fontSize: 14.5, minHeight: 44,
                    }}
                  >
                    <span style={{ fontSize: 17, width: 20, textAlign: 'center', opacity: active ? 1 : 0.85 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ts-muted)', background: 'var(--ts-card2)', borderRadius: 999, padding: '2px 8px' }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </nav>
    </>
  )
}
