// Minimal analytics helper. TopScorers ships a Google Tag Manager container
// (see components/GoogleTagManager.tsx); GA4 reads events pushed to the GTM
// dataLayer. We therefore push custom events here and let GTM forward them to
// GA4 — no direct gtag() call, to stay on the single existing mechanism.
//
// Each `track()` call pushes `{ event, ...params }`. In GTM, a "Custom Event"
// trigger on the event name fires a GA4 Event tag of the same name, so the
// conversion events (sign_up, begin_checkout, purchase) land in GA4 verbatim.
//
// Brand/authorship: Furiosa Studio.

type EventParams = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: EventParams[]
  }
}

export function track(event: string, params?: EventParams): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
}
