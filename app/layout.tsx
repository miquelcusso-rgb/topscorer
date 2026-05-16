import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'TopScorer — Estadísticas Fútbol Europeo',
  description: 'Top goleadores y asistentes de las principales ligas europeas. Temporadas 24/25 y 25/26.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TopScorer',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f0c040',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" className="h-full">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full">
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
