'use client'

import { use, useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { isScout } from '@/lib/plans'
import SaasShell from '@/components/saas/SaasShell'

// Scout tool: manage Performance Alerts. Lists the user's alerts (GET /api/alerts),
// adds one via a player typeahead + alert type (POST), deletes (DELETE ?id).
// Non-scout users see an upgrade CTA. Brand --ts-* tokens. Author: Furiosa Studio.

const ALERT_TYPES = ['goal', 'brace', 'hat_trick', 'assist', 'rating_85'] as const
type AlertType = (typeof ALERT_TYPES)[number]
const TYPE_LABEL: Record<AlertType, { es: string; en: string }> = {
  goal: { es: 'Marca gol', en: 'Scores' },
  brace: { es: 'Doblete', en: 'Brace' },
  hat_trick: { es: 'Hat-trick', en: 'Hat-trick' },
  assist: { es: 'Da asistencia', en: 'Assists' },
  rating_85: { es: 'Valoración ≥ 8.5', en: 'Rating ≥ 8.5' },
}

interface AlertRow { id: number; player_slug: string; player_name: string; alert_type: AlertType; enabled: boolean; last_fired_at: string | null }
interface SearchHit { name: string; slug: string; club?: string }

export default function AlertsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const en = lang === 'en'
  const L: 'es' | 'en' = en ? 'en' : 'es'
  const { user, isLoaded } = useUser()
  const allowed = isLoaded && isScout(user?.publicMetadata as Record<string, unknown> | undefined)

  const [rows, setRows] = useState<AlertRow[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<AlertType>('goal')
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const box = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/alerts')
    if (r.ok) { const j = await r.json(); setRows(Array.isArray(j.data) ? j.data : []) }
    setLoading(false)
  }, [])

  useEffect(() => { if (allowed) load(); else setLoading(false) }, [allowed, load])

  // Player typeahead.
  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return }
    let cancel = false
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const j = await r.json()
        if (!cancel) setHits((j.players ?? []).slice(0, 6))
      } catch { if (!cancel) setHits([]) }
    }, 180)
    return () => { cancel = true; clearTimeout(t) }
  }, [q])

  const add = async (p: SearchHit) => {
    setBusy(true); setErr('')
    const r = await fetch('/api/alerts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_slug: p.slug, player_name: p.name, alert_type: type }),
    })
    setBusy(false)
    if (r.ok) { setQ(''); setHits([]); load() }
    else {
      const j = await r.json().catch(() => ({}))
      setErr(j.error === 'quota_exceeded' ? (en ? 'Alert limit reached (50).' : 'Límite de alertas alcanzado (50).') : (en ? 'Could not add alert.' : 'No se pudo añadir la alerta.'))
    }
  }
  const del = async (id: number) => { await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' }); load() }

  const card: React.CSSProperties = { background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 20, maxWidth: 640 }

  return (
    <SaasShell activeKey="players" breadcrumb={en ? ['Account', 'Performance Alerts'] : ['Cuenta', 'Alertas de rendimiento']}>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 800, color: 'var(--ts-text)', margin: '0 0 6px' }}>
        {en ? 'Performance Alerts' : 'Alertas de rendimiento'}
      </h1>
      <p style={{ color: 'var(--ts-muted)', fontSize: 14, margin: '0 0 18px', maxWidth: 640 }}>
        {en ? 'Get an email the moment a watched player scores, provides an assist or posts a top rating.'
            : 'Recibe un email en cuanto un jugador que sigues marca, asiste o firma una gran valoración.'}
      </p>

      {!isLoaded ? null : !allowed ? (
        <div style={card}>
          <p style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--ts-muted)' }}>
            {en ? 'Performance Alerts are a Scout feature.' : 'Las Alertas de rendimiento son una función Scout.'}
          </p>
          <Link href={`/${lang}/pricing`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '10px 20px', borderRadius: 999, background: 'var(--ts-primary)', color: '#1a1a1a', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            {en ? 'Upgrade to Scout' : 'Hazte Scout'} →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Add */}
          <div style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 12 }}>
              {en ? 'Add an alert' : 'Añadir alerta'}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {ALERT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  style={{ padding: '6px 12px', minHeight: 36, borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                    border: '1px solid var(--ts-border)', background: type === t ? 'var(--ts-primary)' : 'var(--ts-card2)', color: type === t ? '#1a1a1a' : 'var(--ts-text)' }}>
                  {TYPE_LABEL[t][L]}
                </button>
              ))}
            </div>
            <div ref={box} style={{ position: 'relative' }}>
              <input value={q} onChange={e => setQ(e.target.value)} disabled={busy}
                placeholder={en ? 'Search a player…' : 'Busca un jugador…'}
                style={{ width: '100%', minHeight: 44, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ts-border)', background: 'var(--ts-card2)', color: 'var(--ts-text)', fontSize: 14, boxSizing: 'border-box' }} />
              {hits.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden', zIndex: 20 }}>
                  {hits.map(p => (
                    <button key={p.slug} type="button" onClick={() => add(p)}
                      style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, padding: '10px 14px', minHeight: 44, cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: '1px solid var(--ts-hairline)', color: 'var(--ts-text)', fontSize: 13.5, textAlign: 'left' }}>
                      <span style={{ flex: 1 }}>{p.name}{p.club ? <span style={{ color: 'var(--ts-faint)' }}> · {p.club}</span> : null}</span>
                      <span style={{ color: 'var(--ts-teal)', fontSize: 12 }}>+ {TYPE_LABEL[type][L]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {err ? <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--ts-red, #dc2626)' }}>{err}</p> : null}
          </div>

          {/* List */}
          <div style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 12 }}>
              {en ? `Active alerts · ${rows.length}` : `Alertas activas · ${rows.length}`}
            </div>
            {loading ? (
              <p style={{ fontSize: 13, color: 'var(--ts-faint)' }}>{en ? 'Loading…' : 'Cargando…'}</p>
            ) : rows.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--ts-muted)' }}>{en ? 'No alerts yet — add one above.' : 'Aún no tienes alertas — añade una arriba.'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {rows.map((a, i) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', minHeight: 44, borderBottom: i < rows.length - 1 ? '1px solid var(--ts-hairline)' : 'none' }}>
                    <Link href={`/${lang}/jugadores/${a.player_slug}`} style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.player_name}
                    </Link>
                    <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: 'var(--ts-teal)', background: 'var(--ts-card2)', padding: '3px 9px', borderRadius: 999 }}>{TYPE_LABEL[a.alert_type]?.[L] ?? a.alert_type}</span>
                    <button type="button" onClick={() => del(a.id)} aria-label={en ? 'Delete' : 'Eliminar'}
                      style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, cursor: 'pointer', border: '1px solid var(--ts-border)', background: 'var(--ts-card2)', color: 'var(--ts-muted)', fontSize: 14 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </SaasShell>
  )
}
