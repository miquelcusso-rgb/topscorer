'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/contexts/LangContext'
import { useTheme } from '@/contexts/ThemeContext'
import { t } from '@/lib/i18n'

export default function Footer() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const footerBg = isLight ? '#e8edf8' : '#080910'
  const footerBorder = isLight ? '#c8d0e8' : '#1e2033'
  const bottomBorder = isLight ? '#c8d0e8' : '#1e1a38'
  const textBrand = isLight ? '#0f1830' : '#eeeef5'
  const textDesc = isLight ? '#5060a0' : '#7070a0'
  const textData = isLight ? '#7080a0' : '#525278'
  const textGroup = isLight ? '#6070a0' : '#5a5c88'
  const textLink = isLight ? '#5060a0' : '#7070a0'
  const textLinkHover = isLight ? '#0f1830' : '#b0b0cc'
  const textCopy = isLight ? '#6070a0' : '#525278'

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
        { href: lp('/privacidad'), label: t('footer_privacy', lang) },
        { href: lp('/legal'),      label: t('footer_legal', lang) },
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

      <div className="max-w-[1100px] mx-auto px-5 py-12">
        <div className="flex flex-wrap gap-10 justify-between mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-3">
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
          <div className="flex flex-wrap gap-10">
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
          className="flex flex-wrap items-center justify-between gap-3 pt-6"
          style={{ borderTop: `1px solid ${bottomBorder}` }}
        >
          <span style={{ fontSize: 12, color: textCopy }}>
            © {new Date().getFullYear()} TopScorers. {t('footer_copy', lang)}
          </span>
          <span style={{ fontSize: 12, color: textCopy }}>
            <a href="mailto:support@top-scorers.com" style={{ color: textCopy }}>
              support@top-scorers.com
            </a>
          </span>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid currentColor', borderTopColor: 'rgba(128,128,128,0.15)', fontSize: 11, opacity: 0.6, textAlign: 'center' }}>
          Part of the <a href="https://furiosadata.com" rel="dofollow" style={{ color: 'inherit', borderBottom: '1px solid currentColor' }}>Furiosa Data Tools Network</a> — open data and 8 free tools by Furiosa Studio.
        </div>
      </div>
    </footer>
  )
}
