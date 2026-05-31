import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import Mundial2026Client from './Mundial2026Client'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026'
  return {
    title: 'Mundial 2026 — Grupos, Resultados y Goleadores | TopScorers',
    description: 'Sigue el FIFA World Cup 2026 en tiempo real. Grupos, resultados, clasificaciones y top goleadores del Mundial 2026 en USA, Canadá y México.',
    openGraph: {
      title: 'Mundial 2026 — Grupos, Resultados y Goleadores | TopScorers',
      description: 'Sigue el FIFA World Cup 2026 en tiempo real. 48 selecciones, 3 sedes, 1 trofeo.',
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
    keywords: ['mundial 2026', 'world cup 2026', 'FIFA 2026', 'goleadores mundial', 'grupos mundial 2026'],
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: 'FIFA World Cup 2026',
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  location: [
    { '@type': 'Place', name: 'MetLife Stadium', address: { '@type': 'PostalAddress', addressCountry: 'US' } },
    { '@type': 'Place', name: 'Estadio Azteca', address: { '@type': 'PostalAddress', addressCountry: 'MX' } },
    { '@type': 'Place', name: 'BC Place', address: { '@type': 'PostalAddress', addressCountry: 'CA' } },
  ],
  organizer: { '@type': 'Organization', name: 'FIFA', url: 'https://www.fifa.com' },
  description: 'The 2026 FIFA World Cup is the 23rd edition of the tournament, hosted by the United States, Canada, and Mexico.',
  url: 'https://www.top-scorers.com/mundial-2026',
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Mundial 2026', item: 'https://www.top-scorers.com/mundial-2026' },
  ],
}

export default async function Mundial2026Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumb = lang === 'en' ? ['Competitions', 'World Cup 2026'] : ['Competiciones', 'Mundial 2026']
  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <Mundial2026Client />
    </SaasShell>
  )
}
