'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { PLAYERS } from '@/data/players'
import { enrich } from '@/lib/utils'
import { slugify } from '@/lib/slugify'
import type { EnrichedPlayer } from '@/types'

const PlayerRadar = dynamic(() => import('@/components/PlayerRadar'), { ssr: false })

const C = {
  gd: '#f0c040', pu: '#a060ff', te: '#00c8b0', bl: '#4090ff', or: '#e05a30',
  tx: '#e5e5f2', mu: '#5a5a7a', bd: '#1e1e34', sf: '#0e0e1c', s2: '#151528',
  bg: 'rgba(7,14,26,.90)',
}

function posAccent(pos?: string): string {
  if (pos === 'FW') return C.gd
  if (pos === 'MF') return C.pu
  if (pos === 'DF') return C.bl
  if (pos === 'GK') return C.or
  return C.gd
}

// Deduplicated list of all players (latest season per name)
const ALL_PLAYERS: EnrichedPlayer[] = (() => {
  const seen = new Map<string, EnrichedPlayer>()
  for (const p of PLAYERS) {
    if (!seen.has(p.name)) {
      seen.set(p.name, enrich(p))
    }
  }
  return Array.from(seen.values())
})()

const PRESETS = [
  { a: 'Harry Kane',    b: 'Erling Haaland'  },
  { a: 'Kylian Mbappe', b: 'Vinicius Junior'  },
  { a: 'Mohamed Salah', b: 'Bukayo Saka'      },
  { a: 'Lamine Yamal',  b: 'Florian Wirtz'   },
]

interface PlayerSelectorProps {
  label: string
  selected: EnrichedPlayer | null
  onSelect: (p: EnrichedPlayer | null) => void
}

function PlayerSelector({ label, selected, onSelect }: PlayerSelectorProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ALL_PLAYERS.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  function selectPlayer(p: EnrichedPlayer) {
    onSelect(p)
    setQuery('')
    setOpen(false)
  }

  const accent = selected ? posAccent(selected.position) : C.gd

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: C.mu, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {label}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          style={{
            width: '100%', boxSizing: 'border-box' as const,
            background: C.s2, border: `1px solid ${C.bd}`,
            color: C.tx, fontSize: 13, padding: '8px 12px', borderRadius: 4, outline: 'none',
          }}
        />
        {open && filtered.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: '#0b1220', border: `1px solid ${C.bd}`, borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,.6)', overflow: 'hidden', marginTop: 4,
          }}>
            {filtered.map(p => (
              <button
                key={p.name}
                onMouseDown={() => selectPlayer(p)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left' as const, color: C.tx, fontSize: 13,
                  borderBottom: `1px solid rgba(255,255,255,.04)`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                {p.flag && <span>{p.flag}</span>}
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: 11, color: C.mu, marginLeft: 'auto' }}>{p.club}</span>
                {p.position && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: posAccent(p.position), background: `${posAccent(p.position)}22`, padding: '2px 5px', borderRadius: 3 }}>
                    {p.position}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected card */}
      {selected ? (
        <div style={{
          padding: 16, borderRadius: 6, background: `${accent}08`,
          border: `1px solid ${accent}44`, position: 'relative',
        }}>
          <button
            onClick={() => onSelect(null)}
            style={{
              position: 'absolute', top: 8, right: 8, background: 'none', border: 'none',
              color: C.mu, cursor: 'pointer', fontSize: 14, lineHeight: 1,
            }}
          >✕</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selected.flag && <span style={{ fontSize: 22 }}>{selected.flag}</span>}
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: C.tx, letterSpacing: 0.3 }}>
                {selected.name}
              </div>
              <div style={{ fontSize: 11, color: C.mu, display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                <span>{selected.club}</span>
                {selected.position && (
                  <span style={{ fontWeight: 700, color: accent }}>{selected.position}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: 16, borderRadius: 6, background: 'rgba(255,255,255,.02)',
          border: `1px dashed rgba(255,255,255,.1)`, textAlign: 'center' as const,
          color: C.mu, fontSize: 13,
        }}>
          Ningún jugador seleccionado
        </div>
      )}
    </div>
  )
}

interface StatRowProps {
  label: string
  a: number | string
  b: number | string
  accentA: string
  accentB: string
}

function StatRow({ label, a, b, accentA, accentB }: StatRowProps) {
  const numA = typeof a === 'number' ? a : parseFloat(a as string) || 0
  const numB = typeof b === 'number' ? b : parseFloat(b as string) || 0
  const aWins = numA > numB
  const bWins = numB > numA
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
      <td style={{ padding: '8px 12px', fontSize: 12, color: C.mu, fontWeight: 600 }}>{label}</td>
      <td style={{ padding: '8px 12px', textAlign: 'right' as const, fontSize: 14, fontWeight: 700, color: aWins ? accentA : C.tx }}>{a}</td>
      <td style={{ padding: '8px 12px', textAlign: 'right' as const, fontSize: 14, fontWeight: 700, color: bWins ? accentB : C.tx }}>{b}</td>
    </tr>
  )
}

export default function ComparadorClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [playerA, setPlayerA] = useState<EnrichedPlayer | null>(null)
  const [playerB, setPlayerB] = useState<EnrichedPlayer | null>(null)

  // Load from URL params on mount
  useEffect(() => {
    const slugA = searchParams.get('a')
    const slugB = searchParams.get('b')
    if (slugA) {
      const found = ALL_PLAYERS.find(p => slugify(p.name) === slugA)
      if (found) setPlayerA(found)
    }
    if (slugB) {
      const found = ALL_PLAYERS.find(p => slugify(p.name) === slugB)
      if (found) setPlayerB(found)
    }
  }, [searchParams])

  // Update URL when players change
  function selectA(p: EnrichedPlayer | null) {
    setPlayerA(p)
    const params = new URLSearchParams(searchParams.toString())
    if (p) params.set('a', slugify(p.name))
    else params.delete('a')
    router.replace(`/estadisticas/comparador?${params.toString()}`, { scroll: false })
  }

  function selectB(p: EnrichedPlayer | null) {
    setPlayerB(p)
    const params = new URLSearchParams(searchParams.toString())
    if (p) params.set('b', slugify(p.name))
    else params.delete('b')
    router.replace(`/estadisticas/comparador?${params.toString()}`, { scroll: false })
  }

  function applyPreset(preset: { a: string; b: string }) {
    const pA = ALL_PLAYERS.find(p => p.name === preset.a) ?? null
    const pB = ALL_PLAYERS.find(p => p.name === preset.b) ?? null
    setPlayerA(pA)
    setPlayerB(pB)
    const params = new URLSearchParams()
    if (pA) params.set('a', slugify(pA.name))
    if (pB) params.set('b', slugify(pB.name))
    router.replace(`/estadisticas/comparador?${params.toString()}`, { scroll: false })
  }

  const accentA = posAccent(playerA?.position)
  const accentB = posAccent(playerB?.position)
  const bothSelected = !!playerA && !!playerB

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', paddingBottom: 80 }}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 0' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 7vw, 64px)',
            color: C.gd, letterSpacing: 3, lineHeight: 1, margin: 0,
            textTransform: 'uppercase' as const, fontWeight: 700,
          }}>
            Comparador
          </h1>
          <p style={{ color: C.mu, fontSize: 14, marginTop: 10 }}>
            Elige dos jugadores para comparar su perfil de atributos
          </p>
        </div>

        {/* Selectors */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 40, flexWrap: 'wrap' as const }}>
          <PlayerSelector label="Jugador A" selected={playerA} onSelect={selectA} />
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: C.mu, fontSize: 18, fontWeight: 700, alignSelf: 'center' }}>
            VS
          </div>
          <PlayerSelector label="Jugador B" selected={playerB} onSelect={selectB} />
        </div>

        {/* Comparison sections — shown when both selected */}
        {bothSelected && (
          <>
            {/* Radar charts */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' as const }}>
              <div style={{ flex: 1, minWidth: 280, background: C.bg, border: `1px solid ${accentA}33`, borderRadius: 8, padding: 20 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: accentA, marginBottom: 12, letterSpacing: 1 }}>
                  {playerA.flag} {playerA.name}
                </div>
                <PlayerRadar player={playerA} color={accentA} />
              </div>
              <div style={{ flex: 1, minWidth: 280, background: C.bg, border: `1px solid ${accentB}33`, borderRadius: 8, padding: 20 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: accentB, marginBottom: 12, letterSpacing: 1 }}>
                  {playerB.flag} {playerB.name}
                </div>
                <PlayerRadar player={playerB} color={accentB} />
              </div>
            </div>

            {/* Stats comparison table */}
            <div style={{ background: C.bg, border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, marginBottom: 40, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: C.mu }}>
                  Estadísticas
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: accentA }}>{playerA.name}</span>
                <span style={{ margin: '0 12px', fontSize: 11, color: C.mu }}>vs</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: accentB }}>{playerB.name}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <tbody>
                  <StatRow label="Goles"   a={playerA.goles}                  b={playerB.goles}                  accentA={accentA} accentB={accentB} />
                  <StatRow label="Asist."  a={playerA.asist}                  b={playerB.asist}                  accentA={accentA} accentB={accentB} />
                  <StatRow label="PJ"      a={playerA.pj}                     b={playerB.pj}                     accentA={accentA} accentB={accentB} />
                  <StatRow label="G/PJ"    a={playerA.ratio_g.toFixed(2)}     b={playerB.ratio_g.toFixed(2)}     accentA={accentA} accentB={accentB} />
                  <StatRow label="A/PJ"    a={playerA.ratio_a.toFixed(2)}     b={playerB.ratio_a.toFixed(2)}     accentA={accentA} accentB={accentB} />
                  <StatRow label="Val+"    a={playerA.val_con}                 b={playerB.val_con}                 accentA={accentA} accentB={accentB} />
                  <StatRow label="ELO"     a={playerA.elo ?? '—'}             b={playerB.elo ?? '—'}             accentA={accentA} accentB={accentB} />
                  <StatRow label="Fantasy" a={playerA.fantasyPoints ?? '—'}   b={playerB.fantasyPoints ?? '—'}   accentA={accentA} accentB={accentB} />
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Popular matchups */}
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const, color: C.mu, marginBottom: 12 }}>
            Comparaciones populares
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            {PRESETS.map(p => (
              <button
                key={`${p.a}-${p.b}`}
                onClick={() => applyPreset(p)}
                style={{
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.09)',
                  color: C.tx, fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 4, cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'; (e.currentTarget as HTMLElement).style.borderColor = `${C.gd}44` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.09)' }}
              >
                {p.a} <span style={{ color: C.mu }}>vs</span> {p.b}
              </button>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 48, textAlign: 'center' as const }}>
          <Link
            href="/"
            style={{ color: C.gd, fontSize: 12, fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.gd}33`, padding: '8px 16px', borderRadius: 4, background: `${C.gd}08` }}
          >
            ← Volver a estadísticas
          </Link>
        </div>

      </main>
    </div>
  )
}
