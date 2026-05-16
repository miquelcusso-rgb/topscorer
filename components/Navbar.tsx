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
      className="sticky top-0 z-50"
      style={{ background: 'rgba(7,7,15,.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e1e34' }}
    >
      <div className="max-w-[1480px] mx-auto px-4 h-11 flex items-center gap-4">

        <Link
          href="/"
          style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: '#f0c040', letterSpacing: 2, lineHeight: 1 }}
        >
          TopScorers
        </Link>

        <div className="flex items-center gap-4 ml-auto">
          <Link
            href="/pricing"
            className="text-[12px] font-semibold transition-colors duration-150"
            style={{ color: path === '/pricing' ? '#e5e5f2' : '#5a5a7a' }}
          >
            Pricing
          </Link>

          {isLoaded && !isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-sm cursor-pointer transition-all duration-150"
                  style={{ color: '#e5e5f2', background: '#151528', border: '1px solid #1e1e34' }}
                >
                  Entrar
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="text-[12px] font-bold px-3 py-1.5 rounded-sm cursor-pointer"
                  style={{ color: '#07070f', background: '#f0c040', border: '1px solid #f0c040' }}
                >
                  Pro →
                </button>
              </SignUpButton>
            </>
          )}

          {isSignedIn && (
            <>
              <Link
                href="/pricing"
                className="text-[11px] font-bold px-2.5 py-1 rounded-sm"
                style={{ color: '#f0c040', background: 'rgba(240,192,64,.1)', border: '1px solid rgba(240,192,64,.25)' }}
              >
                Upgrade
              </Link>
              <UserButton />
            </>
          )}
        </div>

      </div>
    </nav>
  )
}
