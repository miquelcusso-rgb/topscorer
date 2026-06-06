'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { EnrichedPlayer, Season } from '@/types'
import { PLAYERS } from '@/data/players'
import { enrich, LEAGUE_STYLE, leagueLogoUrl } from '@/lib/utils'
import { FREE_ROW_LIMIT } from '@/lib/plans'

const SEASONS: { id: Season; label: string; live?: boolean }[] = [
  { id: '2526', label: '25/26', live: true },
  { id: '2425', label: '24/25' },
]

const AGES = [
  { v: 21, label: 'U21' },
  { v: 24, label: 'U24' },
  { v: 27, label: 'U27' },
  { v: 99, label: 'Todos' },
]

const LEAGUES_FILTER = [
  { key: 'eur5',  label: 'Top 5', leagues: ['La Liga','Premier League','Bundesliga','Serie A','Ligue 1'] },
  { key: 'pt',    label: 'PT',    leagues: ['Primeira Liga'] },
  { key: 'tr',    label: 'TR',    leagues: ['Sueper Lig'] },
  { key: 'gr',    label: 'GR',    leagues: ['Super Liga Grecia'] },
]

type SortKey = 'ga' | 'goles' | 'asist' | 'ratio_g' | 'ratio_a' | 'age'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'ga',      label: 'G+A' },
  { key: 'asist',   label: 'Asist' },
  { key: 'goles',   label: 'Goles' },
  { key: 'ratio_a', label: 'A/PJ' },
  { key: 'ratio_g', label: 'G/PJ' },
  { key: 'age',     label: 'Edad' },
]

const POS_LABELS: Record<string, string> = {
  MF: 'MC',
  DF: 'DEF',
  GK: 'POR',
}

const POS_VARIANTS: Record<string, string[]> = {
  MF: ['MF', 'CM', 'DM'],
  DF: ['DF', 'CB', 'LB', 'RB'],
  GK: ['GK'],
}

interface Props {
  position: 'MF' | 'DF' | 'GK'
  accentColor: string
  proUser: boolean
}

function Pill({ active, accentHex, children, onClick }: {
  active: boolean
  accentHex: string
  children: React.ReactNode
  onClick: () => void
}) {
  // Parse accentHex to get r,g,b for rgba
  const hex = accentHex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-medium px-2.5 py-1 rounded-sm transition-all duration-150 cursor-pointer whitespace-nowrap"
      style={active
        ? { background: `rgba(${r},${g},${b},.12)`, border: `1px solid rgba(${r},${g},${b},.4)`, color: accentHex }
        : { background: 'transparent', border: '1px solid rgba(255,255,255,.06)', color: '#9a917e' }
      }
    >
      {children}
    </button>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <span className="text-[9px] font-bold tracking-[1.8px] uppercase shrink-0" style={{ color: '#9a917e', fontFamily: "'Barlow Condensed', sans-serif" }}>
        {label}
      </span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  )
}

function ToolbarDivider() {
  return <div className="w-px self-stretch shrink-0" style={{ background: '#1e1f35', margin: '0 3px' }} />
}

export default function PositionPanel({ position, accentColor, proUser }: Props) {
  const [season, setSeason] = useState<Season>('2526')
  const [leagueKey, setLeagueKey] = useState<string>('eur5')
  const [maxAge, setMaxAge] = useState(99)
  const [sort, setSort] = useState<SortKey>('ga')
  const [dir, setDir] = useState<1 | -1>(-1)

  const handleSort = (key: SortKey) => {
    if (sort === key) setDir(d => (d * -1) as 1 | -1)
    else { setSort(key); setDir(-1) }
  }

  const allowedLeagues = useMemo(() => {
    return new Set(LEAGUES_FILTER.filter(l => l.key === leagueKey).flatMap(l => l.leagues))
  }, [leagueKey])

  const allowedPositions = POS_VARIANTS[position]

  const players: (EnrichedPlayer & { ga: number })[] = useMemo(() => {
    const seen = new Set<string>()
    const result: (EnrichedPlayer & { ga: number })[] = []

    for (const p of PLAYERS) {
      if (!allowedPositions.includes(p.position ?? '')) continue
      if (p.season !== season) continue
      if (!allowedLeagues.has(p.league)) continue
      if (p.age > maxAge) continue

      const key = `${p.name}|${p.season}`
      if (seen.has(key)) continue
      seen.add(key)

      const ep = enrich(p)
      result.push({ ...ep, ga: ep.goles + ep.asist })
    }

    return result.sort((a, b) => {
      const va = sort === 'ga' ? a.ga : a[sort as keyof typeof a] as number
      const vb = sort === 'ga' ? b.ga : b[sort as keyof typeof b] as number
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      return (va - vb) * dir
    })
  }, [season, allowedLeagues, allowedPositions, maxAge, sort, dir])

  const rowLimit = proUser ? 25 : FREE_ROW_LIMIT
  const visiblePlayers = players.slice(0, rowLimit)

  const posLabel = POS_LABELS[position] ?? position

  const hex = accentColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return (
    <div className="flex flex-col gap-0">

      {/* Toolbar */}
      <div style={{ background: '#15130f', border: '1px solid #2a2620', borderRadius: '6px 6px 0 0' }}>
        <div className="flex flex-wrap items-center gap-x-0 gap-y-0 px-3 py-2" style={{ borderBottom: '1px solid #101120' }}>
          <FilterGroup label="Temp.">
            {SEASONS.map(s => (
              <Pill key={s.id} active={season === s.id} accentHex="#f0c040" onClick={() => setSeason(s.id)}>
                {s.live && <span className="inline-block w-1 h-1 rounded-full mr-1" style={{ background: '#38c47a', boxShadow: '0 0 3px #38c47a' }} />}
                {s.label}
              </Pill>
            ))}
          </FilterGroup>

          <ToolbarDivider />

          <FilterGroup label="Liga">
            {LEAGUES_FILTER.map(l => (
              <Pill key={l.key} active={leagueKey === l.key} accentHex="#9090a8" onClick={() => setLeagueKey(l.key)}>
                {l.label}
              </Pill>
            ))}
          </FilterGroup>

          <ToolbarDivider />

          <FilterGroup label="Edad">
            {AGES.map(a => (
              <Pill key={a.v} active={maxAge === a.v} accentHex={accentColor} onClick={() => setMaxAge(a.v)}>
                {a.label}
              </Pill>
            ))}
          </FilterGroup>

          <ToolbarDivider />

          <FilterGroup label="Orden">
            {SORT_OPTIONS.map(o => (
              <Pill key={o.key} active={sort === o.key} accentHex={accentColor} onClick={() => handleSort(o.key)}>
                {o.label}
                {sort === o.key && <span className="ml-0.5 text-[8px]">{dir === -1 ? '▼' : '▲'}</span>}
              </Pill>
            ))}
          </FilterGroup>

          <div className="ml-auto">
            <span className="text-[10.5px] tabular" style={{ color: '#3a3b50' }}>
              <strong style={{ color: '#9a917e' }}>{players.length}</strong> {posLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', overflowY: 'clip', background: '#15130f', border: '1px solid #2a2620', borderTop: 'none' }}>
        <table className="w-full border-collapse" style={{ minWidth: 680 }}>
          <thead className="sticky top-[52px] z-[30]">
            <tr style={{ background: '#0a0908', borderBottom: '2px solid #1e1f35' }}>
              {[
                { label: '#',      align: 'right' as const, width: 44 },
                { label: 'Jugador',align: 'left'  as const, width: 220 },
                { label: 'Liga',   align: 'left'  as const },
                { label: 'Edad',   align: 'right' as const, key: 'age' as SortKey },
                { label: 'PJ',     align: 'right' as const },
                { label: 'G+A',    align: 'right' as const, key: 'ga' as SortKey },
                { label: 'Goles',  align: 'right' as const, key: 'goles' as SortKey },
                { label: 'Asist.', align: 'right' as const, key: 'asist' as SortKey },
                { label: 'G/PJ',   align: 'right' as const, key: 'ratio_g' as SortKey },
                { label: 'A/PJ',   align: 'right' as const, key: 'ratio_a' as SortKey },
              ].map(col => {
                const active = col.key === sort
                return (
                  <th
                    key={col.label}
                    className="py-2 px-3 whitespace-nowrap select-none transition-colors duration-150"
                    style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
                      textTransform: 'uppercase', textAlign: col.align,
                      color: active ? accentColor : '#8a8275',
                      cursor: col.key ? 'pointer' : 'default',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      ...(col.width ? { width: col.width } : {}),
                    }}
                    onClick={() => col.key && handleSort(col.key)}
                  >
                    {col.label}
                    {active && col.key && <span className="ml-1 text-[8px]">{dir === -1 ? '▼' : '▲'}</span>}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visiblePlayers.map((p, i) => {
              const rank = i + 1
              const ls = LEAGUE_STYLE[p.league] ?? { bg: 'rgba(90,90,122,.1)', color: '#9a917e', border: 'rgba(90,90,122,.22)' }
              return (
                <tr
                  key={`${p.name}-${p.season}`}
                  className="group cursor-pointer"
                  style={{
                    height: 40,
                    borderBottom: '1px solid rgba(255,255,255,.025)',
                    background: rank % 2 === 0 ? 'rgba(255,255,255,.018)' : 'transparent',
                    borderLeft: rank === 1 ? `3px solid rgba(${r},${g},${b},.4)` : '3px solid transparent',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.035)')}
                  onMouseLeave={e => (e.currentTarget.style.background = rank % 2 === 0 ? 'rgba(255,255,255,.018)' : 'transparent')}
                >
                  {/* Rank */}
                  <td className="pl-3 pr-2 text-right" style={{ width: 44, fontFamily: "'Bebas Neue', cursive", lineHeight: 1 }}>
                    {rank <= 3 ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: '50%', fontSize: 12,
                        color: rank === 1 ? accentColor : rank === 2 ? '#b0b8c8' : '#cd8c5a',
                        background: rank === 1 ? `rgba(${r},${g},${b},.14)` : rank === 2 ? 'rgba(176,184,200,.08)' : 'rgba(205,140,90,.08)',
                        border: `1px solid ${rank === 1 ? `rgba(${r},${g},${b},.35)` : rank === 2 ? 'rgba(176,184,200,.2)' : 'rgba(205,140,90,.2)'}`,
                      }}>{rank}</span>
                    ) : (
                      <span style={{ fontSize: 13, color: '#3a3b50' }}>{rank}</span>
                    )}
                  </td>

                  {/* Name */}
                  <td className="py-0 pr-3" style={{ width: 220, maxWidth: 220, overflow: 'hidden' }}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="min-w-0">
                        <div className="font-semibold leading-tight truncate" style={{ fontSize: 13, color: '#f1e8d2' }}>
                          {p.flag && <span className="mr-0.5 text-xs">{p.flag}</span>}
                          {p.name}
                        </div>
                        <div className="flex items-center gap-1 leading-tight">
                          <span className="truncate" style={{ fontSize: 10, color: '#9a917e' }}>{p.club}</span>
                          <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 3px', borderRadius: 2, color: accentColor, background: `rgba(${r},${g},${b},.1)`, flexShrink: 0, letterSpacing: 0.3 }}>
                            {posLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* League */}
                  <td className="pr-3">
                    <span className="font-semibold whitespace-nowrap rounded-sm" style={{ fontSize: 9, letterSpacing: 0.5, padding: '2px 5px', color: ls.color, background: ls.bg, border: `1px solid ${ls.border}` }}>
                      {leagueLogoUrl(p.league) && (
                        <img
                          src={leagueLogoUrl(p.league)}
                          alt=""
                          width={14} height={14}
                          style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }}
                        />
                      )}
                      {p.league}
                    </span>
                  </td>

                  {/* Age */}
                  <td className="pr-3 text-right tabular" style={{ fontSize: 11, color: '#9a917e' }}>{p.age}</td>

                  {/* PJ */}
                  <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#3a352b' }}>{p.pj}</td>

                  {/* G+A */}
                  <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: accentColor, lineHeight: 1 }}>{p.ga}</td>

                  {/* Goles */}
                  <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: 'rgba(240,192,64,.7)', lineHeight: 1 }}>{p.goles}</td>

                  {/* Asist */}
                  <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: `rgba(${r},${g},${b},.7)`, lineHeight: 1 }}>{p.asist}</td>

                  {/* G/PJ */}
                  <td className="pr-3 text-right tabular" style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,192,64,.8)' }}>{p.ratio_g.toFixed(2)}</td>

                  {/* A/PJ */}
                  <td className="pr-3 text-right tabular" style={{ fontSize: 11, fontWeight: 600, color: `rgba(${r},${g},${b},.8)` }}>{p.ratio_a.toFixed(2)}</td>
                </tr>
              )
            })}
            {visiblePlayers.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10" style={{ fontSize: 12, color: '#3a3b50' }}>
                  No hay jugadores con estos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upgrade banner for free users */}
      {!proUser && players.length > FREE_ROW_LIMIT && (
        <div
          className="relative overflow-hidden"
          style={{
            border: '1px solid rgba(240,192,64,.22)',
            borderTop: 'none',
            background: 'linear-gradient(180deg, rgba(240,192,64,.03) 0%, rgba(240,192,64,.06) 100%)',
          }}
        >
          <div style={{ filter: 'blur(2.5px)', opacity: 0.28, pointerEvents: 'none', userSelect: 'none' }}>
            {[11, 12, 13].map((n, i) => (
              <div key={n} className="flex items-center gap-4 px-4" style={{ borderBottom: '1px solid #2a2620', height: 40, background: i % 2 === 0 ? 'rgba(255,255,255,.018)' : 'transparent' }}>
                <span className="w-5 text-right shrink-0" style={{ fontSize: 13, color: '#3a3b50', fontFamily: "'Bebas Neue', cursive" }}>{n}</span>
                <div className="h-[6px] rounded-full" style={{ background: '#1e1f35', width: `${110 - i * 12}px` }} />
                <div className="h-[6px] rounded-full w-12 shrink-0" style={{ background: '#1e1f35' }} />
                <div className="ml-auto h-[6px] rounded-full w-6 shrink-0" style={{ background: '#1e1f35' }} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="text-center">
              <div className="font-bold mb-1" style={{ fontSize: 14, color: '#f1e8d2', fontFamily: "'Barlow Condensed', sans-serif" }}>
                Posiciones 11–25 bloqueadas
              </div>
              <div style={{ fontSize: 11, color: '#9a917e' }}>Desbloquea el Top 25 completo con Pro</div>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 font-bold rounded-sm transition-all duration-150 cursor-pointer"
              style={{ fontSize: 12, padding: '7px 18px', background: '#f0c040', color: '#0a0908', boxShadow: '0 2px 16px rgba(240,192,64,.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8d060'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(240,192,64,.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f0c040'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(240,192,64,.25)' }}
            >
              Pro desde €5/mes →
            </Link>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div
        className="px-4 py-2"
        style={{ borderLeft: '1px solid #2a2620', borderRight: '1px solid #2a2620', borderBottom: '1px solid #2a2620', borderRadius: '0 0 6px 6px', background: '#0a0908' }}
      >
        <span style={{ fontSize: 10, color: '#3a352b' }}>
          Datos 25/26 (G+A) de temporadas activas
        </span>
      </div>
    </div>
  )
}
