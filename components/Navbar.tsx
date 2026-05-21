'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { isPro } from '@/lib/plans'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'


export default function Navbar() {
  const path = usePathname()
  const { user, isLoaded } = useUser()
  const isSignedIn = isLoaded && !!user
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const [showHint, setShowHint] = useState(false)
  const isLight = theme === 'light'
  const navBg   = isLight ? 'rgba(248,250,255,.97)' : 'rgba(6,13,24,.96)'
  const navText = isLight ? '#1a2a40' : '#7888aa'
  const navActive = isLight ? '#0f1830' : '#eef4ff'
  const navActiveBg = isLight ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)'

  useEffect(() => {
    const seen = localStorage.getItem('ts-theme-hint')
    if (!seen) {
      setShowHint(true)
      const t = setTimeout(() => setShowHint(false), 8000)
      return () => clearTimeout(t)
    }
  }, [])

  function handleToggle() {
    toggle()
    setShowHint(false)
    localStorage.setItem('ts-theme-hint', '1')
  }

  const navLinks = [
    { href: '/',                        label: 'Estadísticas' },
    { href: '/jugadores',               label: 'Jugadores' },
    { href: '/estadisticas/comparador', label: 'Comparar' },
    { href: '/resultados',              label: 'Resultados' },
    { href: '/mundial-2026',            label: 'Mundial 2026' },
    { href: '/pricing',                 label: 'Precios' },
  ]

  return (
    <nav className="sticky top-0 z-50" style={{ background: navBg, backdropFilter: 'blur(24px)' }}>

      {/* Row 1 — h-[58px] */}
      <div
        style={{
          height: 58,
          borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.06)'}`,
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5 h-full flex items-center gap-5">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div style={{
              width: 34, height: 34, borderRadius: '50%', overflow: 'hidden',
              border: '1.5px solid rgba(240,192,64,.32)',
              boxShadow: '0 0 14px rgba(240,192,64,.18)',
              flexShrink: 0,
            }}>
              <Image src="/logo-ball.png" alt="TopScorers" width={34} height={34} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span
              className="font-bold tracking-wide"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, color: navActive, letterSpacing: '2.5px', textTransform: 'uppercase' }}
            >
              Top<span style={{ color: '#f0c040' }}>Scorers</span>
            </span>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-0.5 font-medium">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded transition-all duration-150 cursor-pointer"
                style={{
                  fontSize: 13.5,
                  color: path === href ? navActive : navText,
                  background: path === href ? navActiveBg : 'transparent',
                  fontWeight: path === href ? 600 : 500,
                }}
                onMouseEnter={e => { if (path !== href) { e.currentTarget.style.color = isLight ? '#2a3a54' : '#b8c8e0'; e.currentTarget.style.background = isLight ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.04)' } }}
                onMouseLeave={e => { if (path !== href) { e.currentTarget.style.color = navText; e.currentTarget.style.background = 'transparent' } }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* LIVE chip */}
          <div className="hidden md:flex items-center gap-1.5 ml-auto">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: '#38c47a', boxShadow: '0 0 6px #38c47a', animation: 'pulse-live 2s ease-in-out infinite' }}
            />
            <span style={{ fontSize: 9.5, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#38c47a' }}>
              LIVE
            </span>
          </div>

          {/* Theme toggle + hint arrow (drops below) */}
          <div className="relative flex items-center">
            <button
              onClick={handleToggle}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="cursor-pointer rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                width: 32, height: 32,
                background: theme === 'dark' ? 'rgba(240,192,64,.12)' : 'rgba(240,192,64,.18)',
                border: `1.5px solid ${theme === 'dark' ? 'rgba(240,192,64,.25)' : 'rgba(240,192,64,.5)'}`,
                color: '#f0c040',
                fontSize: 15,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,192,64,.22)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = theme === 'dark' ? 'rgba(240,192,64,.12)' : 'rgba(240,192,64,.18)' }}
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            {showHint && (
              <div className="absolute top-full right-0 mt-1 flex flex-col items-center pointer-events-none z-50">
                <span className="theme-hint-arrow" style={{ color: '#f0c040', fontSize: 12, lineHeight: 1 }}>▼</span>
                <div style={{
                  background: 'rgba(6,10,22,.97)', border: '1px solid rgba(240,192,64,.35)',
                  borderRadius: 5, padding: '4px 9px', whiteSpace: 'nowrap', marginTop: 2,
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '1.5px', color: '#f0c040',
                  fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase',
                  boxShadow: '0 4px 16px rgba(0,0,0,.4)',
                }}>Modo claro</div>
              </div>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {/* Pro CTA — oculto SOLO cuando sabemos con certeza que ya es Pro */}
            {!(isLoaded && isSignedIn && isPro(user?.publicMetadata as Record<string, unknown>)) && (
              isSignedIn ? (
                /* Signed in but not Pro → go to pricing */
                <Link
                  href="/pricing"
                  className="inline-flex font-bold px-4 py-1.5 rounded cursor-pointer transition-all duration-150 items-center gap-1"
                  style={{
                    fontSize: 12.5, color: '#060d18', background: '#f0c040',
                    boxShadow: '0 2px 12px rgba(240,192,64,.28)',
                    letterSpacing: '0.3px', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8d060'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(240,192,64,.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f0c040'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(240,192,64,.28)' }}
                >
                  ⚡ Pro
                </Link>
              ) : (
                /* Not signed in → go to sign-in page (redirect to pricing after) */
                <Link
                  href="/sign-in?redirect_url=%2Fpricing"
                  className="inline-flex font-bold px-4 py-1.5 rounded cursor-pointer transition-all duration-150 items-center gap-1"
                  style={{
                    fontSize: 12.5, color: '#060d18', background: '#f0c040',
                    boxShadow: '0 2px 12px rgba(240,192,64,.28)',
                    letterSpacing: '0.3px', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8d060'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(240,192,64,.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f0c040'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(240,192,64,.28)' }}
                >
                  ⚡ Entrar / Pro
                </Link>
              )
            )}

            {isSignedIn && (
              <UserButton />
            )}

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden flex flex-col gap-[5px] p-1.5 cursor-pointer"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="block w-[18px] h-[1.5px] rounded-full transition-all duration-150"
                  style={{ background: '#606088' }}
                />
              ))}
            </button>
          </div>

        </div>
      </div>


      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{ background: isLight ? 'rgba(240,244,255,.99)' : 'rgba(9,7,16,.98)', borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,.1)' : '#1a1630'}` }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-5 py-3 text-[14px] font-medium border-b transition-colors duration-150"
              style={{
                color: path === href ? (isLight ? '#0f1830' : '#d8d8ec') : (isLight ? '#3a5070' : '#8080a8'),
                borderColor: isLight ? 'rgba(0,0,0,.08)' : '#0e0f1e',
              }}
            >
              {label}
            </Link>
          ))}
          {/* Auth buttons in mobile menu */}
          {isLoaded && (
            <div className="px-5 py-4 flex items-center gap-3" style={{ borderTop: `1px solid ${isLight ? 'rgba(0,0,0,.1)' : '#1a1630'}` }}>
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button
                      className="flex-1 py-2 rounded text-[13px] font-medium cursor-pointer"
                      style={{ color: '#aab8cc', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Entrar
                    </button>
                  </SignInButton>
                  <Link
                    href="/pricing"
                    className="flex-1 py-2 rounded text-[13px] font-bold cursor-pointer text-center"
                    style={{ color: '#060d18', background: '#f0c040', textDecoration: 'none' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    ⚡ Pro
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <UserButton />
                  <Link
                    href="/pricing"
                    onClick={() => setMenuOpen(false)}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-sm"
                    style={{ color: '#f0c040', background: 'rgba(240,192,64,.08)', border: '1px solid rgba(240,192,64,.2)' }}
                  >
                    Upgrade
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #38c47a; }
          50% { opacity: 0.5; box-shadow: 0 0 12px #38c47a; }
        }
      `}</style>
    </nav>
  )
}
