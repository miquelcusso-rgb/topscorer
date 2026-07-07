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
import ConsentBanner from '@/components/ConsentBanner'
import ChromeWrapper from '@/components/ChromeWrapper'
import { GTMScript, GTMNoScript } from '@/components/GoogleTagManager'
import { ADSENSE_CLIENT } from '@/lib/adsense'
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
  // Sensación nativa: el contenido llega a los bordes físicos (notch/home
  // indicator); los sticky compensan con env(safe-area-inset-*) (MobileTopbar).
  viewportFit: 'cover',
}

// Single site-wide @graph: Organization + WebSite linked by @id. The WebSite
// node carries the SearchAction (sitelinks searchbox). This is the ONLY place
// these two nodes are emitted — the home page must not duplicate the WebSite
// node (it only adds its page-specific FAQPage).
const siteGraphJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.top-scorers.com/#organization',
      name: 'Furiosa Studio',
      url: 'https://furiosadata.com',
      logo: 'https://www.top-scorers.com/logo.png',
      description: 'Estadísticas de fútbol europeo: goleadores, asistentes y ligas en tiempo real.',
      sameAs: [
        'https://www.top-scorers.com',
        'https://x.com/furiosadata',
        'https://furiosadata.com',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.top-scorers.com/#website',
      name: 'TopScorers',
      url: 'https://www.top-scorers.com',
      description: 'Estadísticas de fútbol europeo: goleadores, asistentes y ligas en tiempo real.',
      inLanguage: 'es-ES',
      publisher: { '@id': 'https://www.top-scorers.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.top-scorers.com/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
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
      <html lang={htmlLang} className="h-full" suppressHydrationWarning>
        <head>
          {/* Anti-flash: set data-theme BEFORE first paint from the persisted
              choice (localStorage) or OS preference, so SSG pages don't flash
              the default dark theme on refresh for light-mode users. */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('ts-theme');if(t!=='light'&&t!=='dark'){t='light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})()`,
            }}
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* Perf: dropped Bebas Neue (unused per design handoff) and
              narrowed DM Sans + Barlow weights to those actually rendered.
              Net: ~70 KB less font payload + 1 less request. */}
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@500;700&display=swap"
            rel="stylesheet"
          />
          {/* Google Consent Mode v2 — defaults DENIED until the user accepts in
              the cookie banner. Must run BEFORE AdSense/GTM load. Restores a
              previously stored choice so returning visitors aren't re-prompted. */}
          <script
            id="consent-mode-init"
            dangerouslySetInnerHTML={{ __html: `
              window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
              gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
              try{if(localStorage.getItem('ts-consent')==='granted'){gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});}}catch(e){}
            ` }}
          />
          {/* AdSense loader — env-gated. Only emitted when
              NEXT_PUBLIC_ADSENSE_CLIENT is set; otherwise no script loads at all
              and every AdSlot renders nothing (fully dormant until approved). */}
          {ADSENSE_CLIENT && (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
              crossOrigin="anonymous"
            />
          )}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraphJsonLd).replace(/</g, '\\u003c') }}
          />
          <GTMScript />
        </head>
        <body className="min-h-full">
          <GTMNoScript />
          <LangProvider defaultLang={locale}>
            <ThemeProvider>
              <ChromeWrapper navbar={<Navbar />} footer={<Footer />}>
                {children}
              </ChromeWrapper>
              <AddToHomeScreen />
            </ThemeProvider>
          </LangProvider>
          <ServiceWorkerRegistrar />
          <ConsentBanner />
          <AppDownloadBanner />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}
