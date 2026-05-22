import { Suspense } from 'react'
import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import ComparadorClient from './ComparadorClient'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/estadisticas/comparador'
  return {
    title: 'Comparador de Jugadores | TopScorers',
    description: 'Compara estadísticas y perfiles de atributos de jugadores de las principales ligas europeas.',
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

export default function ComparadorPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#5a5a7a', fontSize: 14 }}>Cargando comparador…</span>
      </div>
    }>
      <ComparadorClient />
    </Suspense>
  )
}
