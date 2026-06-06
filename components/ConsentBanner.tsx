'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/contexts/LangContext'

// GDPR cookie consent banner wired to Google Consent Mode v2. Defaults are set
// to 'denied' in the layout <head>; this updates them on the user's choice and
// stores it so returning visitors aren't re-prompted. The footer "Cookie
// settings" link dispatches `ts-open-consent` to reopen it.
type Choice = 'granted' | 'denied'

function gtagConsent(state: Choice) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] }
  const fn = w.gtag || ((...a: unknown[]) => { (w.dataLayer = w.dataLayer || []).push(a) })
  fn('consent', 'update', {
    ad_storage: state, analytics_storage: state, ad_user_data: state, ad_personalization: state,
  })
}

export default function ConsentBanner() {
  const { lang } = useLang()
  const en = lang === 'en'
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try { stored = localStorage.getItem('ts-consent') } catch { /* ignore */ }
    if (!stored) setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener('ts-open-consent', reopen)
    return () => window.removeEventListener('ts-open-consent', reopen)
  }, [])

  function choose(state: Choice) {
    try { localStorage.setItem('ts-consent', state) } catch { /* ignore */ }
    gtagConsent(state)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-label={en ? 'Cookie consent' : 'Consentimiento de cookies'}
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 9999,
        maxWidth: 560, margin: '0 auto',
        background: 'var(--ts-card, #fff)', color: 'var(--ts-text, #1c1608)',
        border: '1px solid var(--ts-border, #ddd)', borderRadius: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,.28)', padding: '16px 18px',
        fontFamily: 'DM Sans, system-ui, sans-serif',
      }}
    >
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
        🍪 {en ? 'We use cookies' : 'Usamos cookies'}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ts-muted, #666)', margin: '0 0 14px' }}>
        {en
          ? 'Essential cookies keep the site working. With your consent we also use analytics and advertising cookies. You can change this anytime in "Cookie settings".'
          : 'Las cookies esenciales hacen funcionar el sitio. Con tu consentimiento usamos también cookies de analítica y publicidad. Puedes cambiarlo cuando quieras en «Configuración de cookies».'}
        {' '}
        <a href={`/${lang}/cookies`} style={{ color: 'var(--ts-primary, #a8761a)', textDecoration: 'underline' }}>
          {en ? 'Cookie Policy' : 'Política de cookies'}
        </a>
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button
          onClick={() => choose('denied')}
          style={{
            cursor: 'pointer', padding: '9px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            background: 'transparent', color: 'var(--ts-text, #1c1608)', border: '1px solid var(--ts-border, #ccc)',
            fontFamily: 'inherit',
          }}
        >
          {en ? 'Reject non-essential' : 'Rechazar no esenciales'}
        </button>
        <button
          onClick={() => choose('granted')}
          style={{
            cursor: 'pointer', padding: '9px 20px', borderRadius: 999, fontSize: 13, fontWeight: 800,
            background: 'var(--ts-primary, #a8761a)', color: '#fff', border: '1px solid var(--ts-primary, #a8761a)',
            fontFamily: 'inherit',
          }}
        >
          {en ? 'Accept all' : 'Aceptar todo'}
        </button>
      </div>
    </div>
  )
}
