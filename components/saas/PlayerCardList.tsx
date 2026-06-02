'use client'

import Link from 'next/link'
import type { PlayerData } from '@/types'
import Avatar from './Avatar'
import LeagueChip from './LeagueChip'
import { slugify } from '@/lib/slugify'
import { playerSlug } from '@/lib/player-slug'
import { shortName } from '@/lib/player-name'

interface Props {
  players: PlayerData[]
  lang?: 'es' | 'en'
}

const LEAGUE_CODE: Record<string, string> = {
  'Premier League': 'EPL',
  'La Liga': 'LL',
  'LaLiga': 'LL',
  'Bundesliga': 'BL',
  'Serie A': 'SA',
  'Ligue 1': 'L1',
}
const code = (n: string) => LEAGUE_CODE[n] ?? n.slice(0, 3).toUpperCase()

// Mobile card list — replaces the wide PlayerTable on <768px.
// Each row is a tap target ≥56px tall (well above 44px floor).
export default function PlayerCardList({ players, lang = 'es' }: Props) {
  return (
    <div className="saas-mobile-cards" aria-label="Top scorers list">
      {players.map((player, i) => {
        const rank = i + 1
        const slug = playerSlug(player)
        return (
          <Link
            key={slug + i}
            href={`/${lang}/jugadores/${slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: 'var(--ts-card)',
              border: '1px solid var(--ts-border)',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'inherit',
              minHeight: 64,
            }}
          >
            <span
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                width: 22,
                textAlign: 'right',
                color: rank <= 3 ? 'var(--ts-primary)' : 'var(--ts-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(rank).padStart(2, '0')}
            </span>
            <Avatar name={player.name} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ts-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {shortName(player)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.club}</span>
                <LeagueChip code={code(player.league)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
                  minWidth: 36,
                  textAlign: 'center',
                }}
              >
                {player.goles}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--ts-teal)',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 22,
                  textAlign: 'right',
                }}
              >
                {player.asist}A
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
