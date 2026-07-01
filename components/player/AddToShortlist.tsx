'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import type { Plan } from '@/types'

interface Shortlist { id: string; name: string; players: Array<{ slug: string }> }

// Scout-only: add THIS player to one of the user's shortlists from the fiche.
// Non-Scout users see nothing here (the IIG-breakdown card above already upsells).
export default function AddToShortlist({ slug, name, lang }: { slug: string; name: string; lang: 'es' | 'en' }) {
  const en = lang === 'en'
  const { user, isLoaded } = useUser()
  const isScout = isLoaded && user && (user.publicMetadata?.plan as Plan) === 'scout'
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<Shortlist[] | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())

  if (!isScout) return null

  const toggle = () => {
    const next = !open; setOpen(next)
    if (next && lists === null) fetch('/api/scout/shortlists').then(r => r.ok ? r.json() : []).then(d => setLists(Array.isArray(d) ? d : [])).catch(() => setLists([]))
  }
  const add = async (id: string) => {
    await fetch('/api/scout/shortlists', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, add: { slug, name } }) }).catch(() => {})
    setAdded(s => new Set(s).add(id))
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={toggle}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '8px 14px', borderRadius: 999, background: 'var(--ts-card2)', border: '1px solid var(--ts-border)', color: 'var(--ts-text)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        ＋ {en ? 'Add to shortlist' : 'Añadir a shortlist'} <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--ts-primary)' }}>SCOUT</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 20, marginTop: 6, minWidth: 220, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, padding: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
          {lists === null ? (
            <div style={{ fontSize: 12, color: 'var(--ts-faint)', padding: 8 }}>{en ? 'Loading…' : 'Cargando…'}</div>
          ) : lists.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ts-muted)', padding: 8 }}>
              {en ? 'No shortlists yet — create one on the Scout page.' : 'Sin shortlists — crea una en la página Scout.'}
            </div>
          ) : lists.map(l => {
            const has = added.has(l.id) || l.players.some(p => p.slug === slug)
            return (
              <button key={l.id} type="button" onClick={() => !has && add(l.id)} disabled={has}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, padding: '8px 10px', minHeight: 40, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--ts-text)', fontSize: 13, textAlign: 'left', cursor: has ? 'default' : 'pointer' }}>
                <span style={{ flex: 1 }}>{l.name}</span>
                <span style={{ color: has ? 'var(--ts-teal)' : 'var(--ts-muted)', fontWeight: 700 }}>{has ? '✓' : '＋'}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
