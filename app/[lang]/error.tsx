'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function LangError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        color: '#f8f7f3',
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#f0c040',
          }}
        >
          TopScorers
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '12px 0 8px' }}>
          Algo ha fallado
        </h1>
        <p style={{ color: '#9aa3b8', fontSize: 15, lineHeight: 1.5, margin: '0 0 24px' }}>
          Error inesperado en esta sección. Lo hemos registrado y estamos en
          ello. Inténtalo de nuevo.
        </p>
        <button
          onClick={() => reset()}
          style={{
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: '#f0c040',
            color: '#0a0908',
          }}
        >
          Reintentar
        </button>
      </div>
    </main>
  )
}
