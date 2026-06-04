import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page not found · TopScorers',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
}

// Next 16 limitation: not-found.tsx inside a dynamic segment cannot read params.
// We fall back to Spanish strings + a links bar with both /es and /en, so the
// page stays useful regardless of the active locale when the route 404s.
export default function NotFoundLang() {
  return (
    <main
      style={{
        margin: 0,
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
        color: '#f8f7f3',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div
          style={{
            fontFamily: "'Barlow Condensed', 'DM Sans', sans-serif",
            fontSize: 120,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#f0c040',
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '12px 0 8px' }}>
          Página no encontrada · Page not found
        </h1>
        <p style={{ color: '#9aa3b8', fontSize: 15, lineHeight: 1.5, margin: '0 0 28px' }}>
          Esta URL no existe en TopScorers. Vuelve a la portada o busca un
          jugador. / This URL doesn&apos;t exist on TopScorers. Head back home
          or search a player.
        </p>
        <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/es"
            style={{
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: '#f0c040',
              color: '#0a0908',
              textDecoration: 'none',
            }}
          >
            Inicio (ES)
          </Link>
          <Link
            href="/en"
            style={{
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,.18)',
              color: '#f8f7f3',
              textDecoration: 'none',
            }}
          >
            Home (EN)
          </Link>
          <Link
            href="/es/jugadores"
            style={{
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,.18)',
              color: '#f8f7f3',
              textDecoration: 'none',
            }}
          >
            Buscar jugador
          </Link>
        </div>
      </div>
    </main>
  )
}
