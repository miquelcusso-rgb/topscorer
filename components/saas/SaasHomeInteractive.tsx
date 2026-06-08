'use client'
import { useState, useMemo, useEffect } from 'react'
import type { Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'
import FilterBar from './FilterBar'
import PositionTable from './PositionTable'
import HotStrips from './HotStrips'
import Link from 'next/link'
import { type PositionTabId, TAB_LABELS, TAB_ACCENT, extraStatList, last5Ratings } from '@/lib/position-stats'
import type { HomeInsights } from '@/lib/home-insights'
import type { HomeRumor } from '@/lib/home-rumor'
import { iig, leagueCoef } from '@/lib/iig'

type LeagueFilterValue = 'big5' | 'big5pt' | 'all'

const BIG5 = ['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1']
const BIG5_PT = [...BIG5, 'Primeira Liga']

const POS_ICON: Record<PositionTabId, string> = {
  fw: '⚽', ast: '🅰', mf: '⇄', df: '🛡', gk: '🧤',
}
// Porteros (gk) removed — the topscorers/topassists feed barely lists keepers,
// so the GK ranking would be too sparse to be useful.
const POS_ORDER: PositionTabId[] = ['fw', 'ast', 'mf', 'df']

// Big page title per position tab (uppercase).
// Each title renders as "TOP <word>" with the second word in gold (--ts-primary).
const POS_TITLE: Record<PositionTabId, { es: string; en: string }> = {
  fw: { es: 'DELANTEROS', en: 'FORWARDS' },
  ast: { es: 'ASISTENTES', en: 'ASSISTERS' },
  mf: { es: 'CENTROCAMPISTAS', en: 'MIDFIELDERS' },
  df: { es: 'DEFENSAS', en: 'DEFENDERS' },
  gk: { es: 'PORTEROS', en: 'GOALKEEPERS' },
}

interface NewsLite { title: string; link: string; source: string; image?: string }
interface Props {
  breaking?: { title: string; link: string; source: string }[]
  lang: Lang
  positionPools: Record<PositionTabId, PlayerData[]>
  defaultPos?: PositionTabId
  insights?: HomeInsights
  rumors?: HomeRumor[]
  news?: NewsLite[]
}

export default function SaasHomeInteractive({ lang, positionPools, defaultPos, insights, rumors = [], news = [], breaking = [] }: Props) {
  const [pos, setPos] = useState<PositionTabId>(defaultPos ?? 'fw')
  // Rotate through the breaking headlines (2–5) in the same banner slot.
  const [breakIdx, setBreakIdx] = useState(0)
  useEffect(() => {
    if (breaking.length < 2) return
    const t = setInterval(() => setBreakIdx(i => (i + 1) % breaking.length), 5000)
    return () => clearInterval(t)
  }, [breaking.length])
  const [league, setLeague] = useState<LeagueFilterValue>('big5')
  const [ageBand, setAgeBand] = useState<'all' | 'u23' | 'u21'>('all')
  const [minPj, setMinPj] = useState<number>(3)
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const [insightDismissed, setInsightDismissed] = useState(false)
  const [curio, setCurio] = useState(0)
  const curioCount = insights?.lines.length ?? 0
  useEffect(() => {
    if (curioCount < 2) return
    const t = setInterval(() => setCurio(c => (c + 1) % curioCount), 5500)
    return () => clearInterval(t)
  }, [curioCount])
  const [extraStats, setExtraStats] = useState<string[]>([])

  const leagueMatch = useMemo(() => {
    if (league === 'big5') return (p: PlayerData) => BIG5.includes(p.league)
    if (league === 'big5pt') return (p: PlayerData) => BIG5_PT.includes(p.league)
    return () => true
  }, [league])

  const pool = positionPools[pos] ?? []
  const filtered = useMemo(() => {
    const ageMax = ageBand === 'u21' ? 21 : ageBand === 'u23' ? 23 : 99
    return pool.filter(p =>
      leagueMatch(p) && (p.age ?? 0) <= ageMax && (p.pj ?? 0) >= minPj
    )
  }, [pool, leagueMatch, ageBand, minPj])

  // Optional column sort (clicking a PositionTable header). Falls back to the
  // pool's default order when no sort is active.
  const SORT_ACCESSOR: Record<string, (p: PlayerData) => number> = {
    goles: p => p.goles ?? 0, asist: p => p.asist ?? 0, pj: p => p.pj ?? 0,
    age: p => p.age ?? 0,
    gpj: p => (p.pj ? (p.goles ?? 0) / p.pj : 0), apj: p => (p.pj ? (p.asist ?? 0) / p.pj : 0),
    sht: p => p.shotsTotal ?? 0, sot: p => (p.shotsTotal ? (p.shotsOn ?? 0) / p.shotsTotal : 0),
    conv: p => (p.shotsTotal ? (p.goles ?? 0) / p.shotsTotal : 0), rt: p => p.rating ?? 0,
    rtc: p => (p.rating ?? 0) * leagueCoef(p.league),
    iig: p => iig(p), kp: p => p.keyPasses ?? 0, pas: p => p.passes ?? 0,
    pacc: p => p.passAccuracy ?? 0, ga: p => (p.goles ?? 0) + (p.asist ?? 0),
    rec: p => p.interceptions ?? 0, tkl: p => p.tacklesTotal ?? 0, int: p => p.interceptions ?? 0,
    dw: p => p.duelsWon ?? 0, dwp: p => (p.duelsTotal ? (p.duelsWon ?? 0) / p.duelsTotal : 0),
    sav: p => p.saves ?? 0, gc: p => p.goalsConceded ?? 0,
    last5: p => last5Ratings(p).avg,
  }
  // Default ordering per tab: descending by the tab's headline value.
  const DEFAULT_SORT: Record<PositionTabId, string> = {
    fw: 'goles', ast: 'asist', mf: 'kp', df: 'tkl', gk: 'sav',
  }
  const sorted = useMemo(() => {
    const key = sort?.key ?? DEFAULT_SORT[pos]
    const acc = SORT_ACCESSOR[key]
    if (!acc) return filtered
    // ALWAYS descending — best stat on top. No ascending toggle (ascending would
    // surface players with 0 of the stat, which is noise on a leaderboard).
    return [...filtered].sort((a, b) => acc(b) - acc(a))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, pos])
  const players = sorted.slice(0, 20)
  const leader = players[0]
  const accent = TAB_ACCENT[pos]

  const t = lang === 'en'
    ? { season: 'Season', position: 'Position', age: 'Age', minpj: 'Min. games', league: 'League',
        leader: 'Leader', topAssist: 'Top assist', avgAge: 'Avg age' }
    : { season: 'Temporada', position: 'Posición', age: 'Edad', minpj: 'Min. partidos', league: 'Liga',
        leader: 'Líder', topAssist: 'Asist. top', avgAge: 'Edad media' }

  const posLabel = TAB_LABELS[lang === 'en' ? 'en' : 'es'][pos]
  const leagueLabel = league === 'big5' ? (lang === 'en' ? 'Top 5 Europe' : 'Top 5 Europa')
    : league === 'big5pt' ? 'Top 5 + Portugal'
    : (lang === 'en' ? 'All leagues' : 'Todas las ligas')

  const topAssist = [...filtered].sort((a, b) => (b.asist ?? 0) - (a.asist ?? 0))[0]
  const avgAge = filtered.length
    ? Math.round(filtered.reduce((s, p) => s + (p.age ?? 0), 0) / filtered.length)
    : 0
  const leaderMetric = pos === 'ast' ? (leader?.asist ?? 0)
    : pos === 'df' || pos === 'gk' ? (leader?.pj ?? 0)
    : (leader?.goles ?? 0)
  const leaderMetricLabel = pos === 'ast' ? (lang === 'en' ? 'assists' : 'asist.')
    : pos === 'df' || pos === 'gk' ? (lang === 'en' ? 'apps' : 'PJ')
    : (lang === 'en' ? 'goals' : 'goles')

  function cycleLeague() {
    const order: LeagueFilterValue[] = ['big5', 'big5pt', 'all']
    setLeague(order[(order.indexOf(league) + 1) % order.length])
  }

  // Position selector (Forwards/Assisters/…) — rendered next to the filters.
  const positionTabs = (
    <div className="saas-position-tabs" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {POS_ORDER.map(id => {
        const isActive = id === pos
        const a = TAB_ACCENT[id]
        return (
          <button
            key={id}
            type="button"
            onClick={() => setPos(id)}
            style={{
              padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: isActive ? 600 : 500,
              background: isActive ? `var(--ts-${a}-soft)` : 'transparent',
              color: isActive ? `var(--ts-${a})` : 'var(--ts-text)',
              border: `1px solid ${isActive ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
              cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 13, opacity: isActive ? 1 : 0.7 }}>{POS_ICON[id]}</span>
            {TAB_LABELS[lang === 'en' ? 'en' : 'es'][id]}
          </button>
        )
      })}
    </div>
  )

  const bigTitle = POS_TITLE[pos][lang === 'en' ? 'en' : 'es']

  // Mobile (≤640px) replaces the scrolling pill rectangle with real <select>
  // dropdowns: one for position + one each for league / age / min-games.
  const selStyle: React.CSSProperties = {
    appearance: 'none', WebkitAppearance: 'none',
    width: '100%', padding: '9px 28px 9px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: 'var(--ts-card)', color: 'var(--ts-text)', border: '1px solid var(--ts-border)',
    fontFamily: 'inherit', cursor: 'pointer',
    backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 9 9\' fill=\'none\' stroke=\'%23999\' stroke-width=\'1.5\'><path d=\'M2 3l2.5 2.5L7 3\'/></svg>")',
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  }
  const fieldLabel: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 4, display: 'block' }
  const mobileFilters = (
    <div className="saas-mobile-filters" style={{ display: 'none', flexDirection: 'column', gap: 10, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, padding: 12 }}>
      <label>
        <span style={fieldLabel}>{t.position}</span>
        <select value={pos} onChange={e => setPos(e.target.value as PositionTabId)} style={selStyle} aria-label={t.position}>
          {POS_ORDER.map(id => <option key={id} value={id}>{TAB_LABELS[lang === 'en' ? 'en' : 'es'][id]}</option>)}
        </select>
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <label>
          <span style={fieldLabel}>{t.league}</span>
          <select value={league} onChange={e => setLeague(e.target.value as LeagueFilterValue)} style={selStyle} aria-label={t.league}>
            <option value="big5">{lang === 'en' ? 'Top 5 Europe' : 'Top 5 Europa'}</option>
            <option value="big5pt">Top 5 + Portugal</option>
            <option value="all">{lang === 'en' ? 'All leagues' : 'Todas las ligas'}</option>
          </select>
        </label>
        <label>
          <span style={fieldLabel}>{t.age}</span>
          <select value={ageBand} onChange={e => setAgeBand(e.target.value as 'all' | 'u23' | 'u21')} style={selStyle} aria-label={t.age}>
            <option value="all">{lang === 'en' ? 'All ages' : 'Todas'}</option>
            <option value="u23">Sub-23</option>
            <option value="u21">Sub-21</option>
          </select>
        </label>
        <label>
          <span style={fieldLabel}>{t.minpj}</span>
          <select value={String(minPj)} onChange={e => setMinPj(Number(e.target.value))} style={selStyle} aria-label={t.minpj}>
            <option value="3">3+</option>
            <option value="5">5+</option>
            <option value="10">10+</option>
          </select>
        </label>
        <label>
          <span style={fieldLabel}>{t.season}</span>
          <select value="2526" disabled style={{ ...selStyle, opacity: 0.7 }} aria-label={t.season}>
            <option value="2526">25/26</option>
          </select>
        </label>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ts-muted)', textAlign: 'right' }}>{players.length} / {filtered.length}</div>
    </div>
  )

  return (
    <>
      {/* Breaking-news banner — rotates through up to 5 fresh (<90 min) headlines in one slot */}
      {breaking.length > 0 && (() => {
        const b = breaking[breakIdx % breaking.length]
        return (
          <a
            href={b.link}
            target="_blank"
            rel="nofollow noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
              background: 'var(--ts-red, #c0392b)', color: '#fff', borderRadius: 8,
              padding: '8px 12px', marginBottom: 12, fontSize: 13, lineHeight: 1.3,
            }}
          >
            <span style={{ flexShrink: 0, fontWeight: 800, letterSpacing: '0.06em', fontSize: 11, background: 'rgba(0,0,0,.22)', padding: '3px 8px', borderRadius: 5, textTransform: 'uppercase' }}>
              ⚡ {lang === 'en' ? 'Breaking' : 'Última hora'}
            </span>
            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {b.title}
            </span>
            <span style={{ flexShrink: 0, opacity: 0.85, fontSize: 11 }}>{b.source} ↗</span>
            {breaking.length > 1 && (
              <span style={{ flexShrink: 0, display: 'flex', gap: 4 }} aria-hidden>
                {breaking.map((_, i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i === (breakIdx % breaking.length) ? '#fff' : 'rgba(255,255,255,.4)' }} />
                ))}
              </span>
            )}
          </a>
        )
      })()}

      {/* Three compact hot strips: news · rumours · strikers (title left, leads right) */}
      <HotStrips news={news} rumors={rumors} strikers={insights?.standouts ?? []} lang={lang === 'en' ? 'en' : 'es'} />

      {insights && insights.lines.length > 0 && !insightDismissed && (() => {
        const line = insights.lines[curio % insights.lines.length]
        const text = lang === 'en' ? line.en : line.es
        const Inner = (
          <>
            <span aria-hidden style={{ fontSize: 14, lineHeight: '20px', flexShrink: 0 }}>💡</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--ts-text)', lineHeight: 1.4 }}>{text}</span>
            {insights.lines.length > 1 && (
              <span style={{ flexShrink: 0, display: 'flex', gap: 4, alignItems: 'center' }}>
                {insights.lines.map((_, i) => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === (curio % insights.lines.length) ? 'var(--ts-primary)' : 'var(--ts-border)' }} />
                ))}
              </span>
            )}
          </>
        )
        const boxStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--ts-teal-soft)', border: '1px solid var(--ts-border)', borderRadius: 10, textDecoration: 'none', color: 'inherit' }
        return (
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
            {line.slug
              ? <Link href={`/${lang}/jugadores/${line.slug}`} style={{ ...boxStyle, flex: 1 }}>{Inner}</Link>
              : <div style={{ ...boxStyle, flex: 1 }}>{Inner}</div>}
            <button type="button" onClick={() => setInsightDismissed(true)} aria-label={lang === 'en' ? 'Dismiss' : 'Cerrar'}
              style={{ flexShrink: 0, background: 'transparent', border: '1px solid var(--ts-border)', borderRadius: 10, color: 'var(--ts-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 10px', fontFamily: 'inherit' }}>×</button>
          </div>
        )
      })()}

      {/* Big page title — "TOP <word>" with the second word in gold; changes with the
          position tab. Sits directly above the tabs + filters + grid so it introduces
          the leaderboard in context (not decontextualized at the very top of the page). */}
      <h1 style={{ margin: '4px 0 -2px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 800, letterSpacing: '0.01em', textTransform: 'uppercase', lineHeight: 1, color: 'var(--ts-text)' }}>
        TOP <span style={{ color: 'var(--ts-primary)' }}>{bigTitle}</span>
      </h1>

      {/* Position selector + filters, grouped right above the table.
          Desktop: pill tabs + chip filter bar. Mobile (≤640px): <select> dropdowns. */}
      {mobileFilters}

      <div className="saas-desktop-filters" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {positionTabs}

      <FilterBar
        filters={[
          { key: 'league', label: t.league, value: leagueLabel, active: league !== 'big5', options: [
            { value: 'big5', label: lang === 'en' ? 'Top 5 Europe' : 'Top 5 Europa' },
            { value: 'big5pt', label: 'Top 5 + Portugal' },
            { value: 'all', label: lang === 'en' ? 'All leagues' : 'Todas las ligas' },
          ] },
          { key: 'season', label: t.season, value: '25/26', options: [{ value: '2526', label: '25/26' }] },
          { key: 'age', label: t.age, value: ageBand === 'u21' ? 'Sub-21' : ageBand === 'u23' ? 'Sub-23' : (lang === 'en' ? 'All' : 'Todas'), active: ageBand !== 'all', options: [
            { value: 'all', label: lang === 'en' ? 'All' : 'Todas' },
            { value: 'u23', label: 'Sub-23' },
            { value: 'u21', label: 'Sub-21' },
          ] },
          { key: 'minpj', label: t.minpj, value: `${minPj}+`, active: minPj > 3, options: [
            { value: '3', label: '3+' }, { value: '5', label: '5+' }, { value: '10', label: '10+' },
          ] },
        ]}
        onFilterSelect={(key, value) => {
          if (key === 'league') setLeague(value as LeagueFilterValue)
          else if (key === 'position') setPos(value as PositionTabId)
          else if (key === 'age') setAgeBand(value as 'all' | 'u23' | 'u21')
          else if (key === 'minpj') setMinPj(Number(value))
        }}
        statOptions={extraStatList(lang === 'en' ? 'en' : 'es').filter(o => !extraStats.includes(o.value))}
        onAddStat={v => setExtraStats(s => (s.includes(v) ? s : [...s, v]))}
        count={{ current: players.length, total: filtered.length }}
      />
      </div>

      <PositionTable
        players={players}
        tab={pos}
        lang={lang === 'en' ? 'en' : 'es'}
        sort={sort}
        onSort={key => setSort({ key, dir: -1 })}
        extraStats={extraStats}
      />
    </>
  )
}
