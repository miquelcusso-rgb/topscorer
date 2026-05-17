'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  const path = usePathname()
  const { user, isLoaded } = useUser()
  const isSignedIn = isLoaded && !!user

  return (
    <nav
      className="sticky top-0 z-50 h-[52px]"
      style={{
        background: 'rgba(4,5,10,.98)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #141526',
      }}
    >
      <div className="max-w-[1100px] mx-auto px-5 h-full flex items-center gap-5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="flex items-center justify-center w-[30px] h-[30px] text-[13px] font-bold rounded-sm"
            style={{ background: '#f0c040', color: '#05060c', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}
          >
            TS
          </span>
          <span
            className="text-[17px] font-semibold tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#d8d8ec', letterSpacing: 1 }}
          >
            TopScorers
          </span>
        </Link>

        {/* divider */}
        <div className="w-px h-4 shrink-0" style={{ background: '#1a1b2e' }} />

        {/* Nav links */}
        <div className="flex items-center gap-0.5 text-[12px] font-medium">
          {[
            { href: '/',              label: 'Estadísticas' },
            { href: '/resultados',    label: 'Resultados' },
            { href: '/mundial-2026',  label: 'Mundial 2026' },
            { href: '/pricing',       label: 'Precios' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-sm transition-colors duration-150 cursor-pointer"
              style={{ color: path === href ? '#d8d8ec' : '#52526e' }}
              onMouseEnter={e => { if (path !== href) e.currentTarget.style.color = '#9090a8' }}
              onMouseLeave={e => { if (path !== href) e.currentTarget.style.color = '#52526e' }}
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
                  className="text-[12px] font-medium px-3.5 py-1.5 rounded-sm cursor-pointer transition-colors duration-150"
                  style={{ color: '#52526e', background: 'transparent', border: '1px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#d8d8ec'; e.currentTarget.style.borderColor = '#1a1b2e' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#52526e'; e.currentTarget.style.borderColor = 'transparent' }}
                >
                  Entrar
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="text-[12px] font-bold px-3.5 py-1.5 rounded-sm cursor-pointer transition-all duration-150"
                  style={{ color: '#05060c', background: '#f0c040' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8d060')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f0c040')}
                >
                  Pro
                </button>
              </SignUpButton>
            </>
          )}

          {isSignedIn && (
            <div className="flex items-center gap-3">
              <Link
                href="/pricing"
                className="text-[11.5px] font-semibold px-3 py-1.5 rounded-sm transition-all duration-150 cursor-pointer"
                style={{ color: '#f0c040', background: 'rgba(240,192,64,.08)', border: '1px solid rgba(240,192,64,.2)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,192,64,.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(240,192,64,.08)')}
              >
                Upgrade
              </Link>
              <UserButton />
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}
