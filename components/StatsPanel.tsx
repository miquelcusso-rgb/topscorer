'use client'

import { useState, useMemo } from 'react'
import type { Tab, PanelState, SortKey, Season } from '@/types'
import { PLAYERS } from '@/data/players'
import { getPool, buildTop25, makeSortFn } from '@/lib/utils'
import StatsTable from './StatsTable'
import SearchInput from './SearchInput'

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
}

const DEFAULT_ASSIST: PanelState = { ...DEFAULT, sort: 'asist' }

interface Props { tab: Tab }

const SEASONS: { id: Season; label: string; live?: boolean }[] = [
  { id: '2526', label: '25/26', live: true },
  { id: '2425', label: '24/25' },
  { id: '2324', label: '23/24' },
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
  active, color = 'gd', children, onClick,
}: { active: boolean; color?: 'gd' | 'bl' | 'gr' | 'mu'; children: React.ReactNode; onClick: () => void }) {
  const map = {
    gd: { bg: 'rgba(240,192,64,.12)', border: '#f0c040', text: '#f0c040' },
    bl: { bg: 'rgba(74,158,255,.12)', border: '#4a9eff', text: '#4a9eff' },
    gr: { bg: 'rgba(56,196,122,.12)', border: '#38c47a', text: '#38c47a' },
    mu: { bg: 'rgba(90,90,122,.12)',  border: '#5a5a7a', text: '#5a5a7a' },
  }
  const c = map[color]
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-semibold px-3 py-1 rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap"
      style={active
        ? { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
        : { background: '#151528', border: '1px solid #1e1e34', color: '#5a5a7a' }
      }
    >
      {children}
    </button>
  )
}

export default function StatsPanel({ tab }: Props) {
  const isAssist = tab === 'a'
  const [st, setSt] = useState<PanelState>(isAssist ? DEFAULT_ASSIST : DEFAULT)
  const pool = useMemo(() => getPool(PLAYERS, tab), [tab])

  function update(patch: Partial<PanelState>) {
    setSt(prev => ({ ...prev, ...patch }))
  }

  const top25 = useMemo(() => buildTop25(pool, st), [pool, st])

  const fillerCount = top25.filter(p => p.isFiller && !p.isPinned).length
  const metAge = top25.filter(p => !p.isFiller || p.isPinned).length

  const sorts = isAssist ? ASSIST_SORTS : SCORER_SORTS
  const eloSortOption: { key: SortKey; label: string } = { key: 'elo', label: 'ELO' }
  const fantSortOption: { key: SortKey; label: string } = { key: 'fantasyPoints', label: 'Fantasy' }

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
            {SEASONS.map(s => (
              <Pill
                key={s.id}
                active={st.season === s.id}
                color="gd"
                onClick={() => update({ season: s.id, pinned: {} })}
              >
                {s.live && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: '#38c47a', boxShadow: '0 0 4px #38c47a' }} />
                )}
                {s.label}
                {s.live && ' en curso'}
              </Pill>
            ))}
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
            <Pill
              active={st.showEur5}
              color="gr"
              onClick={() => { if (st.showEur5 && !st.showPt && !st.showTr && !st.showGr) return; update({ showEur5: !st.showEur5 }) }}
            >
              🌍 Top 5 Europa
            </Pill>
            <Pill
              active={st.showPt}
              color="mu"
              onClick={() => { if (!st.showPt && !st.showEur5 && !st.showTr && !st.showGr) return; update({ showPt: !st.showPt }) }}
            >
              🇵🇹 Portugal
            </Pill>
            <Pill
              active={st.showTr}
              color="mu"
              onClick={() => { if (!st.showTr && !st.showEur5 && !st.showPt && !st.showGr) return; update({ showTr: !st.showTr }) }}
            >
              🇹🇷 Turquía
            </Pill>
            <Pill
              active={st.showGr}
              color="mu"
              onClick={() => { if (!st.showGr && !st.showEur5 && !st.showPt && !st.showTr) return; update({ showGr: !st.showGr }) }}
            >
              🇬🇷 Grecia
            </Pill>
          </div>
        </div>

        {/* Optional columns */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: '#5a5a7a' }}>Columnas extra</div>
          <div className="flex gap-1.5 flex-wrap">
            <Pill active={st.showElo} color="gd" onClick={() => update({ showElo: !st.showElo })}>
              📊 ELO
            </Pill>
            <Pill active={st.showFantasy} color="mu" onClick={() => update({ showFantasy: !st.showFantasy })}>
              🏆 Fantasy
            </Pill>
          </div>
        </div>

        {/* Search */}
        <SearchInput
          pool={pool.filter(p => p.season === st.season)}
          pinned={st.pinned}
          onAdd={name => update({ pinned: { ...st.pinned, [name]: true } })}
        />
      </div>

      {/* Sort bar */}
      <div
        className="flex flex-wrap items-center gap-1.5 px-4 py-2"
        style={{ background: '#0e0e1c', borderLeft: '1px solid #1e1e34', borderRight: '1px solid #1e1e34' }}
      >
        <span className="text-[9px] font-bold tracking-[2px] uppercase mr-1" style={{ color: '#5a5a7a' }}>
          Ordenar →
        </span>
        {[...sorts, ...(st.showElo ? [eloSortOption] : []), ...(st.showFantasy ? [fantSortOption] : [])].map(s => {
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
              Mostrando <strong style={{ color: '#e5e5f2' }}>25</strong> ·{' '}
              <strong style={{ color: '#e5e5f2' }}>{metAge}</strong> cumplen U{st.age} ·{' '}
              <strong style={{ color: '#36364e' }}>{fillerCount}</strong> completados
            </>
          ) : (
            <>Mostrando <strong style={{ color: '#e5e5f2' }}>{top25.length}</strong> jugadores</>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { color: '#f0c040', label: 'Goles' },
            { color: '#4a9eff', label: 'Asistencias' },
            { color: '#e05a30', shape: 'square', label: '★ Añadido' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[10.5px]" style={{ color: '#5a5a7a' }}>
              <div
                className="w-2 h-2 shrink-0"
                style={{
                  background: l.color,
                  borderRadius: l.shape === 'square' ? 0 : '50%',
                }}
              />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <StatsTable
        players={top25}
        isAssist={isAssist}
        sort={st.sort}
        dir={st.dir}
        showElo={st.showElo}
        showFantasy={st.showFantasy}
        onSort={(key) => {
          if (st.sort === key) update({ dir: (st.dir * -1) as 1 | -1 })
          else update({ sort: key, dir: -1 })
        }}
        onUnpin={name => {
          const p = { ...st.pinned }; delete p[name]; update({ pinned: p })
        }}
      />

      {/* Footnotes */}
      <div
        className="flex flex-wrap gap-6 px-4 py-3 mt-0"
        style={{ borderLeft: '1px solid #1e1e34', borderRight: '1px solid #1e1e34', borderBottom: '1px solid #1e1e34', borderRadius: '0 0 3px 3px' }}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: '#5a5a7a', flex: '1 1 200px' }}>
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>Lista de 25 fija:</strong> si el filtro de edad tiene menos de 25 candidatos, se rellena con los siguientes mejores sin límite de edad.
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#5a5a7a', flex: '1 1 200px' }}>
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>Val. sin coef.:</strong> G×2+A ·{' '}
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>Val. con coef.:</strong> G×coef×2+A · Coef Top 5 ×2 / Portugal+Turquía ×1.5
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#5a5a7a', flex: '1 1 200px' }}>
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>ELO:</strong> Índice calculado sobre G, A y coef. de liga ·{' '}
          <strong style={{ color: 'rgba(229,229,242,.65)' }}>Fantasy:</strong> Scoring FPL-like (G×6 + A×3 + PJ).
        </p>
      </div>
    </div>
  )
}
