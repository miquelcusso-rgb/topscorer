import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import CalendarPanel from '../../_panels/CalendarPanel'
import { getAllFixtures, type ApiFixture } from '@/lib/api-football'

// Fixtures/times shift around the draw + live results → revalidate hourly. The
// data is server-rendered + ISR (NOT per-request); the panel keeps the seed.
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

  // Server-seed so the fixtures land in the initial HTML (SEO) — no "Cargando".
  // Defensive: any error → [] (the panel client-fetches too).
  let fixtures: ApiFixture[] = []
  try { fixtures = await getAllFixtures(1, 2026) } catch { fixtures = [] }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: lang === 'en' ? 'Calendar' : 'Calendario', item: `https://www.top-scorers.com/${lang}/mundial-2026/calendario` },
    ],
  }

  // ItemList of the next fixtures (chronological) so the schedule is citable for
  // GEO and lands in the initial HTML alongside the visible calendar.
  const upcoming = [...fixtures]
    .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
    .slice(0, 20)
  const itemListJsonLd = upcoming.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en' ? '2026 World Cup match calendar' : 'Calendario del Mundial 2026',
    description: lang === 'en'
      ? 'The 2026 FIFA World Cup fixtures with dates and kick-off times.'
      : 'Los partidos del Mundial 2026 con fechas y horarios.',
    url: `https://www.top-scorers.com/${lang}/mundial-2026/calendario`,
    numberOfItems: upcoming.length,
    itemListElement: upcoming.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${f.teams.home.name} vs ${f.teams.away.name} — ${f.fixture.date}`,
    })),
  } : null

  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  return (
    <>
      {ld(breadcrumbJsonLd)}
      {itemListJsonLd && ld(itemListJsonLd)}
      <CalendarPanel initial={fixtures} />
    </>
  )
}
