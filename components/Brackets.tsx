'use client'

import { useMemo } from 'react'

// Generic single-elimination bracket renderer.
// Takes an array of rounds; each round is an array of matches; each match is
// two team slots + optional score. Renders to SVG so it scales and prints.

export interface BracketTeam {
  name: string
  /** ISO short (URU, ESP, RMA…) for the chip */
  short?: string
  /** Score in the *first leg / current* leg of the tie (or final score) */
  score?: number
  /** Set true if this team won the tie */
  winner?: boolean
}

export interface BracketMatch {
  id: string
  home: BracketTeam | null
  away: BracketTeam | null
  /** "Apr 9 · 21:00" or "Final · 25 May" */
  meta?: string
}

export interface BracketRound {
  /** "Round of 16", "Quarter-final", … */
  label: string
  matches: BracketMatch[]
}

interface Props {
  rounds: BracketRound[]
  /** Width per round (in px). Default 240. */
  colWidth?: number
  /** Min vertical spacing per match. Default 64. */
  rowHeight?: number
}

const PRIMARY = 'var(--ts-primary, #f0c040)'
const TEAL    = 'var(--ts-teal,    #3ed6c2)'
const TEXT    = 'var(--ts-text,    #e8e8f8)'
const MUTED   = 'var(--ts-muted,   rgba(216,216,236,.6))'
const CARD    = 'var(--ts-card,    #15130f)'
const BORDER  = 'var(--ts-border,  rgba(240,200,90,.08))'

export default function Brackets({ rounds, colWidth = 240, rowHeight = 64 }: Props) {
  const layout = useMemo(() => {
    // Largest round = round[0]. Each subsequent round halves match count.
    const matchesInR0 = rounds[0]?.matches.length ?? 0
    const totalHeight = matchesInR0 * rowHeight * 2
    return {
      width:  rounds.length * colWidth + 40,
      height: totalHeight + 80,
    }
  }, [rounds, colWidth, rowHeight])

  return (
    <div style={{ overflowX: 'auto', padding: 20 }}>
      <svg
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        style={{ display: 'block', minWidth: layout.width }}
      >
        {rounds.map((round, rIdx) => {
          const spacing = (layout.height - 60) / round.matches.length
          return (
            <g key={round.label} transform={`translate(${rIdx * colWidth + 20}, 0)`}>
              <text
                x={colWidth / 2 - 10}
                y={24}
                textAnchor="middle"
                fill={PRIMARY}
                fontSize={11}
                fontWeight={700}
                letterSpacing={2}
                style={{ textTransform: 'uppercase' }}
              >
                {round.label}
              </text>

              {round.matches.map((m, mIdx) => {
                const y = 48 + mIdx * spacing + spacing / 2 - 30
                return (
                  <g key={m.id} transform={`translate(0, ${y})`}>
                    <rect
                      x={0}
                      y={0}
                      width={colWidth - 30}
                      height={60}
                      rx={6}
                      fill={CARD}
                      stroke={BORDER}
                    />
                    <TeamLine y={14} team={m.home} />
                    <line
                      x1={10} x2={colWidth - 40}
                      y1={30} y2={30}
                      stroke={BORDER}
                    />
                    <TeamLine y={44} team={m.away} />
                    {m.meta ? (
                      <text x={colWidth - 35} y={-4} textAnchor="end" fill={MUTED} fontSize={9} fontFamily="JetBrains Mono, ui-monospace, monospace" letterSpacing={0.5}>
                        {m.meta}
                      </text>
                    ) : null}

                    {/* Connector line to next round */}
                    {rIdx < rounds.length - 1 ? (
                      <path
                        d={`M ${colWidth - 30} 30 L ${colWidth - 10} 30`}
                        stroke={BORDER}
                        fill="none"
                      />
                    ) : null}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function TeamLine({ y, team }: { y: number; team: BracketTeam | null }) {
  if (!team) {
    return (
      <text x={14} y={y + 4} fill={MUTED} fontSize={12} fontStyle="italic">
        TBD
      </text>
    )
  }
  const color = team.winner ? PRIMARY : TEXT
  const weight = team.winner ? 700 : 500
  return (
    <>
      {team.short ? (
        <text
          x={14}
          y={y + 4}
          fill={MUTED}
          fontSize={10}
          fontFamily="JetBrains Mono, ui-monospace, monospace"
          letterSpacing={0.6}
        >
          {team.short}
        </text>
      ) : null}
      <text
        x={team.short ? 50 : 14}
        y={y + 4}
        fill={color}
        fontSize={13}
        fontWeight={weight}
      >
        {team.name.length > 16 ? `${team.name.slice(0, 16)}…` : team.name}
      </text>
      {team.score != null ? (
        <text
          x={210 - 30}
          y={y + 4}
          textAnchor="end"
          fill={team.winner ? PRIMARY : TEAL}
          fontSize={14}
          fontWeight={700}
          fontFamily="Barlow Condensed, sans-serif"
        >
          {team.score}
        </text>
      ) : null}
    </>
  )
}
