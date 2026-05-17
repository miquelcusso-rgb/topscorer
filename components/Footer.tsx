'use client'

import Link from 'next/link'

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
      style={{ background: '#05060b', borderTop: '1px solid #151626' }}
    >
      {/* Gold gradient top bar */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #f0c040 30%, #f0c040 70%, transparent)' }} />

      <div className="max-w-[1100px] mx-auto px-5 py-12">
        <div className="flex flex-wrap gap-10 justify-between mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logos/topscorer-v1.svg"
                width={24}
                height={24}
                alt="TopScorers logo"
                style={{ display: 'block' }}
              />
              <span
                className="text-[16px] font-semibold"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#d8d8ec', letterSpacing: 1 }}
              >
                TopScorers
              </span>
            </div>
            <p className="text-[12px] leading-relaxed max-w-[200px]" style={{ color: '#3a3b50' }}>
              Estadísticas de fútbol europeo. Goleadores y asistentes de las principales ligas.
            </p>
            <p className="text-[11px]" style={{ color: '#2a2b3e' }}>
              Hecho con datos de API-Football
            </p>
          </div>

          {/* Nav groups */}
          <div className="flex flex-wrap gap-10">
            {LINKS.map(group => (
              <div key={group.group} className="flex flex-col gap-2">
                <div
                  className="text-[9px] font-bold tracking-[2px] uppercase mb-1"
                  style={{ color: '#52526e', fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {group.group}
                </div>
                {group.items.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[12px] transition-colors duration-150"
                    style={{ color: '#3a3b50' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#d8d8ec')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#3a3b50')}
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
          style={{ borderTop: '1px solid #0d0e1c' }}
        >
          <span className="text-[11px]" style={{ color: '#2a2b3e' }}>
            © {new Date().getFullYear()} TopScorers. Datos con fines informativos.
          </span>
          <span className="text-[11px]" style={{ color: '#2a2b3e' }}>
            <a href="mailto:support@top-scorers.com" style={{ color: '#2a2b3e' }}>
              support@top-scorers.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
