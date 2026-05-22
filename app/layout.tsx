import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LangProvider } from '@/contexts/LangContext'
import type { Lang } from '@/lib/i18n'
import AddToHomeScreen from '@/components/AddToHomeScreen'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'
import AppDownloadBanner from '@/components/AppDownloadBanner'
import { GTMScript, GTMNoScript } from '@/components/GoogleTagManager'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.top-scorers.com'),
  title: {
    default: 'TopScorers — Estadísticas Fútbol Europeo',
    template: '%s | TopScorers',
  },
  description: 'Top goleadores, asistentes y centrocampistas de La Liga, Premier League, Bundesliga, Serie A y más. Estadísticas en tiempo real. Mundial 2026.',
  keywords: ['goleadores', 'asistentes', 'estadísticas fútbol', 'La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1', 'mundial 2026', 'top scorers', 'clasificación fútbol', 'resultados fútbol', 'fichajes', 'transferencias', 'champions league', 'europa league'],
  authors: [{ name: 'TopScorers', url: 'https://www.top-scorers.com' }],
  creator: 'TopScorers',
  publisher: 'TopScorers',
  // TODO: paste Search Console token here before launch
  // verification: { google: 'YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN' },
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TopScorers',
  url: 'https://www.top-scorers.com',
  logo: 'https://www.top-scorers.com/logo.png',
  description: 'Estadísticas de fútbol europeo: goleadores, asistentes y ligas en tiempo real.',
  sameAs: [
    'https://www.top-scorers.com',
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TopScorers',
  url: 'https://www.top-scorers.com',
  description: 'Estadísticas de fútbol europeo: goleadores, asistentes y ligas en tiempo real.',
  inLanguage: 'es-ES',
  publisher: {
    '@type': 'Organization',
    name: 'TopScorers',
    url: 'https://www.top-scorers.com',
    logo: 'https://www.top-scorers.com/logo.png',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const detectedLang = (cookieStore.get('ts-lang')?.value ?? 'es') as Lang

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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c') }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c') }}
          />
          <GTMScript />
        </head>
        <body className="min-h-full">
          <GTMNoScript />
          <LangProvider defaultLang={detectedLang}>
            <ThemeProvider>
              <Navbar />
              {children}
              <Footer />
              <AddToHomeScreen />
            </ThemeProvider>
          </LangProvider>
          <ServiceWorkerRegistrar />
          <AppDownloadBanner />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}
