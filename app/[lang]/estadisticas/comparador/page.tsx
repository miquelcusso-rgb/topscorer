import { Suspense } from 'react'
import type { Metadata } from 'next'
import { isLocale, type Lang } from '@/lib/i18n'
import { resolvePlayerProfile } from '@/lib/resolve-player'
import ComparadorClient from './ComparadorClient'
import SaasShell from '@/components/saas/SaasShell'

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

// Best-effort player name for a comparador slug (?a=/?b=). Never throws so a bad
// slug just degrades the title/OG card instead of breaking metadata rendering.
async function nameForSlug(slug?: string): Promise<string | undefined> {
  if (!slug) return undefined
  try {
    return (await resolvePlayerProfile(slug))?.base.name
  } catch {
    return undefined
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const sp = await searchParams
  const path = '/estadisticas/comparador'
  const en = lang === 'en'

  const slugA = first(sp.a) ?? first(sp.p1)
  const slugB = first(sp.b) ?? first(sp.p2)
  const [nameA, nameB] = await Promise.all([nameForSlug(slugA), nameForSlug(slugB)])

  const baseTitle = en ? 'Player Comparator | TopScorers' : 'Comparador de Jugadores | TopScorers'
  const title = nameA && nameB ? `${nameA} vs ${nameB} — TopScorers` : baseTitle
  const description =
    nameA && nameB
      ? en
        ? `${nameA} vs ${nameB}: goals, assists and head-to-head stats. Compare both players on TopScorers.`
        : `${nameA} vs ${nameB}: goles, asistencias y comparación cara a cara. Compara ambos jugadores en TopScorers.`
      : en
        ? 'Compare stats and attribute profiles of players from Europe’s top leagues.'
        : 'Compara estadísticas y perfiles de atributos de jugadores de las principales ligas europeas.'

  // Dynamic OG image carrying the same a/b slugs (+ lang) the page uses.
  const ogParams = new URLSearchParams()
  if (slugA) ogParams.set('a', slugA)
  if (slugB) ogParams.set('b', slugB)
  ogParams.set('lang', lang)
  const ogImage = `/api/og/comparador?${ogParams.toString()}`

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: en ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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
