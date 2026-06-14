'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LangContext'
import { t } from './shared'
import Countdown from './Countdown'

// ─── Shared World Cup chrome (hero + countdown + tab nav) ─────────────────────
// Rendered once by the WC layout so every WC route shares the same header. The
// tab row links to the real routes and highlights the active one via usePathname
// (no client `view` state any more). Golden Boot stays pinned far-right.

// Tab → route segment. `seg: ''` is the Overview base (/mundial-2026).
const TABS: { seg: string; es: string; en: string }[] = [
  { seg: '',           es: 'Resumen',     en: 'Overview' },
  { seg: 'grupos',     es: 'Grupos',      en: 'Groups' },
  { seg: 'calendario', es: 'Calendario',  en: 'Calendar' },
  { seg: 'resultados', es: 'Resultados',  en: 'Results' },
  { seg: 'asistentes', es: 'Asistentes',  en: 'Assists' },
  { seg: 'disciplina', es: 'Disciplina',  en: 'Discipline' },
  { seg: 'bajas',      es: 'Bajas',       en: 'Injuries' },
  { seg: 'noticias',   es: 'Noticias',    en: 'News' },
  { seg: 'sedes',      es: 'Sedes',       en: 'Venues' },
]

export default function WorldCupChrome({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()
  const pathname = usePathname() ?? ''
  const base = `/${lang}/mundial-2026`

  // Active-route detection: compare the trailing segment after the base. The
  // base itself (Overview) matches when nothing (or a trailing slash) follows.
  const rest = pathname.startsWith(base) ? pathname.slice(base.length).replace(/^\/+|\/+$/g, '') : ''
  const activeSeg = TABS.some(tb => tb.seg === rest) ? rest : ''
  const goldenActive = rest === 'bota-de-oro'

  return (
    <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>

      {/* Hero header */}
      <div style={{ background: 'linear-gradient(180deg, var(--ts-primary-soft), var(--ts-bg))', borderBottom: '1px solid var(--ts-border)' }}>
        <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ paddingTop: 24 }}>
            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)', border: '1px solid var(--ts-border-hot)' }}>
                FIFA WORLD CUP
              </span>
              <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
                🇺🇸 USA · 🇨🇦 CANADA · 🇲🇽 MEXICO
              </span>
            </div>

            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(44px, 8vw, 64px)', fontWeight: 800, color: 'var(--ts-primary)', letterSpacing: 1, lineHeight: 0.95 }}>
              {t(lang, 'MUNDIAL 2026', 'WORLD CUP 2026')}
            </h1>
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--ts-muted)' }}>
              {t(lang, '48 selecciones · 16 sedes · 104 partidos · 11 jun – 19 jul 2026', '48 teams · 16 venues · 104 matches · Jun 11 – Jul 19, 2026')}
            </p>

            <Countdown lang={lang} />

            {/* Calendar shortcut button */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 4 }}>
              <Link
                href={`${base}/calendario`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8,
                  background: 'var(--ts-primary)', color: 'var(--ts-bg)', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, letterSpacing: 0.5, fontFamily: 'inherit', textDecoration: 'none',
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {t(lang, 'Ver calendario completo', 'See full calendar')}
              </Link>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {TABS.map(tab => {
              const active = activeSeg === tab.seg
              const href = tab.seg ? `${base}/${tab.seg}` : base
              return (
                <Link
                  key={tab.seg || 'overview'}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase',
                    color: active ? 'var(--ts-primary)' : 'var(--ts-muted)', background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: active ? '2px solid var(--ts-primary)' : '2px solid transparent', padding: '9px 18px', marginBottom: -1, flexShrink: 0,
                    textDecoration: 'none',
                  }}
                >
                  {t(lang, tab.es, tab.en)}
                </Link>
              )
            })}

            {/* Golden Boot — gold button pinned to the FAR-RIGHT end of the tab
                row (margin-left:auto). Links to its own route. */}
            <Link
              href={`${base}/bota-de-oro`}
              aria-label={t(lang, 'Ver la Bota de Oro del Mundial 2026', 'View the 2026 World Cup Golden Boot')}
              aria-current={goldenActive ? 'page' : undefined}
              className="wc-golden-tab"
              style={{
                marginLeft: 'auto', marginBottom: 4, flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', textDecoration: 'none',
                padding: '8px 16px', borderRadius: 8,
                background: 'linear-gradient(135deg, var(--ts-primary), color-mix(in srgb, var(--ts-primary) 75%, #fff))',
                color: '#1a1300', border: '1px solid var(--ts-primary)',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
                ...(goldenActive ? { outline: '2px solid var(--ts-primary)', outlineOffset: 2 } : {}),
              }}
            >
              <span aria-hidden style={{ fontSize: 15, lineHeight: 1 }}>🏆</span>
              <span className="wc-golden-tab-label">{t(lang, 'Bota de Oro', 'Golden Boot')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--ts-bg)' }}>
        <div style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 80px' }}>
          {children}
        </div>
      </div>
    </main>
  )
}
