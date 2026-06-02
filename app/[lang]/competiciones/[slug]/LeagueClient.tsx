'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { PlayerData } from '@/types'
import Avatar from '@/components/saas/Avatar'
import RelatedLinks, { type RelatedLink } from '@/components/RelatedLinks'
import { slugify } from '@/lib/slugify'
import { playerSlug } from '@/lib/player-slug'
import { iig } from '@/lib/iig'
import { clubLogo } from '@/lib/club-logos'
import {
  leaguesWithData,
  topScorersForLeague,
  topAssistersForLeague,
  youngProspectsForLeague,
  clubsRankedForLeague,
  type ClubRankRow,
} from '@/lib/league-data'
import type { LeagueMeta } from '@/lib/api-football'

interface Props {
  lang: 'es' | 'en'
  league: LeagueMeta
  leagueName: string
  leagueCountry: string
  leagueId: number
  leagueColor: string
  leagueFlag?: string
  leagueSlug: string
  players: PlayerData[]
}

type TabKey = 'resumen' | 'goleadores' | 'asistentes' | 'jovenes'

const headingStyle = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
}

const t = (lang: 'es' | 'en', es: string, en: string) => (lang === 'en' ? en : es)

// ── Small club crest (graceful when missing) ─────────────────────────────────
function ClubCrest({ club }: { club: string }) {
  const logo = clubLogo(club)
  if (!logo) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      style={{ objectFit: 'contain', flexShrink: 0, borderRadius: 2 }}
    />
  )
}

// ── Segmented control (view switcher) ────────────────────────────────────────
function SegmentedControl({
  tabs, active, onChange,
}: {
  tabs: { key: TabKey; label: string }[]
  active: TabKey
  onChange: (k: TabKey) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="league views"
      style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, padding: 4,
        background: 'var(--ts-card2)', border: '1px solid var(--ts-border)',
        borderRadius: 12,
      }}
    >
      {tabs.map(tab => {
        const on = tab.key === active
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.key)}
            style={{
              flex: '1 1 auto', minWidth: 96, cursor: 'pointer',
              padding: '8px 14px', borderRadius: 9, border: 'none',
              background: on ? 'var(--ts-primary)' : 'transparent',
              color: on ? '#1a1400' : 'var(--ts-muted)',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800,
              fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.6,
              transition: 'background 120ms ease, color 120ms ease',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Clubs ranking (derived from real attacking output — NOT a standings) ──────
function ClubsTable({ lang, rows, accentColor }: { lang: 'es' | 'en'; rows: ClubRankRow[]; accentColor: string }) {
  const colTemplate = '30px minmax(120px,1fr) 46px 46px 44px'
  const header = ['#', t(lang, 'Club', 'Club'), t(lang, 'Gol', 'G'), t(lang, 'Asi', 'A'), t(lang, 'Jug', 'Pl')]
  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: colTemplate, gap: 8, padding: '10px 14px', alignItems: 'center',
        background: 'var(--ts-card2)', borderBottom: '1px solid var(--ts-border)',
        fontSize: 10, color: 'var(--ts-muted)', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase',
      }}>
        {header.map((h, i) => (
          <span key={i} style={{ textAlign: i >= 2 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      {rows.map((row, i) => {
        const rank = i + 1
        return (
          <div
            key={row.club}
            style={{
              display: 'grid', gridTemplateColumns: colTemplate, gap: 8, padding: '9px 14px', alignItems: 'center',
              borderBottom: '1px solid var(--ts-divider)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: rank <= 3 ? accentColor : 'var(--ts-muted)' }}>
              {String(rank).padStart(2, '0')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              <ClubCrest club={row.club} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.club}</span>
            </div>
            <span style={{ textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{row.goals}</span>
            <span style={{ textAlign: 'right', fontSize: 13, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>{row.assists}</span>
            <span style={{ textAlign: 'right', fontSize: 13, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>{row.players}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Scorers / assists table ──────────────────────────────────────────────────
function StatTable({
  lang,
  players,
  metric,
  accent,
}: {
  lang: 'es' | 'en'
  players: PlayerData[]
  metric: 'goles' | 'asist'
  accent: 'primary' | 'teal'
}) {
  const colTemplate = '34px 38px minmax(120px,1.4fr) minmax(110px,1fr) 52px 52px 44px 52px'
  const header = [
    '',
    '',
    t(lang, 'Jugador', 'Player'),
    t(lang, 'Club', 'Club'),
    metric === 'goles' ? t(lang, 'Gol', 'G') : t(lang, 'Asi', 'A'),
    metric === 'goles' ? t(lang, 'Asi', 'A') : t(lang, 'Gol', 'G'),
    'PJ',
    'IIG',
  ]
  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 480 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: colTemplate, gap: 8, padding: '10px 14px', alignItems: 'center',
            background: 'var(--ts-card2)', borderBottom: '1px solid var(--ts-border)',
            fontSize: 10, color: 'var(--ts-muted)', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase',
          }}>
            {header.map((h, i) => (
              <span key={i} style={{ textAlign: i >= 4 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {players.map((p, i) => {
            const rank = i + 1
            const g = p.goles ?? 0
            const a = p.asist ?? 0
            const primary = metric === 'goles' ? g : a
            const secondary = metric === 'goles' ? a : g
            return (
              <Link
                key={playerSlug(p) + i}
                href={`/${lang}/jugadores/${playerSlug(p)}`}
                style={{
                  display: 'grid', gridTemplateColumns: colTemplate, gap: 8, padding: '9px 14px', alignItems: 'center',
                  borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: rank <= 3 ? `var(--ts-${accent})` : 'var(--ts-muted)' }}>
                  {String(rank).padStart(2, '0')}
                </span>
                <Avatar name={p.name} size={32} photo={p.photo} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.flag ? `${p.flag} ` : ''}{p.name}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <ClubCrest club={p.club} />
                  <span style={{ fontSize: 12, color: 'var(--ts-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.club}</span>
                </div>
                <span style={{ textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16, color: `var(--ts-${accent})`, fontVariantNumeric: 'tabular-nums' }}>{primary}</span>
                <span style={{ textAlign: 'right', fontSize: 13, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>{secondary}</span>
                <span style={{ textAlign: 'right', fontSize: 13, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>{p.pj}</span>
                <span style={{ textAlign: 'right', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{iig(p).toFixed(1)}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── League MVP gold card ──────────────────────────────────────────────────────
function MvpCard({ lang, player }: { lang: 'es' | 'en'; player: PlayerData }) {
  return (
    <Link
      href={`/${lang}/jugadores/${playerSlug(player)}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 18, padding: '20px 22px', textDecoration: 'none',
        background: 'linear-gradient(135deg, var(--ts-primary-soft), var(--ts-card))',
        border: '1px solid var(--ts-border-hot)', borderRadius: 14,
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={player.name} size={68} photo={player.photo} />
        <span style={{
          position: 'absolute', bottom: -4, right: -4, background: 'var(--ts-primary)', color: '#1a1400',
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 11, padding: '1px 6px',
          borderRadius: 6, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>MVP</span>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ts-primary)', fontFamily: 'Barlow Condensed, sans-serif' }}>
          {t(lang, 'MVP de la liga', 'League MVP')}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ts-text)', fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1.1, marginTop: 2 }}>
          {player.flag ? `${player.flag} ` : ''}{player.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--ts-muted)', fontSize: 13 }}>
          <ClubCrest club={player.club} />
          <span>{player.club}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
        {[
          { label: 'IIG', value: iig(player).toFixed(1), hot: true },
          { label: t(lang, 'Goles', 'Goals'), value: String(player.goles ?? 0) },
          { label: t(lang, 'Asis', 'Asts'), value: String(player.asist ?? 0) },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 26, lineHeight: 1, color: s.hot ? 'var(--ts-primary)' : 'var(--ts-text)' }}>{s.value}</div>
            <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Link>
  )
}

// ── Position leader mini card ─────────────────────────────────────────────────
function LeaderCard({
  lang, label, player, statLabel, statValue, accent,
}: {
  lang: 'es' | 'en'
  label: string
  player: PlayerData
  statLabel: string
  statValue: number
  accent: 'primary' | 'teal'
}) {
  return (
    <Link
      href={`/${lang}/jugadores/${playerSlug(player)}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', textDecoration: 'none',
        background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12,
      }}
    >
      <Avatar name={player.name} size={42} photo={player.photo} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: `var(--ts-${accent})`, fontFamily: 'Barlow Condensed, sans-serif' }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player.flag ? `${player.flag} ` : ''}{player.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{player.club}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 22, color: `var(--ts-${accent})`, lineHeight: 1 }}>{statValue}</div>
        <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)', marginTop: 2 }}>{statLabel}</div>
      </div>
    </Link>
  )
}

export default function LeagueClient({
  lang, league, leagueName, leagueCountry, leagueId, leagueColor, leagueFlag, leagueSlug, players,
}: Props) {
  const [showAllScorers, setShowAllScorers] = useState(false)
  const [tab, setTab] = useState<TabKey>('resumen')

  const scorers = useMemo(
    () => [...players].sort((a, b) => (b.goles ?? 0) - (a.goles ?? 0) || iig(b) - iig(a)),
    [players],
  )
  const assisters = useMemo(
    () => [...players].sort((a, b) => (b.asist ?? 0) - (a.asist ?? 0)).filter(p => (p.asist ?? 0) > 0).slice(0, 8),
    [players],
  )
  // Real-data-only derived views.
  const summaryScorers = useMemo(() => topScorersForLeague(league, 8), [league])
  const summaryAssisters = useMemo(() => topAssistersForLeague(league, 8), [league])
  const clubsRanked = useMemo(() => clubsRankedForLeague(league, 10), [league])
  const youngsters = useMemo(() => youngProspectsForLeague(league, 21, 12), [league])
  const mvp = useMemo(() => {
    const eligible = players.filter(p => (p.pj ?? 0) >= 10)
    const pool = eligible.length ? eligible : players
    return [...pool].sort((a, b) => iig(b) - iig(a))[0]
  }, [players])

  const bestMf = useMemo(() => {
    const mfs = players.filter(p => p.position === 'MF' && (p.keyPasses ?? 0) > 0)
    return [...mfs].sort((a, b) => (b.keyPasses ?? 0) - (a.keyPasses ?? 0))[0]
  }, [players])
  const bestDf = useMemo(() => {
    const dfs = players.filter(p => p.position === 'DF' && (p.tacklesTotal ?? 0) > 0)
    return [...dfs].sort((a, b) => (b.tacklesTotal ?? 0) - (a.tacklesTotal ?? 0))[0]
  }, [players])

  const topScorers = showAllScorers ? scorers.slice(0, 20) : scorers.slice(0, 12)

  // Related: other leagues with data + canonical ranking links.
  const otherLeagues: RelatedLink[] = leaguesWithData('2526')
    .filter(l => l.slug !== leagueSlug)
    .slice(0, 6)
    .map(l => ({ href: `/${lang}/competiciones/${l.slug}`, label: l.league.name }))
  const relatedLinks: RelatedLink[] = [
    ...otherLeagues,
    { href: `/${lang}/bota-de-oro`, label: t(lang, 'Bota de Oro', 'Golden Boot') },
    { href: `/${lang}/records`, label: t(lang, 'Récords y líderes', 'Records & leaders') },
    { href: `/${lang}/competiciones`, label: t(lang, 'Todas las ligas', 'All leagues') },
  ]

  const empty = players.length === 0

  // Tabs are gated on real data: "Jóvenes" only appears if U21 players exist.
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'resumen', label: t(lang, 'Resumen', 'Overview') },
    { key: 'goleadores', label: t(lang, 'Goleadores', 'Scorers') },
    ...(assisters.length > 0 ? [{ key: 'asistentes' as const, label: t(lang, 'Asistentes', 'Assisters') }] : []),
    ...(youngsters.length > 0 ? [{ key: 'jovenes' as const, label: t(lang, 'Jóvenes promesas', 'Young guns') }] : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1000 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://media.api-sports.io/football/leagues/${leagueId}.png`}
          alt={leagueName}
          width={56}
          height={56}
          style={{ objectFit: 'contain', flexShrink: 0, borderRadius: 6 }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ts-muted)', fontSize: 12 }}>
            {leagueFlag && <span style={{ fontSize: 15 }}>{leagueFlag}</span>}
            <span>{leagueCountry}</span>
            <span style={{
              padding: '1px 8px', borderRadius: 5, fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5,
              background: `${leagueColor}22`, color: leagueColor, border: `1px solid ${leagueColor}55`,
            }}>
              {t(lang, 'Temporada 25/26', 'Season 25/26')}
            </span>
          </div>
          <h1 style={{ ...headingStyle, fontSize: 36, color: 'var(--ts-text)', lineHeight: 1, marginTop: 4 }}>
            {leagueName}
          </h1>
        </div>
      </div>

      {empty ? (
        <div style={{
          background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12,
          padding: '40px 20px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--ts-text)', marginBottom: 8 }}>
            {t(lang, 'Datos próximamente', 'Data coming soon')}
          </div>
          <p style={{ color: 'var(--ts-muted)', fontSize: 14, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            {t(
              lang,
              `Todavía no tenemos estadísticas de jugadores cargadas para ${leagueName} en la temporada 25/26. Mientras tanto, explora las ligas con datos disponibles.`,
              `We don't have player stats loaded for ${leagueName} in the 25/26 season yet. In the meantime, explore the leagues with available data.`,
            )}
          </p>
        </div>
      ) : (
        <>
          {/* ── View switcher ── */}
          <SegmentedControl tabs={tabs} active={tab} onChange={setTab} />

          {/* ════════════ RESUMEN ════════════ */}
          {tab === 'resumen' && (
            <>
              {/* MVP */}
              {mvp && <MvpCard lang={lang} player={mvp} />}

              {/* Clubs ranking (left) + scorers/assisters (right) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
                {/* Clubs ranking — honestly NOT a standings table */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h2 style={{ ...headingStyle, fontSize: 18, color: 'var(--ts-text)' }}>
                    {t(lang, 'Clasificación de clubes', 'Club ranking')}
                  </h2>
                  <p style={{ fontSize: 11, color: 'var(--ts-muted)', lineHeight: 1.5, margin: 0 }}>
                    {t(
                      lang,
                      'Clubes ordenados por la producción ofensiva real de sus jugadores rastreados (goles y asistencias sumados). No es la clasificación oficial por puntos.',
                      'Clubs ranked by the real attacking output of their tracked players (goals + assists). This is not the official points standings.',
                    )}
                  </p>
                  <ClubsTable lang={lang} rows={clubsRanked} accentColor={leagueColor} />
                </section>

                {/* Top scorers + top assisters stacked */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h2 style={{ ...headingStyle, fontSize: 18, color: 'var(--ts-primary)' }}>
                      {t(lang, 'Máximos goleadores', 'Top scorers')}
                    </h2>
                    <StatTable lang={lang} players={summaryScorers} metric="goles" accent="primary" />
                  </section>
                  {summaryAssisters.length > 0 && (
                    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <h2 style={{ ...headingStyle, fontSize: 18, color: 'var(--ts-teal)' }}>
                        {t(lang, 'Top asistentes', 'Top assisters')}
                      </h2>
                      <StatTable lang={lang} players={summaryAssisters} metric="asist" accent="teal" />
                    </section>
                  )}
                </div>
              </div>

              {/* Position leaders (only if real position-stat data exists) */}
              {(bestMf || bestDf) && (
                <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 style={{ ...headingStyle, fontSize: 18, color: 'var(--ts-text)' }}>
                    {t(lang, 'Líderes por posición', 'Position leaders')}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {bestMf && (
                      <LeaderCard
                        lang={lang}
                        label={t(lang, 'Mejor centrocampista', 'Best midfielder')}
                        player={bestMf}
                        statLabel={t(lang, 'P. clave', 'Key passes')}
                        statValue={bestMf.keyPasses ?? 0}
                        accent="primary"
                      />
                    )}
                    {bestDf && (
                      <LeaderCard
                        lang={lang}
                        label={t(lang, 'Mejor defensa', 'Best defender')}
                        player={bestDf}
                        statLabel={t(lang, 'Entradas', 'Tackles')}
                        statValue={bestDf.tacklesTotal ?? 0}
                        accent="teal"
                      />
                    )}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ════════════ GOLEADORES ════════════ */}
          {tab === 'goleadores' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <h2 style={{ ...headingStyle, fontSize: 20, color: 'var(--ts-primary)' }}>
                  {t(lang, 'Pichichi · Máximos goleadores', 'Top scorers')}
                </h2>
                {scorers.length > 12 && (
                  <button
                    onClick={() => setShowAllScorers(v => !v)}
                    style={{
                      background: 'transparent', border: '1px solid var(--ts-border)', borderRadius: 8,
                      color: 'var(--ts-muted)', fontSize: 11, fontWeight: 600, padding: '4px 10px',
                      cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5,
                    }}
                  >
                    {showAllScorers ? t(lang, 'Ver menos', 'Show less') : t(lang, 'Ver top 20', 'Show top 20')}
                  </button>
                )}
              </div>
              <StatTable lang={lang} players={topScorers} metric="goles" accent="primary" />
            </section>
          )}

          {/* ════════════ ASISTENTES ════════════ */}
          {tab === 'asistentes' && assisters.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ ...headingStyle, fontSize: 20, color: 'var(--ts-teal)' }}>
                {t(lang, 'Top asistentes', 'Top assisters')}
              </h2>
              <StatTable lang={lang} players={assisters} metric="asist" accent="teal" />
            </section>
          )}

          {/* ════════════ JÓVENES PROMESAS (U21) ════════════ */}
          {tab === 'jovenes' && youngsters.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ ...headingStyle, fontSize: 20, color: 'var(--ts-primary)' }}>
                {t(lang, 'Jóvenes promesas · Sub-21', 'Young guns · U21')}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--ts-muted)', lineHeight: 1.5, margin: 0 }}>
                {t(
                  lang,
                  'Jugadores de 21 años o menos ordenados por contribución de goles + asistencias.',
                  'Players aged 21 or under, ranked by goal + assist contribution.',
                )}
              </p>
              <StatTable lang={lang} players={youngsters} metric="goles" accent="primary" />
            </section>
          )}
        </>
      )}

      <RelatedLinks
        title={t(lang, 'Más rankings', 'More rankings')}
        links={relatedLinks}
      />
    </div>
  )
}
