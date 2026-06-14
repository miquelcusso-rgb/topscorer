import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import GroupsPanel from '../../_panels/GroupsPanel'

// Groups update live during the tournament → revalidate hourly.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/grupos'
  const title = lang === 'en'
    ? '2026 World Cup Groups: Standings of all 12 groups'
    : 'Grupos del Mundial 2026: Clasificación de los 12 grupos'
  const description = lang === 'en'
    ? 'All 12 groups of the 2026 World Cup with live standings: teams, points and ranking of the 48 nations across the USA, Canada and Mexico.'
    : 'Los 12 grupos del Mundial 2026 con la clasificación en directo: equipos, puntos y posiciones de las 48 selecciones en USA, Canadá y México.'
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
    keywords: ['grupos mundial 2026', 'world cup 2026 groups', 'clasificación mundial 2026', 'world cup 2026 standings', 'sorteo mundial 2026'],
  }
}

export default async function GruposPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Groups' : 'Grupos', item: `https://www.top-scorers.com/${lang}/mundial-2026/grupos` },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <GroupsPanel />
    </>
  )
}
