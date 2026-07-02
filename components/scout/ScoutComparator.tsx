'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { IIG_NAME } from '@/lib/iig'
import type { Plan } from '@/types'

export interface ScoutRow {
  name: string; slug: string; club: string; league: string; coef: number
  goles: number; asist: number; rating: number | null
  finishing: number; quality: number; creation: number; iig: number
  photo: string | null; flag: string | null
}

const card: React.CSSProperties = { background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 18 }

export default function ScoutComparator({ lang, board, leagues }: { lang: 'es' | 'en'; board: ScoutRow[]; leagues: string[] }) {
  const en = lang === 'en'
  const { user, isLoaded } = useUser()
  const plan: Plan = (isLoaded && user ? ((user.publicMetadata?.plan as Plan) || 'free') : 'free')
  const isScout = plan === 'scout'
  const [league, setLeague] = useState<string>('')

  // ── Locked teaser for non-Scout ────────────────────────────────────────────
  if (!isScout) {
    return (
      <div style={{ ...card, maxWidth: 560 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 8 }}>
          Scout · {en ? 'Cross-league IIG comparator' : 'Comparador IIG multi-liga'}
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 700, lineHeight: 1.05, margin: '0 0 10px', color: 'var(--ts-text)' }}>
          {en ? 'Compare players across leagues, fairly' : 'Compara jugadores entre ligas, con justicia'}
        </h1>
        <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.55, color: 'var(--ts-muted)' }}>
          {en
            ? `The ${IIG_NAME.en} weights goals by how hard each league is, so a striker in a tougher league isn’t undersold. Scout unlocks the full cross-league board with every component (finishing, quality, creation) and the league coefficient broken out.`
            : `El ${IIG_NAME.es} pondera los goles por la dificultad de cada liga, para que un delantero de una liga más dura no quede infravalorado. Scout desbloquea el tablero completo entre ligas con cada componente (finalización, calidad, creación) y el coeficiente de liga desglosado.`}
        </p>
        <Link href={`/${lang}/pricing`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '10px 18px', borderRadius: 999, background: 'var(--ts-primary)', color: '#1a1a1a', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          {en ? 'Unlock Scout — €5.99/mo' : 'Desbloquear Scout — €5,99/mes'} →
        </Link>
      </div>
    )
  }

  // ── Scout: the comparator ───────────────────────────────────────────────────
  const rows = league ? board.filter(r => r.league === league) : board
  const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'right', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ts-muted)', whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { padding: '8px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13, color: 'var(--ts-text)' }

  return (
    <section style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--ts-text)' }}>
          {en ? 'Cross-league IIG comparator' : 'Comparador IIG multi-liga'}
        </h1>
        <select value={league} onChange={e => setLeague(e.target.value)} aria-label={en ? 'Filter by league' : 'Filtrar por liga'}
          style={{ marginLeft: 'auto', minHeight: 40, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--ts-border)', background: 'var(--ts-card2)', color: 'var(--ts-text)', fontSize: 13, fontWeight: 600 }}>
          <option value="">{en ? 'All leagues' : 'Todas las ligas'}</option>
          {leagues.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--ts-muted)', lineHeight: 1.5 }}>
        {en
          ? 'IIG = finishing (goals × league coef) + quality ((match rating − 6) × 3) + creation (assists × 0.5). “Rating” is the average per-match rating (0-10, API-Football scale); the coefficient is what makes the cross-league comparison fair.'
          : 'IIG = finalización (goles × coef. liga) + calidad ((valoración − 6) × 3) + creación (asistencias × 0,5). La «valoración» es la nota media por partido (0-10, escala de API-Football); el coeficiente es lo que hace justa la comparación entre ligas.'}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
              <th style={{ ...th, textAlign: 'left' }}>#</th>
              <th style={{ ...th, textAlign: 'left' }}>{en ? 'Player' : 'Jugador'}</th>
              <th style={{ ...th, textAlign: 'left' }}>{en ? 'League' : 'Liga'}</th>
              <th style={th}>{en ? 'Coef' : 'Coef'}</th>
              <th style={th}>{en ? 'Finish' : 'Final.'}</th>
              <th style={th}>{en ? 'Quality' : 'Calidad'}</th>
              <th style={th}>{en ? 'Creation' : 'Creac.'}</th>
              <th style={{ ...th, color: 'var(--ts-primary)' }}>IIG</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.slug + i} style={{ borderBottom: '1px solid var(--ts-hairline)' }}>
                <td style={{ ...td, textAlign: 'left', color: 'var(--ts-muted)' }}>{i + 1}</td>
                <td style={{ ...td, textAlign: 'left' }}>
                  <Link href={`/${lang}/jugadores/${r.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ts-text)', textDecoration: 'none', fontWeight: 600 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', background: 'var(--ts-card2)', flexShrink: 0 }}>
                      {r.photo
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={r.photo} alt="" width={26} height={26} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : null}
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>{r.flag ? `${r.flag} ` : ''}{r.name}</span>
                  </Link>
                </td>
                <td style={{ ...td, textAlign: 'left', color: 'var(--ts-muted)', fontSize: 12 }}>{r.league}</td>
                <td style={{ ...td, color: 'var(--ts-faint)' }}>{r.coef.toFixed(2)}</td>
                <td style={{ ...td, color: 'var(--ts-primary)' }}>{r.finishing}</td>
                <td style={{ ...td, color: 'var(--ts-teal)' }}>{r.quality}</td>
                <td style={td}>{r.creation}</td>
                <td style={{ ...td, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--ts-primary)' }}>{r.iig}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
