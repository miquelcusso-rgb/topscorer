'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { PlayerData } from '@/types'
import Avatar from './Avatar'
import LeagueChip from './LeagueChip'
import Sparkline from './Sparkline'
import { slugify } from '@/lib/slugify'
import { playerSlug } from '@/lib/player-slug'
import { shortName } from '@/lib/player-name'

export type TableTab = 'goals' | 'ast' | 'pj' | 'xg'
export type SortDir = 'asc' | 'desc'

interface PlayerTableProps {
  players: PlayerData[]
  sortBy?: TableTab
  sortDir?: SortDir
  onSortChange?: (col: TableTab) => void
  tab?: TableTab
  lang?: 'es' | 'en'
  hrefBuilder?: (player: PlayerData) => string
}

// Stable pseudo-random in [0,1) derived from a string — for synthetic xG / form.
function seed(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return Math.abs(h) / 0x7fffffff
}

function syntheticXg(p: PlayerData): number {
  const base = Math.max(0, p.goles + (seed(p.name) - 0.5) * 4)
  return Math.round(base * 10) / 10
}

function syntheticForm(p: PlayerData): number[] {
  const s = seed(p.club + p.name)
  const len = 8
  const out: number[] = []
  for (let i = 0; i < len; i++) {
    const r = ((Math.sin((s + 1) * (i + 3) * 7.13) + 1) / 2)
    out.push(Math.max(0, Math.round(r * 3)))
  }
  return out
}

const LEAGUE_CODE: Record<string, string> = {
  'Premier League': 'EPL',
  'La Liga': 'LL',
  'LaLiga': 'LL',
  'Bundesliga': 'BL',
  'Serie A': 'SA',
  'Ligue 1': 'L1',
  'Primeira Liga': 'PT',
  'Süper Lig': 'TR',
  'Eredivisie': 'NL',
}

function leagueCode(name: string): string {
  return LEAGUE_CODE[name] ?? name.slice(0, 3).toUpperCase()
}

const HEADERS: Array<{ key: TableTab | null; label: string; align?: 'left' | 'right' }> = [
  { key: null, label: '' },
  { key: null, label: '' },
  { key: null, label: 'Jugador' },
  { key: null, label: 'Equipo' },
  { key: 'goals', label: 'Goles', align: 'right' },
  { key: 'ast', label: 'Asist.', align: 'right' },
  { key: 'pj', label: 'PJ', align: 'right' },
  { key: 'xg', label: 'xG', align: 'right' },
  { key: null, label: 'Forma', align: 'right' },
  { key: null, label: '' },
]

const GRID = '40px 44px 1fr 110px 70px 70px 70px 70px 110px 80px'

export default function PlayerTable({
  players,
  sortBy = 'goals',
  sortDir = 'desc',
  onSortChange,
  lang = 'es',
  hrefBuilder,
}: PlayerTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  return (
    <div
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 12,
          padding: '12px 16px',
          alignItems: 'center',
          background: 'var(--ts-card2)',
          borderBottom: '1px solid var(--ts-border)',
          fontSize: 11,
          color: 'var(--ts-muted)',
          letterSpacing: '0.04em',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
      >
        {HEADERS.map((h, i) => {
          const isSortable = h.key !== null
          const isActive = h.key === sortBy
          const arrow = isActive ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''
          return (
            <span
              key={i}
              style={{
                textAlign: h.align ?? 'left',
                cursor: isSortable ? 'pointer' : 'default',
                color: isActive ? 'var(--ts-text)' : 'inherit',
              }}
              onClick={isSortable && h.key ? () => onSortChange?.(h.key as TableTab) : undefined}
            >
              {h.label}
              {arrow}
            </span>
          )
        })}
      </div>

      {players.map((player, i) => {
        const rank = i + 1
        const xg = syntheticXg(player)
        const xgDelta = Math.round((player.goles - xg) * 10) / 10
        const form = syntheticForm(player)
        const slug = playerSlug(player)
        const href = hrefBuilder ? hrefBuilder(player) : `/${lang}/jugadores/${slug}`
        const hovered = hoveredRow === slug
        return (
          <Link
            key={slug + i}
            href={href}
            onMouseEnter={() => setHoveredRow(slug)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 12,
              padding: '12px 16px',
              alignItems: 'center',
              borderBottom: '1px solid var(--ts-divider)',
              background: hovered ? 'var(--ts-card2)' : 'transparent',
              cursor: 'pointer',
              transition: 'background .12s',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: rank <= 3 ? 'var(--ts-primary)' : 'var(--ts-muted)',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(rank).padStart(2, '0')}
            </span>

            <Avatar name={player.name} size={36} />

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ts-text)',
                  letterSpacing: '-0.01em',
                }}
              >
                {shortName(player)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2 }}>
                {player.flag ? `${player.flag} ` : ''}
                {player.age}
                {player.position ? ` · ${player.position}` : ''}
              </div>
            </div>

            <div style={{ fontSize: 13, color: 'var(--ts-text)' }}>
              <div style={{ fontWeight: 500 }}>{player.club}</div>
              <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2 }}>
                <LeagueChip code={leagueCode(player.league)} />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: rank === 1 ? 'var(--ts-primary)' : 'var(--ts-primary-soft)',
                  color: rank === 1 ? 'var(--ts-bg)' : 'var(--ts-primary)',
                  fontWeight: 700,
                  fontSize: 16,
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'Barlow Condensed, sans-serif',
                }}
              >
                {player.goles}
              </span>
            </div>

            <div
              style={{
                textAlign: 'right',
                fontSize: 14,
                color: 'var(--ts-text)',
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {player.asist}
            </div>

            <div
              style={{
                textAlign: 'right',
                fontSize: 14,
                color: 'var(--ts-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {player.pj}
            </div>

            <div
              style={{
                textAlign: 'right',
                fontSize: 13,
                color: 'var(--ts-text)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {xg.toFixed(1)}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: xgDelta >= 0 ? 'var(--ts-teal)' : 'var(--ts-red)',
                }}
              >
                {xgDelta >= 0 ? '+' : ''}
                {xgDelta.toFixed(1)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Sparkline values={form} width={88} height={20} color="primary" />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 6,
                justifyContent: 'flex-end',
                color: hovered ? 'var(--ts-text)' : 'var(--ts-faint)',
              }}
            >
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                aria-label="Row actions"
                style={{
                  width: 26,
                  height: 26,
                  border: '1px solid var(--ts-border)',
                  borderRadius: 5,
                  background: 'var(--ts-surface)',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                ⋯
              </button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
