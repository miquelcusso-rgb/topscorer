import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResultadosClient from './ResultadosClient'

export const metadata: Metadata = {
  title: 'Resultados y Clasificaciones — TopScorers',
  description: 'Clasificaciones y últimos resultados de La Liga, Premier League, Bundesliga, Serie A, Ligue 1 y más ligas europeas. Actualizado cada hora.',
  openGraph: {
    title: 'Resultados y Clasificaciones — TopScorers',
    description: 'Clasificaciones y últimos resultados de las principales ligas europeas.',
    url: 'https://www.top-scorers.com/resultados',
    siteName: 'TopScorers',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: { canonical: 'https://www.top-scorers.com/resultados' },
}

export default function ResultadosPage() {
  return (
    <Suspense fallback={<ResultadosSkeleton />}>
      <ResultadosClient />
    </Suspense>
  )
}

function ResultadosSkeleton() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0c1a' }}>
      <div
        className="w-full"
        style={{ background: 'linear-gradient(180deg,#07081a,#050610)', borderBottom: '1px solid #151626' }}
      >
        <div className="max-w-[1100px] mx-auto px-5 py-8">
          <div className="h-5 w-40 rounded" style={{ background: '#151626' }} />
          <div className="h-8 w-72 rounded mt-3" style={{ background: '#151626' }} />
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-5 py-8 space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded" style={{ background: '#0e0f1e', border: '1px solid #151626' }} />
        ))}
      </div>
    </main>
  )
}
