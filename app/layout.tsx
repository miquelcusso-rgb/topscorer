import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TopScorer — Estadísticas Fútbol Europeo',
  description: 'Top 25 goleadores y asistentes de las principales ligas europeas. Temporadas 23/24, 24/25 y 25/26.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
