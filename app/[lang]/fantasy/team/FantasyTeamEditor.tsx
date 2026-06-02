'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Pick {
  player_slug: string
  player_name: string
  slot: number
  captain: boolean
}

interface Eligible {
  slug: string
  name: string
  club: string
  league: string
  goals: number
  assists: number
}

interface Props {
  lang: string
  initialTeamName: string
  initialPicks: Pick[]
  eligible: Eligible[]
}

export default function FantasyTeamEditor({ lang, initialTeamName, initialPicks, eligible }: Props) {
  const es = lang === 'es'
  const router = useRouter()
  const [teamName, setTeamName] = useState(initialTeamName)
  const [picks, setPicks] = useState<Pick[]>(() => {
    const seeded = initialPicks.length === 5 ? initialPicks : Array.from({ length: 5 }, (_, i) => ({
      player_slug: '', player_name: '', slot: i + 1, captain: i === 0,
    }))
    return seeded.sort((a, b) => a.slot - b.slot)
  })
  const [filter, setFilter] = useState('')
  const [activeSlot, setActiveSlot] = useState<number>(1)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const pickedSlugs = useMemo(() => new Set(picks.map(p => p.player_slug).filter(Boolean)), [picks])
  const list = useMemo(() =>
    eligible
      .filter(e => !pickedSlugs.has(e.slug))
      .filter(e => filter === '' || e.name.toLowerCase().includes(filter.toLowerCase()) || e.club.toLowerCase().includes(filter.toLowerCase()))
      .slice(0, 60),
    [eligible, pickedSlugs, filter],
  )

  function setSlotPlayer(slot: number, e: Eligible) {
    setPicks(prev => prev.map(p => p.slot === slot ? { ...p, player_slug: e.slug, player_name: e.name } : p))
  }
  function setCaptain(slot: number) {
    setPicks(prev => prev.map(p => ({ ...p, captain: p.slot === slot })))
  }
  function clearSlot(slot: number) {
    setPicks(prev => prev.map(p => p.slot === slot ? { ...p, player_slug: '', player_name: '' } : p))
  }

  async function save() {
    setSaving(true); setErr(null)
    try {
      const res = await fetch('/api/fantasy/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: teamName, picks }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`)
      router.push(`/${lang}/fantasy`)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const canSave = teamName.trim().length >= 2 && picks.every(p => p.player_slug) && picks.filter(p => p.captain).length === 1

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px', color: 'var(--ts-text)' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 48, fontWeight: 800, margin: '0 0 20px', color: 'var(--ts-text)' }}>
        {es ? 'Tu equipo Fantasy' : 'Your Fantasy team'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <section style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--ts-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {es ? 'Nombre del equipo' : 'Team name'}
          </label>
          <input
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            maxLength={32}
            placeholder={es ? 'Los Galácticos' : 'The Galacticos'}
            style={{ width: '100%', background: 'var(--ts-bg)', color: 'var(--ts-text)', border: '1px solid var(--ts-border-hot)', borderRadius: 6, padding: '10px 12px', fontSize: 16, marginBottom: 18 }}
          />

          <div style={{ fontSize: 11, color: 'var(--ts-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>
            {es ? 'Tus 5 picks' : 'Your 5 picks'}
          </div>
          {picks.map(p => (
            <div
              key={p.slot}
              onClick={() => setActiveSlot(p.slot)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', marginBottom: 8, borderRadius: 8, cursor: 'pointer',
                background: activeSlot === p.slot ? 'var(--ts-primary-soft)' : 'var(--ts-bg)',
                border: `1px solid ${activeSlot === p.slot ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ts-card2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--ts-text)' }}>{p.slot}</span>
                <span style={{ fontSize: 14, color: p.player_name ? 'var(--ts-text)' : 'var(--ts-faint)' }}>
                  {p.player_name || (es ? 'Slot vacío' : 'Empty slot')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={ev => { ev.stopPropagation(); setCaptain(p.slot) }}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
                    background: p.captain ? 'var(--ts-primary)' : 'transparent',
                    color: p.captain ? 'var(--ts-bg)' : 'var(--ts-muted)',
                    border: `1px solid ${p.captain ? 'var(--ts-primary)' : 'var(--ts-border-hot)'}`,
                    cursor: 'pointer',
                  }}
                >C</button>
                {p.player_name && (
                  <button
                    onClick={ev => { ev.stopPropagation(); clearSlot(p.slot) }}
                    style={{ fontSize: 11, padding: '4px 8px', background: 'transparent', color: 'var(--ts-muted)', border: '1px solid var(--ts-border)', borderRadius: 4, cursor: 'pointer' }}
                  >×</button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={save}
            disabled={!canSave || saving}
            style={{
              width: '100%', marginTop: 18, padding: '12px 16px', borderRadius: 6,
              background: canSave ? 'var(--ts-primary)' : 'var(--ts-card2)',
              color: canSave ? 'var(--ts-bg)' : 'var(--ts-faint)',
              fontWeight: 700, fontSize: 14, border: 'none',
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? (es ? 'Guardando…' : 'Saving…') : (es ? 'Guardar equipo' : 'Save team')}
          </button>
          {err && <p style={{ color: 'var(--ts-red)', fontSize: 12, marginTop: 10 }}>{err}</p>}
        </section>

        <section style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--ts-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {es ? `Slot ${activeSlot} — elige jugador` : `Slot ${activeSlot} — pick a player`}
          </div>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder={es ? 'Buscar nombre o club…' : 'Search name or club…'}
            style={{ width: '100%', background: 'var(--ts-bg)', color: 'var(--ts-text)', border: '1px solid var(--ts-border-hot)', borderRadius: 6, padding: '8px 12px', fontSize: 14, marginBottom: 12 }}
          />
          <div style={{ maxHeight: 540, overflowY: 'auto' }}>
            {list.map(e => (
              <div
                key={e.slug}
                onClick={() => setSlotPlayer(activeSlot, e)}
                style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
                onMouseEnter={ev => { ev.currentTarget.style.background = 'var(--ts-card2)' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent' }}
              >
                <div>
                  <div style={{ fontSize: 14, color: 'var(--ts-text)', fontWeight: 500 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{e.club} · {e.league}</div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, color: 'var(--ts-primary)', fontWeight: 700 }}>
                  {e.goals}<span style={{ color: 'var(--ts-faint)', fontSize: 11, marginLeft: 4 }}>G</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
