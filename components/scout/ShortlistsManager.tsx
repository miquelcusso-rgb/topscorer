'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import type { Plan } from '@/types'

interface Shortlist { id: string; name: string; players: Array<{ slug: string; name: string }> }

export default function ShortlistsManager({ lang }: { lang: 'es' | 'en' }) {
  const en = lang === 'en'
  const { user, isLoaded } = useUser()
  const isScout = isLoaded && user && (user.publicMetadata?.plan as Plan) === 'scout'
  const [lists, setLists] = useState<Shortlist[]>([])
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    fetch('/api/scout/shortlists').then(r => r.ok ? r.json() : []).then(d => setLists(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])
  useEffect(() => { if (isScout) load() }, [isScout, load])

  if (!isScout) return null // the comparator above already shows the upsell for non-Scout

  const create = async () => {
    if (!name.trim() || busy) return
    setBusy(true)
    await fetch('/api/scout/shortlists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }).catch(() => {})
    setName(''); setBusy(false); load()
  }
  const del = async (id: string) => { await fetch(`/api/scout/shortlists?id=${id}`, { method: 'DELETE' }).catch(() => {}); load() }
  const removePlayer = async (id: string, slug: string) => {
    await fetch('/api/scout/shortlists', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, remove: slug }) }).catch(() => {})
    load()
  }

  return (
    <section style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 18 }}>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, margin: '0 0 12px', color: 'var(--ts-text)' }}>
        {en ? 'My shortlists' : 'Mis shortlists'}
      </h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()}
          placeholder={en ? 'New shortlist name…' : 'Nombre de la shortlist…'} maxLength={60}
          style={{ flex: 1, minHeight: 40, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--ts-border)', background: 'var(--ts-card2)', color: 'var(--ts-text)', fontSize: 14 }} />
        <button type="button" onClick={create} disabled={busy || !name.trim()}
          style={{ minHeight: 40, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--ts-primary)', color: '#1a1a1a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {en ? 'Create' : 'Crear'}
        </button>
      </div>
      {lists.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ts-muted)' }}>
          {en ? 'No shortlists yet. Create one, then add players from any player page.' : 'Aún no hay shortlists. Crea una y añade jugadores desde cualquier ficha.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lists.map(l => (
            <div key={l.id} style={{ border: '1px solid var(--ts-hairline)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: l.players.length ? 8 : 0 }}>
                <span style={{ fontWeight: 700, color: 'var(--ts-text)' }}>{l.name}</span>
                <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{l.players.length}</span>
                <button type="button" onClick={() => del(l.id)} aria-label={en ? 'Delete' : 'Borrar'}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--ts-muted)', cursor: 'pointer', fontSize: 12 }}>
                  {en ? 'Delete' : 'Borrar'}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {l.players.map(p => (
                  <span key={p.slug} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999, background: 'var(--ts-card2)', fontSize: 12 }}>
                    <Link href={`/${lang}/jugadores/${p.slug}`} style={{ color: 'var(--ts-text)', textDecoration: 'none' }}>{p.name}</Link>
                    <button type="button" onClick={() => removePlayer(l.id, p.slug)} aria-label="×"
                      style={{ background: 'none', border: 'none', color: 'var(--ts-muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
