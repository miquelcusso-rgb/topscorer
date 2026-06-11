'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { isPro } from '@/lib/plans'
import { enrich } from '@/lib/utils'
import { slugify } from '@/lib/slugify'
import { playerSlug } from '@/lib/player-slug'
import { PRIMARY_PLAYERS, seasonsForPlayer } from '@/lib/player-identity'
import { iig } from '@/lib/iig'
import { clubLogo } from '@/lib/club-logos'
import Avatar from '@/components/saas/Avatar'
import ComparisonRadar, { type ComparisonAxis } from '@/components/player/ComparisonRadar'
import type { EnrichedPlayer, Position } from '@/types'
import VersusCard from './VersusCard'

interface SearchHit {
  name: string; fullName?: string; slug: string; club: string; league: string
  flag?: string; photo?: string; age?: number; pos?: string
}

// Small club crest next to a club name. Omitted gracefully when no logo URL.
function ClubLogo({ club, size = 18 }: { club: string; size?: number }) {
  const src = clubLogo(club)
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      crossOrigin="anonymous"
      loading="lazy"
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
    />
  )
}

const C_DARK = {
  gd: '#f0c040', pu: '#00c8b0', te: '#00c8b0', bl: '#e05a30', or: '#9aa0b0',
  tx: '#f1e8d2', mu: '#9a917e', bd: '#2a2620', sf: '#15130f', s2: '#1c1a16',
  bg: 'rgba(10,9,8,.92)',
}

function posAccent(pos?: string): string {
  if (pos === 'FW') return C_DARK.gd   // gold
  if (pos === 'MF') return C_DARK.pu   // teal
  if (pos === 'DF') return C_DARK.bl   // orange
  if (pos === 'GK') return C_DARK.or   // neutral grey
  return C_DARK.gd
}

// One entry per REAL player (PRIMARY_PLAYERS = current season, identity unified
// by apiId). This fixes the "3 Pedris" / "Mbappé ×3" duplicates: each player
// appears once (most recent season); other seasons are reachable via the season
// picker on each selected card.
const ALL_PLAYERS: EnrichedPlayer[] = PRIMARY_PLAYERS.map(enrich)

// Robust lookup so presets/deep-links match abbreviated dataset names
// ("Harry Kane" → "H. Kane", "Vinicius Junior" → "Vinícius Júnior").
const _pnorm = (s?: string) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.'’-]/g, ' ').replace(/\s+/g, ' ').trim()
const _pil = (s?: string) => { const t = _pnorm(s).split(' ').filter(Boolean); return t.length >= 2 ? `${t[0][0]} ${t[t.length - 1]}` : _pnorm(s) }
function findPlayerByName(q: string): EnrichedPlayer | null {
  const n = _pnorm(q), il = _pil(q)
  return (
    ALL_PLAYERS.find(p => _pnorm(p.name) === n || _pnorm(p.fullName) === n) ??
    ALL_PLAYERS.find(p => _pil(p.name) === il || _pil(p.fullName) === il) ??
    null
  )
}

const PRESETS = [
  { a: 'Harry Kane',    b: 'Erling Haaland'  },
  { a: 'Kylian Mbappé', b: 'Vinicius Junior'  },
  { a: 'Mohamed Salah', b: 'Bukayo Saka'      },
  { a: 'Lamine Yamal',  b: 'Florian Wirtz'   },
]

// ── Stat-set definitions for the comparison radar ────────────────────────────
// Each axis pulls a REAL numeric value from a player (metric) and renders a
// display string (format). aPct/bPct are computed later as val / max(a,b,1)
// — UNLESS the axis sets `invert`, in which case fewer = better (see below).
type StatSetId = 'pct' | 'compare' | 'fw' | 'mf' | 'df' | 'transfer'

interface AxisDef {
  label: string
  // bilingual labels for the radar/breakdown axis
  labelEn?: string
  // real numeric value used for the polygon. By default higher = better, so a
  // larger value pushes the vertex further out. For `invert` axes (e.g. balls
  // lost, where LOWER is better) we flip the normalization later so that the
  // player with FEWER losses gets the bigger area — see radarAxes useMemo.
  metric: (p: EnrichedPlayer) => number
  // display value (shown as the real number on the radar vertex / breakdown)
  format: (p: EnrichedPlayer) => string | number
  // when true, lower raw metric = better; the polygon is inverted so a player
  // who loses fewer balls does NOT look worse on the radar.
  invert?: boolean
}

const n0 = (v?: number) => v ?? 0
// Per-game rate, guarding divide-by-zero (pj = 0 → 0).
function perGame(total?: number, pj?: number): number {
  const g = pj ?? 0
  if (g <= 0) return 0
  return (total ?? 0) / g
}
function pctOf(a?: number, b?: number): number {
  if (!a || !b) return 0
  return Math.round((a / b) * 1000) / 10
}
function keyPassesOf(p: EnrichedPlayer): number {
  return p.keyPasses ?? p.passesKey ?? 0
}
// Parse "€120M" / "€80m" → millions as a number for relative comparison.
function marketValueM(p: EnrichedPlayer): number {
  if (!p.marketValue) return 0
  const m = p.marketValue.match(/([\d.]+)\s*([mMkK])?/)
  if (!m) return 0
  const num = parseFloat(m[1])
  if (Number.isNaN(num)) return 0
  const unit = (m[2] ?? '').toLowerCase()
  return unit === 'k' ? num / 1000 : num
}

const STAT_SETS: Record<StatSetId, AxisDef[]> = {
  // 'pct' (per-position percentile radar) is resolved separately from the radars,
  // not from these relative stat formulas.
  pct: [],
  // Comparativa — the user-requested cross-position axes, all backed by REAL
  // API-Football season data (backfilled into PlayerData via scripts/backfill-full.mjs):
  //   G/PJ                = goles / pj
  //   A/PJ                = asist / pj
  //   Regates intentados  = dribblesAttempts
  //   Regates conseguidos = dribblesSuccess
  //   Duelos ganados      = duelsWon
  // NOTE: "Balones perdidos" (balls lost / dispossessed) is NOT exposed by the
  // API-Football /players endpoint, so it cannot be shown with real data. We
  // substitute "Duelos ganados" (a real, meaningful metric) for that 5th axis.
  compare: [
    { label: 'G/PJ',          labelEn: 'G/Game',     metric: p => perGame(p.goles, p.pj), format: p => perGame(p.goles, p.pj).toFixed(2) },
    { label: 'A/PJ',          labelEn: 'A/Game',     metric: p => perGame(p.asist, p.pj), format: p => perGame(p.asist, p.pj).toFixed(2) },
    { label: 'Regates int.',  labelEn: 'Drib. att.', metric: p => n0(p.dribblesAttempts), format: p => p.dribblesAttempts ?? '—' },
    { label: 'Regates cons.', labelEn: 'Drib. won',  metric: p => n0(p.dribblesSuccess),  format: p => p.dribblesSuccess ?? '—' },
    { label: 'Duelos gan.',   labelEn: 'Duels won',  metric: p => n0(p.duelsWon),         format: p => p.duelsWon ?? '—' },
  ],
  // Delantero — finishing volume + efficiency
  fw: [
    { label: 'Goles',    metric: p => n0(p.goles),                         format: p => n0(p.goles) },
    { label: 'Tiros',    metric: p => n0(p.shotsTotal),                    format: p => p.shotsTotal ?? '—' },
    { label: '% Puerta', metric: p => pctOf(p.shotsOn, p.shotsTotal),      format: p => { const v = pctOf(p.shotsOn, p.shotsTotal); return v ? `${v}%` : '—' } },
    { label: 'Conv.',    metric: p => pctOf(p.goles, p.shotsTotal),        format: p => { const v = pctOf(p.goles, p.shotsTotal); return v ? `${v}%` : '—' } },
    { label: 'Asist.',   metric: p => n0(p.asist),                         format: p => n0(p.asist) },
    { label: 'IIG',      metric: p => iig(p),                              format: p => iig(p).toFixed(1) },
  ],
  // Centrocampista — playmaking + volume + contribution
  mf: [
    { label: 'P. clave', metric: p => keyPassesOf(p),                      format: p => keyPassesOf(p) || '—' },
    { label: 'Pases',    metric: p => n0(p.passes),                        format: p => p.passes ?? '—' },
    { label: '% Acier.', metric: p => n0(p.passAccuracy),                  format: p => (p.passAccuracy != null ? `${p.passAccuracy}%` : '—') },
    { label: 'Asist.',   metric: p => n0(p.asist),                         format: p => n0(p.asist) },
    { label: 'G+A',      metric: p => n0(p.goles) + n0(p.asist),           format: p => n0(p.goles) + n0(p.asist) },
    { label: 'Recup.',   metric: p => n0(p.interceptions),                 format: p => p.interceptions ?? '—' },
  ],
  // Defensa — defensive actions
  df: [
    { label: 'Entradas', metric: p => n0(p.tacklesTotal),                  format: p => p.tacklesTotal ?? '—' },
    { label: 'Intercep.', metric: p => n0(p.interceptions),                format: p => p.interceptions ?? '—' },
    { label: 'Duelos G.', metric: p => n0(p.duelsWon),                     format: p => p.duelsWon ?? '—' },
    { label: '% Duelos', metric: p => pctOf(p.duelsWon, p.duelsTotal),     format: p => { const v = pctOf(p.duelsWon, p.duelsTotal); return v ? `${v}%` : '—' } },
    { label: 'Nota',     metric: p => n0(p.rating),                        format: p => (p.rating != null ? p.rating.toFixed(2) : '—') },
  ],
  // Transfer info — age, market value, minutes, PJ (value-style comparison)
  transfer: [
    { label: 'Edad',     metric: p => n0(p.age),                           format: p => n0(p.age) },
    { label: 'Valor',    metric: p => marketValueM(p),                     format: p => p.marketValue ?? '—' },
    { label: 'Minutos',  metric: p => n0(p.minutes),                       format: p => p.minutes ?? '—' },
    { label: 'PJ',       metric: p => n0(p.pj),                            format: p => n0(p.pj) },
  ],
}

const STAT_SET_LABELS: Record<'es' | 'en', Record<StatSetId, string>> = {
  es: { pct: 'Percentil', compare: 'Comparativa', fw: 'Delantero', mf: 'Centrocampista', df: 'Defensa', transfer: 'Transfer info' },
  en: { pct: 'Percentile', compare: 'Comparison', fw: 'Forward', mf: 'Midfielder', df: 'Defender', transfer: 'Transfer info' },
}

const STAT_SET_ORDER: StatSetId[] = ['pct', 'compare', 'fw', 'mf', 'df', 'transfer']

function defaultSetForPosition(_pos?: Position): StatSetId {
  // Default to the cross-position "Comparativa" set (G/PJ, A/PJ, regates,
  // balones perdidos) regardless of position. Users can still switch to the
  // position-specific sets via the segmented control.
  void _pos
  return 'compare'
}

interface PlayerSelectorProps {
  label: string
  selected: EnrichedPlayer | null
  onSelect: (p: EnrichedPlayer | null) => void
  isLight: boolean
}

function PlayerSelector({ label, selected, onSelect, isLight }: PlayerSelectorProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const textMuted = isLight ? '#8a7f68' : C_DARK.mu
  const textMain = isLight ? '#1c1608' : C_DARK.tx
  const inputBg = isLight ? '#ffffff' : C_DARK.s2
  const inputBorder = isLight ? '#e6dfce' : C_DARK.bd
  const dropdownBg = isLight ? '#ffffff' : '#15130f'
  const dropdownBorder = isLight ? '#e6dfce' : C_DARK.bd
  const rowHoverBg = isLight ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.05)'
  const emptyCardBg = isLight ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.02)'
  const emptyCardBorder = isLight ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.1)'

  // Search hits come from /api/search (covers ALL first-division players, not
  // just the minutes-capped local dataset → Julián Álvarez, rotation players…).
  const [hits, setHits] = useState<SearchHit[]>([])
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setHits([]); return }
    let cancel = false
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(j => { if (!cancel && j.ok) setHits((j.players ?? []).slice(0, 8)) })
        .catch(() => {})
    }, 180)
    return () => { cancel = true; clearTimeout(t) }
  }, [query])
  const filtered = hits

  async function selectPlayer(hit: SearchHit) {
    setQuery(''); setHits([]); setOpen(false)
    // Player in the rich local dataset → use it directly (multi-season, full stats).
    const local = ALL_PLAYERS.find(p => playerSlug(p) === hit.slug)
    if (local) { onSelect(local); return }
    // Otherwise load live by API id (parsed from the `name-<id>` slug).
    const m = hit.slug.match(/-(\d+)$/)
    if (!m) return
    try {
      const j = await fetch(`/api/player?id=${m[1]}`).then(r => r.json())
      if (j.ok && j.player) onSelect(enrich(j.player))
    } catch { /* ignore */ }
  }

  const accent = selected ? posAccent(selected.position) : C_DARK.gd

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: textMuted, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {label}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          style={{
            width: '100%', boxSizing: 'border-box' as const,
            background: inputBg, border: `1px solid ${inputBorder}`,
            color: textMain, fontSize: 13, padding: '8px 12px', borderRadius: 4, outline: 'none',
          }}
        />
        {open && filtered.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: dropdownBg, border: `1px solid ${dropdownBorder}`, borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,.2)', overflow: 'hidden', marginTop: 4,
          }}>
            {filtered.map(p => (
              <button
                key={p.slug}
                onMouseDown={() => selectPlayer(p)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left' as const, color: textMain, fontSize: 13,
                  borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.04)'}`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = rowHoverBg }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                {/* Uniform row: reserved flag column + photo + name + club + position */}
                <span style={{ width: 16, flexShrink: 0, textAlign: 'center', fontSize: 13, lineHeight: 1 }} aria-hidden>{p.flag ?? '🏳️'}</span>
                <Avatar name={p.name} photo={p.photo} size={22} />
                {/* Name takes priority for space; the club (less critical) is the
                    one that truncates, so full player names show whenever possible. */}
                <span style={{ flex: 1, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: textMuted, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, maxWidth: 92 }}>
                  <ClubLogo club={p.club} size={14} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{p.club}</span>
                </span>
                {p.pos && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: posAccent(p.pos as Position), background: `${posAccent(p.pos as Position)}22`, padding: '2px 5px', borderRadius: 3, flexShrink: 0 }}>
                    {p.pos}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected card */}
      {selected ? (
        <div style={{
          padding: 16, borderRadius: 6, background: `${accent}08`,
          border: `1px solid ${accent}44`, position: 'relative',
        }}>
          <button
            onClick={() => onSelect(null)}
            style={{
              position: 'absolute', top: 8, right: 8, background: 'none', border: 'none',
              color: textMuted, cursor: 'pointer', fontSize: 14, lineHeight: 1,
            }}
          >✕</button>
          {/* Photo on top, then name, then club row */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
            <Avatar name={selected.name} photo={selected.photo} size={72} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 21, fontWeight: 700, color: textMain, letterSpacing: 0.3, lineHeight: 1.1 }}>
              {selected.flag ? `${selected.flag} ` : ''}{selected.name}
            </div>
            <div style={{ fontSize: 12, color: textMuted, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              <ClubLogo club={selected.club} />
              <span>{selected.club}</span>
              {selected.position && (
                <span style={{ fontWeight: 700, color: accent }}>{selected.position}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: 16, borderRadius: 6, background: emptyCardBg,
          border: `1px dashed ${emptyCardBorder}`, textAlign: 'center' as const,
          color: textMuted, fontSize: 13,
        }}>
          Ningún jugador seleccionado
        </div>
      )}
    </div>
  )
}

interface StatRowProps {
  label: string
  a: number | string
  b: number | string
  accentA: string
  accentB: string
  isLight: boolean
}

function StatRow({ label, a, b, accentA, accentB, isLight }: StatRowProps) {
  const numA = typeof a === 'number' ? a : parseFloat(a as string) || 0
  const numB = typeof b === 'number' ? b : parseFloat(b as string) || 0
  const aWins = numA > numB
  const bWins = numB > numA
  const textMuted = isLight ? '#8a7f68' : C_DARK.mu
  const textMain = isLight ? '#1c1608' : C_DARK.tx
  const rowBorder = isLight ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.04)'
  return (
    <tr style={{ borderBottom: `1px solid ${rowBorder}` }}>
      <td style={{ padding: '8px 12px', fontSize: 12, color: textMuted, fontWeight: 600 }}>{label}</td>
      <td style={{ padding: '8px 12px', textAlign: 'right' as const, fontSize: 14, fontWeight: 700, color: aWins ? accentA : textMain }}>{a}</td>
      <td style={{ padding: '8px 12px', textAlign: 'right' as const, fontSize: 14, fontWeight: 700, color: bWins ? accentB : textMain }}>{b}</td>
    </tr>
  )
}

// Season picker — shown only when the selected player has >1 season of data.
// Switches which season's stats feed the radar/breakdown (identity stays the
// same, so the URL slug doesn't change).
function SeasonPicker({ selected, onPick, es, isLight }: {
  selected: EnrichedPlayer | null
  onPick: (p: EnrichedPlayer) => void
  es: boolean
  isLight: boolean
}) {
  // Full real career fetched on demand (every season from API-Football), so we
  // aren't limited to the bundled seasons (e.g. Messi's PSG / Inter Miami years).
  const [career, setCareer] = useState<Array<Record<string, unknown> & { season: string; club: string }>>([])
  useEffect(() => {
    setCareer([])
    const id = selected?.apiId
    if (!id) return
    let cancel = false
    fetch(`/api/player-career?id=${id}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok && Array.isArray(j.data)) setCareer(j.data) })
      .catch(() => {})
    return () => { cancel = true }
  }, [selected?.apiId])

  if (!selected) return null

  // Merge: bundled static seasons first, then real career (overrides → real data).
  const byKey = new Map<string, { season: string; club: string; row: EnrichedPlayer }>()
  for (const r of seasonsForPlayer(selected)) {
    byKey.set(r.season, { season: r.season, club: r.club, row: enrich(r) })
  }
  for (const c of career) {
    const merged = { ...selected, ...c } as unknown as Parameters<typeof enrich>[0]
    byKey.set(c.season, { season: c.season, club: c.club, row: enrich(merged) })
  }
  const options = [...byKey.values()].sort((a, b) => Number(b.season) - Number(a.season))
  if (options.length <= 1) return null

  const fmtSeason = (s: string) => (s.length === 4 ? `${s.slice(0, 2)}/${s.slice(2)}` : s)
  const value = options.find(o => o.season === selected.season)?.season ?? options[0].season

  return (
    <select
      value={value}
      onChange={e => { const o = options.find(x => x.season === e.target.value); if (o) onPick(o.row) }}
      aria-label={es ? 'Temporada' : 'Season'}
      style={{
        width: '100%', maxWidth: 280, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
        background: isLight ? '#ffffff' : C_DARK.s2, color: isLight ? '#1c1608' : C_DARK.tx,
        border: `1px solid ${isLight ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.12)'}`,
        fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
      }}
    >
      {options.map(o => (
        <option key={o.season} value={o.season}>{fmtSeason(o.season)} · {o.club}</option>
      ))}
    </select>
  )
}

export default function ComparadorClient() {
  const { theme } = useTheme()
  const { lang } = useLang()
  const { user, isLoaded } = useUser()
  const isLight = theme === 'light'
  const searchParams = useSearchParams()
  const router = useRouter()
  // Pro-only feature (pricing promises so)
  const proUser = isLoaded ? isPro(user?.publicMetadata as Record<string, unknown>) : false
  const es = lang === 'es'

  const [playerA, setPlayerA] = useState<EnrichedPlayer | null>(null)
  const [playerB, setPlayerB] = useState<EnrichedPlayer | null>(null)
  // Stat set driving the comparison radar. Defaults to player A's position;
  // user touching the selector locks their choice (won't auto-flip after that).
  const [statSet, setStatSet] = useState<StatSetId>('compare')
  const [statSetTouched, setStatSetTouched] = useState(false)
  // Share UX: brief "Copied" toast after clipboard fallback (Web Share API has
  // its own native sheet, so it needs no toast).
  const [shareCopied, setShareCopied] = useState(false)

  // Per-position percentile radars (handoff schema: Understat + API-Football).
  type RadarResp = { position: string; leagueHasUnderstat: boolean; axes: { axisId: string; label: string; labelEn?: string; percentile: number | null; isProxy: boolean }[]; understat?: { xG: number; npxG: number; xA: number; keyPasses: number } | null }
  const [radarA, setRadarA] = useState<RadarResp | null>(null)
  const [radarB, setRadarB] = useState<RadarResp | null>(null)
  useEffect(() => {
    setRadarA(null); const id = playerA?.apiId; if (!id) return
    let c = false; fetch(`/api/player-radar?id=${id}`).then(r => r.json()).then(j => { if (!c && j.ok) setRadarA(j) }).catch(() => {})
    return () => { c = true }
  }, [playerA?.apiId])
  useEffect(() => {
    setRadarB(null); const id = playerB?.apiId; if (!id) return
    let c = false; fetch(`/api/player-radar?id=${id}`).then(r => r.json()).then(j => { if (!c && j.ok) setRadarB(j) }).catch(() => {})
    return () => { c = true }
  }, [playerB?.apiId])

  const pageBg = isLight ? '#faf8f2' : '#0a0908'
  const textMuted = isLight ? '#8a7f68' : C_DARK.mu
  const cardBg = isLight ? 'rgba(255,255,255,.9)' : C_DARK.bg
  const cardBorder = isLight ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.07)'
  const presetBg = isLight ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.03)'
  const presetBorder = isLight ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.09)'
  const presetHoverBg = isLight ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.07)'
  const presetHoverBorder = isLight ? `${C_DARK.gd}44` : `${C_DARK.gd}44`
  const textPreset = isLight ? '#1c1608' : C_DARK.tx

  // Load from URL params on mount. Accept ?a=/?b= (canonical) and also
  // ?p1=/?p2= (deep-link from player profile CTA).
  useEffect(() => {
    let cancel = false
    const load = async (slug: string, set: (p: EnrichedPlayer) => void) => {
      const found = ALL_PLAYERS.find(p => playerSlug(p) === slug)
      if (found) { set(found); return }
      const m = slug.match(/-(\d+)$/)
      if (!m) return
      try {
        const j = await fetch(`/api/player?id=${m[1]}`).then(r => r.json())
        if (!cancel && j.ok && j.player) set(enrich(j.player))
      } catch { /* ignore */ }
    }
    const slugA = searchParams.get('a') ?? searchParams.get('p1')
    const slugB = searchParams.get('b') ?? searchParams.get('p2')
    if (slugA) load(slugA, setPlayerA)
    if (slugB) load(slugB, setPlayerB)
    return () => { cancel = true }
  }, [searchParams])

  // Default the stat-set selector to player A's position — until the user
  // manually picks one (then we respect their choice).
  useEffect(() => {
    if (statSetTouched) return
    // Default to the per-position percentile radar when both players have ids;
    // otherwise fall back to player A's position stat set.
    if (playerA?.apiId && playerB?.apiId) setStatSet('pct')
    else if (playerA) setStatSet(defaultSetForPosition(playerA.position))
  }, [playerA, playerB, statSetTouched])

  // Update URL when players change
  function selectA(p: EnrichedPlayer | null) {
    setPlayerA(p)
    const params = new URLSearchParams(searchParams.toString())
    if (p) params.set('a', playerSlug(p))
    else params.delete('a')
    router.replace(`/estadisticas/comparador?${params.toString()}`, { scroll: false })
  }

  function selectB(p: EnrichedPlayer | null) {
    setPlayerB(p)
    const params = new URLSearchParams(searchParams.toString())
    if (p) params.set('b', playerSlug(p))
    else params.delete('b')
    router.replace(`/estadisticas/comparador?${params.toString()}`, { scroll: false })
  }

  function applyPreset(preset: { a: string; b: string }) {
    const pA = findPlayerByName(preset.a)
    const pB = findPlayerByName(preset.b)
    setPlayerA(pA)
    setPlayerB(pB)
    const params = new URLSearchParams()
    if (pA) params.set('a', playerSlug(pA))
    if (pB) params.set('b', playerSlug(pB))
    router.replace(`/estadisticas/comparador?${params.toString()}`, { scroll: false })
  }

  // Share the current comparison: native Web Share sheet when available, else
  // copy the URL to the clipboard with a brief "Copied/Copiado" toast.
  async function handleShare() {
    if (typeof window === 'undefined') return
    const url = window.location.href
    const title = playerA && playerB ? `${playerA.name} vs ${playerB.name} — TopScorers` : 'TopScorers'
    if (navigator.share) {
      try { await navigator.share({ title, url }); return } catch { /* user cancelled / unsupported */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch { /* clipboard blocked — no-op */ }
  }

  const accentA = posAccent(playerA?.position)
  const accentB = posAccent(playerB?.position)
  const bothSelected = !!playerA && !!playerB

  // Radar uses brand palette (gold A / teal B) regardless of position so the
  // overlap reads cleanly. accentA/accentB stay for the per-player selector cards.
  const RADAR_A = 'var(--ts-primary)'
  const RADAR_B = 'var(--ts-teal)'

  // Build relative/proportional axes for the chosen stat set. Each axis is
  // normalized by the MAX of the two players on that axis → leader hits 100%.
  const radarAxes: ComparisonAxis[] = useMemo(() => {
    if (!playerA || !playerB) return []
    // Per-position percentile radar (both players overlaid on a 0–100 scale).
    if (statSet === 'pct') {
      if (!radarA || !radarB || radarA.position !== radarB.position) return []
      const bMap = new Map(radarB.axes.map(a => [a.axisId, a]))
      return radarA.axes
        .map(a => {
          const b = bMap.get(a.axisId)
          if (a.percentile == null || !b || b.percentile == null) return null
          const axisLabel = es ? a.label : (a.labelEn ?? a.label)
          return {
            label: axisLabel + (a.isProxy || b.isProxy ? ' *' : ''),
            aVal: a.percentile, bVal: b.percentile, aPct: a.percentile, bPct: b.percentile,
          } as ComparisonAxis
        })
        .filter((x): x is ComparisonAxis => x !== null)
    }
    return STAT_SETS[statSet].map(def => {
      const aRaw = def.metric(playerA)
      const bRaw = def.metric(playerB)
      const max = Math.max(aRaw, bRaw, 1)
      // Normalize relative to the max of the two players (relative radar).
      // For `invert` axes (e.g. balones perdidos, where LOWER is better) we
      // flip with (max - value) / max so the player who loses FEWER balls gets
      // the LARGER area — i.e. fewer losses reads as "better" on the polygon.
      // Larger raw value still shows as the real number on the vertex label.
      const aPct = def.invert ? ((max - aRaw) / max) * 100 : (aRaw / max) * 100
      const bPct = def.invert ? ((max - bRaw) / max) * 100 : (bRaw / max) * 100
      return {
        label: (es ? def.label : (def.labelEn ?? def.label)),
        aVal: def.format(playerA),
        bVal: def.format(playerB),
        aPct,
        bPct,
      }
    })
  }, [playerA, playerB, statSet, es, radarA, radarB])

  // Note: comparator is now free (was Pro-only). proUser kept for future Pro perks.
  void proUser

  return (
    <div style={{ minHeight: '100vh', background: pageBg, paddingBottom: 80 }}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 0' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 7vw, 64px)',
            color: C_DARK.gd, letterSpacing: 3, lineHeight: 1, margin: 0,
            textTransform: 'uppercase' as const, fontWeight: 700,
          }}>
            Comparador
          </h1>
          <p style={{ color: textMuted, fontSize: 14, marginTop: 10 }}>
            Elige dos jugadores para comparar su perfil de atributos
          </p>
        </div>

        {/* Selectors */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 40, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <PlayerSelector label="Jugador A" selected={playerA} onSelect={selectA} isLight={isLight} />
            <SeasonPicker selected={playerA} onPick={setPlayerA} es={es} isLight={isLight} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: textMuted, fontSize: 18, fontWeight: 700, alignSelf: 'center' }}>
            VS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <PlayerSelector label="Jugador B" selected={playerB} onSelect={selectB} isLight={isLight} />
            <SeasonPicker selected={playerB} onPick={setPlayerB} es={es} isLight={isLight} />
          </div>
        </div>

        {/* Save comparison button — shown when both selected */}
        {bothSelected && (
          <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 20 }}>
            <button
              onClick={async () => {
                if (!isLoaded) return
                if (!user) {
                  alert(lang === 'es' ? 'Inicia sesión para guardar comparaciones.' : 'Sign in to save comparisons.')
                  return
                }
                const name = prompt(lang === 'es' ? 'Nombre para esta comparación (opcional):' : 'Name for this comparison (optional):', `${playerA.name} vs ${playerB.name}`)
                if (name === null) return
                const r = await fetch('/api/comparisons', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, player_names: [playerA.name, playerB.name], season: playerA.season }),
                })
                if (r.status === 409) {
                  alert(lang === 'es' ? 'Has alcanzado el límite gratis (5). Pásate a Pro para guardar ilimitadas.' : 'You hit the free cap (5). Upgrade to Pro for unlimited.')
                } else if (r.ok) {
                  alert(lang === 'es' ? '✓ Comparación guardada' : '✓ Comparison saved')
                } else if (r.status === 401) {
                  alert(lang === 'es' ? 'Inicia sesión para guardar comparaciones.' : 'Sign in to save comparisons.')
                } else {
                  alert(lang === 'es' ? 'No se pudo guardar.' : 'Could not save.')
                }
              }}
              style={{
                background: 'transparent', color: C_DARK.gd,
                border: `1px solid ${C_DARK.gd}66`,
                padding: '6px 16px', borderRadius: 999,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: 0.6, textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              ⭐ {lang === 'es' ? 'Guardar comparación' : 'Save comparison'}
            </button>
          </div>
        )}

        {/* Comparison sections — shown when both selected.
            Layout order (user-requested): the per-player headers live in the
            selectors above (photo + name + team logo); then the overlapping
            comparative RADAR; then the detailed per-stat breakdown (VersusCard)
            and the stats table. Radar sits ABOVE the breakdown. */}
        {bothSelected && (
          <>
            {/* Overlapping comparison radar + stat-set selector — ON TOP */}
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: 20, marginBottom: 32 }}>
              {/* Segmented control */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <div style={{
                  display: 'inline-flex', flexWrap: 'wrap' as const, justifyContent: 'center',
                  gap: 4, padding: 4, borderRadius: 999,
                  background: presetBg, border: `1px solid ${presetBorder}`,
                }}>
                  {STAT_SET_ORDER.map(id => {
                    const active = statSet === id
                    return (
                      <button
                        key={id}
                        onClick={() => { setStatSet(id); setStatSetTouched(true) }}
                        style={{
                          background: active ? C_DARK.gd : 'transparent',
                          color: active ? '#1c1608' : textMuted,
                          border: 'none', cursor: 'pointer',
                          padding: '6px 14px', borderRadius: 999,
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 13, fontWeight: 700, letterSpacing: 0.4,
                          textTransform: 'uppercase' as const,
                          transition: 'all 150ms ease',
                        }}
                      >
                        {STAT_SET_LABELS[es ? 'es' : 'en'][id]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {statSet === 'transfer' ? (
                /* Transfer info — clean key-value comparison table */
                <div style={{ maxWidth: 520, margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 12px', borderBottom: `1px solid ${cardBorder}` }}>
                    <span style={{ flex: 1, textAlign: 'right' as const, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: RADAR_A }}>{playerA.name}</span>
                    <span style={{ width: 120, textAlign: 'center' as const, fontSize: 11, color: textMuted }}> </span>
                    <span style={{ flex: 1, textAlign: 'left' as const, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: RADAR_B }}>{playerB.name}</span>
                  </div>
                  {radarAxes.map(ax => (
                    <div key={ax.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${cardBorder}` }}>
                      <span style={{ flex: 1, textAlign: 'right' as const, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: textPreset }}>{ax.aVal}</span>
                      <span style={{ width: 120, textAlign: 'center' as const, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: textMuted, fontFamily: "'Barlow Condensed', sans-serif" }}>{ax.label}</span>
                      <span style={{ flex: 1, textAlign: 'left' as const, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: textPreset }}>{ax.bVal}</span>
                    </div>
                  ))}
                </div>
              ) : statSet === 'pct' && radarAxes.length < 3 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', fontSize: 13, color: textMuted }}>
                  {!radarA || !radarB
                    ? (es ? 'Cargando radar por percentiles…' : 'Loading percentile radar…')
                    : (es ? 'El radar por percentiles requiere dos jugadores de la misma posición. Usa otra pestaña para comparar posiciones distintas.' : 'The percentile radar needs two players of the same position. Use another tab to compare different positions.')}
                </div>
              ) : (
                <>
                  <ComparisonRadar
                    axes={radarAxes}
                    colorA={RADAR_A}
                    colorB={RADAR_B}
                    labelA={playerA.name}
                    labelB={playerB.name}
                    size={360}
                  />
                  {statSet === 'pct' && (
                    <p style={{ textAlign: 'center', fontSize: 11, color: textMuted, marginTop: 8 }}>
                      {es ? 'Percentil 0–100 vs su posición en la liga · ' : 'Percentile 0–100 vs position in league · '}<span style={{ color: 'var(--ts-primary)' }}>* {es ? 'eje aproximado' : 'approximated axis'}</span>
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Head-to-head VERSUS card (real metrics + shareable) — BELOW radar */}
            <VersusCard a={playerA} b={playerB} es={lang === 'es'} />

            {/* Share this comparison (Web Share API → clipboard fallback) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
              <button
                type="button"
                onClick={handleShare}
                aria-label={es ? 'Compartir comparación' : 'Share comparison'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  minHeight: 44, padding: '0 18px', borderRadius: 8, cursor: 'pointer',
                  background: 'var(--ts-primary)', color: '#0a0908',
                  border: '1px solid var(--ts-primary)',
                  fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  transition: 'opacity 150ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                {shareCopied ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                )}
                {shareCopied
                  ? (es ? 'Copiado' : 'Copied')
                  : (es ? 'Compartir' : 'Share')}
              </button>
            </div>

            {/* Stats comparison table */}
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 8, marginBottom: 40, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: textMuted }}>
                  Estadísticas
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: accentA }}>{playerA.name}</span>
                <span style={{ margin: '0 12px', fontSize: 11, color: textMuted }}>vs</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: accentB }}>{playerB.name}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <tbody>
                  <StatRow label="Goles"   a={playerA.goles}                  b={playerB.goles}                  accentA={accentA} accentB={accentB} isLight={isLight} />
                  <StatRow label="Asist."  a={playerA.asist}                  b={playerB.asist}                  accentA={accentA} accentB={accentB} isLight={isLight} />
                  <StatRow label="PJ"      a={playerA.pj}                     b={playerB.pj}                     accentA={accentA} accentB={accentB} isLight={isLight} />
                  <StatRow label="G/PJ"    a={playerA.ratio_g.toFixed(2)}     b={playerB.ratio_g.toFixed(2)}     accentA={accentA} accentB={accentB} isLight={isLight} />
                  <StatRow label="A/PJ"    a={playerA.ratio_a.toFixed(2)}     b={playerB.ratio_a.toFixed(2)}     accentA={accentA} accentB={accentB} isLight={isLight} />
                  <StatRow label="Val+"    a={playerA.val_con}                 b={playerB.val_con}                 accentA={accentA} accentB={accentB} isLight={isLight} />
                  <StatRow label="ELO"     a={playerA.elo ?? '—'}             b={playerB.elo ?? '—'}             accentA={accentA} accentB={accentB} isLight={isLight} />
                  <StatRow label="Fantasy" a={playerA.fantasyPoints ?? '—'}   b={playerB.fantasyPoints ?? '—'}   accentA={accentA} accentB={accentB} isLight={isLight} />
                  {radarA?.understat && radarB?.understat && (
                    <>
                      <StatRow label="xG"   a={radarA.understat.xG.toFixed(1)}   b={radarB.understat.xG.toFixed(1)}   accentA={accentA} accentB={accentB} isLight={isLight} />
                      <StatRow label="npxG" a={radarA.understat.npxG.toFixed(1)} b={radarB.understat.npxG.toFixed(1)} accentA={accentA} accentB={accentB} isLight={isLight} />
                      <StatRow label="xA"   a={radarA.understat.xA.toFixed(1)}   b={radarB.understat.xA.toFixed(1)}   accentA={accentA} accentB={accentB} isLight={isLight} />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Popular matchups */}
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: textMuted, marginBottom: 12 }}>
            Comparaciones populares
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            {PRESETS.map(p => (
              <button
                key={`${p.a}-${p.b}`}
                onClick={() => applyPreset(p)}
                style={{
                  background: presetBg, border: `1px solid ${presetBorder}`,
                  color: textPreset, fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 4, cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = presetHoverBg; (e.currentTarget as HTMLElement).style.borderColor = presetHoverBorder }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = presetBg; (e.currentTarget as HTMLElement).style.borderColor = presetBorder }}
              >
                {p.a} <span style={{ color: textMuted }}>vs</span> {p.b}
              </button>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 48, textAlign: 'center' as const }}>
          <Link
            href="/"
            style={{ color: C_DARK.gd, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C_DARK.gd}33`, padding: '8px 16px', borderRadius: 4, background: `${C_DARK.gd}08` }}
          >
            ← Volver a estadísticas
          </Link>
        </div>

      </main>
    </div>
  )
}
