'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#060d18',
          color: '#eef4ff',
          fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
          padding: '24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#f0c040',
            }}
          >
            TopScorers
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '16px 0 8px' }}>
            Algo ha fallado
          </h1>
          <p style={{ color: '#9aa3b8', fontSize: '15px', lineHeight: 1.5, margin: '0 0 24px' }}>
            Se ha producido un error inesperado. Hemos sido notificados y estamos
            trabajando en ello. Inténtalo de nuevo.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '10px 22px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: '#f0c040',
              color: '#060d18',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
