import type { PlayerData, EnrichedPlayer, SortKey, PanelState, Tab } from '@/types'

export const COEF: Record<string, number> = {
  'La Liga': 2, 'Premier League': 2, 'Bundesliga': 2, 'Serie A': 2, 'Ligue 1': 2,
  'Sueper Lig': 1.5, 'Primeira Liga': 1.5, 'Super Liga Grecia': 1.5,
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
}

export function enrich(p: PlayerData): EnrichedPlayer {
  const coef = COEF[p.league] || 1
  return {
    ...p,
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

export function buildTop25(pool: EnrichedPlayer[], state: PanelState): EnrichedPlayer[] {
  const allowed = new Set<string>()
  if (state.showEur5) ['La Liga','Premier League','Bundesliga','Serie A','Ligue 1'].forEach(l => allowed.add(l))
  if (state.showPt) allowed.add('Primeira Liga')
  if (state.showTr) allowed.add('Sueper Lig')
  if (state.showGr) allowed.add('Super Liga Grecia')

  const bySeason = pool.filter(p => p.season === state.season && allowed.has(p.league))
  const sf = makeSortFn(state.sort, state.dir)

  const primary = bySeason.filter(p => p.age <= state.age).sort(sf)
  const filler  = bySeason.filter(p => p.age >  state.age).sort(sf)

  const top25: EnrichedPlayer[] = []
  const seen: Record<string, boolean> = {}
  for (const p of [...primary, ...filler]) {
    if (top25.length >= 25) break
    if (!seen[p.name]) {
      top25.push(p.age > state.age ? { ...p, isFiller: true } : p)
      seen[p.name] = true
    }
  }

  for (const pname of Object.keys(state.pinned)) {
    const idx = top25.findIndex(p => p.name === pname)
    if (idx !== -1) { top25[idx] = { ...top25[idx], isPinned: true }; continue }
    const pr = bySeason.find(p => p.name === pname)
    if (!pr) continue
    const lastFree = [...top25].map((p,i) => i).reverse().find(i => !top25[i].isPinned)
    if (lastFree !== undefined) top25.splice(lastFree, 1)
    top25.push({ ...pr, isPinned: true })
  }

  return top25.sort(sf)
}
