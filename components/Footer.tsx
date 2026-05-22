'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'

export default function Footer() {
  const { lang } = useLang()

  const LINKS = [
    {
      group: t('footer_stats', lang),
      items: [
        { href: '/',           label: t('footer_scorers', lang) },
        { href: '/?tab=a',     label: t('footer_assists', lang) },
        { href: '/?tab=c',     label: t('footer_midfield', lang) },
        { href: '/resultados', label: t('footer_results', lang) },
      ],
    },
    {
      group: t('footer_competitions', lang),
      items: [
        { href: '/mundial-2026', label: t('footer_world_cup', lang) },
        { href: '/resultados',   label: t('footer_tables', lang) },
      ],
    },
    {
      group: t('footer_product', lang),
      items: [
        { href: '/pricing',    label: t('footer_pricing', lang) },
        { href: '/about',      label: t('footer_about', lang) },
        { href: '/privacidad', label: t('footer_privacy', lang) },
        { href: '/legal',      label: t('footer_legal', lang) },
      ],
    },
  ]

  return (
    <footer
      className="w-full"
      style={{ background: '#080910', borderTop: '1px solid #1e2033' }}
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
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#eeeef5', letterSpacing: 1 }}
              >
                TopScorers
              </span>
            </div>
            <p className="text-[12px] leading-relaxed max-w-[200px]" style={{ color: '#7070a0' }}>
              {t('footer_desc', lang)}
            </p>
            <p className="text-[11px]" style={{ color: '#525278' }}>
              {t('footer_data', lang)}
            </p>
          </div>

          {/* Nav groups */}
          <div className="flex flex-wrap gap-10">
            {LINKS.map(group => (
              <div key={group.group} className="flex flex-col gap-2">
                <div
                  className="text-[9px] font-bold tracking-[2px] uppercase mb-1"
                  style={{ color: '#5a5c88', fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {group.group}
                </div>
                {group.items.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="transition-colors duration-150"
                    style={{ fontSize: 13, color: '#7070a0' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#b0b0cc')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7070a0')}
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
          style={{ borderTop: '1px solid #1e1a38' }}
        >
          <span style={{ fontSize: 12, color: '#525278' }}>
            © {new Date().getFullYear()} TopScorers. {t('footer_copy', lang)}
          </span>
          <span style={{ fontSize: 12, color: '#525278' }}>
            <a href="mailto:support@top-scorers.com" style={{ color: '#525278' }}>
              support@top-scorers.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
