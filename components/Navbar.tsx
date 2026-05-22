'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { isPro, isScout, isTeam } from '@/lib/plans'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import ShareButton from '@/components/ShareButton'


export default function Navbar() {
  const path = usePathname()
  const { user, isLoaded } = useUser()
  const isSignedIn = isLoaded && !!user
  const userMeta = user?.publicMetadata as Record<string, unknown> | undefined
  const isScoutUser = isSignedIn && (isScout(userMeta) || isTeam(userMeta))
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const { theme, toggle } = useTheme()

  // Close "Más" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const { lang, setLang } = useLang()
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

  // Primary links (always visible on desktop)
  const primaryLinks = [
    { href: '/',                        label: t('nav_stats', lang) },
    { href: '/competiciones',           label: t('nav_competitions', lang) },
    { href: '/resultados',              label: t('nav_results', lang) },
    { href: '/estadisticas/comparador', label: t('nav_compare', lang) },
    { href: '/pricing',                 label: t('nav_pricing', lang) },
  ]
  // Secondary links (in "Más" dropdown)
  const secondaryLinks = [
    { href: '/jugadores',    label: t('nav_players', lang) },
    { href: '/descubrir',    label: t('nav_discover', lang) },
    { href: '/transferencias', label: t('nav_transfers', lang) },
    { href: '/mundial-2026', label: t('nav_world_cup', lang) },
    // Scout-only: API key management
    ...(isScoutUser ? [{ href: '/cuenta/api', label: 'API' }] : []),
  ]
  // All links for mobile menu
  const navLinks = [...primaryLinks, ...secondaryLinks]

  // Cancellation banner
  const planCancelsAt = user?.publicMetadata?.planCancelsAt as string | null | undefined
  const planExpiry    = user?.publicMetadata?.planExpiry    as string | null | undefined
  const planName      = isScoutUser ? 'Scout' : 'Pro'
  const showCancelBanner = isSignedIn && !!planCancelsAt

  return (
    <nav className="sticky top-0 z-50" style={{ background: navBg, backdropFilter: 'blur(24px)' }}>

      {/* Cancellation notice banner */}
      {showCancelBanner && (
        <div
          className="w-full text-center text-[11px] font-medium py-1.5 px-4"
          style={{
            background: isLight ? '#fff4e0' : '#1a1000',
            borderBottom: `1px solid ${isLight ? '#f0c04060' : '#f0c04030'}`,
            color: isLight ? '#7a5800' : '#f0c040',
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: 0.5,
          }}
        >
          {lang === 'en' ? `Your ${planName} plan ends on ` : `Tu plan ${planName} finaliza el `}
          <strong>
            {new Date(planCancelsAt ?? planExpiry ?? '').toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </strong>
          .{' '}
          <Link href="/pricing" style={{ color: '#f0c040', textDecoration: 'underline' }}>
            Renovar
          </Link>
        </div>
      )}

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
            {primaryLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded transition-all duration-150 cursor-pointer whitespace-nowrap"
                style={{
                  fontSize: 13,
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

            {/* "Más" dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(v => !v)}
                className="px-3 py-1.5 rounded transition-all duration-150 cursor-pointer flex items-center gap-1"
                style={{
                  fontSize: 13,
                  color: secondaryLinks.some(l => l.href === path) ? navActive : navText,
                  background: secondaryLinks.some(l => l.href === path) ? navActiveBg : 'transparent',
                  fontWeight: 500, border: 'none', outline: 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = secondaryLinks.some(l => l.href === path) ? navActiveBg : 'transparent' }}
              >
                {lang === 'es' ? 'Más' : 'More'}
                <span style={{ fontSize: 9, opacity: 0.6, marginTop: 1 }}>▼</span>
              </button>
              {moreOpen && (
                <div
                  className="absolute left-0 top-full mt-1 rounded-lg py-1 z-50 min-w-[160px]"
                  style={{
                    background: isLight ? '#ffffff' : '#10111e',
                    border: `1px solid ${isLight ? 'rgba(0,0,0,.1)' : '#1a1b2e'}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,.32)',
                  }}
                >
                  {secondaryLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2.5 transition-colors duration-150"
                      style={{
                        fontSize: 13,
                        color: path === href ? (isLight ? '#0f1830' : '#eef4ff') : (isLight ? '#3a5070' : '#8090b0'),
                        fontWeight: path === href ? 600 : 400,
                        background: path === href ? (isLight ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.05)') : 'transparent',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.06)'; e.currentTarget.style.color = isLight ? '#0f1830' : '#d8d8ec' }}
                      onMouseLeave={e => { e.currentTarget.style.background = path === href ? (isLight ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.05)') : 'transparent'; e.currentTarget.style.color = path === href ? (isLight ? '#0f1830' : '#eef4ff') : (isLight ? '#3a5070' : '#8090b0') }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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

          {/* Share button */}
          <ShareButton />

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="cursor-pointer rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              width: 32, height: 32, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.5px',
              background: 'rgba(255,255,255,.06)',
              border: '1.5px solid rgba(255,255,255,.12)',
              color: '#9090a8',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)' }}
            aria-label="Change language"
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>

          {/* Theme toggle + hint arrow (drops below) */}
          <div className="relative flex items-center">
            <button
              onClick={handleToggle}
              aria-label={theme === 'dark' ? t('theme_aria_to_light', lang) : t('theme_aria_to_dark', lang)}
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
                }}>{t('theme_hint_light', lang)}</div>
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
                  ⚡ {t('nav_enter', lang)}
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
                      {t('nav_sign_in', lang)}
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
