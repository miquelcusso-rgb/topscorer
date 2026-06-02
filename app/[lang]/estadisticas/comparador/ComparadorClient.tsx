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
  gd: '#f0c040', pu: '#a060ff', te: '#00c8b0', bl: '#4090ff', or: '#e05a30',
  tx: '#e5e5f2', mu: '#5a5a7a', bd: '#1e1e34', sf: '#0e0e1c', s2: '#151528',
  bg: 'rgba(7,14,26,.90)',
}

function posAccent(pos?: string): string {
  if (pos === 'FW') return C_DARK.gd
  if (pos === 'MF') return C_DARK.pu
  if (pos === 'DF') return C_DARK.bl
  if (pos === 'GK') return C_DARK.or
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
type StatSetId = 'compare' | 'fw' | 'mf' | 'df' | 'transfer'

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
  es: { compare: 'Comparativa', fw: 'Delantero', mf: 'Centrocampista', df: 'Defensa', transfer: 'Transfer info' },
  en: { compare: 'Comparison', fw: 'Forward', mf: 'Midfielder', df: 'Defender', transfer: 'Transfer info' },
}

const STAT_SET_ORDER: StatSetId[] = ['compare', 'fw', 'mf', 'df', 'transfer']

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

  const textMuted = isLight ? '#5060a0' : C_DARK.mu
  const textMain = isLight ? '#0f1830' : C_DARK.tx
  const inputBg = isLight ? '#ffffff' : C_DARK.s2
  const inputBorder = isLight ? '#c8d0e8' : C_DARK.bd
  const dropdownBg = isLight ? '#ffffff' : '#0b1220'
  const dropdownBorder = isLight ? '#c8d0e8' : C_DARK.bd
  const rowHoverBg = isLight ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.05)'
  const emptyCardBg = isLight ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.02)'
  const emptyCardBorder = isLight ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.1)'

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    // Accent-insensitive so "vitinha" matches "Vítinha", "ode" matches "Ödegaard", etc.
    const strip = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const q = strip(query.trim())
    return ALL_PLAYERS.filter(p =>
      strip(p.name).includes(q) ||
      (p.fullName ? strip(p.fullName).includes(q) : false) ||
      strip(p.club).includes(q)
    ).slice(0, 8)
  }, [query])

  function selectPlayer(p: EnrichedPlayer) {
    onSelect(p)
    setQuery('')
    setOpen(false)
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
                key={p.name}
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
                {p.flag && <span>{p.flag}</span>}
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: textMuted, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClubLogo club={p.club} size={14} />
                  {p.club}
                </span>
                {p.position && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: posAccent(p.position), background: `${posAccent(p.position)}22`, padding: '2px 5px', borderRadius: 3 }}>
                    {p.position}
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
  const textMuted = isLight ? '#5060a0' : C_DARK.mu
  const textMain = isLight ? '#0f1830' : C_DARK.tx
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
        background: isLight ? '#ffffff' : C_DARK.s2, color: isLight ? '#0f1830' : C_DARK.tx,
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

  const pageBg = isLight ? '#edf1f8' : '#07070f'
  const textMuted = isLight ? '#5060a0' : C_DARK.mu
  const cardBg = isLight ? 'rgba(255,255,255,.9)' : C_DARK.bg
  const cardBorder = isLight ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.07)'
  const presetBg = isLight ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.03)'
  const presetBorder = isLight ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.09)'
  const presetHoverBg = isLight ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.07)'
  const presetHoverBorder = isLight ? `${C_DARK.gd}44` : `${C_DARK.gd}44`
  const textPreset = isLight ? '#0f1830' : C_DARK.tx

  // Load from URL params on mount. Accept ?a=/?b= (canonical) and also
  // ?p1=/?p2= (deep-link from player profile CTA).
  useEffect(() => {
    const slugA = searchParams.get('a') ?? searchParams.get('p1')
    const slugB = searchParams.get('b') ?? searchParams.get('p2')
    if (slugA) {
      const found = ALL_PLAYERS.find(p => playerSlug(p) === slugA)
      if (found) setPlayerA(found)
    }
    if (slugB) {
      const found = ALL_PLAYERS.find(p => playerSlug(p) === slugB)
      if (found) setPlayerB(found)
    }
  }, [searchParams])

  // Default the stat-set selector to player A's position — until the user
  // manually picks one (then we respect their choice).
  useEffect(() => {
    if (statSetTouched || !playerA) return
    setStatSet(defaultSetForPosition(playerA.position))
  }, [playerA, statSetTouched])

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
  }, [playerA, playerB, statSet, es])

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
              ) : (
                <ComparisonRadar
                  axes={radarAxes}
                  colorA={RADAR_A}
                  colorB={RADAR_B}
                  labelA={playerA.name}
                  labelB={playerB.name}
                  size={360}
                />
              )}
            </div>

            {/* Head-to-head VERSUS card (real metrics + shareable) — BELOW radar */}
            <VersusCard a={playerA} b={playerB} es={lang === 'es'} />

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
