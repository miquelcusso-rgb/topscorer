import Link from 'next/link'
import type { Metadata } from 'next'
import { GTMScript, GTMNoScript } from '@/components/GoogleTagManager'

export const metadata: Metadata = {
  title: '404 — Page not found · TopScorers',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <html lang="es">
      <head><GTMScript /></head>
      <body style={{ margin: 0, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
    <GTMNoScript />
    <main
      style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0908',
        color: '#f8f7f3',
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        padding: '24px',
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
        <div
          style={{
            fontFamily: "'Barlow Condensed', 'DM Sans', sans-serif",
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            margin: '8px 0 4px',
            letterSpacing: '-0.02em',
            color: '#f0c040',
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '12px 0 8px' }}>
          Página no encontrada
        </h1>
        <p style={{ color: '#9aa3b8', fontSize: 15, lineHeight: 1.5, margin: '0 0 28px' }}>
          La página que buscas no existe o se ha movido. Vuelve a la portada
          para ver los goleadores en tiempo real.
        </p>
        <div style={{ display: 'inline-flex', gap: 12 }}>
          <Link
            href="/es"
            style={{
              border: 'none',
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 15,
              fontWeight: 600,
              backgroundColor: '#f0c040',
              color: '#0a0908',
              textDecoration: 'none',
            }}
          >
            Ir al inicio
          </Link>
          <Link
            href="/es/jugadores"
            style={{
              border: '1px solid rgba(255,255,255,.18)',
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 15,
              fontWeight: 600,
              color: '#f8f7f3',
              textDecoration: 'none',
            }}
          >
            Buscar jugador
          </Link>
        </div>
      </div>
    </main>
      </body>
    </html>
  )
}
