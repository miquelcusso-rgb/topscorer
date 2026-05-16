'use client'

import { useState } from 'react'
import type { EnrichedPlayer } from '@/types'
import { LEAGUE_STYLE } from '@/lib/utils'
import PlayerHoverCard from './PlayerHoverCard'

interface Props {
  player: EnrichedPlayer
  rank: number
  isAssist: boolean
  maxVal: number
  showElo: boolean
  showFantasy: boolean
  onUnpin?: (name: string) => void
}

const SRC_STYLE = {
  live: { label: 'Live',      color: '#38c47a', bg: 'rgba(56,196,122,.14)',  border: 'rgba(56,196,122,.28)' },
  srch: { label: 'Búsqueda', color: '#4a9eff', bg: 'rgba(74,158,255,.12)', border: 'rgba(74,158,255,.22)' },
  est:  { label: 'Estimado', color: '#e05a30', bg: 'rgba(224,90,48,.10)',  border: 'rgba(224,90,48,.22)' },
}

export default function PlayerRow({ player, rank, isAssist, maxVal, showElo, showFantasy, onUnpin }: Props) {
  const [cardOpen, setCardOpen] = useState(false)
  const isTop3 = rank <= 3
  const mainVal = isAssist ? player.asist : player.goles
  const barPct  = Math.round((mainVal / maxVal) * 100)
  const ls      = LEAGUE_STYLE[player.league] ?? { bg: 'rgba(90,90,122,.12)', color: '#5a5a7a', border: 'rgba(90,90,122,.25)' }
  const src     = SRC_STYLE[player.src]

  const eloColor = player.elo != null
    ? player.elo >= 2100 ? '#f0c040' : player.elo >= 1900 ? '#38c47a' : '#4a9eff'
    : '#5a5a7a'

  return (
    <tr
      className="group relative border-b transition-colors duration-150"
      style={{
        borderColor: 'rgba(255,255,255,.035)',
        background: isTop3 ? 'rgba(240,192,64,.025)' : 'transparent',
        borderLeft: player.isPinned ? '2px solid #e05a30' : '2px solid transparent',
      }}
      onMouseEnter={() => setCardOpen(true)}
      onMouseLeave={() => setCardOpen(false)}
      onClick={() => setCardOpen(v => !v)}
    >
      {/* Rank */}
      <td className="pl-3 pr-1 py-2.5 w-9 text-right" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 17, color: isTop3 ? '#f0c040' : '#36364e' }}>
        {rank}
      </td>

      {/* Name + hover card anchor */}
      <td className="py-2.5 pr-3 relative">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="min-w-0">
            <div
              className="font-semibold text-[13.5px] leading-tight truncate"
              style={{
                color: '#e5e5f2',
                textShadow: isTop3 ? '0 0 12px rgba(240,192,64,.25)' : 'none',
              }}
            >
              {player.flag && <span className="mr-1 text-sm">{player.flag}</span>}
              {player.name}
              {player.isPinned && <span style={{ color: '#e05a30', fontSize: 10, marginLeft: 4 }}>★</span>}
            </div>
            <div className="text-[10.5px] leading-tight truncate" style={{ color: '#5a5a7a' }}>
              {player.club}
              {player.isFiller && !player.isPinned && (
                <span className="ml-1 text-[9px]" style={{ color: '#36364e' }}>(relleno)</span>
              )}
            </div>
          </div>
          {player.isPinned && onUnpin && (
            <button
              className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-sm transition-colors duration-150 cursor-pointer"
              style={{ color: 'rgba(224,90,48,.6)', border: '1px solid rgba(224,90,48,.25)', background: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e05a30'; e.currentTarget.style.borderColor = '#e05a30' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(224,90,48,.6)'; e.currentTarget.style.borderColor = 'rgba(224,90,48,.25)' }}
              onClick={e => { e.stopPropagation(); onUnpin(player.name) }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Hover card */}
        <PlayerHoverCard player={player} showElo={showElo} showFantasy={showFantasy} />
      </td>

      {/* League */}
      <td className="py-2.5 pr-3">
        <span
          className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap"
          style={{ color: ls.color, background: ls.bg, border: `1px solid ${ls.border}` }}
        >
          {player.league}
        </span>
      </td>

      {/* Age */}
      <td className="py-2.5 pr-3 text-[12px]" style={{ color: '#5a5a7a' }}>{player.age}</td>

      {/* PJ */}
      <td className="py-2.5 pr-3" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: '#5a5a7a' }}>{player.pj}</td>

      {/* Main stat (goals or assists) with mini bar */}
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: isAssist ? '#4a9eff' : '#f0c040' }}>
            {mainVal}
          </span>
          <div className="h-[3px] rounded-sm flex-1 min-w-[40px] max-w-[80px]" style={{ background: '#1e1e34' }}>
            <div
              className="h-full rounded-sm"
              style={{ width: `${barPct}%`, background: isAssist ? '#4a9eff' : '#f0c040' }}
            />
          </div>
        </div>
      </td>

      {/* Secondary stat */}
      <td className="py-2.5 pr-3" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: isAssist ? '#f0c040' : '#4a9eff' }}>
        {isAssist ? player.goles : player.asist}
      </td>

      {/* Ratios */}
      <td className="py-2.5 pr-3 text-[12px] font-semibold" style={{ color: isAssist ? 'rgba(74,158,255,.9)' : 'rgba(240,192,64,.9)' }}>
        {isAssist ? player.ratio_a.toFixed(2) : player.ratio_g.toFixed(2)}
      </td>
      <td className="py-2.5 pr-3 text-[12px] font-semibold" style={{ color: isAssist ? 'rgba(240,192,64,.9)' : 'rgba(74,158,255,.9)' }}>
        {isAssist ? player.ratio_g.toFixed(2) : player.ratio_a.toFixed(2)}
      </td>

      {/* Value / G+A */}
      {isAssist ? (
        <td className="py-2.5 pr-3" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: '#38c47a' }}>
          {player.goles + player.asist}
        </td>
      ) : (
        <>
          <td className="py-2.5 pr-3" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: '#e05a30' }}>
            {player.val_sin}
          </td>
          <td className="py-2.5 pr-3">
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: '#a060ff' }}>
              {player.val_con}
            </span>
            <small className="ml-1 text-[9px]" style={{ color: '#5a5a7a' }}>×{player.coef}</small>
          </td>
        </>
      )}

      {/* ELO */}
      {showElo && (
        <td className="py-2.5 pr-3">
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: eloColor }}>
            {player.elo ?? '—'}
          </span>
        </td>
      )}

      {/* Fantasy */}
      {showFantasy && (
        <td className="py-2.5 pr-3">
          <div>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: '#a060ff' }}>
              {player.fantasyPoints ?? '—'}
            </span>
            {player.fantasyPrice != null && (
              <div className="text-[9.5px]" style={{ color: '#5a5a7a' }}>€{player.fantasyPrice}M</div>
            )}
          </div>
        </td>
      )}

      {/* Source */}
      <td className="py-2.5 pr-3">
        <span
          className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-sm"
          style={{ color: src.color, background: src.bg, border: `1px solid ${src.border}` }}
        >
          {src.label}
        </span>
      </td>
    </tr>
  )
}
