'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Avatar from '@/components/saas/Avatar'

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
  const textPrimary = isLight ? '#1c1608' : '#f1e8d2'
  const textMuted   = isLight ? '#8a7f68' : '#9a917e'

  const feeColor = t.type === 'Free' ? '#38c47a'
    : t.type === 'N/A' ? '#9a917e'
    : t.type.includes('Loan') ? '#00c8b0'
    : '#f0c040'

  return (
    <div
      className="rounded-lg p-3 flex items-center gap-3"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
    >
      {/* Player photo (real photo if available, else tinted initials) */}
      <Avatar name={t.player.name} photo={t.player.photo || undefined} size={36} />
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
  const [selectedClub, setSelectedClub] = useState<string>('all')
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const textPrimary   = isLight ? '#1c1608' : '#f1e8d2'
  const textMuted     = isLight ? '#8a7f68' : '#9a917e'
  const tabActiveBg   = isLight ? 'rgba(240,192,64,.15)' : 'rgba(240,192,64,.12)'
  const tabInactiveBg = isLight ? 'rgba(210,220,245,.8)' : 'rgba(255,255,255,.04)'

  useEffect(() => {
    setLoading(true)
    setError(false)
    setSelectedClub('all') // reset club filter when changing league
    fetch(`/api/football/transfers?league=${encodeURIComponent(selectedLeague)}`)
      .then(r => r.json())
      .then(d => { if (d.ok) setTransfers(d.data); else setError(true) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [selectedLeague])

  // Clubs OF the selected league only. A league feed includes the foreign
  // counterparty of cross-border moves; those clubs appear just once, while the
  // league's own clubs recur. So keep clubs seen ≥2 times (fallback to all if
  // that filters everything on a thin feed) → the dropdown lists this league's
  // clubs, not "every club at once".
  const clubCounts = transfers
    .flatMap(t => [t.teams.in.name, t.teams.out.name])
    .reduce<Record<string, number>>((m, name) => { m[name] = (m[name] ?? 0) + 1; return m }, {})
  const leagueClubs = Object.keys(clubCounts).filter(c => clubCounts[c] >= 2).sort()
  const clubs = leagueClubs.length ? leagueClubs : Object.keys(clubCounts).sort()
  const visibleTransfers = selectedClub === 'all'
    ? transfers
    : transfers.filter(t => t.teams.in.name === selectedClub || t.teams.out.name === selectedClub)

  return (
    <div className="px-5 py-8">
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
      <div className="flex gap-2 flex-wrap mb-3">
        {LEAGUES.map(league => (
          <button
            key={league}
            onClick={() => setSelectedLeague(league)}
            className="cursor-pointer transition-all duration-150 rounded px-3 py-1.5"
            style={{
              fontSize: 13, fontWeight: 700,
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

      {/* Club filter (audit pass 1) */}
      {clubs.length > 1 && (
        <div className="mb-6" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label htmlFor="club-filter" style={{ fontSize: 12, color: textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Club:
          </label>
          <select
            id="club-filter"
            value={selectedClub}
            onChange={e => setSelectedClub(e.target.value)}
            style={{
              fontSize: 13, padding: '6px 10px',
              background: tabInactiveBg, color: textPrimary,
              border: '1px solid rgba(255,255,255,.10)', borderRadius: 6,
              fontFamily: 'inherit',
            }}
          >
            <option value="all">Todos los clubes</option>
            {clubs.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Transfer list */}
      {loading ? (
        <div className="gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
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
      ) : visibleTransfers.length === 0 ? (
        <div className="py-10 text-center" style={{ color: textMuted, fontSize: 14 }}>
          No hay transferencias recientes para esta liga.
        </div>
      ) : (
        <div className="gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
          {visibleTransfers.map((t, i) => <TransferCard key={i} t={t} isLight={isLight} />)}
        </div>
      )}
    </div>
  )
}
