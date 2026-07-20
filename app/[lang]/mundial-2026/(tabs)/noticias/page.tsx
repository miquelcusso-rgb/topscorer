import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import NewsPanel from '../../_panels/NewsPanel'

export const revalidate = 86400 // torneo acabado (19-jul-2026): archivo, 24h de sobra

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/noticias'
  const title = lang === 'en'
    ? '2026 World Cup News: Latest headlines'
    : 'Noticias del Mundial 2026: Últimos titulares'
  const description = lang === 'en'
    ? 'Latest 2026 World Cup news: headlines and updates on teams, players, squads and matches from across the tournament, refreshed throughout the day.'
    : 'Últimas noticias del Mundial 2026: titulares y actualizaciones sobre selecciones, jugadores, convocatorias y partidos del torneo, actualizadas a lo largo del día.'
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
    keywords: ['noticias mundial 2026', 'world cup 2026 news', 'última hora mundial 2026', 'world cup 2026 latest', 'actualidad mundial 2026'],
  }
}

export default async function NoticiasPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'News' : 'Noticias', item: `https://www.top-scorers.com/${lang}/mundial-2026/noticias` },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <NewsPanel />
    </>
  )
}
