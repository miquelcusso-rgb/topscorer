'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
import { t } from '@/lib/i18n'
import type { Tab, PanelState, SortKey, Season, PlayerData } from '@/types'
import { PLAYERS } from '@/data/players'
import { getPool, buildTopN, makeSortFn } from '@/lib/utils'
import { isPro, FREE_ROW_LIMIT, FREE_SEASONS } from '@/lib/plans'
import { CURRENT_SEASON_CODE, CURRENT_SEASON_SHORT } from '@/lib/season'
import { exportPlayersCSV } from '@/lib/export-csv'
import StatsTable from './StatsTable'
import SearchInput from './SearchInput'
import WatchlistPanel, { type WatchlistEntry } from './WatchlistPanel'
import AdSlot from './AdSlot'

const DEFAULT: PanelState = {
  season: CURRENT_SEASON_CODE as Season,
  age: 99,
  showEsp: true,
  showEng: true,
  showGer: true,
  showIta: true,
  showFra: true,
  showPt: false,
  showTr: false,
  showGr: false,
  show2nd: false,
  showEuro: false,
  sort: 'val_sin',
  dir: -1,
  pinned: {},
  showElo: false,
  showFantasy: false,
  showTop50: false,
  showPj: true,
  showRatios: true,
  showValCoef: true,
  showValSin: true,
}

const DEFAULT_ASSIST: PanelState = { ...DEFAULT, sort: 'asist' }

interface Props { tab: Tab; initialPlayers?: PlayerData[] }

// Full season history goes back to 2010/11. Older seasons (without static data
// loaded) fetch live from API-Football on demand and cache for 1h via
// unstable_cache. With Plan B+, ALL seasons are free.
const SEASONS: { id: Season; label: string; live?: boolean; proOnly?: boolean }[] = [
  { id: CURRENT_SEASON_CODE as Season, label: CURRENT_SEASON_SHORT, live: true },
  { id: '2425', label: '24/25' },
  { id: '2324', label: '23/24' },
  { id: '2223', label: '22/23' },
  { id: '2122', label: '21/22' },
  { id: '2021', label: '20/21' },
  { id: '1920', label: '19/20' },
  { id: '1819', label: '18/19' },
  { id: '1718', label: '17/18' },
  { id: '1617', label: '16/17' },
  { id: '1516', label: '15/16' },
  { id: '1415', label: '14/15' },
  { id: '1314', label: '13/14' },
  { id: '1213', label: '12/13' },
  { id: '1112', label: '11/12' },
  { id: '1011', label: '10/11' },
]

const AGES = [
  { v: 18, label: 'U18', proOnly: true },
  { v: 21, label: 'U21', proOnly: true },
  { v: 24, label: 'U24' },
  { v: 27, label: 'U27', proOnly: true },
  { v: 30, label: 'U30', proOnly: true },
  { v: 99, label: 'Todos' },
]

function Pill({
  active, color = 'gd', locked, children, onClick, isLight,
}: {
  active: boolean
  color?: 'gd' | 'bl' | 'gr' | 'mu' | 'pu'
  locked?: boolean
  children: React.ReactNode
  onClick: () => void
  isLight?: boolean
}) {
  const map = {
    gd: { bg: 'rgba(240,192,64,.12)', border: 'rgba(240,192,64,.45)', text: '#f0c040' },
    bl: { bg: 'rgba(0,200,176,.1)',   border: 'rgba(0,200,176,.4)',   text: '#00c8b0' },
    gr: { bg: 'rgba(56,196,122,.1)',  border: 'rgba(56,196,122,.4)',  text: '#38c47a' },
    mu: { bg: 'rgba(255,255,255,.06)',border: 'rgba(255,255,255,.16)',text: '#9090a8' },
    pu: { bg: 'rgba(0,200,176,.1)',  border: 'rgba(0,200,176,.4)',  text: '#00c8b0' },
  }
  const c = map[color]
  const inactiveStyle = isLight
    ? { background: 'rgba(232,228,218,.85)', border: '1px solid rgba(0,0,0,.12)', color: '#6a6356' }
    : { background: 'rgba(21,19,15,.7)', border: '1px solid rgba(255,255,255,.08)', color: '#9a917e' }
  const lockedStyle = isLight
    ? { background: 'rgba(225,220,208,.6)', border: '1px solid rgba(0,0,0,.08)', color: '#8a8275' }
    : { background: 'rgba(21,19,15,.7)', border: '1px solid rgba(255,255,255,.06)', color: '#6e6655' }
  return (
    <button
      data-active={active ? "true" : undefined}
      onClick={onClick}
      className="text-[12px] font-medium px-3 py-1 rounded transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1"
      style={active
        ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
        : locked
          ? lockedStyle
          : inactiveStyle
      }
    >
      {children}
    </button>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <span className="filter-label" style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '2px',
        textTransform: 'uppercase' as const,
        fontFamily: "'Barlow Condensed', sans-serif",
        color: '#6a6356',
      }}>
        {label}
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {children}
      </div>
    </div>
  )
}

function ProUpsellInline() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [showSticky, setShowSticky] = useState(false)

  // Light-mode-aware tokens
  const skelBar    = isLight ? '#cfd8ee' : '#1e1f35'
  const rowBorder  = isLight ? '#ece6d8' : '#2a2620'
  const rowAltBg   = isLight ? 'rgba(0,0,0,.025)' : 'rgba(255,255,255,.018)'
  const fadeTop    = isLight ? 'rgba(248,247,243,.9)' : 'rgba(10,9,8,.85)'
  const headColor  = isLight ? '#1a2236' : '#e8e0c0'
  const pillColor  = isLight ? '#8a6a00' : '#f0c040'
  const ghostNum   = isLight ? '#b5ab95' : '#3a3b50'
  const secLinkCol = isLight ? '#6a6356' : '#9a917e'
  const secLinkBd  = isLight ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.08)'
  const stickyBg   = isLight ? 'rgba(248,247,243,.97)' : 'rgba(10,9,8,.96)'
  const stickyText = isLight ? '#6e6655' : '#9a917e'

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* Sentinel div — marks end of free rows */}
      <div ref={sentinelRef} />

      {/* Ghost rows with blur */}
      <div
        className="relative overflow-hidden"
        style={{
          borderLeft: '1px solid rgba(240,192,64,.15)',
          borderRight: '1px solid rgba(240,192,64,.15)',
          borderTop: '1px solid rgba(240,192,64,.12)',
        }}
      >
        <div style={{ filter: 'blur(2.5px)', opacity: 0.22, pointerEvents: 'none', userSelect: 'none' }}>
          {[11, 12, 13, 14, 15].map((n, i) => (
            <div
              key={n}
              className="flex items-center gap-4 px-4"
              style={{
                borderBottom: `1px solid ${rowBorder}`,
                height: 40,
                background: i % 2 === 0 ? rowAltBg : 'transparent',
              }}
            >
              <span
                className="w-5 text-right shrink-0"
                style={{ fontSize: 13, color: ghostNum, fontFamily: "'Bebas Neue', cursive" }}
              >
                {n}
              </span>
              <div className="h-[6px] rounded-full" style={{ background: skelBar, width: `${110 - i * 12}px` }} />
              <div className="h-[6px] rounded-full w-12 shrink-0" style={{ background: skelBar }} />
              <div className="ml-auto h-[6px] rounded-full w-6 shrink-0" style={{ background: skelBar }} />
              <div className="h-[6px] rounded-full w-8 shrink-0" style={{ background: skelBar }} />
              <div className="h-[6px] rounded-full w-8 shrink-0" style={{ background: skelBar }} />
            </div>
          ))}
        </div>

        {/* Gradient fade */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: 60, background: `linear-gradient(180deg, ${fadeTop} 0%, transparent 100%)`, pointerEvents: 'none' }}
        />

        {/* Upsell overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4"
          style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(240,192,64,.04) 100%)' }}
        >
          {/* Headline */}
          <div className="text-center">
            <div
              className="font-bold mb-2"
              style={{ fontSize: 15, color: headColor, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.4 }}
            >
              🔒 Posiciones 11–25 desbloqueadas con Pro
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {['Top 25 jugadores', 'Todas las temporadas', 'Sin anuncios'].map(feat => (
                <span
                  key={feat}
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: 'rgba(240,192,64,.1)',
                    border: '1px solid rgba(240,192,64,.25)',
                    color: pillColor,
                    letterSpacing: 0.2,
                  }}
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 font-bold rounded-sm transition-all duration-150 cursor-pointer"
              style={{ fontSize: 12, padding: '8px 20px', background: '#f0c040', color: '#0a0908', boxShadow: '0 2px 18px rgba(240,192,64,.28)', borderRadius: 4 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8d060'; e.currentTarget.style.boxShadow = '0 4px 28px rgba(240,192,64,.45)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f0c040'; e.currentTarget.style.boxShadow = '0 2px 18px rgba(240,192,64,.28)' }}
            >
              Ver Precios →
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1 transition-all duration-150 cursor-pointer"
              style={{ fontSize: 11, padding: '7px 14px', background: 'transparent', color: secLinkCol, border: `1px solid ${secLinkBd}`, borderRadius: 4 }}
              onMouseEnter={e => { e.currentTarget.style.color = isLight ? '#1c1608' : '#c8bfa8'; e.currentTarget.style.borderColor = isLight ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.18)' }}
              onMouseLeave={e => { e.currentTarget.style.color = secLinkCol; e.currentTarget.style.borderColor = secLinkBd }}
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky CTA — mobile only, appears when user scrolls past free rows */}
      {showSticky && (
        <div
          className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-between gap-3 px-4 py-3"
          style={{
            background: stickyBg,
            borderTop: '1px solid rgba(240,192,64,.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span style={{ fontSize: 12, color: stickyText, lineHeight: 1.35 }}>
            Ver Top 25 completo —{' '}
            <span style={{ color: '#f0c040', fontWeight: 600 }}>Pro desde €2.99/mes</span>
          </span>
          <Link
            href="/pricing"
            className="shrink-0 font-bold rounded-sm"
            style={{ fontSize: 11, padding: '7px 14px', background: '#f0c040', color: '#0a0908', borderRadius: 4, whiteSpace: 'nowrap' }}
          >
            Activar Pro
          </Link>
        </div>
      )}
    </>
  )
}


export default function StatsPanel({ tab, initialPlayers }: Props) {
  const isAssist = tab === 'a'
  const [st, setSt] = useState<PanelState>(isAssist ? DEFAULT_ASSIST : DEFAULT)
  const { user, isLoaded } = useUser()
  const proUser = isLoaded ? isPro(user?.publicMetadata as Record<string, unknown>) : false
  const { theme } = useTheme()
  const { lang } = useLang()
  const isLight = theme === 'light'

  // Dynamic sort options (translated)
  const SCORER_SORTS: { key: SortKey; label: string }[] = [
    { key: 'val_sin', label: t('sort_val', lang) },
    { key: 'val_con', label: t('sort_val_plus', lang) },
    { key: 'goles',   label: t('sort_goals', lang) },
    { key: 'asist',   label: t('sort_assists', lang) },
    { key: 'ratio_g', label: t('sort_ratio_g', lang) },
    { key: 'ratio_a', label: t('sort_ratio_a', lang) },
    { key: 'age',     label: t('sort_age', lang) },
  ]

  const ASSIST_SORTS: { key: SortKey; label: string }[] = [
    { key: 'asist',   label: t('sort_assists', lang) },
    { key: 'ratio_a', label: t('sort_ratio_a', lang) },
    { key: 'goles',   label: t('sort_goals', lang) },
    { key: 'val_sin', label: t('sort_ga', lang) },
    { key: 'ratio_g', label: t('sort_ratio_g', lang) },
    { key: 'age',     label: t('sort_age', lang) },
  ]

  const [showMinG, setShowMinG] = useState(false)
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([])
  const [watchlistOpen, setWatchlistOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadWatchlist = useCallback(async () => {
    if (!proUser) return
    const res = await fetch('/api/watchlist')
    if (res.ok) setWatchlist(await res.json())
  }, [proUser])

  useEffect(() => { loadWatchlist() }, [loadWatchlist])

  async function handleWatchlistToggle(playerName: string) {
    const existing = watchlist.find(e => e.player_name === playerName && e.season === st.season && e.tab === tab)
    if (existing) {
      setWatchlist(prev => prev.filter(e => e.id !== existing.id))
      await fetch(`/api/watchlist?player_name=${encodeURIComponent(playerName)}&season=${st.season}&tab=${tab}`, { method: 'DELETE' })
    } else {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName, season: st.season, tab }),
      })
      if (res.ok) {
        const entry = await res.json()
        setWatchlist(prev => [entry, ...prev])
      }
    }
  }

  async function handleNoteChange(entry: WatchlistEntry, note: string) {
    setWatchlist(prev => prev.map(e => e.id === entry.id ? { ...e, note } : e))
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_name: entry.player_name, season: entry.season, tab: entry.tab, note }),
    })
  }

  async function handleWatchlistRemove(entry: WatchlistEntry) {
    setWatchlist(prev => prev.filter(e => e.id !== entry.id))
    await fetch(`/api/watchlist?player_name=${encodeURIComponent(entry.player_name)}&season=${entry.season}&tab=${entry.tab}`, { method: 'DELETE' })
  }

  const watchlistKeys = useMemo(
    () => new Set(watchlist.filter(e => e.season === st.season && e.tab === tab).map(e => e.player_name)),
    [watchlist, st.season, tab],
  )

  const [livePlayers, setLivePlayers] = useState<PlayerData[] | null>(initialPlayers ?? null)

  useEffect(() => {
    if (initialPlayers) return
    const extra = `${st.show2nd ? '&second=1' : ''}${st.showEuro ? '&euro=1' : ''}`
    Promise.all([
      fetch(`/api/players?tab=s&season=2025${extra}`).then(r => r.json()),
      fetch(`/api/players?tab=a&season=2025${extra}`).then(r => r.json()),
    ]).then(([scorers, assists]) => {
      if (scorers.ok && assists.ok) {
        setLivePlayers([...scorers.data, ...assists.data])
      }
    }).catch(() => {}) // silently fall back to static data
  }, [initialPlayers, st.show2nd, st.showEuro])

  const dataSource = livePlayers ?? PLAYERS
  const pool = useMemo(() => getPool(dataSource, tab), [dataSource, tab])

  function update(patch: Partial<PanelState>) {
    setSt(prev => ({ ...prev, ...patch }))
  }

  const rowLimit = proUser ? (st.showTop50 ? 50 : 25) : FREE_ROW_LIMIT
  const topN = useMemo(() => buildTopN(pool, st, rowLimit), [pool, st, rowLimit])

  const fillerCount = topN.filter(p => p.isFiller && !p.isPinned).length
  const metAge      = topN.filter(p => !p.isFiller || p.isPinned).length

  // CSV export with server-side monthly quota enforcement (Pro 50/mo, Scout ∞)
  const handleExportCSV = useCallback(async () => {
    if (exporting) return
    setExporting(true)
    try {
      const res = await fetch('/api/usage/export', { method: 'POST' })
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}))
        alert(body.error ?? 'Has alcanzado tu límite de exportaciones este mes.')
        return
      }
      if (!res.ok) {
        alert('No se pudo exportar. Inténtalo de nuevo.')
        return
      }
      exportPlayersCSV(topN.filter(p => !p.isFiller))
    } finally {
      setExporting(false)
    }
  }, [exporting, topN])

  const sorts = isAssist ? ASSIST_SORTS : SCORER_SORTS
  const eloSortOpt:  { key: SortKey; label: string } = { key: 'elo',          label: 'ELO'     }
  const fantSortOpt: { key: SortKey; label: string } = { key: 'fantasyPoints', label: 'Fantasy' }

  return (
    <div className="flex flex-col gap-0">

      {/* ── FILTER TOOLBAR ── */}
      <div
        className="filter-toolbar"
        style={{
          background: isLight ? 'rgba(248,247,243,.92)' : 'rgba(21,19,15,.92)',
          border: isLight ? '1px solid rgba(0,0,0,.1)' : '1px solid rgba(255,255,255,.07)',
          borderRadius: '8px 8px 0 0', backdropFilter: 'blur(8px)',
        }}
      >
        {/* Fila 1: filtros — Main groups row */}
        <div className="flex flex-wrap items-start gap-x-5 gap-y-3 px-4 pt-3.5 pb-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <FilterGroup label={t('filter_season', lang)}>
            {/* Dropdown — supports 16 seasons (25/26 down to 10/11) cleanly */}
            <select
              value={st.season}
              onChange={e => update({ season: e.target.value as Season, pinned: {} })}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                background: isLight
                  ? "rgba(240,192,64,.10) url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path d='M2 4l4 4 4-4' stroke='%23c8a830' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>\") no-repeat right 10px center / 10px"
                  : "rgba(240,192,64,.10) url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path d='M2 4l4 4 4-4' stroke='%23f0c040' stroke-width='1.5' fill='none' stroke-linecap='round'/></svg>\") no-repeat right 10px center / 10px",
                border: `1px solid ${isLight ? 'rgba(200,168,48,.35)' : 'rgba(240,192,64,.4)'}`,
                borderRadius: 4,
                color: isLight ? '#7a5c00' : '#f0c040',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5,
                textTransform: 'uppercase',
                padding: '5px 28px 5px 12px',
                cursor: 'pointer',
                outline: 'none',
              }}
              aria-label={t('filter_season', lang)}
            >
              {SEASONS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}{s.live ? ' · LIVE' : ''}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label={t('filter_league', lang)}>
            {/* TOP 5 shortcut */}
            {(() => {
              const allFive = st.showEsp && st.showEng && st.showGer && st.showIta && st.showFra
              const hasExtra = st.showPt || st.showTr || st.showGr
              const isTop5Only = allFive && !hasExtra
              return (
                <Pill active={isTop5Only} color="gr" isLight={isLight} onClick={() => {
                  // Select all 5, deselect extras
                  update({ showEsp: true, showEng: true, showGer: true, showIta: true, showFra: true, showPt: false, showTr: false, showGr: false })
                }}>Top 5</Pill>
              )
            })()}
            {/* Individual Big 5 */}
            {([
              { key: 'showEsp', label: 'ESP', c: '220,70,40'  },
              { key: 'showEng', label: 'ENG', c: '80,170,80'  },
              { key: 'showGer', label: 'GER', c: '220,50,50'  },
              { key: 'showIta', label: 'ITA', c: '60,110,220' },
              { key: 'showFra', label: 'FRA', c: '110,70,220' },
            ] as const).map(({ key, label, c }) => {
              const active = st[key]
              const count = ['showEsp','showEng','showGer','showIta','showFra','showPt','showTr','showGr'].filter(k => st[k as keyof typeof st]).length
              return (
                <button
                  key={key}
                  data-active={active ? "true" : undefined}
                  onClick={() => { if (active && count <= 1) return; update({ [key]: !active }) }}
                  className="text-[11px] font-bold px-2.5 py-1 rounded transition-all duration-150 cursor-pointer"
                  style={active
                    ? { background: `rgba(${c},.14)`, border: `1px solid rgba(${c},.45)`, color: `rgb(${c})` }
                    : isLight
                      ? { background: 'rgba(232,228,218,.85)', border: '1px solid rgba(0,0,0,.12)', color: '#6a6356' }
                      : { background: 'rgba(21,19,15,.7)', border: '1px solid rgba(255,255,255,.08)', color: '#9a917e' }
                  }
                >{label}</button>
              )
            })}
            {/* Divider */}
            <div style={{ width: 1, height: 20, background: isLight ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.08)', margin: '0 2px', alignSelf: 'center' }} />
            {/* PT / TR / GR */}
            {([
              { key: 'showPt', label: 'PT' },
              { key: 'showTr', label: 'TR' },
              { key: 'showGr', label: 'GR' },
            ] as const).map(({ key, label }) => {
              const active = st[key]
              const count = ['showEsp','showEng','showGer','showIta','showFra','showPt','showTr','showGr'].filter(k => st[k as keyof typeof st]).length
              return (
                <Pill key={key} active={active} color="mu" isLight={isLight}
                  onClick={() => { if (active && count <= 1) return; update({ [key]: !active }) }}
                >{label}</Pill>
              )
            })}
            {/* Divider */}
            <div style={{ width: 1, height: 20, background: isLight ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.08)', margin: '0 2px', alignSelf: 'center' }} />
            {/* 2ª DIV + EUROPA — Pro only */}
            {proUser ? (
              <>
                <Pill active={st.show2nd} color="bl" isLight={isLight} onClick={() => update({ show2nd: !st.show2nd })}>2ª DIV</Pill>
                <Pill active={st.showEuro} color="pu" isLight={isLight} onClick={() => update({ showEuro: !st.showEuro })}>EUROPA</Pill>
              </>
            ) : (
              <>
                {['2ª DIV', 'EUROPA'].map(label => (
                  <div key={label} style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{
                      position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                      fontSize: 7, fontWeight: 700, letterSpacing: 0.5,
                      background: 'rgba(240,192,64,.15)', color: '#f0c040',
                      border: '1px solid rgba(240,192,64,.25)', borderRadius: 3,
                      padding: '1px 4px', pointerEvents: 'none' as const, whiteSpace: 'nowrap' as const,
                    }}>PRO</span>
                    <button
                      className="text-[12px] font-medium px-3 py-1 rounded transition-all duration-150 whitespace-nowrap"
                      style={isLight
                        ? { background: 'rgba(225,220,208,.6)', border: '1px solid rgba(0,0,0,.08)', color: '#8a8275', textDecoration: 'line-through', opacity: 0.45, cursor: 'default' }
                        : { background: 'rgba(21,19,15,.7)', border: '1px solid rgba(255,255,255,.06)', color: '#9a917e', textDecoration: 'line-through', opacity: 0.45, cursor: 'default' }
                      }
                    >{label}</button>
                  </div>
                ))}
              </>
            )}
          </FilterGroup>

          <FilterGroup label={t('filter_age', lang)}>
            {AGES.map(a => {
              const locked = !!a.proOnly && !proUser
              if (locked) {
                return (
                  <div key={a.v} style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{
                      position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                      fontSize: 7, fontWeight: 700, letterSpacing: 0.5,
                      background: 'rgba(240,192,64,.15)', color: '#f0c040',
                      border: '1px solid rgba(240,192,64,.25)', borderRadius: 3,
                      padding: '1px 4px', pointerEvents: 'none' as const, whiteSpace: 'nowrap' as const,
                    }}>PRO</span>
                    <button
                      className="text-[12px] font-medium px-3 py-1 rounded transition-all duration-150 whitespace-nowrap"
                      style={isLight
                        ? { background: 'rgba(225,220,208,.6)', border: '1px solid rgba(0,0,0,.08)', color: '#8a8275', textDecoration: 'line-through', opacity: 0.45, cursor: 'default' }
                        : { background: 'rgba(21,19,15,.7)', border: '1px solid rgba(255,255,255,.06)', color: '#9a917e', textDecoration: 'line-through', opacity: 0.45, cursor: 'default' }
                      }
                    >
                      {a.label}
                    </button>
                  </div>
                )
              }
              return (
                <Pill key={a.v} active={st.age === a.v} color="bl" isLight={isLight} onClick={() => update({ age: a.v })}>
                  {a.v === 99 ? t('filter_all_ages', lang) : a.label}
                </Pill>
              )
            })}
          </FilterGroup>

          <FilterGroup label={t('filter_columns', lang)}>
            {proUser ? (
              <Pill active={st.showElo} color="gd" isLight={isLight} onClick={() => update({ showElo: !st.showElo })}>ELO</Pill>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 7, fontWeight: 700, letterSpacing: 0.5,
                  background: 'rgba(240,192,64,.15)', color: '#f0c040',
                  border: '1px solid rgba(240,192,64,.25)', borderRadius: 3,
                  padding: '1px 4px', pointerEvents: 'none' as const, whiteSpace: 'nowrap' as const,
                }}>PRO</span>
                <button
                  className="text-[12px] font-medium px-3 py-1 rounded transition-all duration-150 whitespace-nowrap"
                  style={{
                    background: 'rgba(21,19,15,.7)', border: '1px solid rgba(255,255,255,.06)',
                    color: '#9a917e', textDecoration: 'line-through', opacity: 0.45,
                    cursor: 'default',
                  }}
                >ELO</button>
              </div>
            )}
            {proUser ? (
              <Pill active={st.showFantasy} color="mu" onClick={() => update({ showFantasy: !st.showFantasy })}>Fantasy</Pill>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 7, fontWeight: 700, letterSpacing: 0.5,
                  background: 'rgba(240,192,64,.15)', color: '#f0c040',
                  border: '1px solid rgba(240,192,64,.25)', borderRadius: 3,
                  padding: '1px 4px', pointerEvents: 'none' as const, whiteSpace: 'nowrap' as const,
                }}>PRO</span>
                <button
                  className="text-[12px] font-medium px-3 py-1 rounded transition-all duration-150 whitespace-nowrap"
                  style={{
                    background: 'rgba(21,19,15,.7)', border: '1px solid rgba(255,255,255,.06)',
                    color: '#9a917e', textDecoration: 'line-through', opacity: 0.45,
                    cursor: 'default',
                  }}
                >Fantasy</button>
              </div>
            )}
            <Pill active={showMinG} color="mu" onClick={() => setShowMinG(v => !v)}>Min/G</Pill>
            {proUser && [{ v: false, label: 'Top 25' }, { v: true, label: 'Top 50' }].map(o => (
              <button key={String(o.v)} onClick={() => update({ showTop50: o.v })}
                className="text-[12px] font-medium px-3 py-1 rounded transition-all duration-150 cursor-pointer"
                style={st.showTop50 === o.v
                  ? { background: 'rgba(0,200,176,.12)', border: '1px solid rgba(0,200,176,.35)', color: '#00c8b0' }
                  : { background: 'rgba(21,19,15,.7)', border: '1px solid #2a2620', color: '#9a917e' }
                }
              >{o.label}</button>
            ))}
          </FilterGroup>
        </div>

        {/* Fila 2: count + actions */}
        <div className="filter-toolbar-row2 flex items-center gap-3 px-4 py-2" style={{ background: 'rgba(5,10,20,.70)' }}>
          <span style={{ fontSize: 12, color: '#9a917e' }}>
            <strong style={{ color: '#8a8275' }}>{topN.length}</strong> {t('players_count', lang)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {proUser && (
              <button
                onClick={() => setWatchlistOpen(true)}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-sm transition-all duration-150 cursor-pointer"
                style={watchlist.length > 0
                  ? { background: 'rgba(240,192,64,.1)', border: '1px solid rgba(240,192,64,.3)', color: '#f0c040' }
                  : { background: 'transparent', border: '1px solid rgba(255,255,255,.05)', color: '#3a3b50' }
                }
                aria-label="Watchlist"
              >
                ★{watchlist.length > 0 && <span className="text-[9px]">{watchlist.length}</span>}
              </button>
            )}
            {/* CSV Export button */}
            {proUser ? (
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-sm transition-all duration-150 cursor-pointer"
                style={{ background: 'rgba(56,196,122,.08)', border: '1px solid rgba(56,196,122,.2)', color: '#38c47a', opacity: exporting ? 0.5 : 1 }}
                title="Exportar a CSV"
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,196,122,.15)'; e.currentTarget.style.borderColor = 'rgba(56,196,122,.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,196,122,.08)'; e.currentTarget.style.borderColor = 'rgba(56,196,122,.2)' }}
              >
                {exporting ? '…' : '⬇ CSV'}
              </button>
            ) : (
              <div className="relative group">
                <button
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-sm cursor-default"
                  style={{ background: 'rgba(21,19,15,.7)', border: '1px solid rgba(255,255,255,.06)', color: '#6e6655', opacity: 0.55 }}
                  title="Feature Pro"
                >
                  ⬇ CSV
                </button>
                <div
                  className="absolute bottom-full mb-1.5 right-0 hidden group-hover:block z-30 whitespace-nowrap"
                  style={{ fontSize: 10, background: 'rgba(21,19,15,.96)', border: '1px solid rgba(240,192,64,.2)', color: '#f0c040', padding: '4px 8px', borderRadius: 4 }}
                >
                  Feature Pro —{' '}
                  <Link href="/pricing" style={{ color: '#f0c040', textDecoration: 'underline' }}>
                    Actualiza tu plan
                  </Link>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#6a6356',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  padding: '5px 10px',
                  border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  background: 'rgba(21,19,15,.6)',
                }}
              >
                {t('add_player', lang)}
              </span>
              <SearchInput
                pool={pool.filter(p => p.season === st.season)}
                pinned={st.pinned}
                onAdd={name => update({ pinned: { ...st.pinned, [name]: true } })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ad between filter toolbar and table */}
      <AdSlot slot="1234567890" format="horizontal" className="my-3" />

      {/* Table */}
      <StatsTable
        players={topN}
        isAssist={isAssist}
        sort={st.sort}
        dir={st.dir}
        showElo={st.showElo}
        showFantasy={st.showFantasy}
        showPj={proUser ? st.showPj : true}
        showRatios={proUser ? st.showRatios : true}
        showValSin={proUser ? st.showValSin : true}
        showValCoef={proUser ? st.showValCoef : true}
        showMinG={showMinG}
        watchlistKeys={proUser ? watchlistKeys : undefined}
        onWatchlistToggle={proUser ? handleWatchlistToggle : undefined}
        onSort={(key) => {
          if (st.sort === key) update({ dir: (st.dir * -1) as 1 | -1 })
          else update({ sort: key, dir: -1 })
        }}
        onUnpin={name => {
          const p = { ...st.pinned }; delete p[name]; update({ pinned: p })
        }}
      />

      {/* Pro upsell inline section (free users only) */}
      {!proUser && <ProUpsellInline />}

      {/* Watchlist panel */}
      {proUser && (
        <WatchlistPanel
          entries={watchlist}
          open={watchlistOpen}
          onClose={() => setWatchlistOpen(false)}
          onRemove={handleWatchlistRemove}
          onNoteChange={handleNoteChange}
        />
      )}

      {/* Footnote */}
      <div
        className="px-4 py-2"
        style={{
          borderLeft: `1px solid ${isLight ? '#e6dfce' : '#2a2620'}`,
          borderRight: `1px solid ${isLight ? '#e6dfce' : '#2a2620'}`,
          borderBottom: `1px solid ${isLight ? '#e6dfce' : '#2a2620'}`,
          borderRadius: '0 0 6px 6px',
          background: isLight ? 'rgba(244,242,235,.7)' : 'rgba(21,19,15,.65)',
        }}
      >
        <span style={{ fontSize: 10, color: isLight ? '#6a6356' : '#9a917e' }}>
          Datos {CURRENT_SEASON_SHORT}: europeangoldenshoe.com + FotMob &nbsp;·&nbsp; Val: G×2+A &nbsp;·&nbsp; Val+: G×coef×2+A
        </span>
      </div>
    </div>
  )
}
