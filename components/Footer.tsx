'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'
import { t } from '@/lib/i18n'

export default function Footer() {
  const { lang } = useLang()
  const { theme } = useTheme()
  void theme

  // Brand palette only (black / gold / turquoise). Uses --ts-* tokens so it
  // matches the rest of the site in both themes — NO bluish legacy colours.
  const footerBg = 'var(--ts-card2)'
  const footerBorder = 'var(--ts-border)'
  const bottomBorder = 'var(--ts-border)'
  const textBrand = 'var(--ts-text)'
  const textDesc = 'var(--ts-muted)'
  const textData = 'var(--ts-faint)'
  const textGroup = 'var(--ts-faint)'
  const textLink = 'var(--ts-muted)'
  const textLinkHover = 'var(--ts-text)'
  const textCopy = 'var(--ts-muted)'

  // Locale-aware path builder
  const lp = (p: string) => (p === '/' ? `/${lang}` : `/${lang}${p}`)

  const LINKS = [
    {
      group: t('footer_stats', lang),
      items: [
        { href: lp('/'),            label: t('footer_scorers', lang) },
        { href: lp('/?tab=a'),      label: t('footer_assists', lang) },
        { href: lp('/?tab=c'),      label: t('footer_midfield', lang) },
        { href: lp('/resultados'),  label: t('footer_results', lang) },
      ],
    },
    {
      group: t('footer_competitions', lang),
      items: [
        { href: lp('/mundial-2026'),    label: t('footer_world_cup', lang) },
        { href: lp('/resultados'),      label: t('footer_tables', lang) },
        { href: lp('/transferencias'),  label: lang === 'es' ? 'Fichajes' : 'Transfers' },
        { href: lp('/rumores'),         label: lang === 'es' ? 'Rumores' : 'Rumours' },
      ],
    },
    {
      group: lang === 'es' ? 'Goleadores' : 'Top scorers',
      items: [
        { href: lp('/maximos-goleadores-europa'), label: lang === 'es' ? 'Goleadores de Europa' : 'Europe top scorers' },
        { href: lp('/goleadores-liga-espanola'),  label: lang === 'es' ? 'Goleadores La Liga' : 'La Liga scorers' },
        { href: lp('/goleadores-premier-league'), label: lang === 'es' ? 'Goleadores Premier' : 'Premier scorers' },
        { href: lp('/bota-de-oro'),               label: lang === 'es' ? 'Bota de Oro' : 'Golden Shoe' },
      ],
    },
    {
      group: t('footer_product', lang),
      items: [
        { href: lp('/pricing'),    label: t('footer_pricing', lang) },
        { href: lp('/wiki'),       label: lang === 'es' ? 'Wiki / Ayuda' : 'Wiki / Help' },
        { href: lp('/clasificacion'), label: lang === 'es' ? 'Comunidad · Ranking' : 'Community · Ranking' },
        { href: lp('/encuestas'),     label: lang === 'es' ? 'Encuestas' : 'Polls' },
        { href: lp('/predicciones'),  label: lang === 'es' ? 'Predicciones' : 'Picks' },
        { href: lp('/about'),      label: t('footer_about', lang) },
        { href: lp('/api-docs'),   label: 'API' },
      ],
    },
    {
      group: 'Legal',
      items: [
        { href: lp('/privacidad'), label: lang === 'es' ? 'Privacidad' : 'Privacy' },
        { href: lp('/terminos'),   label: lang === 'es' ? 'Términos' : 'Terms' },
        { href: lp('/cookies'),    label: 'Cookies' },
        { href: lp('/aviso'),      label: lang === 'es' ? 'Aviso y fuentes' : 'Disclaimer & sources' },
      ],
    },
  ]

  return (
    <footer
      className="w-full"
      style={{ background: footerBg, borderTop: `1px solid ${footerBorder}` }}
    >
      {/* Gold gradient top bar */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #f0c040 30%, #f0c040 70%, transparent)' }} />

      <div className="ts-footer-inner max-w-[1100px] mx-auto px-5 py-12">
        <div className="ts-footer-top flex flex-wrap gap-10 justify-between mb-10">

          {/* Brand */}
          <div className="ts-footer-brand flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="TopScorers" width={22} height={22} unoptimized style={{ borderRadius: 3 }} />
              <span
                className="text-[16px] font-semibold"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: textBrand, letterSpacing: 1 }}
              >
                TopScorers
              </span>
            </div>
            <p className="text-[12px] leading-relaxed max-w-[200px]" style={{ color: textDesc }}>
              {t('footer_desc', lang)}
            </p>
            <p className="text-[11px]" style={{ color: textData }}>
              {t('footer_data', lang)}
            </p>
          </div>

          {/* Nav groups */}
          <div className="ts-footer-cols flex flex-wrap gap-10">
            {LINKS.map(group => (
              <div key={group.group} className="flex flex-col gap-2">
                <div
                  className="text-[9px] font-bold tracking-[2px] uppercase mb-1"
                  style={{ color: textGroup, fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {group.group}
                </div>
                {group.items.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="transition-colors duration-150"
                    style={{ fontSize: 13, color: textLink }}
                    onMouseEnter={e => (e.currentTarget.style.color = textLinkHover)}
                    onMouseLeave={e => (e.currentTarget.style.color = textLink)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="ts-footer-bottom flex flex-wrap items-center justify-between gap-3 pt-6"
          style={{ borderTop: `1px solid ${bottomBorder}` }}
        >
          <span style={{ fontSize: 12, color: textCopy }}>
            © {new Date().getFullYear()} TopScorers · {lang === 'es' ? 'por Furiosa Studio' : 'by Furiosa Studio'}. {' '}
            <button
              type="button"
              onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('ts-open-consent')) }}
              style={{ background: 'none', border: 'none', padding: 0, color: textCopy, textDecoration: 'underline', cursor: 'pointer', font: 'inherit', fontSize: 12 }}
            >
              {lang === 'es' ? 'Configuración de cookies' : 'Cookie settings'}
            </button>
          </span>
          <span style={{ fontSize: 12, color: textCopy }}>
            <a href="mailto:support@top-scorers.com" style={{ color: textCopy }}>
              support@top-scorers.com
            </a>
          </span>
        </div>

        <div className="ts-footer-net" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid currentColor', borderTopColor: 'rgba(128,128,128,0.15)', fontSize: 11, opacity: 0.6, textAlign: 'center' }}>
          Part of the <a href="https://furiosadata.com" rel="dofollow" style={{ color: 'inherit', borderBottom: '1px solid currentColor' }}>Furiosa Data Tools Network</a> — open data and 8 free tools by Furiosa Studio.
        </div>

        {/* tinystartups · Launched on Tiny Startups */}
        <div style={{ marginTop: '0.75rem', textAlign: 'center', transform: 'scale(0.8)', transformOrigin: 'center top' }}>
          <a
            href="https://www.tinystartups.com/startup/topscorer"
            target="_blank"
            rel="noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              padding: '14px 22px 14px 18px', borderRadius: 14, textDecoration: 'none',
              fontFamily: "'Inter',system-ui,sans-serif",
              background: 'linear-gradient(#fff,#fff) padding-box,linear-gradient(90deg,#3525E6,#D81FE0,#22B8F0) border-box',
              border: '2px solid transparent', color: '#0E0B1F',
            }}
          >
            <svg width="56" height="56" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="tsg" x1=".1" y1="0" x2=".9" y2="1">
                  <stop offset="0%" stopColor="#3525E6" />
                  <stop offset="55%" stopColor="#D81FE0" />
                  <stop offset="100%" stopColor="#22B8F0" />
                </linearGradient>
              </defs>
              <path d="M50 6C52 32 68 48 94 50C68 52 52 68 50 94C48 68 32 52 6 50C32 48 48 32 50 6Z" fill="url(#tsg)" />
            </svg>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6A6585' }}>Launched on</span>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em' }}>Tiny Startups</span>
              <span style={{ fontSize: 11, color: '#6A6585', marginTop: 4 }}>tinystartups.com</span>
            </span>
          </a>
        </div>

        {/* launchbuff · Featured on LaunchBuff */}
        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          <a href="https://launchbuff.com/" target="_blank" rel="noopener noreferrer" title="Featured on LaunchBuff">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://launchbuff.com/badge-featured-dark.svg" alt="Featured on LaunchBuff" width={256} height={80} />
          </a>
        </div>

        {/* launchstag · Featured on Launchstag */}
        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          <a href="https://launchstag.com/" target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://launchstag.com/badge-light.png" alt="Featured on Launchstag" width={150} />
          </a>
        </div>

        {/* tinylaunch · Launching Soon (launch 3-ago-2026) */}
        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          <a href="https://tinylaunch.com/" target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://tinylaunch.com/tinylaunch_badge_launching_soon.svg"
              alt="TinyLaunch Badge"
              width={202}
              height={52}
              style={{ width: 202, height: 'auto' }}
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
