'use client'
import { useState, useEffect, useRef } from 'react'
import { clubLogo } from '@/lib/club-logos'
import { canonicalClubName } from '@/lib/club-colors'
import { notifyClubChange } from '@/lib/use-club-accent'

// "My team" picker for the sidebar account box: a text input with a live
// matching-names dropdown. FREE for everyone (favourite team); PRO additionally
// tints the workspace. Writes localStorage 'ts-club' + fires notifyClubChange so
// the sidebar/topbar accent + the home block update instantly.
interface Club { value: string; label: string }

export default function ClubTypeahead({ en }: { en: boolean }) {
  const [all, setAll] = useState<Club[]>([])
  const [selected, setSelected] = useState<string>('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => { try { setSelected(localStorage.getItem('ts-club') ?? '') } catch {} }, [])
  const ensureLoaded = () => { if (!all.length) fetch('/api/clubs').then(r => r.json()).then(d => Array.isArray(d) && setAll(d)).catch(() => {}) }

  // Close on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (c: Club | null) => {
    const v = c?.value ?? ''
    setSelected(v); setQ(''); setOpen(false)
    try { v ? localStorage.setItem('ts-club', v) : localStorage.removeItem('ts-club') } catch {}
    notifyClubChange()
  }

  const nq = q.trim().toLowerCase()
  const matches = nq ? all.filter(c => c.label.toLowerCase().includes(nq)).slice(0, 8) : []
  const crest = selected ? clubLogo(selected) : undefined

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginBottom: 6 }}>
        {en ? 'My team' : 'Mi equipo'}
      </div>

      {selected && !open ? (
        // Compact selected state: crest + name + change.
        <button type="button" onClick={() => { ensureLoaded(); setOpen(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minHeight: 40, padding: '6px 10px', borderRadius: 8, background: 'var(--ts-bg)', border: '1px solid var(--ts-border)', cursor: 'pointer', color: 'var(--ts-text)', textAlign: 'left', fontFamily: 'inherit' }}>
          {crest
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={crest} alt="" width={20} height={20} style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }} />
            : <span aria-hidden style={{ fontSize: 14 }}>🛡️</span>}
          <span style={{ flex: 1, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{canonicalClubName(selected)}</span>
          <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{en ? 'change' : 'cambiar'}</span>
        </button>
      ) : (
        <input
          type="text"
          value={q}
          autoFocus={open}
          onFocus={() => { ensureLoaded(); setOpen(true) }}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          placeholder={en ? 'Type your team…' : 'Escribe tu equipo…'}
          aria-label={en ? 'My team' : 'Mi equipo'}
          style={{ width: '100%', boxSizing: 'border-box', minHeight: 40, padding: '8px 10px', borderRadius: 8, background: 'var(--ts-bg)', border: '1px solid var(--ts-border)', color: 'var(--ts-text)', fontSize: 12, fontFamily: 'inherit' }}
        />
      )}

      {open && nq.length > 0 && (
        <div style={{ position: 'absolute', zIndex: 30, left: 0, right: 0, marginTop: 4, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', maxHeight: 240, overflowY: 'auto' }}>
          {matches.length === 0 ? (
            <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--ts-faint)' }}>{en ? 'No matches' : 'Sin coincidencias'}</div>
          ) : matches.map(c => {
            const logo = clubLogo(c.value)
            return (
              <button key={c.value} type="button" onClick={() => pick(c)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minHeight: 38, padding: '7px 10px', border: 'none', borderBottom: '1px solid var(--ts-hairline)', background: 'transparent', color: 'var(--ts-text)', fontSize: 12.5, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                {logo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={logo} alt="" width={18} height={18} style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
                  : <span aria-hidden style={{ width: 18, textAlign: 'center' }}>·</span>}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
              </button>
            )
          })}
          {selected && (
            <button type="button" onClick={() => pick(null)}
              style={{ display: 'block', width: '100%', minHeight: 34, padding: '6px 10px', border: 'none', background: 'transparent', color: 'var(--ts-muted)', fontSize: 11, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              {en ? '× Clear my team' : '× Quitar mi equipo'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
