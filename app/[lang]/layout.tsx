import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LangProvider } from '@/contexts/LangContext'
import { LOCALES, isLocale, type Lang } from '@/lib/i18n'
import AddToHomeScreen from '@/components/AddToHomeScreen'
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'
import AppDownloadBanner from '@/components/AppDownloadBanner'
import { GTMScript, GTMNoScript } from '@/components/GoogleTagManager'
import '../globals.css'

export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const en = lang === 'en'
  const ogImage = en ? '/og-default-en.jpg' : '/og-default-es.jpg'
  const title = 'TopScorers — Estadísticas Fútbol Europeo'
  const ogDesc = 'Top goleadores y asistentes de las principales ligas europeas en tiempo real.'
  return {
    metadataBase: new URL('https://www.top-scorers.com'),
    title: {
      default: title,
      template: '%s | TopScorers',
    },
    description: 'Top goleadores, asistentes y centrocampistas de La Liga, Premier League, Bundesliga, Serie A y más. Estadísticas en tiempo real. Mundial 2026.',
    keywords: ['goleadores', 'asistentes', 'estadísticas fútbol', 'La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1', 'mundial 2026', 'top scorers', 'clasificación fútbol', 'resultados fútbol', 'fichajes', 'transferencias', 'champions league', 'europa league'],
    authors: [{ name: 'TopScorers', url: 'https://www.top-scorers.com' }],
    creator: 'TopScorers',
    publisher: 'TopScorers',
    // Search Console: verified via DNS domain property (sc-domain:top-scorers.com).
    openGraph: {
      type: 'website',
      locale: en ? 'en_US' : 'es_ES',
      url: `https://www.top-scorers.com/${en ? 'en' : 'es'}`,
      siteName: 'TopScorers',
      title,
      description: ogDesc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@furiosadata',
      creator: '@furiosadata',
      title,
      description: ogDesc,
      images: [ogImage],
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
}

export const viewport: Viewport = {
  themeColor: '#f0c040',
  width: 'device-width',
  initialScale: 1,
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Furiosa Studio',
  url: 'https://furiosadata.com',
  logo: 'https://www.top-scorers.com/logo.png',
  description: 'Estadísticas de fútbol europeo: goleadores, asistentes y ligas en tiempo real.',
  sameAs: [
    'https://www.top-scorers.com',
    'https://x.com/furiosadata',
    'https://furiosadata.com',
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
    name: 'Furiosa Studio',
    url: 'https://www.top-scorers.com',
    logo: 'https://www.top-scorers.com/logo.png',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const locale: Lang = lang
  const htmlLang = locale === 'en' ? 'en' : 'es'

  return (
    <ClerkProvider>
      <html lang={htmlLang} className="h-full">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* Perf: dropped Bebas Neue (unused per design handoff) and
              narrowed DM Sans + Barlow weights to those actually rendered.
              Net: ~70 KB less font payload + 1 less request. */}
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@500;700&display=swap"
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
          <LangProvider defaultLang={locale}>
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
