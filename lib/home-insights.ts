import type { PlayerData } from '@/types'
import { iig, leagueCoef } from './iig'
import { slugify } from './slugify'
import { playerSlug } from './player-slug'
import { seasonsForPlayer } from './player-identity'

// Canonical profile slug for a player: a `season` row may be a non-primary
// duplicate (e.g. a curated "Erling Haaland" vs the generated "E. Haaland"), so
// resolve to the primary entry's slug — the one the profile is actually served
// at — to avoid 404 links.
const canonSlug = (p: PlayerData) => playerSlug(seasonsForPlayer(p)[0] ?? p)

// Small, serializable payloads computed server-side from the real PLAYERS
// dataset and passed to the client (1-3 players only — keeps RSC payload tiny,
// avoids the /es 500 regression). Everything here is a derived fact, no mocks.

export interface HotStriker {
  name: string
  club: string
  league: string
  flag?: string
  photo?: string
  goles: number
  rating: number | null
  pj: number
  form: number // (rating + goles/pj), rounded to 2
  iig: number
}

export interface HomeInsight {
  es: string
  en: string
  slug?: string  // player profile slug, so a curiosity links to the player
}

// "Jugones de la jornada" — a few editorial standouts, each a real leader.
export interface Standout {
  key: 'scorer' | 'assister' | 'rating' | 'iig'
  labelEs: string
  labelEn: string
  name: string
  club: string
  flag?: string
  photo?: string
  slug: string
  stat: string        // headline value, e.g. "33" or "8.6"
  statLabelEs: string
  statLabelEn: string
}

export interface HomeInsights {
  hot: HotStriker | null
  lines: HomeInsight[]
  standouts: Standout[]
}

const num1 = (v: number) => (Math.round(v * 10) / 10).toString().replace('.', ',')
const numEn1 = (v: number) => (Math.round(v * 10) / 10).toString()

// Recent-form proxy = rating + goles/pj. Pure real-data ratio (per-game scoring
// rate blended with season rating). Requires a real rating + minimum games so a
// single-game outlier can't top the list.
function formScore(p: PlayerData): number {
  const rating = typeof p.rating === 'number' && p.rating > 0 ? p.rating : 0
  const pj = p.pj && p.pj > 0 ? p.pj : 0
  if (!rating || !pj) return 0
  return rating + (p.goles ?? 0) / pj
}

export function computeHomeInsights(season: PlayerData[]): HomeInsights {
  const forwards = season.filter(p => p.position === 'FW' && p.tab === 's')

  // Hot striker — best recent-form proxy among forwards with ≥5 games.
  const hotCandidates = forwards.filter(p => (p.pj ?? 0) >= 5)
  let hot: HotStriker | null = null
  if (hotCandidates.length) {
    const best = hotCandidates.reduce((a, b) => (formScore(b) > formScore(a) ? b : a))
    hot = {
      name: best.name,
      club: best.club,
      league: best.league,
      flag: best.flag,
      photo: best.photo,
      goles: best.goles ?? 0,
      rating: typeof best.rating === 'number' ? best.rating : null,
      pj: best.pj ?? 0,
      form: Math.round(formScore(best) * 100) / 100,
      iig: iig(best),
    }
  }

  const lines: HomeInsight[] = []

  // Insight 1 — IIG leader.
  if (forwards.length) {
    const leader = forwards.reduce((a, b) => (iig(b) > iig(a) ? b : a))
    const lv = iig(leader)
    const coef = leagueCoef(leader.league)
    lines.push({
      es: `${leader.name} lidera el IIG con ${leader.goles ?? 0} goles · ${num1(lv)} IIG (coef. liga ×${num1(coef)})`,
      en: `${leader.name} leads the IIG with ${leader.goles ?? 0} goals · ${numEn1(lv)} IIG (league coef ×${numEn1(coef)})`,
      slug: canonSlug(leader),
    })
  }

  // Insight 2 — best finishing conversion among forwards with enough shots.
  const finishers = forwards.filter(p => (p.shotsTotal ?? 0) >= 20 && (p.goles ?? 0) > 0)
  if (finishers.length) {
    const conv = (p: PlayerData) => (p.goles ?? 0) / (p.shotsTotal ?? 1)
    const sharp = finishers.reduce((a, b) => (conv(b) > conv(a) ? b : a))
    const pctEs = num1(conv(sharp) * 100)
    const pctEn = numEn1(conv(sharp) * 100)
    lines.push({
      es: `${sharp.name} firma la mejor conversión: ${pctEs}% de sus tiros acaban en gol`,
      en: `${sharp.name} has the sharpest finishing: ${pctEn}% of shots converted`,
      slug: canonSlug(sharp),
    })
  }

  // "Jugones de la jornada" — real leaders across categories.
  const standouts: Standout[] = []
  const sd = (
    key: Standout['key'], labelEs: string, labelEn: string,
    p: PlayerData | undefined, stat: string, statLabelEs: string, statLabelEn: string,
  ) => {
    if (!p) return
    standouts.push({
      key, labelEs, labelEn, name: p.name, club: p.club, flag: p.flag,
      photo: p.photo, slug: canonSlug(p), stat, statLabelEs, statLabelEn,
    })
  }
  const byGoals = [...season].filter(p => p.tab === 's').sort((a, b) => (b.goles ?? 0) - (a.goles ?? 0))[0]
  const byAssist = [...season].sort((a, b) => (b.asist ?? 0) - (a.asist ?? 0))[0]
  const byRating = [...season].filter(p => (p.pj ?? 0) >= 10 && typeof p.rating === 'number')
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0]
  const byIig = [...forwards].sort((a, b) => iig(b) - iig(a))[0]
  sd('scorer', 'Máximo goleador', 'Top scorer', byGoals, `${byGoals?.goles ?? 0}`, 'goles', 'goals')
  sd('assister', 'Más asistencias', 'Top assister', byAssist, `${byAssist?.asist ?? 0}`, 'asistencias', 'assists')
  sd('rating', 'Mejor nota', 'Best rating', byRating, byRating?.rating != null ? byRating.rating.toFixed(2) : '—', 'media', 'avg rating')
  sd('iig', 'Líder IIG', 'IIG leader', byIig, byIig ? num1(iig(byIig)) : '—', 'IIG', 'IIG')

  return { hot, lines, standouts }
}
