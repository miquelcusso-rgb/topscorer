import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import VenuesPanel from '../../_panels/VenuesPanel'
import { VENUES } from '../../_panels/shared'

// Static venue data → revalidate daily is plenty.
export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/sedes'
  const title = lang === 'en'
    ? '2026 World Cup Venues: All 16 host stadiums & cities'
    : 'Sedes del Mundial 2026: Los 16 estadios y ciudades anfitrionas'
  const description = lang === 'en'
    ? 'All 16 venues of the 2026 World Cup: host stadiums and cities across the USA (11), Mexico (3) and Canada (2), with capacities and the MetLife final venue.'
    : 'Las 16 sedes del Mundial 2026: estadios y ciudades anfitrionas en USA (11), México (3) y Canadá (2), con sus capacidades y la sede de la final (MetLife).'
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
    keywords: ['sedes mundial 2026', 'world cup 2026 venues', 'estadios mundial 2026', 'world cup 2026 stadiums', 'ciudades mundial 2026'],
  }
}

export default async function SedesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en' ? '2026 World Cup venues' : 'Sedes del Mundial 2026',
    description: lang === 'en'
      ? 'The 16 host stadiums of the 2026 FIFA World Cup across the USA, Mexico and Canada.'
      : 'Los 16 estadios anfitriones del Mundial 2026 en USA, México y Canadá.',
    url: `https://www.top-scorers.com/${lang}/mundial-2026/sedes`,
    numberOfItems: VENUES.length,
    itemListElement: VENUES.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'StadiumOrArena',
        name: v.stadium,
        address: { '@type': 'PostalAddress', addressLocality: v.city, addressCountry: v.country },
        maximumAttendeeCapacity: Number(v.capacity.replace(/,/g, '')) || undefined,
      },
    })),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Venues' : 'Sedes', item: `https://www.top-scorers.com/${lang}/mundial-2026/sedes` },
    ],
  }
  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  return (
    <>
      {ld(breadcrumbJsonLd)}
      {ld(itemListJsonLd)}
      <VenuesPanel />
    </>
  )
}
