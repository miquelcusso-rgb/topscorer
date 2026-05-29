'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useUser } from '@clerk/nextjs'
import { isPro } from '@/lib/plans'
import type { EnrichedPlayer } from '@/types'
import type { ApiPlayerResponse, ApiPlayerDetail } from '@/lib/api-football'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import HiddenGemSeal, { getSealVariant } from '@/components/HiddenGemSeal'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import AdSlot from '@/components/AdSlot'

const PlayerRadar = dynamic(() => import('@/components/PlayerRadar'), { ssr: false })

interface Props {
  player: EnrichedPlayer
  liveStats: ApiPlayerResponse | null
  allSeasons: EnrichedPlayer[]
  playerDetails: ApiPlayerDetail | null
}

// ─── Static preferred-foot lookup for well-known players ─────────────────────
const PREFERRED_FOOT: Record<string, string> = {
  'Kylian Mbappé': 'Derecho',
  'Erling Haaland': 'Izquierdo',
  'Vinicius Junior': 'Derecho',
  'Lionel Messi': 'Izquierdo',
  'Cristiano Ronaldo': 'Derecho',
  'Mohamed Salah': 'Izquierdo',
  'Harry Kane': 'Derecho',
  'Lamine Yamal': 'Derecho',
  'Pedri': 'Izquierdo',
  'Jude Bellingham': 'Derecho',
  'Robert Lewandowski': 'Derecho',
  'Bukayo Saka': 'Izquierdo',
  'Phil Foden': 'Izquierdo',
  'Trent Alexander-Arnold': 'Derecho',
  'Rodri': 'Derecho',
  'Florian Wirtz': 'Izquierdo',
}

function formatBirthDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatSeasonLabel(season: number): string {
  const y2 = String(season + 1).slice(2)
  return `${String(season).slice(2)}/${y2}`
}

function StatMiniLabel({ label, sub, muted }: { label: string; sub: string; muted: string }) {
  return (
    <>
      <div style={{ fontSize: 9, color: muted, letterSpacing: '1px', marginTop: 3, fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 9, color: muted, opacity: 0.6 }}>{sub}</div>
    </>
  )
}

export default function PlayerPageClient({ player, liveStats, allSeasons, playerDetails }: Props) {
  const { theme } = useTheme()
  const { user, isLoaded } = useUser()
  const isLight = theme === 'light'
  // Kept for future Pro-only perks; advanced sections are now free.
  const proUser = isLoaded ? isPro(user?.publicMetadata as Record<string, unknown>) : false
  void proUser

  // ─── Design tokens ──────────────────────────────────────────────────────────
  const pageBg     = isLight ? '#edf1f8' : '#060d18'
  const cardBg     = isLight ? '#ffffff' : '#10111e'
  const cardBorder = isLight ? 'rgba(0,0,0,.08)' : '#1a1b2e'
  const sectionBg  = isLight ? 'rgba(235,240,255,.6)' : '#0c0d18'
  const textMuted  = isLight ? '#52526e' : '#52526e'
  const textPrimary = isLight ? '#0f1830' : '#d8d8ec'

  const gold  = '#f0c040'
  const teal  = '#00c8b0'
  const green = '#38c47a'

  // ─── Primary stats ──────────────────────────────────────────────────────────
  const det = playerDetails
  const s0  = liveStats?.statistics[0]

  const goals   = det?.statistics[0]?.goals.total ?? s0?.goals.total ?? player.goles
  const assists = det?.statistics[0]?.goals.assists ?? s0?.goals.assists ?? player.asist
  const pj      = det?.statistics[0]?.games.appearences ?? s0?.games.appearences ?? player.pj
  const minutes = det?.statistics[0]?.games.minutes ?? player.minutes ?? 0
  const g90     = minutes > 0
    ? ((goals / minutes) * 90).toFixed(2)
    : pj > 0 ? (goals / pj).toFixed(2) : '—'

  // ─── Secondary stats ────────────────────────────────────────────────────────
  const shotsTotal = det?.statistics[0]?.shots.total ?? null
  const shotsOn    = det?.statistics[0]?.shots.on ?? null
  const passesKey  = det?.statistics[0]?.passes.key ?? null
  const dribblesAttempts = det?.statistics[0]?.dribbles.attempts ?? null
  const dribblesSuccess  = det?.statistics[0]?.dribbles.success ?? null
  const duelsTotal = det?.statistics[0]?.duels.total ?? null
  const duelsWon   = det?.statistics[0]?.duels.won ?? null
  const yellow     = det?.statistics[0]?.cards.yellow ?? 0
  const penalties  = det?.statistics[0]?.penalty.scored ?? 0
  const rating     = det?.statistics[0]?.games.rating

  // ─── Physical ───────────────────────────────────────────────────────────────
  const height     = det?.player.height ?? player.height
  const weight     = det?.player.weight ?? player.weight
  const birthDate  = det?.player.birth.date ?? player.birthDate
  const birthPlace = det?.player.birth.place
    ? `${det.player.birth.place}, ${det.player.birth.country}`
    : player.birthPlace
  const preferredFoot = PREFERRED_FOOT[player.name]
  const apiRating = rating ? parseFloat(rating) : null

  // ─── Market value ───────────────────────────────────────────────────────────
  // TODO: Transfermarkt scraping or manual data entry for premium accuracy
  const marketValue = player.marketValue ?? (player.val_con > 0 ? `~€${player.val_con}` : null)

  const seasonLabel = (raw: string) => raw.replace(/(\d{2})(\d{2})/, '20$1/20$2')

  // ─── Season trend chart from playerDetails.statistics ───────────────────────
  const trendData = det
    ? det.statistics.map(stat => ({
        season: formatSeasonLabel(stat.league.season),
        goles: stat.goals.total,
        asist: stat.goals.assists ?? 0,
      }))
    : []

  return (
    <div className="min-h-screen" style={{ background: pageBg }}>
      <div className="max-w-[960px] mx-auto px-5 py-8">

        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mb-6 text-[12px] font-semibold transition-colors"
          style={{ color: textMuted, textDecoration: 'none' }}
        >
          ← Goleadores
        </Link>

        {/* ── HERO BANNER (always dark) ───────────────────────────────────── */}
        {(() => {
          const smallLeagues = new Set(['Championship','2. Bundesliga','Serie B','Ligue 2','Segunda División','Liga Portugal 2','1. Lig','Primeira Liga','Süper Lig','Super League Grecia'])
          const heroScore = player.pj > 0 ? ((player.goles / (player.pj * 0.9)) * 3 + (player.asist / (player.pj * 0.9)) * 2) * (smallLeagues.has(player.league) ? 1.4 : 1) * ((player.age ?? 99) <= 21 ? 1.5 : (player.age ?? 99) <= 24 ? 1.2 : 1) * (player.pj >= 20 ? 1.1 : 1) : 0
          const heroSeal = getSealVariant(heroScore, player.age ?? 99, smallLeagues.has(player.league))
          return (
        <div
          className="rounded-xl p-6 mb-5 relative overflow-hidden"
          style={{ background: '#060d18', border: `1px solid ${heroSeal === 'elite' ? 'rgba(240,192,64,.3)' : heroSeal === 'prospect' ? 'rgba(160,96,255,.25)' : heroSeal === 'gem' ? 'rgba(0,200,176,.25)' : '#1a1b2e'}` }}
        >
          {heroSeal && (
            <div style={{ position: 'absolute', top: 14, right: 16, opacity: 0.9, zIndex: 2 }}>
              <HiddenGemSeal variant={heroSeal} size="md" lang="es" />
            </div>
          )}
          <div className="flex items-center gap-5 flex-wrap">
            {/* Photo */}
            {det?.player.photo ? (
              <div
                className="rounded-full overflow-hidden shrink-0"
                style={{ width: 120, height: 120, border: '3px solid #1a1b2e' }}
              >
                <Image
                  src={det.player.photo}
                  alt={player.name}
                  width={120}
                  height={120}
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="rounded-full shrink-0 flex items-center justify-center"
                style={{
                  width: 120,
                  height: 120,
                  background: '#10111e',
                  border: '3px solid #1a1b2e',
                  fontSize: 40,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  color: gold,
                }}
              >
                {player.name.charAt(0)}
              </div>
            )}

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <h1
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 44,
                  fontWeight: 800,
                  color: '#d8d8ec',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {player.flag && <span className="mr-2">{player.flag}</span>}
                {player.name}
              </h1>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {liveStats?.statistics[0]?.team.logo && (
                  <Image
                    src={liveStats.statistics[0].team.logo}
                    alt={player.club}
                    width={20}
                    height={20}
                    className="object-contain"
                    unoptimized
                  />
                )}
                <span style={{ fontSize: 14, color: '#d8d8ec', fontWeight: 600 }}>{player.club}</span>

                {liveStats?.statistics[0]?.league.logo && (
                  <>
                    <span style={{ color: '#1a1b2e', margin: '0 2px' }}>·</span>
                    <Image
                      src={liveStats.statistics[0].league.logo}
                      alt={player.league}
                      width={16}
                      height={16}
                      className="object-contain"
                      unoptimized
                    />
                  </>
                )}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 3,
                    background: 'rgba(240,192,64,.12)',
                    border: '1px solid rgba(240,192,64,.3)',
                    color: gold,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: 1,
                  }}
                >
                  {player.league}
                </span>
                {player.position && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 3,
                      background: 'rgba(0,200,176,.08)',
                      border: '1px solid rgba(0,200,176,.25)',
                      color: teal,
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                  >
                    {player.position}
                  </span>
                )}
                {det?.player.injured && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 3,
                      background: 'rgba(224,90,48,.12)',
                      border: '1px solid rgba(224,90,48,.4)',
                      color: '#e05a30',
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                  >
                    LESIONADO
                  </span>
                )}
              </div>

              {/* Bio row */}
              <div
                className="flex flex-wrap gap-x-4 gap-y-1 mt-3"
                style={{ fontSize: 12, color: '#52526e' }}
              >
                {det?.player.nationality && <span>{player.flag} {det.player.nationality}</span>}
                {player.age != null && <span>{player.age} años</span>}
                {birthDate && <span>{formatBirthDate(birthDate)}</span>}
                {birthPlace && <span>{birthPlace}</span>}
                {height && <span>{height}</span>}
                {weight && <span>{weight}</span>}
              </div>
            </div>

            {/* ELO badge */}
            {player.elo != null && (
              <div className="text-center shrink-0">
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: gold,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {player.elo}
                </div>
                <div style={{ fontSize: 10, color: '#52526e', letterSpacing: 1, marginTop: 2 }}>ELO</div>
              </div>
            )}
          </div>
        </div>
          )
        })()}

        {/* ── PRIMARY STAT CARDS ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {([
            { label: 'GOLES', value: goals, color: gold },
            { label: 'ASISTENCIAS', value: assists ?? 0, color: teal },
            { label: 'PARTIDOS', value: pj, color: textMuted },
            { label: 'G/90 MIN', value: g90, color: green },
          ] as { label: string; value: string | number; color: string }[]).map(stat => (
            <div
              key={stat.label}
              className="rounded-lg p-4 text-center"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: stat.color,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: textMuted,
                  letterSpacing: '1.5px',
                  marginTop: 4,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Ad after primary stat cards */}
        <AdSlot slot="0987654321" format="rectangle" className="my-4" />

        {/* ── SECONDARY STATS ROW (disparos, pases clave, duelos…) ───────── */}
        {det && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
            {([
              {
                label: 'DISPAROS',
                value: shotsTotal != null ? `${shotsOn ?? 0}/${shotsTotal}` : '—',
                sub: 'A puerta / Total',
                color: textPrimary,
              },
              {
                label: 'PASES CLAVE',
                value: passesKey != null && pj > 0
                  ? (passesKey / pj).toFixed(1)
                  : String(passesKey ?? '—'),
                sub: 'por partido',
                color: textPrimary,
              },
              {
                label: 'REGATES',
                value: dribblesAttempts && dribblesAttempts > 0 && dribblesSuccess != null
                  ? `${Math.round((dribblesSuccess / dribblesAttempts) * 100)}%`
                  : '—',
                sub: 'completados',
                color: teal,
              },
              {
                label: 'DUELOS',
                value: duelsTotal && duelsTotal > 0 && duelsWon != null
                  ? `${Math.round((duelsWon / duelsTotal) * 100)}%`
                  : '—',
                sub: 'ganados',
                color: green,
              },
              {
                label: 'AMARILLAS',
                value: yellow,
                sub: 'tarjetas',
                color: yellow > 5 ? '#e05a30' : gold,
              },
              {
                label: 'PENALTIS',
                value: penalties,
                sub: 'marcados',
                color: textPrimary,
              },
            ] as { label: string; value: string | number; sub: string; color: string }[]).map(stat => (
              <div
                key={stat.label}
                className="rounded-lg p-3 text-center"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: stat.color,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <StatMiniLabel label={stat.label} sub={stat.sub} muted={textMuted} />
              </div>
            ))}
          </div>
        )}

        {/* ── TWO-COLUMN MAIN GRID ─────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Radar chart */}
          <div
            className="rounded-lg p-5"
            style={{ background: sectionBg, border: `1px solid ${cardBorder}` }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '2px',
                color: textMuted,
                fontFamily: "'Barlow Condensed', sans-serif",
                marginBottom: 12,
              }}
            >
              PERFIL ESTADÍSTICO
            </div>
            <PlayerRadar player={player} color={gold} />
          </div>

          {/* Physical & profile card */}
          <div
            className="rounded-lg p-5"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '2px',
                color: textMuted,
                fontFamily: "'Barlow Condensed', sans-serif",
                marginBottom: 16,
              }}
            >
              PERFIL FÍSICO
            </div>
            <div className="flex flex-col gap-3">
              {([
                { label: 'Altura', value: height ?? '—' },
                { label: 'Peso', value: weight ?? '—' },
                { label: 'Pie preferido', value: preferredFoot ?? 'N/D' },
                { label: 'Nacionalidad', value: det?.player.nationality ?? player.nationality ?? '—' },
                { label: 'Nacido', value: birthDate ? `${formatBirthDate(birthDate)}${birthPlace ? `, ${birthPlace}` : ''}` : '—' },
                { label: 'Rating API', value: apiRating != null ? apiRating.toFixed(2) : '—' },
              ] as { label: string; value: string }[]).map(row => (
                <div
                  key={row.label}
                  className="flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${cardBorder}`, paddingBottom: 8 }}
                >
                  <span style={{ fontSize: 12, color: textMuted }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Market value */}
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${cardBorder}` }}>
              <div style={{ fontSize: 10, color: textMuted, letterSpacing: '1px', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', marginBottom: 4 }}>
                Valor Estimado
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: green,
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}
              >
                {marketValue ?? '—'}
              </div>
              <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>
                * Estimación basada en estadísticas
              </div>
            </div>
          </div>
        </div>

        {/* ── STATISTICS BY COMPETITION TABLE ─────────────────────────────── */}
        {det && det.statistics.length > 0 && (
          <div
            className="rounded-lg overflow-hidden mb-5"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${cardBorder}`,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '2px',
                color: textMuted,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              ESTADÍSTICAS POR COMPETICIÓN
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: isLight ? 'rgba(235,240,255,.8)' : 'rgba(255,255,255,.03)' }}>
                    {['Competición', 'Equipo', 'PJ', 'Goles', 'Asist.', 'Min', 'Rating'].map(h => (
                      <th
                        key={h}
                        className="text-right first:text-left"
                        style={{
                          padding: '8px 12px',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '1.5px',
                          color: textMuted,
                          fontFamily: "'Barlow Condensed', sans-serif",
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {det.statistics.map((stat, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${cardBorder}` }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div className="flex items-center gap-2">
                          {stat.league.logo && (
                            <Image
                              src={stat.league.logo}
                              alt={stat.league.name}
                              width={16}
                              height={16}
                              className="object-contain"
                              unoptimized
                            />
                          )}
                          <div>
                            <div style={{ fontSize: 13, color: textPrimary, fontWeight: 600 }}>{stat.league.name}</div>
                            <div style={{ fontSize: 10, color: textMuted }}>{stat.league.country} · {stat.league.season}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div className="flex items-center gap-2">
                          {stat.team.logo && (
                            <Image
                              src={stat.team.logo}
                              alt={stat.team.name}
                              width={16}
                              height={16}
                              className="object-contain"
                              unoptimized
                            />
                          )}
                          <span style={{ fontSize: 12, color: textMuted }}>{stat.team.name}</span>
                        </div>
                      </td>
                      <td className="text-right" style={{ padding: '10px 12px', fontSize: 13, color: textMuted }}>{stat.games.appearences}</td>
                      <td
                        className="text-right"
                        style={{ padding: '10px 12px', fontSize: 18, fontWeight: 800, color: gold, fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        {stat.goals.total}
                      </td>
                      <td
                        className="text-right"
                        style={{ padding: '10px 12px', fontSize: 18, fontWeight: 800, color: teal, fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        {stat.goals.assists ?? 0}
                      </td>
                      <td className="text-right" style={{ padding: '10px 12px', fontSize: 12, color: textMuted }}>{stat.games.minutes ?? '—'}</td>
                      <td
                        className="text-right"
                        style={{
                          padding: '10px 12px',
                          fontSize: 14,
                          fontWeight: 700,
                          color: stat.games.rating ? green : textMuted,
                          fontFamily: "'Barlow Condensed', sans-serif",
                        }}
                      >
                        {stat.games.rating ? parseFloat(stat.games.rating).toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SEASON TREND MINI CHART (Trayectoria de temporada) ──────────── */}
        {trendData.length > 1 && (
          <div
            className="rounded-lg p-5 mb-5"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '2px',
                color: textMuted,
                fontFamily: "'Barlow Condensed', sans-serif",
                marginBottom: 12,
              }}
            >
              GOLES Y ASISTENCIAS POR COMPETICIÓN
            </div>
            <div className="flex gap-3 mb-2" style={{ fontSize: 10, color: textMuted }}>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: gold, borderRadius: 1, marginRight: 4 }} />
                Goles
              </span>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: teal, borderRadius: 1, marginRight: 4 }} />
                Asistencias
              </span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={trendData} barCategoryGap="25%">
                <XAxis
                  dataKey="season"
                  tick={{ fill: textMuted, fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#0e0e1c', border: '1px solid #1a1b2e', fontSize: 12, color: '#e5e5f2' }}
                  cursor={{ fill: 'rgba(255,255,255,.04)' }}
                />
                <Bar dataKey="goles" name="Goles" radius={[2, 2, 0, 0]}>
                  {trendData.map((_, i) => (
                    <Cell key={i} fill={gold} />
                  ))}
                </Bar>
                <Bar dataKey="asist" name="Asist." radius={[2, 2, 0, 0]}>
                  {trendData.map((_, i) => (
                    <Cell key={i} fill={teal} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── SEASON HISTORY TABLE ─────────────────────────────────────────── */}
        {allSeasons.length > 1 && (
          <div
            className="rounded-lg overflow-hidden mb-5"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${cardBorder}`,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '2px',
                color: textMuted,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              HISTORIAL POR TEMPORADA
            </div>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isLight ? 'rgba(235,240,255,.8)' : 'rgba(255,255,255,.03)' }}>
                  {['Temporada', 'Club', 'PJ', 'Goles', 'Asist.', 'G/PJ', 'Val.'].map(h => (
                    <th
                      key={h}
                      className="text-right first:text-left"
                      style={{
                        padding: '8px 12px',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        color: textMuted,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        textTransform: 'uppercase',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSeasons.map(s => (
                  <tr key={s.season} style={{ borderTop: `1px solid ${cardBorder}` }}>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: textPrimary, fontWeight: 600 }}>
                      {seasonLabel(s.season)}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: textMuted }}>{s.club}</td>
                    <td className="text-right" style={{ padding: '10px 12px', fontSize: 13, color: textMuted }}>
                      {s.pj}
                    </td>
                    <td
                      className="text-right"
                      style={{ padding: '10px 12px', fontSize: 16, fontWeight: 800, color: gold, fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {s.goles}
                    </td>
                    <td
                      className="text-right"
                      style={{ padding: '10px 12px', fontSize: 16, fontWeight: 800, color: teal, fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {s.asist}
                    </td>
                    <td className="text-right" style={{ padding: '10px 12px', fontSize: 12, color: textMuted }}>
                      {s.ratio_g.toFixed(2)}
                    </td>
                    <td
                      className="text-right"
                      style={{ padding: '10px 12px', fontSize: 14, fontWeight: 700, color: textPrimary, fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {s.val_sin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ADDITIONAL INFO ──────────────────────────────────────────────── */}
        {(player.contractUntil || player.fantasyPoints != null) && (
          <div
            className="rounded-lg p-5"
            style={{ background: sectionBg, border: `1px solid ${cardBorder}` }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '2px',
                color: textMuted,
                fontFamily: "'Barlow Condensed', sans-serif",
                marginBottom: 12,
              }}
            >
              INFO ADICIONAL
            </div>
            <div className="flex flex-wrap gap-5">
              {player.contractUntil && (
                <div>
                  <div style={{ fontSize: 10, color: textMuted, letterSpacing: '1px' }}>CONTRATO</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, fontFamily: "'Barlow Condensed', sans-serif" }}>
                    Hasta {player.contractUntil}
                  </div>
                </div>
              )}
              {player.fantasyPoints != null && (
                <div>
                  <div style={{ fontSize: 10, color: textMuted, letterSpacing: '1px' }}>FANTASY PTS</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#a060ff', fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {player.fantasyPoints}
                  </div>
                </div>
              )}
              {player.fantasyPrice != null && (
                <div>
                  <div style={{ fontSize: 10, color: textMuted, letterSpacing: '1px' }}>PRECIO FANTASY</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#a060ff', fontFamily: "'Barlow Condensed', sans-serif" }}>
                    €{player.fantasyPrice}M
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
