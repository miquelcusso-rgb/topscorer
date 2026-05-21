'use client'

import type { EnrichedPlayer } from '@/types'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts'

interface Props {
  player: EnrichedPlayer
  color?: string
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50
  return Math.round(((value - min) / (max - min)) * 100)
}

export default function PlayerRadar({ player, color = '#f0c040' }: Props) {
  const data = [
    { subject: 'Goles',   value: normalize(player.goles,          0, 40) },
    { subject: 'Asist.',  value: normalize(player.asist,          0, 25) },
    { subject: 'G/PJ',    value: normalize(player.ratio_g,        0, 1.2) },
    { subject: 'Val+',    value: normalize(player.val_con,        0, 100) },
    { subject: 'ELO',     value: normalize(player.elo ?? 1500,    1400, 2300) },
    { subject: 'Fantasy', value: normalize(player.fantasyPoints ?? 0, 0, 300) },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <PolarGrid stroke="rgba(255,255,255,.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#7878a0', fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif" }}
        />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.18}
          strokeWidth={1.5}
        />
        <Tooltip
          contentStyle={{ background: '#0e0e1c', border: `1px solid ${color}44`, fontSize: 12, color: '#e5e5f2' }}
          formatter={(v) => [`${v ?? ''}`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
