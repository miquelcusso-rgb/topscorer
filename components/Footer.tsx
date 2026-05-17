'use client'

import Link from 'next/link'
import Image from 'next/image'

const LINKS = [
  {
    group: 'Estadísticas',
    items: [
      { href: '/',             label: 'Goleadores' },
      { href: '/?tab=a',       label: 'Asistentes' },
      { href: '/?tab=c',       label: 'Centrocampistas' },
      { href: '/resultados',   label: 'Resultados' },
    ],
  },
  {
    group: 'Competiciones',
    items: [
      { href: '/mundial-2026', label: 'Mundial 2026' },
      { href: '/resultados',   label: 'Clasificaciones' },
    ],
  },
  {
    group: 'Producto',
    items: [
      { href: '/pricing',  label: 'Precios' },
      { href: '/about',    label: 'Sobre TopScorers' },
      { href: '/privacidad', label: 'Privacidad' },
      { href: '/legal',      label: 'Aviso legal' },
    ],
  },
]

export default function Footer() {
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
              Estadísticas de fútbol europeo. Goleadores y asistentes de las principales ligas.
            </p>
            <p className="text-[11px]" style={{ color: '#525278' }}>
              Hecho con datos de API-Football
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
            © {new Date().getFullYear()} TopScorers. Datos con fines informativos.
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
