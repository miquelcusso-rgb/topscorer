'use client'
import { useState, useEffect } from 'react'

export default function AppDownloadBanner() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show only on mobile, only if not dismissed
    const isMobile = window.innerWidth < 768
    const wasDismissed = localStorage.getItem('app-banner-dismissed')
    if (isMobile && !wasDismissed) {
      setTimeout(() => setShow(true), 3000) // show after 3s
    }
  }, [])

  function dismiss() {
    setDismissed(true)
    setShow(false)
    localStorage.setItem('app-banner-dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-3"
      style={{
        background: '#0c0d18',
        borderTop: '1px solid #1a1b2e',
        boxShadow: '0 -8px 32px rgba(0,0,0,.4)',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(240,192,64,.2)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-ball.png" alt="TopScorers" width={40} height={40} />
      </div>
      <div className="flex-1">
        <div style={{ fontSize: 13, fontWeight: 600, color: '#eef4ff' }}>TopScorers App</div>
        <div style={{ fontSize: 11, color: '#52526e' }}>Próximamente en Google Play</div>
      </div>
      <a
        href="https://play.google.com/store/apps/details?id=com.topscorers.app"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '6px 14px',
          background: '#f0c040',
          color: '#060d18',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          textDecoration: 'none',
          flexShrink: 0,
        }}
        onClick={dismiss}
      >
        Ver
      </a>
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', color: '#52526e', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  )
}
