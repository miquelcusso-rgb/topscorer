import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import DisciplinePanel from '../../_panels/DisciplinePanel'

export const revalidate = 86400 // torneo acabado (19-jul-2026): archivo, 24h de sobra

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/disciplina'
  const title = lang === 'en'
    ? '2026 World Cup Discipline: Most-booked players (cards)'
    : 'Disciplina del Mundial 2026: Jugadores con más tarjetas'
  const description = lang === 'en'
    ? 'Most-booked players at the 2026 World Cup: yellow and red cards ranking, updated live. Accumulated yellows lead to a suspension.'
    : 'Jugadores con más tarjetas del Mundial 2026: ranking de amarillas y rojas, actualizado en directo. La acumulación de amarillas conlleva sanción.'
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
    keywords: ['disciplina mundial 2026', 'world cup 2026 cards', 'tarjetas mundial 2026', 'world cup 2026 discipline', 'sanciones mundial 2026'],
  }
}

export default async function DisciplinaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Discipline' : 'Disciplina', item: `https://www.top-scorers.com/${lang}/mundial-2026/disciplina` },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <DisciplinePanel />
    </>
  )
}
