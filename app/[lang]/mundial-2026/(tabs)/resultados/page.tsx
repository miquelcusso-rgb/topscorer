import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import LiveDataPanel from '../../_panels/LiveDataPanel'

// Live scores → revalidate hourly (the panel itself client-fetches every load).
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/resultados'
  const title = lang === 'en'
    ? '2026 World Cup Results: Live scores & latest matches'
    : 'Resultados del Mundial 2026: Marcadores en directo y últimos partidos'
  const description = lang === 'en'
    ? 'Live 2026 World Cup results: latest match scores and tournament top scorers, updated throughout the competition across the USA, Canada and Mexico.'
    : 'Resultados del Mundial 2026 en directo: marcadores de los últimos partidos y goleadores del torneo, actualizados durante toda la competición en USA, Canadá y México.'
  return {
    title,
    description,
    openGraph: {
      title: `${title} | TopScorers`,
      description,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-mundial-${lang}.jpg`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    keywords: ['resultados mundial 2026', 'world cup 2026 results', 'marcadores mundial 2026', 'world cup 2026 scores', 'resultados en directo mundial'],
  }
}

export default async function ResultadosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Results' : 'Resultados', item: `https://www.top-scorers.com/${lang}/mundial-2026/resultados` },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <LiveDataPanel />
    </>
  )
}
