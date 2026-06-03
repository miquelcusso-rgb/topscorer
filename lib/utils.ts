import type { PlayerData, EnrichedPlayer, SortKey, PanelState, Tab } from '@/types'
import { flagFor } from '@/lib/flags'

export const COEF: Record<string, number> = {
  'La Liga': 2, 'Premier League': 2, 'Bundesliga': 2, 'Serie A': 2, 'Ligue 1': 2,
  'Sueper Lig': 1.5, 'Primeira Liga': 1.5, 'Super Liga Grecia': 1.5,
  'Championship': 1.8, '2. Bundesliga': 1.8, 'Serie B': 1.5, 'Ligue 2': 1.5,
  'Segunda División': 1.8, 'Liga Portugal 2': 1.2, '1. Lig': 1.2,
  'Champions League': 2.5, 'Europa League': 2.2, 'Conference League': 2.0,
}

export const LEAGUE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'La Liga':           { bg: 'rgba(230,80,40,.14)',   color: '#e07050', border: 'rgba(230,80,40,.24)' },
  'Premier League':    { bg: 'rgba(80,180,80,.12)',   color: '#55c060', border: 'rgba(80,180,80,.24)' },
  'Bundesliga':        { bg: 'rgba(220,50,50,.12)',   color: '#de5050', border: 'rgba(220,50,50,.24)' },
  'Serie A':           { bg: 'rgba(60,110,220,.12)',  color: '#5080e0', border: 'rgba(60,110,220,.24)' },
  'Ligue 1':           { bg: 'rgba(110,70,220,.12)',  color: '#9060e0', border: 'rgba(110,70,220,.24)' },
  'Sueper Lig':        { bg: 'rgba(200,160,40,.12)',  color: '#c8a040', border: 'rgba(200,160,40,.24)' },
  'Primeira Liga':     { bg: 'rgba(180,60,60,.12)',   color: '#c05858', border: 'rgba(180,60,60,.24)' },
  'Super Liga Grecia': { bg: 'rgba(60,120,200,.12)',  color: '#4080d0', border: 'rgba(60,120,200,.24)' },
  // 2nd division
  'Championship':      { bg: 'rgba(61,25,91,.14)',   color: '#8060a0', border: 'rgba(61,25,91,.28)' },
  '2. Bundesliga':     { bg: 'rgba(220,5,21,.12)',   color: '#de3040', border: 'rgba(220,5,21,.24)' },
  'Serie B':           { bg: 'rgba(2,68,148,.12)',   color: '#3060c0', border: 'rgba(2,68,148,.24)' },
  'Ligue 2':           { bg: 'rgba(0,48,135,.12)',   color: '#2050a0', border: 'rgba(0,48,135,.24)' },
  'Segunda División':  { bg: 'rgba(238,49,36,.12)',  color: '#e04030', border: 'rgba(238,49,36,.24)' },
  'Liga Portugal 2':   { bg: 'rgba(0,102,0,.12)',    color: '#30a030', border: 'rgba(0,102,0,.24)' },
  '1. Lig':            { bg: 'rgba(227,10,23,.12)',  color: '#e03040', border: 'rgba(227,10,23,.24)' },
  // European
  'Champions League':  { bg: 'rgba(26,58,110,.14)',  color: '#4070c0', border: 'rgba(26,58,110,.28)' },
  'Europa League':     { bg: 'rgba(247,127,0,.12)',  color: '#f08030', border: 'rgba(247,127,0,.24)' },
  'Conference League': { bg: 'rgba(56,196,122,.10)', color: '#38c47a', border: 'rgba(56,196,122,.24)' },
}

export const LEAGUE_IDS: Record<string, number> = {
  'La Liga':           140,
  'Premier League':    39,
  'Bundesliga':        78,
  'Serie A':           135,
  'Ligue 1':           61,
  'Primeira Liga':     94,
  'Sueper Lig':        203,
  'Super Liga Grecia': 197,
  'Championship':      40,
  '2. Bundesliga':     79,
  'Serie B':           136,
  'Ligue 2':           62,
  'Segunda División':  141,
  'Liga Portugal 2':   95,
  '1. Lig':            204,
  'Champions League':  2,
  'Europa League':     3,
  'Conference League': 848,
}
export function leagueLogoUrl(league: string): string {
  const id = LEAGUE_IDS[league]
  return id ? `https://media.api-sports.io/football/leagues/${id}.png` : ''
}

export function enrich(p: PlayerData): EnrichedPlayer {
  const coef = COEF[p.league] || 1
  return {
    ...p,
    flag: p.flag ?? flagFor(p.nationality),
    // Every player with an API id has a CDN headshot — derive it when a row
    // didn't carry one, so photos show wherever an apiId is known.
    photo: p.photo ?? (p.apiId ? `https://media.api-sports.io/football/players/${p.apiId}.png` : undefined),
    coef,
    ratio_g: Math.round((p.goles / p.pj) * 100) / 100,
    ratio_a: Math.round((p.asist / p.pj) * 100) / 100,
    val_sin: p.goles * 2 + p.asist,
    val_con: Math.round((p.goles * coef * 2 + p.asist) * 10) / 10,
    elo: p.elo ?? Math.round(1500 + p.goles * coef * 4 + p.asist * coef * 2 + p.pj * 0.5),
    fantasyPoints: p.fantasyPoints ?? (p.goles * 6 + p.asist * 3 + p.pj),
    fantasyPrice: p.fantasyPrice ?? Math.round((8 + Math.min(p.goles * 0.2 + p.asist * 0.1, 7)) * 10) / 10,
  }
}

export function getPool(data: PlayerData[], tab: Tab): EnrichedPlayer[] {
  return data.filter(p => p.tab === tab).map(enrich)
}

export function makeSortFn(key: SortKey, dir: 1 | -1) {
  return (a: EnrichedPlayer, b: EnrichedPlayer) => {
    const va = a[key] as number | string | undefined
    const vb = b[key] as number | string | undefined
    if (va == null && vb == null) return 0
    if (va == null) return 1
    if (vb == null) return -1
    if (typeof va === 'string') return va < vb! ? -dir : va > vb! ? dir : 0
    return ((va as number) - (vb as number)) * dir
  }
}

export function buildTopN(pool: EnrichedPlayer[], state: PanelState, limit = 25): EnrichedPlayer[] {
  const allowed = new Set<string>()
  if (state.showEsp) allowed.add('La Liga')
  if (state.showEng) allowed.add('Premier League')
  if (state.showGer) allowed.add('Bundesliga')
  if (state.showIta) allowed.add('Serie A')
  if (state.showFra) allowed.add('Ligue 1')
  if (state.showPt)  allowed.add('Primeira Liga')
  if (state.showTr)  allowed.add('Sueper Lig')
  if (state.showGr)  allowed.add('Super Liga Grecia')
  if (state.show2nd) {
    allowed.add('Championship'); allowed.add('2. Bundesliga')
    allowed.add('Serie B');      allowed.add('Ligue 2')
    allowed.add('Segunda División'); allowed.add('Liga Portugal 2'); allowed.add('1. Lig')
  }
  if (state.showEuro) {
    allowed.add('Champions League'); allowed.add('Europa League'); allowed.add('Conference League')
  }

  const bySeason = pool.filter(p => p.season === state.season && allowed.has(p.league))
  const sf = makeSortFn(state.sort, state.dir)

  const primary = bySeason.filter(p => p.age <= state.age).sort(sf)
  const filler  = bySeason.filter(p => p.age >  state.age).sort(sf)

  const result: EnrichedPlayer[] = []
  const seen: Record<string, boolean> = {}
  for (const p of [...primary, ...filler]) {
    if (result.length >= limit) break
    if (!seen[p.name]) {
      result.push(p.age > state.age ? { ...p, isFiller: true } : p)
      seen[p.name] = true
    }
  }

  for (const pname of Object.keys(state.pinned)) {
    const idx = result.findIndex(p => p.name === pname)
    if (idx !== -1) { result[idx] = { ...result[idx], isPinned: true }; continue }
    const pr = bySeason.find(p => p.name === pname)
    if (!pr) continue
    const lastFree = [...result].map((_p,i) => i).reverse().find(i => !result[i].isPinned)
    if (lastFree !== undefined) result.splice(lastFree, 1)
    result.push({ ...pr, isPinned: true })
  }

  return result.sort(sf)
}
