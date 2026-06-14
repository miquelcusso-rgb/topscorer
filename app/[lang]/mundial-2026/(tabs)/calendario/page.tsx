import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import CalendarPanel from '../../_panels/CalendarPanel'

// Fixtures/times shift around the draw + live results → revalidate hourly.
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/mundial-2026/calendario'
  const title = lang === 'en'
    ? '2026 World Cup Calendar: All matches, dates & kick-off times'
    : 'Calendario del Mundial 2026: Todos los partidos, fechas y horarios'
  const description = lang === 'en'
    ? 'Full 2026 World Cup match calendar: every fixture, date and kick-off time (your local time), from the June 11 opener to the July 19 final, plus all tournament phases.'
    : 'Calendario completo del Mundial 2026: todos los partidos, fechas y horarios (tu hora local), del partido inaugural del 11 de junio a la final del 19 de julio, con todas las fases.'
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
    keywords: ['calendario mundial 2026', 'world cup 2026 calendar', 'world cup 2026 schedule', 'partidos mundial 2026', 'fixtures world cup 2026', 'horarios mundial 2026'],
  }
}

export default async function CalendarioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Calendar' : 'Calendario', item: `https://www.top-scorers.com/${lang}/mundial-2026/calendario` },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <CalendarPanel />
    </>
  )
}
