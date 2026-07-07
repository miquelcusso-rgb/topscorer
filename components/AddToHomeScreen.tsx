'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function AddToHomeScreen() {
  const [show, setShow] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed or installed as PWA
    let dismissed: string | null = null
    try { dismissed = localStorage.getItem('ts-a2hs-dismissed') } catch {}
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)

    if (dismissed || isStandalone) return

    // Only on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setIsIos(ios)

    // Audit móvil 8-jul: 4s tapaba la primera pantalla antes de que el usuario
    // llegara a interactuar (cubre ~180px sobre las filas). 9s deja explorar.
    const t = setTimeout(() => setShow(true), 9000)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setShow(false)
    try { localStorage.setItem('ts-a2hs-dismissed', '1') } catch {}
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] md:hidden"
      style={{
        background: 'rgba(10,9,8,.97)', // negro de marca (antes azulado #060a16 — paleta prohibida)
        borderTop: '1px solid rgba(240,192,64,.25)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 -8px 32px rgba(0,0,0,.5)',
        padding: '14px 18px 18px',
        paddingBottom: 'calc(18px + env(safe-area-inset-bottom))',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-4 cursor-pointer"
        style={{ fontSize: 18, color: '#8a7f68', lineHeight: 1 }}
        aria-label="Cerrar"
      >
        ×
      </button>

      {/* Content */}
      <div className="flex items-start gap-3">
        <div style={{
          width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
          border: '1.5px solid rgba(240,192,64,.3)',
          boxShadow: '0 0 12px rgba(240,192,64,.15)',
        }}>
          <Image src="/logo-ball.png" alt="TopScorers" width={44} height={44} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#f8f7f3', marginBottom: 3 }}>
            Añadir a pantalla inicio
          </p>
          <p style={{ fontSize: 11.5, color: '#9a917e', lineHeight: 1.5 }}>
            {isIos
              ? <>Pulsa <span style={{ color: '#f0c040' }}>Compartir</span> → <span style={{ color: '#f0c040' }}>&ldquo;Añadir a inicio&rdquo;</span> para acceso rápido</>
              : <>Pulsa el <span style={{ color: '#f0c040' }}>menú ⋮</span> → <span style={{ color: '#f0c040' }}>&ldquo;Añadir a pantalla inicio&rdquo;</span></>
            }
          </p>
        </div>
      </div>

      {/* Visual hint steps for iOS */}
      {isIos && (
        <div className="flex items-center gap-2 mt-3">
          {[
            { icon: '⬆', label: 'Compartir' },
            { icon: '→', label: '' },
            { icon: '＋', label: 'Añadir a inicio' },
          ].map((s, i) => (
            s.label ? (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <span style={{ color: '#3a4a62', fontSize: 10 }}>→</span>}
                <div style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(240,192,64,.1)', border: '1px solid rgba(240,192,64,.2)',
                  fontSize: 11, fontWeight: 600, color: '#f0c040',
                }}>
                  {s.icon} {s.label}
                </div>
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  )
}
