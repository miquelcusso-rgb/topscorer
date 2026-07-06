'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

// Known plan prices (EUR). Used as the GA4 purchase `value` since the real
// charged amount isn't exposed client-side on the Stripe redirect back.
const PRICE: Record<string, number> = {
  pro_monthly: 2.99,
  pro_yearly: 23.99,
  scout_monthly: 5.99,
  scout_yearly: 49.99,
}

// Mounted on the home page (the Stripe success_url is `/?checkout=success...`).
// Fires the GA4 `purchase` conversion exactly once per checkout session.
// Reads window.location.search directly (not useSearchParams) so it doesn't
// force a CSR bail-out on the statically-rendered home page.
export default function PurchaseTracker() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('checkout') !== 'success') return

    const sessionId = p.get('session_id') || undefined
    // De-dupe across reloads/back-button within the session.
    const key = `ts_purchase_${sessionId ?? 'nosession'}`
    try { if (sessionStorage.getItem(key)) return } catch {}

    const plan = p.get('plan') || undefined
    const billing = p.get('billing') || undefined
    const value = plan && billing ? PRICE[`${plan}_${billing}`] : undefined

    track('purchase', {
      currency: 'EUR',
      ...(value !== undefined ? { value } : {}),
      ...(sessionId ? { transaction_id: sessionId } : {}),
      ...(plan ? { plan } : {}),
      ...(billing ? { billing } : {}),
    })

    try { sessionStorage.setItem(key, '1') } catch {}
  }, [])

  return null
}
