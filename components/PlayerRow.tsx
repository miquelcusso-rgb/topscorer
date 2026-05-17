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

  const rankColor =
    rank === 1 ? '#f0c040' :
    rank === 2 ? '#b0b8c8' :
    rank === 3 ? '#cd8c5a' :
    '#2a2b3e'

  const isTop1 = rank === 1
  const isTop3 = rank <= 3
  const mainVal = isAssist ? player.asist : player.goles
  const barPct  = Math.round((mainVal / maxVal) * 100)
  const ls      = LEAGUE_STYLE[player.league] ?? { bg: 'rgba(90,90,122,.1)', color: '#52526e', border: 'rgba(90,90,122,.22)' }
  const pos     = player.position ? POS_STYLE[player.position] : null

  const eloColor = player.elo != null
    ? player.elo >= 2100 ? '#f0c040' : player.elo >= 1900 ? '#38c47a' : '#00c8b0'
    : '#52526e'

  return (
    <tr
      className="group cursor-pointer"
      style={{
        height: 38,
        borderBottom: '1px solid rgba(255,255,255,.025)',
        background: isTop1
          ? 'rgba(240,192,64,.04)'
          : isTop3
          ? 'rgba(240,192,64,.02)'
          : rank % 2 === 0
          ? 'rgba(255,255,255,.018)'
          : 'transparent',
        borderLeft: player.isPinned
          ? '3px solid #e05a30'
          : isTop1
          ? '3px solid rgba(240,192,64,.5)'
          : '3px solid transparent',
        transition: 'background 150ms ease, border-left-color 150ms ease',
      }}
      onMouseEnter={e => {
        setCardOpen(true)
        e.currentTarget.style.background = 'rgba(255,255,255,.035)'
        if (!player.isPinned && !isTop1) {
          e.currentTarget.style.borderLeftColor = isAssist ? 'rgba(0,200,176,.5)' : 'rgba(240,192,64,.5)'
        }
      }}
      onMouseLeave={e => {
        setCardOpen(false)
        e.currentTarget.style.background = isTop1
          ? 'rgba(240,192,64,.04)'
          : isTop3
          ? 'rgba(240,192,64,.02)'
          : rank % 2 === 0
          ? 'rgba(255,255,255,.018)'
          : 'transparent'
        if (!player.isPinned && !isTop1) {
          e.currentTarget.style.borderLeftColor = 'transparent'
        }
      }}
      onClick={() => setCardOpen(v => !v)}
    >
      {/* Rank */}
      <td className="pl-3 pr-2 text-right" style={{ width: 44, fontFamily: "'Bebas Neue', cursive", lineHeight: 1 }}>
        {isTop3 ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%', fontSize: 12,
            color: rankColor,
            background: rank === 1 ? 'rgba(240,192,64,.14)' : rank === 2 ? 'rgba(176,184,200,.08)' : 'rgba(205,140,90,.08)',
            border: `1px solid ${rank === 1 ? 'rgba(240,192,64,.3)' : rank === 2 ? 'rgba(176,184,200,.2)' : 'rgba(205,140,90,.2)'}`,
          }}>
            {rank}
          </span>
        ) : (
          <span style={{ fontSize: 13, color: '#3a3b50' }}>{rank}</span>
        )}
      </td>

      {/* Name + club */}
      <td className="py-0 pr-2 relative" style={{ width: 210, maxWidth: 210, overflow: 'hidden' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="min-w-0">
            <div
              className="font-semibold leading-tight truncate"
              style={{
                fontSize: 13,
                color: '#d8d8ec',
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
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  padding: '1px 4px',
                  color: ls.color,
                  background: ls.bg,
                  border: `1px solid ${ls.border}`,
                  flexShrink: 0,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textTransform: 'uppercase',
                }}
              >
                {player.club.slice(0, 3)}
              </span>
              {player.isFiller && !player.isPinned && (
                <span style={{ fontSize: 8, color: '#2a2b3e' }}>(relleno)</span>
              )}
              {pos && (
                <span style={{ fontSize: 7, fontWeight: 700, padding: '1px 3px', borderRadius: 2, color: pos.color, background: pos.bg, flexShrink: 0, letterSpacing: 0.3 }}>
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
          style={{ fontSize: 9, letterSpacing: 0.5, padding: '2px 5px', color: ls.color, background: ls.bg, border: `1px solid ${ls.border}` }}
        >
          {player.league}
        </span>
      </td>

      {/* Age */}
      <td className="pr-3 text-right tabular" style={{ fontSize: 11, color: '#52526e' }}>
        {player.age}
      </td>

      {/* PJ */}
      {showPj && (
        <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#2a2b3e' }}>
          {player.pj}
        </td>
      )}

      {/* Main stat + mini bar */}
      <td className="pr-3">
        <div className="flex items-center justify-end gap-2">
          <div className="h-[2px] rounded-full w-[52px] shrink-0" style={{ background: 'rgba(255,255,255,.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: isAssist ? '#00c8b0' : '#f0c040', opacity: 0.65 }} />
          </div>
          <span className="tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: isAssist ? '#00c8b0' : '#f0c040', lineHeight: 1, minWidth: 20, textAlign: 'right' }}>
            {mainVal}
          </span>
        </div>
      </td>

      {/* Secondary stat */}
      <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: isAssist ? 'rgba(240,192,64,.6)' : 'rgba(0,200,176,.6)', lineHeight: 1 }}>
        {isAssist ? player.goles : player.asist}
      </td>

      {/* Ratios */}
      {showRatios && (
        <>
          <td className="pr-3 text-right tabular" style={{ fontSize: 11, fontWeight: 600, color: isAssist ? 'rgba(0,200,176,.85)' : 'rgba(240,192,64,.85)' }}>
            {isAssist ? player.ratio_a.toFixed(2) : player.ratio_g.toFixed(2)}
          </td>
          <td className="pr-3 text-right tabular" style={{ fontSize: 11, fontWeight: 600, color: isAssist ? 'rgba(240,192,64,.85)' : 'rgba(0,200,176,.85)' }}>
            {isAssist ? player.ratio_g.toFixed(2) : player.ratio_a.toFixed(2)}
          </td>
        </>
      )}

      {/* Val sin / G+A */}
      {showValSin && (
        isAssist ? (
          <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#38c47a', lineHeight: 1 }}>
            {player.goles + player.asist}
          </td>
        ) : (
          <td className="pr-3 text-right tabular" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#e05a30', lineHeight: 1 }}>
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
          <small className="ml-1" style={{ fontSize: 8, color: '#2a2b3e' }}>×{player.coef}</small>
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
              <div style={{ fontSize: 9, color: '#52526e' }}>€{player.fantasyPrice}M</div>
            )}
          </div>
        </td>
      )}

    </tr>
  )
}
