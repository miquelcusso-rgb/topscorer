import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import InjuriesPanel from '../../_panels/InjuriesPanel'

export const revalidate = 86400 // torneo acabado (19-jul-2026): archivo, 24h de sobra

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/bajas'
  const title = lang === 'en'
    ? '2026 World Cup Injuries: Injured & suspended players by team'
    : 'Bajas del Mundial 2026: Lesionados y sancionados por selección'
  const description = lang === 'en'
    ? 'Injured and suspended players at the 2026 World Cup, grouped by national team and updated live as call-ups and absences are confirmed during the tournament.'
    : 'Jugadores lesionados y sancionados del Mundial 2026, agrupados por selección y actualizados en directo según se confirman bajas y ausencias durante el torneo.'
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
    keywords: ['bajas mundial 2026', 'world cup 2026 injuries', 'lesionados mundial 2026', 'world cup 2026 injured players', 'sancionados mundial 2026'],
  }
}

export default async function BajasPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Injuries' : 'Bajas', item: `https://www.top-scorers.com/${lang}/mundial-2026/bajas` },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <InjuriesPanel />
    </>
  )
}
