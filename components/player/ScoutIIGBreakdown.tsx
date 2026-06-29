'use client'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import type { PlayerData, Plan } from '@/types'
import { iig, leagueCoef, IIG_NAME } from '@/lib/iig'

// Scout layer · slice-1: per-player IIG breakdown (components + weights), the
// headline Scout feature (pricing_scout_f2). Gated on the Scout plan; everyone
// else sees a coming-soon teaser. Pure client gating on an already-indexable
// fiche → no new route, no sitemap entry, nothing extra exposed to crawlers, so
// it carries ZERO SEO impact (no noindex coordination needed). The standalone
// multi-player cross-league comparator (a new noindex route) is a later slice.
//
// Everything is recomputed from the SAME real season fields the IIG itself uses
// (goals, assists, rating, league) via lib/iig — no invented numbers. Brand
// --ts-* tokens only. Author: Furiosa Studio.

const TOP5_COEF = 1.0 // Big-5 reference coefficient for the cross-league context line.

export default function ScoutIIGBreakdown({ player, en }: { player: PlayerData; en: boolean }) {
  const { user, isLoaded } = useUser()
  const plan: Plan = (isLoaded && user ? ((user.publicMetadata?.plan as Plan) || 'free') : 'free')
  const isScout = plan === 'scout'

  const goles = player.goles ?? 0
  const asist = player.asist ?? 0
  const rating = typeof player.rating === 'number' && player.rating > 0 ? player.rating : 0
  const coef = leagueCoef(player.league)
  const total = iig(player)

  const title = `${en ? 'IIG breakdown' : 'Desglose IIG'} · ${IIG_NAME[en ? 'en' : 'es']}`

  // ── Coming-soon / locked teaser for non-Scout (Scout plan is coming soon) ──
  if (!isScout) {
    return (
      <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
            {en ? 'IIG breakdown' : 'Desglose IIG'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 999, background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)' }}>
            Scout · {en ? 'soon' : 'próx.'}
          </span>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.5, color: 'var(--ts-muted)' }}>
          {en
            ? 'See exactly how this player’s Striker Impact Index is built — every component, weight and league coefficient — with the Scout toolkit.'
            : 'Mira exactamente cómo se construye el Índice de Impacto del Goleador de este jugador — cada componente, peso y coeficiente de liga — con el kit Scout.'}
        </p>
        <Link href={`/${en ? 'en' : 'es'}/pricing`}
          style={{ display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '8px 16px', borderRadius: 999,
            background: 'var(--ts-card2)', border: '1px solid var(--ts-border)', color: 'var(--ts-text)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          {en ? 'Discover Scout' : 'Descubre Scout'} →
        </Link>
      </div>
    )
  }

  // ── Scout: the real component breakdown ────────────────────────────────────
  const finishing = goles * coef
  const quality = rating ? (rating - 6) * 3 : 0
  const creation = asist * 0.5
  const sumPos = Math.max(finishing, 0) + Math.max(quality, 0) + Math.max(creation, 0)
  const pct = (v: number) => (sumPos > 0 ? Math.round((Math.max(v, 0) / sumPos) * 100) : 0)
  const r1 = (v: number) => Math.round(v * 10) / 10

  const rows: Array<{ label: string; formula: string; value: number; tone: string }> = [
    {
      label: en ? 'Finishing (league-weighted)' : 'Finalización (ponderada por liga)',
      formula: `${goles} × ${coef.toFixed(2)}`,
      value: finishing, tone: 'var(--ts-primary)',
    },
    {
      label: en ? 'All-round quality' : 'Calidad global',
      formula: rating ? `(${rating.toFixed(2)} − 6) × 3` : (en ? 'no rating' : 'sin nota'),
      value: quality, tone: 'var(--ts-teal)',
    },
    {
      label: en ? 'Creation' : 'Creación',
      formula: `${asist} × 0.5`,
      value: creation, tone: 'var(--ts-text)',
    },
  ]

  // Cross-league context: what the finishing term would be at a Big-5 coef.
  const finishingTop5 = goles * TOP5_COEF
  const showContext = goles > 0 && coef < TOP5_COEF

  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>{title}</span>
        <span style={{ marginLeft: 'auto', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 26, lineHeight: 1, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ts-text)' }}>{row.label}</span>
              <span style={{ fontSize: 11, color: 'var(--ts-faint)', fontFamily: 'JetBrains Mono, monospace' }}>{row.formula}</span>
              <span style={{ marginLeft: 'auto', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: row.tone, fontVariantNumeric: 'tabular-nums' }}>
                {row.value >= 0 ? '+' : ''}{r1(row.value)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--ts-card2)', overflow: 'hidden' }}>
                <div style={{ width: `${pct(row.value)}%`, height: '100%', borderRadius: 3, background: row.tone }} />
              </div>
              <span style={{ width: 34, textAlign: 'right', fontSize: 11, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>{pct(row.value)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ts-hairline)', fontSize: 12, color: 'var(--ts-muted)', lineHeight: 1.5 }}>
        <div>
          {en ? 'League coefficient' : 'Coeficiente de liga'}: <strong style={{ color: 'var(--ts-text)' }}>{player.league} · {coef.toFixed(2)}</strong>
        </div>
        {showContext && (
          <div style={{ marginTop: 4 }}>
            {en
              ? `In a Top-5 league (1.00) the finishing term would be +${r1(finishingTop5)} instead of +${r1(finishing)}.`
              : `En una liga Top-5 (1,00), la finalización sería +${r1(finishingTop5)} en vez de +${r1(finishing)}.`}
          </div>
        )}
      </div>
    </div>
  )
}
