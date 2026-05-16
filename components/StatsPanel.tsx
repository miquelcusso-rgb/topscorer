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
  { key: 'val_sin', label: 'Val. sin coef.' },
  { key: 'val_con', label: 'Val. con coef.' },
  { key: 'goles',   label: 'Goles' },
  { key: 'asist',   label: 'Asistencias' },
  { key: 'ratio_g', label: 'G/PJ' },
  { key: 'ratio_a', label: 'A/PJ' },
  { key: 'age',     label: 'Edad' },
]

const ASSIST_SORTS: { key: SortKey; label: string }[] = [
  { key: 'asist',   label: 'Asistencias' },
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
    gd: { bg: 'rgba(240,192,64,.12)', border: '#f0c040', text: '#f0c040' },
    bl: { bg: 'rgba(74,158,255,.12)', border: '#4a9eff', text: '#4a9eff' },
    gr: { bg: 'rgba(56,196,122,.12)', border: '#38c47a', text: '#38c47a' },
    mu: { bg: 'rgba(90,90,122,.12)',  border: '#5a5a7a', text: '#5a5a7a' },
    pu: { bg: 'rgba(160,96,255,.12)', border: '#a060ff', text: '#a060ff' },
  }
  const c = map[color]
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-semibold px-3 py-1 rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1"
      style={active
        ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
        : locked
          ? { background: '#0e0e1c', border: '1px solid #1e1e34', color: '#2a2a48' }
          : { background: '#151528', border: '1px solid #1e1e34', color: '#5a5a7a' }
      }
    >
      {locked && <span style={{ fontSize: 9 }}>🔒</span>}
      {children}
    </button>
  )
}

function UpgradeBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-sm"
      style={{ border: '1px solid rgba(240,192,64,.2)', background: 'rgba(240,192,64,.03)' }}
    >
      {/* Blurred ghost rows */}
      <div style={{ filter: 'blur(4px)', opacity: 0.2, pointerEvents: 'none', userSelect: 'none' }}>
        {[11, 12, 13, 14, 15].map(n => (
          <div
            key={n}
            className="flex items-center gap-4 px-4 py-2.5"
            style={{ borderBottom: '1px solid #1e1e34', height: 42 }}
          >
            <span className="text-[12px] font-bold w-6" style={{ color: '#2a2a48' }}>{n}</span>
            <div className="h-2.5 rounded-full flex-1 max-w-[140px]" style={{ background: '#1e1e34' }} />
            <div className="h-2 rounded-full w-20" style={{ background: '#1e1e34' }} />
            <div className="h-2 rounded-full w-8" style={{ background: '#1e1e34' }} />
            <div className="h-2 rounded-full w-12" style={{ background: '#1e1e34' }} />
          </div>
        ))}
      </div>
      {/* CTA overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 py-4">
        <div className="text-center">
          <div className="text-[13px] font-bold mb-1" style={{ color: '#e5e5f2' }}>
            Posiciones 11–25 bloqueadas
          </div>
          <div className="text-[11.5px]" style={{ color: '#5a5a7a' }}>
            Desbloquea el Top 25 completo con Pro
          </div>
        </div>
        <Link
          href="/pricing"
          className="text-[12px] font-bold px-4 py-2 rounded-sm transition-all duration-150"
          style={{ background: '#f0c040', color: '#07070f' }}
        >
          Pro desde €4/mes →
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
    const key = `${playerName}|${st.season}|${tab}`
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

  const PRO_COLS = [
    { key: 'showPj',      label: 'PJ'       },
    { key: 'showRatios',  label: 'G/PJ·A/PJ'},
    { key: 'showValSin',  label: 'Val. sin' },
    { key: 'showValCoef', label: 'Val. coef'},
  ]

  return (
    <div className="flex flex-col gap-0">

      {/* Filter strip */}
      <div
        className="flex flex-wrap gap-x-6 gap-y-3 px-4 py-3"
        style={{ background: '#0e0e1c', border: '1px solid #1e1e34', borderTop: 'none' }}
      >
        {/* Season */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: '#5a5a7a' }}>Temporada</div>
          <div className="flex gap-1.5 flex-wrap">
            {SEASONS.map(s => {
              const locked = s.proOnly && !proUser
              return (
                <Pill
                  key={s.id}
                  active={st.season === s.id}
                  color="gd"
                  locked={locked}
                  onClick={() => {
                    if (locked) { window.location.href = '/pricing'; return }
                    update({ season: s.id, pinned: {} })
                  }}
                >
                  {s.live && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: '#38c47a', boxShadow: '0 0 4px #38c47a' }} />
                  )}
                  {s.label}{s.live && ' en curso'}
                </Pill>
              )
            })}
          </div>
        </div>

        {/* Age */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: '#5a5a7a' }}>Edad máx.</div>
          <div className="flex gap-1.5 flex-wrap">
            {AGES.map(a => (
              <Pill key={a.v} active={st.age === a.v} color="bl" onClick={() => update({ age: a.v })}>
                {a.label}
              </Pill>
            ))}
          </div>
        </div>

        {/* Leagues */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: '#5a5a7a' }}>Ligas</div>
          <div className="flex gap-1.5 flex-wrap">
            <Pill active={st.showEur5} color="gr" onClick={() => { if (st.showEur5 && !st.showPt && !st.showTr && !st.showGr) return; update({ showEur5: !st.showEur5 }) }}>
              🌍 Top 5 Europa
            </Pill>
            <Pill active={st.showPt} color="mu" onClick={() => { if (!st.showPt && !st.showEur5 && !st.showTr && !st.showGr) return; update({ showPt: !st.showPt }) }}>
              🇵🇹 Portugal
            </Pill>
            <Pill active={st.showTr} color="mu" onClick={() => { if (!st.showTr && !st.showEur5 && !st.showPt && !st.showGr) return; update({ showTr: !st.showTr }) }}>
              🇹🇷 Turquía
            </Pill>
            <Pill active={st.showGr} color="mu" onClick={() => { if (!st.showGr && !st.showEur5 && !st.showPt && !st.showTr) return; update({ showGr: !st.showGr }) }}>
              🇬🇷 Grecia
            </Pill>
          </div>
        </div>

        {/* Extra columns */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: '#5a5a7a' }}>
            Columnas extra
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Pill active={st.showElo}     color="gd" onClick={() => update({ showElo:     !st.showElo     })}>ELO</Pill>
            <Pill active={st.showFantasy} color="mu" onClick={() => update({ showFantasy: !st.showFantasy })}>Fantasy</Pill>
          </div>
        </div>

        {/* Watchlist button (pro only) */}
        {proUser && (
          <div className="flex flex-col gap-1.5 ml-auto">
            <div className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: '#5a5a7a' }}>
              &nbsp;
            </div>
            <button
              onClick={() => setWatchlistOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap"
              style={watchlist.length > 0
                ? { background: 'rgba(240,192,64,.12)', border: '1px solid rgba(240,192,64,.4)', color: '#f0c040' }
                : { background: '#151528', border: '1px solid #1e1e34', color: '#5a5a7a' }
              }
            >
              ★ Watchlist
              {watchlist.length > 0 && (
                <span
                  className="text-[9px] font-bold px-1 py-0.5 rounded-full"
                  style={{ background: 'rgba(240,192,64,.2)', color: '#f0c040' }}
                >
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Pro column toggles */}
        {proUser && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: '#a060ff' }}>
              Columnas pro
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PRO_COLS.map(c => (
                <Pill
                  key={c.key}
                  active={st[c.key as keyof PanelState] as boolean}
                  color="pu"
                  onClick={() => update({ [c.key]: !st[c.key as keyof PanelState] })}
                >
                  {c.label}
                </Pill>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <SearchInput
          pool={pool.filter(p => p.season === st.season)}
          pinned={st.pinned}
          onAdd={name => update({ pinned: { ...st.pinned, [name]: true } })}
        />
      </div>

      {/* Pro top-50 toggle + sort bar */}
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2"
        style={{ background: '#0e0e1c', borderLeft: '1px solid #1e1e34', borderRight: '1px solid #1e1e34' }}
      >
        {proUser && (
          <div className="flex gap-1 items-center mr-2">
            {[
              { v: false, label: 'Top 25' },
              { v: true,  label: 'Top 50' },
            ].map(o => (
              <button
                key={String(o.v)}
                onClick={() => update({ showTop50: o.v })}
                className="text-[11px] font-bold px-2.5 py-1 rounded-sm transition-all duration-150 cursor-pointer"
                style={st.showTop50 === o.v
                  ? { background: 'rgba(160,96,255,.15)', border: '1px solid rgba(160,96,255,.4)', color: '#a060ff' }
                  : { background: '#151528', border: '1px solid #1e1e34', color: '#5a5a7a' }
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        <span className="text-[9px] font-bold tracking-[2px] uppercase mr-1" style={{ color: '#5a5a7a' }}>
          Ordenar →
        </span>
        {[...sorts, ...(st.showElo ? [eloSortOpt] : []), ...(st.showFantasy ? [fantSortOpt] : [])].map(s => {
          const active = st.sort === s.key
          return (
            <button
              key={s.key}
              onClick={() => {
                if (st.sort === s.key) update({ dir: (st.dir * -1) as 1 | -1 })
                else update({ sort: s.key, dir: -1 })
              }}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-sm transition-all duration-150 cursor-pointer"
              style={active
                ? { background: '#f0c040', border: '1px solid #f0c040', color: '#000', fontWeight: 700 }
                : { background: '#151528', border: '1px solid #1e1e34', color: '#5a5a7a' }
              }
            >
              {s.label}
              {active && <span className="ml-1 text-[8px]">{st.dir === -1 ? '▼' : '▲'}</span>}
            </button>
          )
        })}
      </div>

      {/* Info bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-2"
        style={{ borderLeft: '1px solid #1e1e34', borderRight: '1px solid #1e1e34' }}
      >
        <div className="text-[11px]" style={{ color: '#5a5a7a' }}>
          {st.age < 99 && fillerCount > 0 ? (
            <>
              Mostrando <strong style={{ color: '#e5e5f2' }}>{rowLimit}</strong> ·{' '}
              <strong style={{ color: '#e5e5f2' }}>{metAge}</strong> cumplen U{st.age} ·{' '}
              <strong style={{ color: '#36364e' }}>{fillerCount}</strong> completados
            </>
          ) : (
            <>
              Mostrando <strong style={{ color: '#e5e5f2' }}>{topN.length}</strong> jugadores
              {!proUser && (
                <span style={{ color: '#2a2a48' }}>
                  {' '}·{' '}
                  <Link href="/pricing" style={{ color: '#5a5a6a', textDecoration: 'underline', textDecorationColor: '#2a2a48' }}>
                    Top 25 con Pro
                  </Link>
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { color: '#f0c040', label: 'Goles' },
            { color: '#4a9eff', label: 'Asistencias' },
            { color: '#e05a30', shape: 'square' as const, label: '★ Añadido' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[10.5px]" style={{ color: '#5a5a7a' }}>
              <div className="w-2 h-2 shrink-0" style={{ background: l.color, borderRadius: l.shape === 'square' ? 0 : '50%' }} />
              {l.label}
            </div>
          ))}
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

      {/* Footnotes */}
      <div
        className="flex flex-wrap gap-6 px-4 py-3"
        style={{ borderLeft: '1px solid #1e1e34', borderRight: '1px solid #1e1e34', borderBottom: '1px solid #1e1e34', borderRadius: '0 0 3px 3px' }}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: '#5a5a7a', flex: '1 1 200px' }}>
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>Lista fija:</strong> si el filtro de edad tiene menos candidatos, se rellena con los siguientes sin límite de edad.
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#5a5a7a', flex: '1 1 200px' }}>
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>Val. sin coef.:</strong> G×2+A ·{' '}
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>Val. con coef.:</strong> G×coef×2+A · Coef Top 5 ×2 / PT+TR+GR ×1.5
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#5a5a7a', flex: '1 1 200px' }}>
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>ELO:</strong> calculado sobre G, A y coef. de liga ·{' '}
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>Fantasy:</strong> G×6 + A×3 + PJ.
        </p>
      </div>
    </div>
  )
}
