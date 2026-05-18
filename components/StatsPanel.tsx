'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import type { Tab, PanelState, SortKey, Season } from '@/types'
import { PLAYERS } from '@/data/players'
import { getPool, buildTopN, makeSortFn } from '@/lib/utils'
import { isPro, FREE_ROW_LIMIT, FREE_SEASONS } from '@/lib/plans'
import StatsTable from './StatsTable'
import SearchInput from './SearchInput'
import WatchlistPanel, { type WatchlistEntry } from './WatchlistPanel'

const DEFAULT: PanelState = {
  season: '2526',
  age: 99,
  showEur5: true,
  showPt: false,
  showTr: false,
  showGr: false,
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

interface Props { tab: Tab }

const SEASONS: { id: Season; label: string; live?: boolean; proOnly?: boolean }[] = [
  { id: '2526', label: '25/26', live: true },
  { id: '2425', label: '24/25' },
  { id: '2324', label: '23/24', proOnly: true },
  { id: '2223', label: '22/23', proOnly: true },
  { id: '2122', label: '21/22', proOnly: true },
  { id: '2021', label: '20/21', proOnly: true },
]

const AGES = [
  { v: 18, label: 'U18' },
  { v: 21, label: 'U21' },
  { v: 24, label: 'U24' },
  { v: 27, label: 'U27' },
  { v: 30, label: 'U30' },
  { v: 99, label: 'Todos' },
]

const SCORER_SORTS: { key: SortKey; label: string }[] = [
  { key: 'val_sin', label: 'Val.' },
  { key: 'val_con', label: 'Val+' },
  { key: 'goles',   label: 'Goles' },
  { key: 'asist',   label: 'Asist' },
  { key: 'ratio_g', label: 'G/PJ' },
  { key: 'ratio_a', label: 'A/PJ' },
  { key: 'age',     label: 'Edad' },
]

const ASSIST_SORTS: { key: SortKey; label: string }[] = [
  { key: 'asist',   label: 'Asist' },
  { key: 'ratio_a', label: 'A/PJ' },
  { key: 'goles',   label: 'Goles' },
  { key: 'val_sin', label: 'G+A' },
  { key: 'ratio_g', label: 'G/PJ' },
  { key: 'age',     label: 'Edad' },
]

function Pill({
  active, color = 'gd', locked, children, onClick,
}: {
  active: boolean
  color?: 'gd' | 'bl' | 'gr' | 'mu' | 'pu'
  locked?: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  const map = {
    gd: { bg: 'rgba(240,192,64,.12)', border: 'rgba(240,192,64,.45)', text: '#f0c040' },
    bl: { bg: 'rgba(0,200,176,.1)',   border: 'rgba(0,200,176,.4)',   text: '#00c8b0' },
    gr: { bg: 'rgba(56,196,122,.1)',  border: 'rgba(56,196,122,.4)',  text: '#38c47a' },
    mu: { bg: 'rgba(255,255,255,.06)',border: 'rgba(255,255,255,.16)',text: '#9090a8' },
    pu: { bg: 'rgba(160,96,255,.1)',  border: 'rgba(160,96,255,.4)',  text: '#a060ff' },
  }
  const c = map[color]
  return (
    <button
      onClick={onClick}
      className="text-[12px] font-medium px-3 py-1 rounded transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1"
      style={active
        ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
        : locked
          ? { background: 'rgba(8,16,30,.7)', border: '1px solid rgba(255,255,255,.06)', color: '#2a3a54' }
          : { background: 'rgba(8,16,30,.7)', border: '1px solid rgba(255,255,255,.08)', color: '#6878a0' }
      }
    >
      {children}
    </button>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '2px',
        textTransform: 'uppercase' as const, color: '#5a5c88',
        fontFamily: "'Barlow Condensed', sans-serif",
        color: '#3a5270',
      }}>
        {label}
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {children}
      </div>
    </div>
  )
}

function UpgradeBanner() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        border: '1px solid rgba(240,192,64,.22)',
        borderTop: 'none',
        background: 'linear-gradient(180deg, rgba(240,192,64,.03) 0%, rgba(240,192,64,.06) 100%)',
      }}
    >
      {/* Ghost rows — sharper blur */}
      <div style={{ filter: 'blur(2.5px)', opacity: 0.28, pointerEvents: 'none', userSelect: 'none' }}>
        {[11, 12, 13, 14, 15].map((n, i) => (
          <div
            key={n}
            className="flex items-center gap-4 px-4"
            style={{
              borderBottom: '1px solid #151626',
              height: 40,
              background: i % 2 === 0 ? 'rgba(255,255,255,.018)' : 'transparent',
            }}
          >
            <span
              className="w-5 text-right shrink-0"
              style={{ fontSize: 13, color: '#3a3b50', fontFamily: "'Bebas Neue', cursive" }}
            >
              {n}
            </span>
            <div className="h-[6px] rounded-full" style={{ background: '#1e1f35', width: `${110 - i * 12}px` }} />
            <div className="h-[6px] rounded-full w-12 shrink-0" style={{ background: '#1e1f35' }} />
            <div className="ml-auto h-[6px] rounded-full w-6 shrink-0" style={{ background: '#1e1f35' }} />
            <div className="h-[6px] rounded-full w-8 shrink-0" style={{ background: '#1e1f35' }} />
            <div className="h-[6px] rounded-full w-8 shrink-0" style={{ background: '#1e1f35' }} />
          </div>
        ))}
      </div>

      {/* Gradient fade at top of ghost rows */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: 40, background: 'linear-gradient(180deg, rgba(6,7,14,.0) 0%, transparent 100%)', pointerEvents: 'none' }}
      />

      {/* CTA overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="text-center">
          <div
            className="font-bold mb-1"
            style={{ fontSize: 14, color: '#d8d8ec', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.3 }}
          >
            Posiciones 11–25 bloqueadas
          </div>
          <div style={{ fontSize: 11, color: '#52526e' }}>
            Desbloquea el Top 25 completo + historial con Pro
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 font-bold rounded-sm transition-all duration-150 cursor-pointer"
          style={{ fontSize: 12, padding: '7px 18px', background: '#f0c040', color: '#05060c', boxShadow: '0 2px 16px rgba(240,192,64,.25)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f8d060'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(240,192,64,.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f0c040'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(240,192,64,.25)' }}
        >
          Pro desde €5/mes →
        </Link>
      </div>
    </div>
  )
}


export default function StatsPanel({ tab }: Props) {
  const isAssist = tab === 'a'
  const [st, setSt] = useState<PanelState>(isAssist ? DEFAULT_ASSIST : DEFAULT)
  const { user, isLoaded } = useUser()
  const proUser = isLoaded ? isPro(user?.publicMetadata as Record<string, unknown>) : false

  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([])
  const [watchlistOpen, setWatchlistOpen] = useState(false)

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

  const pool = useMemo(() => getPool(PLAYERS, tab), [tab])

  function update(patch: Partial<PanelState>) {
    setSt(prev => ({ ...prev, ...patch }))
  }

  const rowLimit = proUser ? (st.showTop50 ? 50 : 25) : FREE_ROW_LIMIT
  const topN = useMemo(() => buildTopN(pool, st, rowLimit), [pool, st, rowLimit])

  const fillerCount = topN.filter(p => p.isFiller && !p.isPinned).length
  const metAge      = topN.filter(p => !p.isFiller || p.isPinned).length

  const sorts = isAssist ? ASSIST_SORTS : SCORER_SORTS
  const eloSortOpt:  { key: SortKey; label: string } = { key: 'elo',          label: 'ELO'     }
  const fantSortOpt: { key: SortKey; label: string } = { key: 'fantasyPoints', label: 'Fantasy' }

  return (
    <div className="flex flex-col gap-0">

      {/* ── FILTER TOOLBAR ── */}
      <div
        style={{ background: 'rgba(8,16,30,.92)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '8px 8px 0 0', backdropFilter: 'blur(8px)' }}
      >
        {/* Fila 1: filtros — Main groups row */}
        <div className="flex flex-wrap items-start gap-x-5 gap-y-3 px-4 pt-3.5 pb-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <FilterGroup label="Temporada">
            {SEASONS.map(s => {
              const locked = s.proOnly && !proUser
              return (
                <Pill key={s.id} active={st.season === s.id} color="gd" locked={locked}
                  onClick={() => {
                    if (locked) { window.location.href = '/pricing'; return }
                    update({ season: s.id, pinned: {} })
                  }}
                >
                  {s.live && <span className="inline-block w-1 h-1 rounded-full" style={{ background: '#38c47a', boxShadow: '0 0 3px #38c47a' }} />}
                  {s.label}
                </Pill>
              )
            })}
          </FilterGroup>

          <FilterGroup label="Liga">
            <Pill active={st.showEur5} color="gr" onClick={() => { if (st.showEur5 && !st.showPt && !st.showTr && !st.showGr) return; update({ showEur5: !st.showEur5 }) }}>Top 5</Pill>
            <Pill active={st.showPt}   color="mu" onClick={() => { if (!st.showPt && !st.showEur5 && !st.showTr && !st.showGr) return; update({ showPt: !st.showPt }) }}>PT</Pill>
            <Pill active={st.showTr}   color="mu" onClick={() => { if (!st.showTr && !st.showEur5 && !st.showPt && !st.showGr) return; update({ showTr: !st.showTr }) }}>TR</Pill>
            <Pill active={st.showGr}   color="mu" onClick={() => { if (!st.showGr && !st.showEur5 && !st.showPt && !st.showTr) return; update({ showGr: !st.showGr }) }}>GR</Pill>
          </FilterGroup>

          <FilterGroup label="Edad">
            {AGES.map(a => (
              <Pill key={a.v} active={st.age === a.v} color="bl" onClick={() => update({ age: a.v })}>
                {a.label}
              </Pill>
            ))}
          </FilterGroup>

          <FilterGroup label="Columnas">
            <Pill active={st.showElo}     color="gd" onClick={() => update({ showElo: !st.showElo })}>ELO</Pill>
            <Pill active={st.showFantasy} color="mu" onClick={() => update({ showFantasy: !st.showFantasy })}>Fantasy</Pill>
            {proUser && [{ v: false, label: 'Top 25' }, { v: true, label: 'Top 50' }].map(o => (
              <button key={String(o.v)} onClick={() => update({ showTop50: o.v })}
                className="text-[12px] font-medium px-3 py-1 rounded transition-all duration-150 cursor-pointer"
                style={st.showTop50 === o.v
                  ? { background: 'rgba(160,96,255,.12)', border: '1px solid rgba(160,96,255,.35)', color: '#a060ff' }
                  : { background: 'rgba(14,16,28,.7)', border: '1px solid #1e2038', color: '#7878a0' }
                }
              >{o.label}</button>
            ))}
          </FilterGroup>
        </div>

        {/* Fila 2: count + actions */}
        <div className="flex items-center gap-3 px-4 py-2" style={{ background: 'rgba(5,10,20,.70)' }}>
          <span style={{ fontSize: 12, color: '#6878a0' }}>
            <strong style={{ color: '#8898bc' }}>{topN.length}</strong> jugadores
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
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#3a5270', fontFamily: "'Barlow Condensed', sans-serif" }}>
                Añadir jugador
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

      {/* Upgrade banner (free users only) */}
      {!proUser && <UpgradeBanner />}

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
        style={{ borderLeft: '1px solid #201c3a', borderRight: '1px solid #201c3a', borderBottom: '1px solid #201c3a', borderRadius: '0 0 6px 6px', background: 'rgba(10,8,18,.65)' }}
      >
        <span style={{ fontSize: 10, color: '#525278' }}>
          Datos 25/26: europeangoldenshoe.com + FotMob &nbsp;·&nbsp; Val: G×2+A &nbsp;·&nbsp; Val+: G×coef×2+A
        </span>
      </div>
    </div>
  )
}
