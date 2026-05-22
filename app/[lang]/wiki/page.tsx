import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import WikiClient from './WikiClient'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const l = isLocale(lang) ? lang : 'es'
  const es = l === 'es'
  const title = es ? 'Wiki — Cómo funciona TopScorers | Métricas y sellos' : 'Wiki — How TopScorers works | Metrics & seals'
  const description = es
    ? 'Centro de ayuda de TopScorers: glosario de métricas (G/90, A/90, ELO), el sistema de sellos (Élite, Promesa, Joya oculta), ligas cubiertas y planes.'
    : 'TopScorers help center: metrics glossary (G/90, A/90, ELO), the seal system (Elite, Prospect, Hidden gem), covered leagues and plans.'
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${l}/wiki`,
      languages: {
        es: `${BASE}/es/wiki`,
        en: `${BASE}/en/wiki`,
        'x-default': `${BASE}/es/wiki`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE}/${l}/wiki`,
      siteName: 'TopScorers',
      locale: es ? 'es_ES' : 'en_US',
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function WikiPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const l = isLocale(lang) ? lang : 'es'

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/${l}` },
      { '@type': 'ListItem', position: 2, name: 'Wiki', item: `${BASE}/${l}/wiki` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <WikiClient />
    </>
  )
}
