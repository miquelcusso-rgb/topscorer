'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Recovery for users still controlled by the OLD service worker (the one
    // whose aggressive cache-first served stale /_next/static chunks → runtime
    // "X is not a function" version-skew errors). When the NEW worker takes
    // control, reload ONCE so the page drops any mismatched cached chunks.
    // Guarded so it only fires when an old worker was already controlling
    // (never on a first-ever install, and never in a loop).
    const hadController = !!navigator.serviceWorker.controller
    let reloaded = false
    const onControllerChange = () => {
      if (reloaded || !hadController) return
      reloaded = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    navigator.serviceWorker.register('/sw.js')
      .then(reg => { reg.update().catch(() => {}) }) // proactively pull the new SW
      .catch(() => {})

    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
  }, [])
  return null
}
