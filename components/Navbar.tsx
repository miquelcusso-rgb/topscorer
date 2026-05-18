'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { useState } from 'react'

interface LeaguePill {
  code: string
  label: string
  color: string
  borderColor: string
  textColor?: string
  transparentBg?: boolean
}

const LEAGUE_PILLS: LeaguePill[] = [
  { code: 'ESP', label: 'ESP', color: '#ee3124', borderColor: 'rgba(238,49,36,.4)' },
  { code: 'ENG', label: 'ENG', color: '#3d195b', borderColor: 'rgba(61,25,91,.6)', textColor: '#a060ff' },
  { code: 'GER', label: 'GER', color: '#e00000', borderColor: 'rgba(224,0,0,.4)' },
  { code: 'ITA', label: 'ITA', color: '#1a4db5', borderColor: 'rgba(26,77,181,.45)' },
  { code: 'FRA', label: 'FRA', color: '#003399', borderColor: 'rgba(0,51,153,.45)' },
  { code: 'PRT', label: 'PRT', color: '#00c8b0', borderColor: 'rgba(0,200,176,.4)', textColor: '#00c8b0', transparentBg: true },
  { code: 'TUR', label: 'TUR', color: '#e00000', borderColor: 'rgba(224,0,0,.4)' },
  { code: 'GR',  label: 'GR',  color: '#1a4db5', borderColor: 'rgba(26,77,181,.45)' },
]

export default function Navbar() {
  const path = usePathname()
  const { user, isLoaded } = useUser()
  const isSignedIn = isLoaded && !!user
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/',             label: 'Estadísticas' },
    { href: '/resultados',   label: 'Resultados' },
    { href: '/mundial-2026', label: 'Mundial 2026' },
    { href: '/pricing',      label: 'Precios' },
  ]

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'rgba(6,13,24,.96)', backdropFilter: 'blur(24px)' }}>

      {/* Row 1 — h-[58px] */}
      <div
        style={{
          height: 58,
          borderBottom: '1px solid rgba(255,255,255,.06)',
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
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, color: '#eef4ff', letterSpacing: '2.5px', textTransform: 'uppercase' }}
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
                  color: path === href ? '#eef4ff' : '#7888aa',
                  background: path === href ? 'rgba(255,255,255,.06)' : 'transparent',
                  fontWeight: path === href ? 600 : 500,
                }}
                onMouseEnter={e => { if (path !== href) { e.currentTarget.style.color = '#b8c8e0'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' } }}
                onMouseLeave={e => { if (path !== href) { e.currentTarget.style.color = '#7888aa'; e.currentTarget.style.background = 'transparent' } }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 ml-auto">
            {isLoaded && !isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <button
                    className="font-medium px-3.5 py-1.5 rounded cursor-pointer transition-all duration-150"
                    style={{ fontSize: 12.5, color: '#7888aa', background: 'transparent', border: '1px solid rgba(255,255,255,.1)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#eef4ff'; e.currentTarget.style.borderColor = 'rgba(240,192,64,.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#7888aa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)' }}
                  >
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    className="font-bold px-4 py-1.5 rounded cursor-pointer transition-all duration-150"
                    style={{ fontSize: 12.5, color: '#060d18', background: '#f0c040', boxShadow: '0 2px 12px rgba(240,192,64,.28)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8d060'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(240,192,64,.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f0c040'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(240,192,64,.28)' }}
                  >
                    Pro →
                  </button>
                </SignUpButton>
              </>
            )}

            {isSignedIn && (
              <div className="flex items-center gap-3">
                <Link
                  href="/pricing"
                  className="text-[11.5px] font-semibold px-3 py-1.5 rounded-sm transition-all duration-150 cursor-pointer hidden md:inline-flex"
                  style={{ color: '#f0c040', background: 'rgba(240,192,64,.08)', border: '1px solid rgba(240,192,64,.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,192,64,.14)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(240,192,64,.08)')}
                >
                  Upgrade
                </Link>
                <UserButton />
              </div>
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

      {/* Row 2 — h-[36px] secondary bar — desktop only */}
      <div
        className="hidden md:block"
        style={{
          height: 36,
          background: 'rgba(5,10,20,.90)',
          borderBottom: '1px solid rgba(255,255,255,.05)',
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5 h-full flex items-center gap-2">

          {/* League pills */}
          {LEAGUE_PILLS.map(pill => (
            <a
              key={pill.code}
              href={`/?league=${pill.code}`}
              className="inline-flex items-center rounded-sm cursor-pointer transition-all duration-150"
              style={{
                fontSize: 9,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                padding: '2px 6px',
                color: pill.transparentBg ? pill.textColor ?? pill.color : '#c8c8e0',
                background: pill.transparentBg ? 'transparent' : `${pill.color}22`,
                border: `1px solid ${pill.borderColor}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {pill.label}
            </a>
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* LIVE badge */}
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: '#38c47a',
                boxShadow: '0 0 6px #38c47a',
                animation: 'pulse-live 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: 9,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#38c47a',
              }}
            >
              LIVE
            </span>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{ background: 'rgba(9,7,16,.98)', borderBottom: '1px solid #1a1630' }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-5 py-3 text-[14px] font-medium border-b transition-colors duration-150"
              style={{
                color: path === href ? '#d8d8ec' : '#8080a8',
                borderColor: '#0e0f1e',
              }}
            >
              {label}
            </Link>
          ))}
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
