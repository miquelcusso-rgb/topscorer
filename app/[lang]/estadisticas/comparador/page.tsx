import { Suspense } from 'react'
import type { Metadata } from 'next'
import { isLocale, type Lang } from '@/lib/i18n'
import ComparadorClient from './ComparadorClient'
import SaasShell from '@/components/saas/SaasShell'

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

export default async function ComparadorPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const breadcrumb = lang === 'en' ? ['Statistics', 'Comparator'] : ['Estadísticas', 'Comparador']
  return (
    <SaasShell activeKey="compare" breadcrumb={breadcrumb}>
      <Suspense fallback={
        <div style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ color: 'var(--ts-muted)', fontSize: 14 }}>Cargando comparador…</span>
        </div>
      }>
        <ComparadorClient />
      </Suspense>
    </SaasShell>
  )
}
