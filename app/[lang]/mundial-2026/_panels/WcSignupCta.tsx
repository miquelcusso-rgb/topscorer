'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useLang } from '@/contexts/LangContext'

// ─── Soft account capture for World Cup fans ──────────────────────────────────
// Top-of-funnel: the WC pages are the only ones ranking + getting real traffic,
// but the fan reads and leaves. This is a *soft* CTA (no paywall, never blocks
// or replaces the server-rendered/indexable content) that nudges signed-out
// visitors to create a FREE account, so post-tournament we have a base that's
// convertible to Pro. Hidden once the user is signed in.
//
// `nation` personalises the copy on the team pages ("follow <nation>"). The link
// points at the existing Clerk sign-up route (/<lang>/sign-up).

export default function WcSignupCta({ nation }: { nation?: string }) {
  const { lang } = useLang()
  const { isSignedIn, isLoaded } = useUser()

  // Already has an account → no soft capture needed.
  if (isLoaded && isSignedIn) return null

  const en = lang === 'en'
  const headline = nation
    ? (en ? `Following ${nation} at the World Cup?` : `¿Sigues a ${nation} en el Mundial?`)
    : (en ? 'Following the World Cup?' : '¿Sigues el Mundial 2026?')
  const sub = nation
    ? (en
        ? `Create a free account to follow ${nation} and get notified when the Golden Boot lead changes.`
        : `Crea una cuenta gratis para seguir a ${nation} y enterarte cuando cambie el goleador.`)
    : (en
        ? 'Create a free account to follow your team and get notified when the Golden Boot lead changes.'
        : 'Crea una cuenta gratis para seguir a tu selección y enterarte cuando cambie el goleador.')

  return (
    <section
      style={{
        margin: '8px 0',
        borderRadius: 14,
        padding: '18px 20px',
        background: 'var(--ts-primary-soft)',
        border: '1px solid var(--ts-border-hot)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div style={{ flex: 1, minWidth: 220 }}>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: 'var(--ts-primary)',
            lineHeight: 1.1,
          }}
        >
          {headline}
        </div>
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: '4px 0 0', lineHeight: 1.55 }}>
          {sub}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, flexShrink: 0 }}>
        <Link
          href={`/${lang}/sign-up`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '10px 18px',
            borderRadius: 8,
            background: 'var(--ts-primary)',
            color: 'var(--ts-bg)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.4,
            fontFamily: 'inherit',
            textDecoration: 'none',
          }}
        >
          {en ? 'Create free account' : 'Crear cuenta gratis'}
        </Link>
        <span style={{ fontSize: 10, color: 'var(--ts-faint)', letterSpacing: 0.5 }}>
          {en ? 'Free · no card needed' : 'Gratis · sin tarjeta'}
        </span>
      </div>
    </section>
  )
}
