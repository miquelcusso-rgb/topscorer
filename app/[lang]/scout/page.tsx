import type { Metadata } from 'next'
import { isLocale, type Lang } from '@/lib/i18n'
import { PRIMARY_PLAYERS } from '@/lib/player-identity'
import { leagueCoef, iig, rankScore } from '@/lib/iig'
import { playerSlug } from '@/lib/player-slug'
import { playerPhoto } from '@/lib/player-photo'
import { flagFor } from '@/lib/flags'
import SaasShell from '@/components/saas/SaasShell'
import ScoutComparator, { type ScoutRow } from '@/components/scout/ScoutComparator'

// Scout product hub — the cross-league IIG comparator (Scout tools layer).
// GATED behind the Scout plan, NOINDEX, and intentionally NOT in the sitemap:
// per _SEO-RULING-scout-gating.md the public Scouter Top-20 stays free+indexable,
// while the scouting TOOLS live here behind the paywall. ISR daily (static data).
export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  return {
    title: en ? 'Scout — Cross-league IIG comparator' : 'Scout — Comparador IIG multi-liga',
    description: en
      ? 'Scout tools: compare the Goal Impact Index (IIG) across leagues with the league-strength weighting broken out.'
      : 'Herramientas Scout: compara el Índice de Impacto del Goleador (IIG) entre ligas con la ponderación por dificultad desglosada.',
    // Gated tools layer → never indexed (the free Scouter Top-20 is the SEO asset).
    robots: { index: false, follow: false },
    alternates: { canonical: `https://www.top-scorers.com/${lang}/scout` },
  }
}

// Build the cross-league IIG board server-side from the static dataset (no
// external call → free tier). Top players across ALL leagues by rankScore, with
// the IIG components exposed so the league-coefficient effect is transparent.
function buildBoard(): ScoutRow[] {
  const season = (Array.isArray(PRIMARY_PLAYERS) ? PRIMARY_PLAYERS : []).filter(p => p && p.season === '2526')
  return [...season]
    .sort((a, b) => rankScore(b) - rankScore(a))
    .slice(0, 60)
    .map(p => {
      const coef = leagueCoef(p.league)
      const goles = p.goles ?? 0
      const asist = p.asist ?? 0
      const rating = typeof p.rating === 'number' && p.rating > 0 ? p.rating : 0
      const r1 = (v: number) => Math.round(v * 10) / 10
      return {
        name: p.name,
        slug: playerSlug(p),
        club: p.club,
        league: p.league,
        coef,
        goles, asist,
        rating: rating || null,
        finishing: r1(goles * coef),
        quality: r1(rating ? (rating - 6) * 3 : 0),
        creation: r1(asist * 0.5),
        iig: iig(p),
        photo: playerPhoto(p) ?? null,
        flag: p.flag ?? flagFor(p.nationality) ?? null,
      }
    })
}

export default async function ScoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const board = buildBoard()
  const leagues = Array.from(new Set(board.map(r => r.league))).sort((a, b) => a.localeCompare(b))
  return (
    <SaasShell activeKey="players" breadcrumb={lang === 'en' ? ['Scout', 'IIG comparator'] : ['Scout', 'Comparador IIG']}>
      <ScoutComparator lang={lang} board={board} leagues={leagues} />
    </SaasShell>
  )
}
