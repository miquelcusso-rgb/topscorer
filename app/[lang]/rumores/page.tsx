import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import RumoresClient from './RumoresClient'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const es = lang === 'es'
  const title = es ? 'Rumores de fichajes — Mercado en vivo | TopScorers' : 'Transfer rumours — Live market | TopScorers'
  const description = es
    ? 'Rumores, acuerdos y traspasos confirmados en las grandes ligas europeas. Probabilidad por operación + comentarios de la comunidad.'
    : 'Rumours, agreed deals and confirmed transfers across Europe’s top leagues. Likelihood % + community discussion.'
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${lang}/rumores`,
      languages: {
        es: `${BASE}/es/rumores`,
        en: `${BASE}/en/rumores`,
        'x-default': `${BASE}/es/rumores`,
      },
    },
    openGraph: {
      title, description,
      url: `${BASE}/${lang}/rumores`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function RumoresPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/${lang}` },
      { '@type': 'ListItem', position: 2, name: 'Rumores', item: `${BASE}/${lang}/rumores` },
    ],
  }

  const breadcrumb = lang === 'en' ? ['Transfers', 'Rumours'] : ['Transferencias', 'Rumores']

  return (
    <SaasShell activeKey="transfers" breadcrumb={breadcrumb}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <RumoresClient />
    </SaasShell>
  )
}
