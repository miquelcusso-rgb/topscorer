import { Suspense } from 'react'
import type { Metadata } from 'next'
import ComparadorClient from './ComparadorClient'

export const metadata: Metadata = {
  title: 'Comparador de Jugadores | TopScorers',
  description: 'Compara estadísticas y perfiles de atributos de jugadores de las principales ligas europeas.',
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
