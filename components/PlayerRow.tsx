'use client'

import { useState } from 'react'
import type { EnrichedPlayer } from '@/types'
import { LEAGUE_STYLE } from '@/lib/utils'
import PlayerHoverCard from './PlayerHoverCard'
import WatchlistButton from './WatchlistButton'

interface Props {
  player: EnrichedPlayer
  rank: number
  isAssist: boolean
  maxVal: number
  showElo: boolean
  showFantasy: boolean
  showPj?: boolean
  showRatios?: boolean
  showValSin?: boolean
  showValCoef?: boolean
  watchlisted?: boolean
  onWatchlistToggle?: (name: string) => void
  onUnpin?: (name: string) => void
}

const POS_STYLE: Record<string, { color: string; bg: string }> = {
  FW: { color: '#e05a30', bg: 'rgba(224,90,48,.12)' },
  MF: { color: '#00c8b0', bg: 'rgba(0,200,176,.1)'  },
  DF: { color: '#6080d0', bg: 'rgba(96,128,208,.1)'  },
  GK: { color: '#f0c040', bg: 'rgba(240,192,64,.1)'  },
}

export default function PlayerRow({
  player, rank, isAssist, maxVal,
  showElo, showFantasy,
  showPj = true, showRatios = true, showValSin = true, showValCoef = true,
  watchlisted, onWatchlistToggle,
  onUnpin,
}: Props) {
  const [cardOpen, setCardOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  const rankColor =
    rank === 1 ? '#f0c040' :
    rank <= 3   ? '#9090a8' :
    '#3a3d5c'

  const isTop1 = rank === 1
  const isTop3 = rank <= 3
  const mainVal = isAssist ? player.asist : player.goles
  const barPct  = Math.round((mainVal / maxVal) * 100)
  const ls      = LEAGUE_STYLE[player.league] ?? { bg: 'rgba(90,90,122,.1)', color: '#52526e', border: 'rgba(90,90,122,.22)' }
  const pos     = player.position ? POS_STYLE[player.position] : null

  const eloColor = player.elo != null
    ? player.elo >= 2100 ? '#f0c040' : player.elo >= 1900 ? '#38c47a' : '#00c8b0'
    : '#52526e'

  // Row background: odd = slight tint, even = transparent (top3 get special bg)
  const rowBgDefault = isTop1
    ? 'rgba(240,192,64,.04)'
    : isTop3
    ? 'rgba(240,192,64,.02)'
    : rank % 2 !== 0
    ? 'rgba(255,255,255,.012)'
    : 'transparent'

  const rowBgHover = 'rgba(255,255,255,.028)'

  // Left border: pinned = orange, hover = accent/teal, else transparent
  const rowBorderLeft = player.isPinned
    ? '2px solid #e05a30'
    : isTop1
    ? '2px solid rgba(240,192,64,.5)'
    : hovered
    ? `2px solid rgba(240,192,64,.4)`
    : '2px solid transparent'

  return (
    <tr
      className="group cursor-pointer"
      style={{
        height: 42,
        borderBottom: '1px solid #181a2e',
        background: hovered ? rowBgHover : rowBgDefault,
        borderLeft: rowBorderLeft,
        transition: 'background 150ms ease, border-left-color 150ms ease',
      }}
      onMouseEnter={() => {
        setCardOpen(true)
        setHovered(true)
      }}
      onMouseLeave={() => {
        setCardOpen(false)
        setHovered(false)
      }}
      onClick={() => setCardOpen(v => !v)}
    >
      {/* Rank */}
      <td className="pl-3 pr-2 text-right" style={{ width: 44, fontFamily: "'Bebas Neue', cursive", lineHeight: 1 }}>
        {isTop3 ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%', fontSize: 13,
            color: rankColor,
            background: rank === 1 ? 'rgba(240,192,64,.14)' : rank === 2 ? 'rgba(144,144,168,.08)' : 'rgba(144,144,168,.06)',
            border: `1px solid ${rank === 1 ? 'rgba(240,192,64,.3)' : 'rgba(144,144,168,.2)'}`,
          }}>
            {rank}
          </span>
        ) : (
          <span style={{ fontSize: 14, color: '#3a3d5c' }}>{rank}</span>
        )}
      </td>

      {/* Name + club */}
      <td className="py-0 pr-2 relative" style={{ width: 210, maxWidth: 210, overflow: 'hidden' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="min-w-0">
            <div
              className="leading-tight truncate"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#d4d4ee',
                textShadow: isTop1 ? '0 0 12px rgba(240,192,64,.18)' : 'none',
              }}
            >
              {player.flag && <span className="mr-0.5 text-xs">{player.flag}</span>}
              {player.name}
              {player.isPinned && <span style={{ color: '#e05a30', fontSize: 9, marginLeft: 3 }}>★</span>}
            </div>
            <div className="flex items-center gap-1 leading-tight">
              <span
                className="truncate rounded-sm"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  padding: '2px 6px',
                  color: ls.color,
                  background: ls.bg,
                  border: `1px solid ${ls.border}`,
                  flexShrink: 0,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textTransform: 'uppercase' as const,
                }}
              >
                {player.club.slice(0, 3)}
              </span>
              {player.isFiller && !player.isPinned && (
                <span style={{ fontSize: 8, color: '#3a3d5c' }}>(relleno)</span>
              )}
              {pos && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 2, color: pos.color, background: pos.bg, flexShrink: 0, letterSpacing: 0.3 }}>
                  {player.position}
                </span>
              )}
            </div>
          </div>
          {player.isPinned && onUnpin && (
            <button
              className="shrink-0 px-1 py-px rounded-sm transition-colors duration-150 cursor-pointer"
              style={{ fontSize: 9, fontWeight: 700, color: 'rgba(224,90,48,.55)', border: '1px solid rgba(224,90,48,.22)', background: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e05a30'; e.currentTarget.style.borderColor = '#e05a30' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(224,90,48,.55)'; e.currentTarget.style.borderColor = 'rgba(224,90,48,.22)' }}
              onClick={e => { e.stopPropagation(); onUnpin(player.name) }}
            >
              ✕
            </button>
          )}
          {onWatchlistToggle && (
            <WatchlistButton
              saved={!!watchlisted}
              onClick={e => { e.stopPropagation(); onWatchlistToggle(player.name) }}
            />
          )}
        </div>
        <PlayerHoverCard player={player} showElo={showElo} showFantasy={showFantasy} open={cardOpen} />
      </td>

      {/* League badge */}
      <td className="pr-3">
        <span
          className="font-semibold whitespace-nowrap rounded-sm"
          style={{ fontSize: 11, letterSpacing: 0.5, padding: '2px 6px', color: ls.color, background: ls.bg, border: `1px solid ${ls.border}` }}
        >
          {player.league}
        </span>
      </td>

      {/* Age */}
      <td className="pr-3 text-right tabular" style={{ fontSize: 12, color: '#5a5b7a' }}>
        {player.age}
      </td>

      {/* PJ */}
      {showPj && (
        <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#3a3d5c' }}>
          {player.pj}
        </td>
      )}

      {/* Main stat + mini bar */}
      <td className="pr-3">
        <div className="flex items-center justify-end gap-2">
          <div className="h-[2px] rounded-full w-[52px] shrink-0" style={{ background: '#1e2033' }}>
            <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: isAssist ? 'rgba(0,200,176,.35)' : 'rgba(240,192,64,.45)' }} />
          </div>
          <span className="tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: '#eeeef5', lineHeight: 1, minWidth: 20, textAlign: 'right' }}>
            {mainVal}
          </span>
        </div>
      </td>

      {/* Secondary stat */}
      <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: isAssist ? 'rgba(240,192,64,.6)' : '#00c8b0', lineHeight: 1 }}>
        {isAssist ? player.goles : player.asist}
      </td>

      {/* Ratios */}
      {showRatios && (
        <>
          <td className="pr-3 text-right tabular" style={{ fontSize: 13, fontWeight: 600, color: '#5a5b7a' }}>
            {isAssist ? player.ratio_a.toFixed(2) : player.ratio_g.toFixed(2)}
          </td>
          <td className="pr-3 text-right tabular" style={{ fontSize: 13, fontWeight: 600, color: '#5a5b7a' }}>
            {isAssist ? player.ratio_g.toFixed(2) : player.ratio_a.toFixed(2)}
          </td>
        </>
      )}

      {/* Val sin / G+A */}
      {showValSin && (
        isAssist ? (
          <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#f0c040', lineHeight: 1 }}>
            {player.goles + player.asist}
          </td>
        ) : (
          <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#f0c040', lineHeight: 1 }}>
            {player.val_sin}
          </td>
        )
      )}

      {/* Val con coef (scorer only) */}
      {!isAssist && showValCoef && (
        <td className="pr-3 text-right tabular">
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#a060ff', lineHeight: 1 }}>
            {player.val_con}
          </span>
          <small className="ml-1" style={{ fontSize: 8, color: '#3a3d5c' }}>×{player.coef}</small>
        </td>
      )}

      {/* ELO */}
      {showElo && (
        <td className="pr-3 text-right tabular">
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 15, color: eloColor, lineHeight: 1 }}>
            {player.elo ?? '—'}
          </span>
        </td>
      )}

      {/* Fantasy */}
      {showFantasy && (
        <td className="pr-3 text-right tabular">
          <div className="flex flex-col items-end">
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 15, color: '#a060ff', lineHeight: 1 }}>
              {player.fantasyPoints ?? '—'}
            </span>
            {player.fantasyPrice != null && (
              <div style={{ fontSize: 9, color: '#5a5b7a' }}>€{player.fantasyPrice}M</div>
            )}
          </div>
        </td>
      )}

    </tr>
  )
}
