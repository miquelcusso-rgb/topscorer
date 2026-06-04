import type { Metadata } from 'next'
import { Suspense } from 'react'
import { isLocale, type Lang } from '@/lib/i18n'
import ResultadosClient from './ResultadosClient'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/resultados'
  return {
    title: 'Resultados y Clasificaciones — TopScorers',
    description: 'Clasificaciones y últimos resultados de La Liga, Premier League, Bundesliga, Serie A, Ligue 1 y más ligas europeas. Actualizado cada hora.',
    openGraph: {
      title: 'Resultados y Clasificaciones — TopScorers',
      description: 'Clasificaciones y últimos resultados de las principales ligas europeas.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
  }
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Resultados', item: 'https://www.top-scorers.com/resultados' },
  ],
}

export default async function ResultadosPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const breadcrumb = lang === 'en' ? ['Results'] : ['Resultados']
  return (
    <SaasShell activeKey="results" breadcrumb={breadcrumb}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <Suspense fallback={<ResultadosSkeleton />}>
        <ResultadosClient />
      </Suspense>
    </SaasShell>
  )
}

function ResultadosSkeleton() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0c1a' }}>
      <div
        className="w-full"
        style={{ background: 'linear-gradient(180deg,#0a0908,#0a0908)', borderBottom: '1px solid #2a2620' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 py-8">
          <div className="h-5 w-40 rounded" style={{ background: '#2a2620' }} />
          <div className="h-8 w-72 rounded mt-3" style={{ background: '#2a2620' }} />
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-5 py-8 space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded" style={{ background: '#15130f', border: '1px solid #2a2620' }} />
        ))}
      </div>
    </main>
  )
}
