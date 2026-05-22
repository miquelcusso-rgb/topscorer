'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const LEAGUES = ['La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1']

interface Transfer {
  player: { id: number; name: string; photo: string }
  date: string
  type: string
  teams: {
    in:  { id: number; name: string; logo: string }
    out: { id: number; name: string; logo: string }
  }
}

function TransferCard({ t, isLight }: { t: Transfer; isLight: boolean }) {
  const cardBg     = isLight ? '#ffffff' : 'rgba(255,255,255,.04)'
  const cardBorder = isLight ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.07)'
  const textPrimary = isLight ? '#0f1830' : '#dde8ff'
  const textMuted   = isLight ? '#5060a0' : '#6878a0'

  const feeColor = t.type === 'Free' ? '#38c47a'
    : t.type === 'N/A' ? '#52526e'
    : t.type.includes('Loan') ? '#a060ff'
    : '#f0c040'

  return (
    <div
      className="rounded-lg p-3 flex items-center gap-3"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
    >
      {/* Player photo */}
      <img
        src={t.player.photo}
        alt={t.player.name}
        width={36}
        height={36}
        style={{ borderRadius: '50%', flexShrink: 0, background: '#1a1b2e' }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      {/* Player + teams */}
      <div className="flex-1 min-w-0">
        <div
          style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 2 }}
          className="truncate"
        >
          {t.player.name}
        </div>
        <div className="flex items-center gap-1.5">
          <img src={t.teams.out.logo} alt="" width={14} height={14} style={{ borderRadius: 2 }} />
          <span style={{ fontSize: 10, color: textMuted }} className="truncate max-w-[70px]">{t.teams.out.name}</span>
          <span style={{ fontSize: 10, color: textMuted }}>→</span>
          <img src={t.teams.in.logo} alt="" width={14} height={14} style={{ borderRadius: 2 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }} className="truncate max-w-[70px]">{t.teams.in.name}</span>
        </div>
      </div>
      {/* Fee + date */}
      <div className="text-right shrink-0">
        <div
          style={{
            fontSize: 12, fontWeight: 700, color: feeColor,
            fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5,
          }}
        >
          {t.type}
        </div>
        <div style={{ fontSize: 10, color: textMuted }}>
          {new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

export default function TransferenciasClient() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [selectedLeague, setSelectedLeague] = useState('La Liga')
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const textPrimary   = isLight ? '#0f1830' : '#dde8ff'
  const textMuted     = isLight ? '#5060a0' : '#6878a0'
  const tabActiveBg   = isLight ? 'rgba(240,192,64,.15)' : 'rgba(240,192,64,.12)'
  const tabInactiveBg = isLight ? 'rgba(210,220,245,.8)' : 'rgba(255,255,255,.04)'

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/football/transfers?league=${encodeURIComponent(selectedLeague)}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setTransfers(d.data); else setError(true) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [selectedLeague])

  return (
    <div className="max-w-[1100px] mx-auto px-5 py-8">
      {/* Header */}
      <h1
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 42, fontWeight: 800, color: textPrimary,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
        }}
      >
        Transferencias
      </h1>
      <p style={{ fontSize: 13, color: textMuted, marginBottom: 24 }}>
        Últimos fichajes y movimientos de los principales clubes europeos.
      </p>

      {/* League tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {LEAGUES.map(league => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className="cursor-pointer transition-all duration-150 rounded px-3 py-1.5"
            style={{
              fontSize: 12, fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '1px', textTransform: 'uppercase',
              background: selectedLeague === league ? tabActiveBg : tabInactiveBg,
              color: selectedLeague === league ? '#f0c040' : textMuted,
              border: `1px solid ${selectedLeague === league ? 'rgba(240,192,64,.35)' : 'rgba(255,255,255,.08)'}`,
            }}
          >
            {league}
          </button>
        ))}
      </div>

      {/* Transfer list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg h-16 animate-pulse"
              style={{ background: isLight ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.04)' }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="py-10 text-center" style={{ color: textMuted, fontSize: 14 }}>
          No se pudieron cargar las transferencias. Inténtalo de nuevo.
        </div>
      ) : transfers.length === 0 ? (
        <div className="py-10 text-center" style={{ color: textMuted, fontSize: 14 }}>
          No hay transferencias recientes para esta liga.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {transfers.map((t, i) => <TransferCard key={i} t={t} isLight={isLight} />)}
        </div>
      )}
    </div>
  )
}
