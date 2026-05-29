import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import CuentaClient from './CuentaClient'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const es = lang === 'es'
  const title = es ? 'Mi cuenta — TopScorers' : 'My account — TopScorers'
  return {
    title,
    description: es ? 'Tu progreso, badge, watchlist, comparaciones guardadas, predicciones y plan.' : 'Your progress, badge, watchlist, saved comparisons, picks and plan.',
    robots: { index: false, follow: false }, // private page
    alternates: { canonical: `${BASE}/${lang}/cuenta` },
  }
}

export default function CuentaPage() {
  return <CuentaClient />
}
