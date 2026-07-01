'use client'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import type { PlayerData, Plan } from '@/types'
import { iig, IIG_NAME } from '@/lib/iig'
import { seasonShort } from '@/lib/season'

// Scout tool: the player's IIG season-by-season (historical trend). Uses the
// multi-season rows already loaded on the fiche — no external call. Gated on the
// Scout plan; everyone else sees a coming-... upsell. Author: Furiosa Studio.
export default function ScoutIIGTrend({ seasons, en }: { seasons: PlayerData[]; en: boolean }) {
  const { user, isLoaded } = useUser()
  const plan: Plan = (isLoaded && user ? ((user.publicMetadata?.plan as Plan) || 'free') : 'free')
  const isScout = plan === 'scout'

  // One row per season (newest→oldest as stored), IIG computed from real stats.
  const points = seasons
    .filter(s => s.season)
    .map(s => ({ code: s.season as string, iig: iig(s), goles: s.goles ?? 0 }))
    .filter((p, i, arr) => arr.findIndex(x => x.code === p.code) === i) // dedupe seasons
    .sort((a, b) => a.code.localeCompare(b.code)) // oldest → newest, left→right

  if (points.length < 2) return null // nothing to trend

  const card: React.CSSProperties = { background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }

  if (!isScout) {
    return (
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
            {en ? 'IIG trend' : 'Tendencia IIG'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 999, background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)' }}>Scout</span>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.5, color: 'var(--ts-muted)' }}>
          {en
            ? `See how this player's ${IIG_NAME.en} has risen or fallen season by season — a scouting read on trajectory, not just this year.`
            : `Mira cómo ha subido o bajado el ${IIG_NAME.es} de este jugador temporada a temporada — una lectura de ojeo sobre su trayectoria, no solo este año.`}
        </p>
        <Link href={`/${en ? 'en' : 'es'}/pricing`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '8px 16px', borderRadius: 999, background: 'var(--ts-card2)', border: '1px solid var(--ts-border)', color: 'var(--ts-text)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          {en ? 'Discover Scout' : 'Descubre Scout'} →
        </Link>
      </div>
    )
  }

  const max = Math.max(1, ...points.map(p => p.iig))
  return (
    <div style={card}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 14 }}>
        {en ? 'IIG trend by season' : 'Tendencia del IIG por temporada'}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
        {points.map(p => (
          <div key={p.code} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>{p.iig}</span>
            <div style={{ width: '100%', maxWidth: 34, height: `${Math.max(4, Math.round((p.iig / max) * 104))}px`, borderRadius: '4px 4px 0 0', background: 'var(--ts-primary)' }} />
            <span style={{ fontSize: 10, color: 'var(--ts-muted)', whiteSpace: 'nowrap' }}>{seasonShort(p.code)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
