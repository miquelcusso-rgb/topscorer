'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLang } from '@/contexts/LangContext'
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

// One distinct colour + label per action type. Loan and "return from loan"
// share the same colour; free agent ≠ paid transfer. Shows the amount when the
// API provides one (often it doesn't → "no revelado").
function classifyTransfer(type: string, es: boolean): { label: string; color: string; amount: string | null } {
  const s = (type ?? '').trim()
  const low = s.toLowerCase()
  const hasMoney = /[€$£]|\d+\s*(m|k|mill)/i.test(s)
  if (low.includes('loan') || low.includes('cesi')) {
    const back = low.includes('return') || low.includes('back') || low.includes('vuelve') || low.includes('fin')
    return { label: back ? (es ? 'Vuelve de cesión' : 'Return from loan') : (es ? 'Cesión' : 'Loan'), color: '#00c8b0', amount: hasMoney ? s : null }
  }
  if (low === 'free' || low.includes('free') || low.includes('libre')) {
    return { label: es ? 'Agente libre' : 'Free agent', color: '#38c47a', amount: null }
  }
  if (!s || low === 'n/a' || low === '-' || low === '?') {
    return { label: es ? 'No revelado' : 'Undisclosed', color: '#9a917e', amount: null }
  }
  // A fee value → paid transfer.
  return { label: es ? 'Traspaso' : 'Transfer', color: '#f0c040', amount: hasMoney ? s : null }
}

function TransferCard({ t, isLight, es }: { t: Transfer; isLight: boolean; es: boolean }) {
  const cardBg     = isLight ? '#ffffff' : 'rgba(255,255,255,.04)'
  const cardBorder = isLight ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.07)'
  const textPrimary = isLight ? '#1c1608' : '#f1e8d2'
  const textMuted   = isLight ? '#8a7f68' : '#9a917e'

  const act = classifyTransfer(t.type, es)

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
      {/* Action type chip + amount + date */}
      <div className="text-right shrink-0">
        <span style={{
          display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
          color: act.color, background: `${act.color}1f`, border: `1px solid ${act.color}55`,
          borderRadius: 999, padding: '2px 8px', fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          {act.label}
        </span>
        {act.amount && (
          <div style={{ fontSize: 13, fontWeight: 800, color: act.color, fontFamily: "'Barlow Condensed', sans-serif", marginTop: 3, letterSpacing: 0.3 }}>
            {act.amount}
          </div>
        )}
        <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>
          {new Date(t.date).toLocaleDateString(es ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

export default function TransferenciasClient() {
  const { theme } = useTheme()
  const { lang } = useLang()
  const es = lang !== 'en'
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
          {visibleTransfers.map((t, i) => <TransferCard key={i} t={t} isLight={isLight} es={es} />)}
        </div>
      )}
    </div>
  )
}
