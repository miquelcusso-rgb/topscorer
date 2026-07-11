'use client'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { canonicalClubName } from '@/lib/club-colors'
import { slugify } from '@/lib/slugify'

// Clickable breadcrumb trail above the page content. Breadcrumbs arrive as
// plain strings from every page, so hrefs are resolved centrally here: known
// section labels map to their route, and the middle crumb of a player fiche
// (['Jugadores', <club>, <name>]) links to the club's team page (canonical
// slug — team pages cover the whole league universe). Unresolvable parts render
// as plain text. Only client-safe tiny imports (no datasets). Author: Furiosa Studio.

const CRUMB_ROUTE: Record<string, string> = {
  'estadísticas': '/estadisticas', statistics: '/estadisticas',
  jugadores: '/jugadores', players: '/jugadores',
  equipos: '/competiciones', teams: '/competiciones',
  competiciones: '/competiciones', competitions: '/competiciones',
  noticias: '/noticias', news: '/noticias',
  'mundial 2026': '/mundial-2026', 'world cup 2026': '/mundial-2026',
  cuenta: '/cuenta', account: '/cuenta',
  scout: '/scout',
}

export default function Breadcrumbs({ parts }: { parts: string[] }) {
  const { lang } = useLang()
  if (!parts || parts.length < 2) return null

  const hrefFor = (part: string, i: number): string | undefined => {
    const key = part.trim().toLowerCase()
    if (CRUMB_ROUTE[key]) return `/${lang}${CRUMB_ROUTE[key]}`
    const first = (parts[0] ?? '').toLowerCase()
    if (i === 1 && (first === 'jugadores' || first === 'players')) {
      const s = slugify(canonicalClubName(part))
      if (s) return `/${lang}/equipo/${s}`
    }
    return undefined
  }

  return (
    <nav aria-label="breadcrumb" style={{ fontSize: 12.5, color: 'var(--ts-muted)', marginBottom: -8 }}>
      {parts.map((part, i) => {
        const last = i === parts.length - 1
        const href = last ? undefined : hrefFor(part, i)
        return (
          <span key={i}>
            {i > 0 && <span style={{ color: 'var(--ts-faint)', margin: '0 6px' }}>/</span>}
            {last ? (
              <strong style={{ color: 'var(--ts-text)', fontWeight: 600 }}>{part}</strong>
            ) : href ? (
              <Link href={href} style={{ color: 'inherit', textUnderlineOffset: 3 }}
                className="ts-crumb-link">{part}</Link>
            ) : (
              part
            )}
          </span>
        )
      })}
    </nav>
  )
}
