'use client'

import Link from 'next/link'
import type { SidebarActiveKey } from './Sidebar'
import { useLang } from '@/contexts/LangContext'

interface Props {
  open: boolean
  onClose: () => void
  activeKey: SidebarActiveKey
  lang: 'es' | 'en'
}

// Mobile slide-in drawer (left). Renders the nav list as a flat, full-height
// menu — no workspace card, no upgrade card (those live on /cuenta on mobile).

export default function MobileNav({ open, onClose, activeKey, lang }: Props) {
  const { lang: _lang } = useLang()

  const labels = lang === 'en'
    ? { stats: 'Statistics', leagues: 'Competitions', players: 'Players',
        compare: 'Compare', transfers: 'Transfers', results: 'Results',
        more: 'More', pricing: 'Pricing', account: 'Account' }
    : { stats: 'Estadísticas', leagues: 'Competiciones', players: 'Jugadores',
        compare: 'Comparador', transfers: 'Transferencias', results: 'Resultados',
        more: 'Más', pricing: 'Pricing', account: 'Mi cuenta' }

  const primary: Array<{ id: SidebarActiveKey; icon: string; label: string; href: string }> = [
    { id: 'stats',     icon: '📊', label: labels.stats,     href: `/${lang}` },
    { id: 'leagues',   icon: '🏆', label: labels.leagues,   href: `/${lang}/competiciones` },
    { id: 'players',   icon: '👤', label: labels.players,   href: `/${lang}/jugadores` },
    { id: 'compare',   icon: '⚖',  label: labels.compare,   href: `/${lang}/comparador` },
    { id: 'transfers', icon: '↔',  label: labels.transfers, href: `/${lang}/transferencias` },
    { id: 'results',   icon: '⚽', label: labels.results,   href: `/${lang}/resultados` },
  ]

  const secondary = [
    { label: labels.pricing, href: `/${lang}/pricing` },
    { label: labels.account, href: `/${lang}/cuenta` },
  ]

  return (
    <>
      <div className="saas-mobile-backdrop" data-open={open} onClick={onClose} aria-hidden />
      <nav
        className="saas-mobile-nav"
        data-open={open}
        aria-label="Main menu"
        aria-hidden={!open}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--ts-border)' }}>
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

        <div style={{ padding: '14px 8px' }}>
          {primary.map(item => {
            const isActive = item.id === activeKey
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 14px',
                  borderRadius: 8,
                  color: isActive ? 'var(--ts-primary)' : 'var(--ts-text)',
                  background: isActive ? 'var(--ts-primary-soft)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  fontSize: 15,
                  minHeight: 44,
                }}
              >
                <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div style={{ padding: '12px 18px 24px', marginTop: 'auto', borderTop: '1px solid var(--ts-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 10 }}>
            {labels.more}
          </div>
          {secondary.map(s => (
            <Link
              key={s.href}
              href={s.href}
              onClick={onClose}
              style={{
                display: 'block',
                padding: '12px 0',
                color: 'var(--ts-muted)',
                textDecoration: 'none',
                fontSize: 14,
                minHeight: 44,
              }}
            >{s.label}</Link>
          ))}
        </div>
      </nav>
    </>
  )
}
