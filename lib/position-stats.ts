import type { PlayerData } from '@/types'

export type PositionTabId = 'fw' | 'ast' | 'mf' | 'df' | 'gk'

// Map a tab to the player.position values it includes.
export const POSITION_FILTER: Record<PositionTabId, (p: PlayerData) => boolean> = {
  fw:  p => p.position === 'FW' && p.tab === 's',
  ast: p => p.tab === 'a' || (p.asist ?? 0) > 0,
  mf:  p => p.position === 'MF',
  df:  p => p.position === 'DF',
  gk:  p => p.position === 'GK',
}

// Sort metric per tab (descending) — the defining productivity for the role.
export function sortValue(tab: PositionTabId, p: PlayerData): number {
  switch (tab) {
    case 'fw':  return p.goles ?? 0
    case 'ast': return p.asist ?? 0
    case 'mf':  return (p.keyPasses ?? 0) + (p.asist ?? 0) * 2 + (p.goles ?? 0) // playmaking
    case 'df':  return (p.tacklesTotal ?? 0) + (p.interceptions ?? 0) + (p.duelsWon ?? 0) * 0.5 // defensive actions
    case 'gk':  return (p.rating ?? 0) * 10 + (p.minutes ?? 0) / 1000
    default:    return p.goles ?? 0
  }
}

// ── "Últimos 5 ratings" ──────────────────────────────────────────────────────
// Per-match ratings aren't in the static dataset (that needs /fixtures/players,
// far more API calls). We render a deterministic 5-match series CENTERED ON THE
// REAL season rating from API-Football, with small match-to-match variance.
// Clearly labelled "est." in the UI. The season average shown IS the real one
// when available.
function seed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export interface Last5 {
  ratings: number[]
  avg: number
  real: boolean // true when centered on the real season rating
}

export function last5Ratings(p: PlayerData): Last5 {
  let mean: number
  let real = false
  if (typeof p.rating === 'number' && p.rating > 0) {
    mean = p.rating
    real = true
  } else {
    const mins = Math.max(1, p.minutes ?? (p.pj ?? 1) * 70)
    const per90 = ((p.goles ?? 0) + (p.asist ?? 0) * 0.8) / (mins / 90)
    mean = Math.min(8.4, 6.6 + per90 * 0.9)
  }
  const s = seed(p.name + p.club)
  const ratings: number[] = []
  for (let i = 0; i < 5; i++) {
    const wobble = ((Math.sin((s % 997) * (i + 2) * 0.137) + 1) / 2 - 0.5) * 0.9
    ratings.push(Math.round(Math.max(5.4, Math.min(9.7, mean + wobble)) * 10) / 10)
  }
  return { ratings, avg: Math.round(mean * 10) / 10, real }
}

// ── Per-position columns (real stats) ────────────────────────────────────────
export interface PosColumn {
  key: string
  label: string
  value: (p: PlayerData) => string | number
  accent?: boolean
  tone?: 'primary' | 'teal' | 'muted' | 'text'
}

const n = (v?: number) => v ?? 0
const dash = (v?: number) => (v == null ? '—' : v)
function pct(a?: number, b?: number): string {
  if (!a || !b) return '—'
  return Math.round((a / b) * 100) + '%'
}
function ratio(a?: number, b?: number, dec = 2): string {
  if (!b) return '—'
  return (n(a) / b).toFixed(dec)
}

export const COLUMNS_FOR: Record<PositionTabId, PosColumn[]> = {
  // Delanteros: finishing volume + efficiency
  fw: [
    { key: 'goles', label: 'Goles',   value: p => n(p.goles), accent: true, tone: 'primary' },
    { key: 'sht',   label: 'Tiros',   value: p => dash(p.shotsTotal), tone: 'muted' },
    { key: 'sot',   label: '% Puerta', value: p => pct(p.shotsOn, p.shotsTotal), tone: 'text' },
    { key: 'conv',  label: 'Conv.',   value: p => pct(p.goles, p.shotsTotal), tone: 'teal' },
    { key: 'asist', label: 'Asist.',  value: p => n(p.asist), tone: 'teal' },
    { key: 'rt',    label: 'Nota',    value: p => (p.rating != null ? p.rating.toFixed(2) : '—'), tone: 'text' },
  ],
  // Asistentes: creation
  ast: [
    { key: 'asist', label: 'Asist.',   value: p => n(p.asist), accent: true, tone: 'teal' },
    { key: 'kp',    label: 'P. clave', value: p => dash(p.keyPasses), tone: 'primary' },
    { key: 'pas',   label: 'Pases',    value: p => dash(p.passes), tone: 'muted' },
    { key: 'pacc',  label: '% Acier.', value: p => (p.passAccuracy != null ? p.passAccuracy + '%' : '—'), tone: 'text' },
    { key: 'rt',    label: 'Nota',     value: p => (p.rating != null ? p.rating.toFixed(2) : '—'), tone: 'text' },
  ],
  // Centrocampistas: playmaking + volume + contribution
  mf: [
    { key: 'kp',    label: 'P. clave', value: p => dash(p.keyPasses), accent: true, tone: 'primary' },
    { key: 'pas',   label: 'Pases',    value: p => dash(p.passes), tone: 'muted' },
    { key: 'pacc',  label: '% Acier.', value: p => (p.passAccuracy != null ? p.passAccuracy + '%' : '—'), tone: 'text' },
    { key: 'ga',    label: 'G+A',      value: p => n(p.goles) + n(p.asist), tone: 'teal' },
    { key: 'rec',   label: 'Recup.',   value: p => dash(p.interceptions), tone: 'muted' },
    { key: 'rt',    label: 'Nota',     value: p => (p.rating != null ? p.rating.toFixed(2) : '—'), tone: 'text' },
  ],
  // Defensas: defensive actions
  df: [
    { key: 'tkl',   label: 'Entradas', value: p => dash(p.tacklesTotal), accent: true, tone: 'teal' },
    { key: 'int',   label: 'Intercep.', value: p => dash(p.interceptions), tone: 'primary' },
    { key: 'dw',    label: 'Duelos G.', value: p => dash(p.duelsWon), tone: 'muted' },
    { key: 'dwp',   label: '% Duelos', value: p => pct(p.duelsWon, p.duelsTotal), tone: 'text' },
    { key: 'rt',    label: 'Nota',     value: p => (p.rating != null ? p.rating.toFixed(2) : '—'), tone: 'text' },
  ],
  // Porteros: shot-stopping (sparse in this dataset — topscorers rarely lists GKs)
  gk: [
    { key: 'pj',    label: 'PJ',       value: p => n(p.pj), accent: true, tone: 'text' },
    { key: 'sav',   label: 'Paradas',  value: p => dash(p.saves), tone: 'primary' },
    { key: 'gc',    label: 'G. enc.',  value: p => dash(p.goalsConceded), tone: 'muted' },
    { key: 'rt',    label: 'Nota',     value: p => (p.rating != null ? p.rating.toFixed(2) : '—'), tone: 'text' },
  ],
}

export const TAB_ACCENT: Record<PositionTabId, 'primary' | 'teal'> = {
  fw: 'primary', ast: 'teal', mf: 'primary', df: 'teal', gk: 'primary',
}

export const TAB_LABELS: Record<'es' | 'en', Record<PositionTabId, string>> = {
  es: { fw: 'Delanteros', ast: 'Asistentes', mf: 'Centrocampistas', df: 'Defensas', gk: 'Porteros' },
  en: { fw: 'Forwards', ast: 'Assisters', mf: 'Midfielders', df: 'Defenders', gk: 'Keepers' },
}
