import type { PlayerData } from '@/types'
import { iig, leagueCoef } from './iig'

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
}

export interface HomeInsights {
  hot: HotStriker | null
  lines: HomeInsight[]
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
    })
  }

  return { hot, lines }
}
