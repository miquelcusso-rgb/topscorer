import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.top-scorers.com'),
  title: {
    default: 'TopScorers — Estadísticas Fútbol Europeo',
    template: '%s | TopScorers',
  },
  description: 'Top goleadores, asistentes y centrocampistas de La Liga, Premier League, Bundesliga, Serie A y más. Estadísticas en tiempo real. Mundial 2026.',
  keywords: ['goleadores', 'asistentes', 'estadísticas fútbol', 'La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1', 'mundial 2026', 'top scorers'],
  authors: [{ name: 'TopScorers', url: 'https://www.top-scorers.com' }],
  creator: 'TopScorers',
  publisher: 'TopScorers',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.top-scorers.com',
    siteName: 'TopScorers',
    title: 'TopScorers — Estadísticas Fútbol Europeo',
    description: 'Top goleadores y asistentes de las principales ligas europeas en tiempo real.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'TopScorers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TopScorers — Estadísticas Fútbol Europeo',
    description: 'Top goleadores y asistentes de las principales ligas europeas en tiempo real.',
    images: ['/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TopScorers',
  },
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: '/logo.png',
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
            href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
            rel="stylesheet"
          />
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6498215334315959"
            crossOrigin="anonymous"
          />
        </head>
        <body className="min-h-full">
          <Navbar />
          {children}
          <Footer />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}
