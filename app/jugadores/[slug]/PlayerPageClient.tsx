'use client'

import { useTheme } from '@/contexts/ThemeContext'
import type { EnrichedPlayer } from '@/types'
import type { ApiPlayerResponse } from '@/lib/api-football'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const PlayerRadar = dynamic(() => import('@/components/PlayerRadar'), { ssr: false })

interface Props {
  player: EnrichedPlayer
  liveStats: ApiPlayerResponse | null
  allSeasons: EnrichedPlayer[]
}

export default function PlayerPageClient({ player, liveStats, allSeasons }: Props) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const cardBg = isLight ? '#ffffff' : 'rgba(255,255,255,.04)'
  const cardBorder = isLight ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.07)'
  const sectionBg = isLight ? 'rgba(235,240,255,.6)' : 'rgba(8,14,28,.9)'
  const textMuted = isLight ? '#5060a0' : '#6878a0'
  const textPrimary = isLight ? '#0f1830' : '#dde8ff'

  const s = liveStats?.statistics[0]
  const goals = s?.goals.total ?? player.goles
  const assists = s?.goals.assists ?? player.asist
  const pj = s?.games.appearences ?? player.pj

  const seasonLabel = (raw: string) => raw.replace(/(\d{2})(\d{2})/, '20$1/20$2')

  return (
    <div className="max-w-[900px] mx-auto px-5 py-8">
      {/* Back nav */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 mb-6 text-[12px] font-semibold transition-colors"
        style={{ color: textMuted, textDecoration: 'none' }}
      >
        ← Goleadores
      </Link>

      {/* Header card */}
      <div
        className="rounded-lg p-6 mb-5"
        style={{ background: sectionBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="flex items-start gap-5 flex-wrap">
          <div>
            <h1
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 42,
                fontWeight: 800,
                color: textPrimary,
                lineHeight: 1,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {player.flag && <span className="mr-2">{player.flag}</span>}
              {player.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span style={{ fontSize: 14, color: textMuted }}>{player.club}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 3,
                  background: 'rgba(240,192,64,.12)',
                  border: '1px solid rgba(240,192,64,.3)',
                  color: '#f0c040',
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
                    color: '#00c8b0',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {player.position}
                </span>
              )}
            </div>
          </div>
          <div className="ml-auto flex gap-3 flex-wrap">
            {player.age != null && (
              <div className="text-center">
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: textPrimary,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {player.age}
                </div>
                <div style={{ fontSize: 10, color: textMuted, letterSpacing: 1 }}>EDAD</div>
              </div>
            )}
            {player.elo != null && (
              <div className="text-center">
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#f0c040',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {player.elo}
                </div>
                <div style={{ fontSize: 10, color: textMuted, letterSpacing: 1 }}>ELO</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'GOLES', value: goals, color: '#f0c040' },
          { label: 'ASIST.', value: assists, color: '#00c8b0' },
          { label: 'PJ', value: pj, color: textMuted },
          { label: 'G/PJ', value: pj > 0 ? (goals / pj).toFixed(2) : '—', color: '#38c47a' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-lg p-4 text-center"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div
              style={{
                fontSize: 36,
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
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Radar */}
      <div
        className="rounded-lg p-5 mb-5"
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
        <PlayerRadar player={player} color="#f0c040" />
      </div>

      {/* Season history */}
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
              <tr
                style={{
                  background: isLight ? 'rgba(235,240,255,.8)' : 'rgba(255,255,255,.03)',
                }}
              >
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
                    style={{
                      padding: '10px 12px',
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#f0c040',
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                  >
                    {s.goles}
                  </td>
                  <td
                    className="text-right"
                    style={{
                      padding: '10px 12px',
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#00c8b0',
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                  >
                    {s.asist}
                  </td>
                  <td className="text-right" style={{ padding: '10px 12px', fontSize: 12, color: textMuted }}>
                    {s.ratio_g.toFixed(2)}
                  </td>
                  <td
                    className="text-right"
                    style={{
                      padding: '10px 12px',
                      fontSize: 14,
                      fontWeight: 700,
                      color: textPrimary,
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                  >
                    {s.val_sin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Market info */}
      {(player.marketValue || player.contractUntil || player.fantasyPoints) && (
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
            {player.marketValue && (
              <div>
                <div style={{ fontSize: 10, color: textMuted, letterSpacing: '1px' }}>VALOR MERCADO</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#38c47a',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {player.marketValue}
                </div>
              </div>
            )}
            {player.contractUntil && (
              <div>
                <div style={{ fontSize: 10, color: textMuted, letterSpacing: '1px' }}>CONTRATO</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: textPrimary,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  Hasta {player.contractUntil}
                </div>
              </div>
            )}
            {player.fantasyPoints != null && (
              <div>
                <div style={{ fontSize: 10, color: textMuted, letterSpacing: '1px' }}>FANTASY PTS</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#a060ff',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {player.fantasyPoints}
                </div>
              </div>
            )}
            {player.fantasyPrice != null && (
              <div>
                <div style={{ fontSize: 10, color: textMuted, letterSpacing: '1px' }}>PRECIO FANTASY</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#a060ff',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  €{player.fantasyPrice}M
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
