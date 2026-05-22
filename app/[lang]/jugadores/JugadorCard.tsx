'use client'

import Link from 'next/link'
import { slugify } from '@/lib/slugify'
import { positionLabel } from '@/lib/position'
import PlayerHoverCard from '@/components/PlayerHoverCard'
import type { EnrichedPlayer } from '@/types'

interface Props {
  player: EnrichedPlayer
}

export default function JugadorCard({ player: p }: Props) {
  return (
    <Link href={`/jugadores/${slugify(p.name)}`} style={{ textDecoration: 'none' }}>
      <div
        className="group relative rounded-lg p-3 cursor-pointer transition-colors duration-150 hover:bg-white/[.07]"
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
        }}
      >
        {/* Rich hover card (photo/avatar, market value, season stats) */}
        <PlayerHoverCard player={p} showElo={false} showFantasy={false} />
        <div style={{ fontSize: 14, fontWeight: 600, color: '#dde8ff' }}>
          {p.flag} {p.name}
        </div>
        {/* Position directly below the name (always shown) */}
        <div style={{ fontSize: 11, marginTop: 2 }}>
          <span style={{ color: '#00c8b0', fontWeight: 600 }}>{positionLabel(p)}</span>
          <span style={{ color: '#6878a0' }}> · {p.club}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#f0c040',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {p.goles}G
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#00c8b0',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {p.asist}A
          </span>
        </div>
      </div>
    </Link>
  )
}
