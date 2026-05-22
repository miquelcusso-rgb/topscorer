import type { EnrichedPlayer } from '@/types'

export function exportPlayersCSV(players: EnrichedPlayer[], filename = 'topscorers-stats.csv') {
  const headers = ['Rank','Nombre','Club','Liga','País','Posición','Edad','PJ','Goles','Asistencias','G/PJ','A/PJ','G/90','Min/G','ELO','Fantasy']
  const rows = players.map((p, i) => [
    i + 1,
    p.name,
    p.club,
    p.league,
    p.nationality ?? '',
    p.position ?? '',
    p.age ?? '',
    p.pj,
    p.goles,
    p.asist,
    p.pj > 0 ? (p.goles / p.pj).toFixed(2) : '0',
    p.pj > 0 ? (p.asist / p.pj).toFixed(2) : '0',
    p.pj > 0 ? (p.goles / (p.pj * 0.9)).toFixed(2) : '0',
    p.pj > 0 && p.goles > 0 ? Math.round((p.pj * 90) / p.goles) : '',
    p.elo ?? '',
    p.fantasyPoints ?? '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
