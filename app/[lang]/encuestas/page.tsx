import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import EncuestasClient from './EncuestasClient'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const es = lang === 'es'
  const title = es ? 'Encuestas — Comunidad TopScorers' : 'Polls — TopScorers community'
  const description = es
    ? 'Vota cada semana en encuestas sobre Balón de Oro, Pichichi, Champions y más. Suma puntos para tu badge de comunidad.'
    : 'Vote each week on Ballon d’Or, Golden Boot, Champions and more polls. Earn points towards your community badge.'
  return {
    title, description,
    alternates: {
      canonical: `${BASE}/${lang}/encuestas`,
      languages: {
        es: `${BASE}/es/encuestas`,
        en: `${BASE}/en/encuestas`,
        'x-default': `${BASE}/es/encuestas`,
      },
    },
    openGraph: {
      title, description,
      url: `${BASE}/${lang}/encuestas`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default function EncuestasPage() {
  return <EncuestasClient />
}
