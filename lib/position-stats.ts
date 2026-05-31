import type { PlayerData } from '@/types'

export type PositionTabId = 'fw' | 'ast' | 'mf' | 'df' | 'gk'

// Map a tab to the player.position values it includes.
export const POSITION_FILTER: Record<PositionTabId, (p: PlayerData) => boolean> = {
  fw:  p => p.position === 'FW' && p.tab === 's',
  ast: p => p.tab === 'a' || (p.asist ?? 0) > 0, // assist leaders across positions
  mf:  p => p.position === 'MF',
  df:  p => p.position === 'DF',
  gk:  p => p.position === 'GK',
}

// Default sort metric per tab (descending).
export function sortValue(tab: PositionTabId, p: PlayerData): number {
  switch (tab) {
    case 'fw':  return p.goles ?? 0
    case 'ast': return p.asist ?? 0
    case 'mf':  return (p.goles ?? 0) + (p.asist ?? 0)
    case 'df':  return (p.minutes ?? 0)           // most-played defenders
    case 'gk':  return (p.minutes ?? 0)
    default:    return p.goles ?? 0
  }
}

// ── Synthetic "last 5 ratings" ───────────────────────────────────────────────
// The static dataset has no per-match ratings. We derive a deterministic,
// plausible 5-match rating series seeded by the player name, centered on a mean
// inferred from the player's per-90 productivity. Consistent with the v2
// design's existing synthetic xG / form. Clearly an estimate (labelled "est.").
function seed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export interface Last5 {
  ratings: number[]
  avg: number
}

export function last5Ratings(p: PlayerData): Last5 {
  const mins = Math.max(1, p.minutes ?? (p.pj ?? 1) * 70)
  const ga = (p.goles ?? 0) + (p.asist ?? 0) * 0.8
  const per90 = ga / (mins / 90)
  // Base mean 6.6–8.4 mapped from productivity, lightly position-agnostic.
  const mean = Math.min(8.4, 6.6 + per90 * 0.9)
  const s = seed(p.name + p.club)
  const ratings: number[] = []
  for (let i = 0; i < 5; i++) {
    const wobble = ((Math.sin((s % 997) * (i + 2) * 0.137) + 1) / 2 - 0.5) * 1.1
    const r = Math.max(5.5, Math.min(9.6, mean + wobble))
    ratings.push(Math.round(r * 10) / 10)
  }
  const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
  return { ratings, avg }
}

// ── Per-position column config ───────────────────────────────────────────────
export interface PosColumn {
  key: string
  label: string
  /** derive display value from player */
  value: (p: PlayerData) => string | number
  /** accent the value in primary gold (key metric) */
  accent?: boolean
  tone?: 'primary' | 'teal' | 'muted' | 'text'
}

function ratio(n: number, d: number, dec = 2): string {
  if (!d) return '—'
  return (n / d).toFixed(dec)
}
function per90(n: number, mins?: number, pj?: number): string {
  const m = mins ?? (pj ?? 0) * 70
  if (!m) return '—'
  return (n / (m / 90)).toFixed(2)
}

// Columns shown after the player/club identity cells, before the "Últimos 5".
export const COLUMNS_FOR: Record<PositionTabId, PosColumn[]> = {
  fw: [
    { key: 'goles', label: 'Goles',  value: p => p.goles ?? 0, accent: true, tone: 'primary' },
    { key: 'asist', label: 'Asist.', value: p => p.asist ?? 0, tone: 'teal' },
    { key: 'pj',    label: 'PJ',     value: p => p.pj ?? 0, tone: 'muted' },
    { key: 'gpj',   label: 'G/PJ',   value: p => ratio(p.goles ?? 0, p.pj ?? 0), tone: 'text' },
  ],
  ast: [
    { key: 'asist', label: 'Asist.', value: p => p.asist ?? 0, accent: true, tone: 'teal' },
    { key: 'goles', label: 'Goles',  value: p => p.goles ?? 0, tone: 'primary' },
    { key: 'pj',    label: 'PJ',     value: p => p.pj ?? 0, tone: 'muted' },
    { key: 'apj',   label: 'A/PJ',   value: p => ratio(p.asist ?? 0, p.pj ?? 0), tone: 'text' },
  ],
  mf: [
    { key: 'ga',    label: 'G+A',    value: p => (p.goles ?? 0) + (p.asist ?? 0), accent: true, tone: 'primary' },
    { key: 'goles', label: 'Goles',  value: p => p.goles ?? 0, tone: 'primary' },
    { key: 'asist', label: 'Asist.', value: p => p.asist ?? 0, tone: 'teal' },
    { key: 'pj',    label: 'PJ',     value: p => p.pj ?? 0, tone: 'muted' },
    { key: 'ga90',  label: 'G+A/90', value: p => per90((p.goles ?? 0) + (p.asist ?? 0), p.minutes, p.pj), tone: 'text' },
  ],
  df: [
    { key: 'pj',    label: 'PJ',     value: p => p.pj ?? 0, accent: true, tone: 'text' },
    { key: 'min',   label: 'Min',    value: p => p.minutes ?? 0, tone: 'muted' },
    { key: 'goles', label: 'Goles',  value: p => p.goles ?? 0, tone: 'primary' },
    { key: 'asist', label: 'Asist.', value: p => p.asist ?? 0, tone: 'teal' },
  ],
  gk: [
    { key: 'pj',    label: 'PJ',     value: p => p.pj ?? 0, accent: true, tone: 'text' },
    { key: 'min',   label: 'Min',    value: p => p.minutes ?? 0, tone: 'muted' },
  ],
}

export const TAB_ACCENT: Record<PositionTabId, 'primary' | 'teal'> = {
  fw: 'primary', ast: 'teal', mf: 'primary', df: 'teal', gk: 'primary',
}

export const TAB_LABELS: Record<'es' | 'en', Record<PositionTabId, string>> = {
  es: { fw: 'Delanteros', ast: 'Asistentes', mf: 'Centrocampistas', df: 'Defensas', gk: 'Porteros' },
  en: { fw: 'Forwards', ast: 'Assisters', mf: 'Midfielders', df: 'Defenders', gk: 'Keepers' },
}
