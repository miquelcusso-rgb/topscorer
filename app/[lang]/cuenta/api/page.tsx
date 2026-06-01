'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { isScout, isTeam } from '@/lib/plans'
import SaasShell from '@/components/saas/SaasShell'

interface ApiKeyRow {
  id: string
  key_prefix: string
  label: string
  last_used_at: string | null
  revoked: boolean
  created_at: string
}

export default function ApiKeysPage() {
  const { user, isLoaded } = useUser()
  const meta = user?.publicMetadata as Record<string, unknown> | undefined
  const allowed = isLoaded && (isScout(meta) || isTeam(meta))

  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [justCreated, setJustCreated] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/keys')
    if (res.ok) setKeys(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (allowed) load()
    else setLoading(false)
  }, [allowed, load])

  async function createKey() {
    setCreating(true)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label || 'API Key' }),
      })
      const body = await res.json()
      if (!res.ok) { alert(body.error ?? 'Error al crear la clave'); return }
      setJustCreated(body.plaintext)
      setLabel('')
      load()
    } finally {
      setCreating(false)
    }
  }

  async function revokeKey(id: string) {
    if (!confirm('¿Revocar esta clave? Las peticiones que la usen dejarán de funcionar de inmediato.')) return
    const res = await fetch(`/api/keys?id=${id}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  if (!isLoaded) return null

  // ── Upsell for non-Scout users ─────────────────────────────────────────────
  if (!allowed) {
    return (
      <SaasShell activeKey="stats" breadcrumb={['Cuenta', 'API']}>
        <main className="relative z-10">
          <div className="max-w-[680px] mx-auto px-5 py-16 text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
              style={{ background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}
            >
              <span style={{ fontSize: 26 }}>🔑</span>
            </div>
            <h1
              className="font-bold mb-3"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, color: 'var(--ts-text)', letterSpacing: 0.5 }}
            >
              Acceso API
            </h1>
            <p className="text-[14px] mb-6" style={{ color: 'var(--ts-muted)', lineHeight: 1.6 }}>
              La API REST de TopScorers está disponible en el plan <strong style={{ color: 'var(--ts-primary)' }}>Scout</strong>:
              50.000 peticiones/mes a goleadores, jugadores y clasificaciones de las grandes ligas.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 rounded font-bold text-[14px]"
              style={{ background: 'var(--ts-primary)', color: 'var(--ts-bg)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}
            >
              Ver plan Scout
            </Link>
          </div>
        </main>
      </SaasShell>
    )
  }

  // ── Scout: full key management ──────────────────────────────────────────────
  return (
    <SaasShell activeKey="stats" breadcrumb={['Cuenta', 'API']}>
    <main className="relative z-10">
      <div className="max-w-[820px] mx-auto px-5 py-10">
        <h1
          className="font-bold mb-1"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, color: 'var(--ts-text)', letterSpacing: 0.5 }}
        >
          Claves API
        </h1>
        <p className="text-[13px] mb-6" style={{ color: 'var(--ts-muted)' }}>
          Plan Scout · 50.000 peticiones/mes · máx. 5 claves activas
        </p>

        {/* Newly created key — shown once */}
        {justCreated && (
          <div
            className="rounded-lg p-4 mb-6"
            style={{ background: 'var(--ts-teal-soft)', border: '1px solid var(--ts-border-hot)' }}
          >
            <div className="text-[12px] font-bold mb-2" style={{ color: 'var(--ts-teal)' }}>
              ✓ Clave creada — cópiala ahora, no volverá a mostrarse
            </div>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 text-[12px] px-3 py-2 rounded overflow-x-auto"
                style={{ background: 'var(--ts-card2)', color: 'var(--ts-text)', border: '1px solid var(--ts-border)', fontFamily: 'monospace' }}
              >
                {justCreated}
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText(justCreated); }}
                className="px-3 py-2 rounded text-[12px] font-bold cursor-pointer"
                style={{ background: 'var(--ts-teal)', color: 'var(--ts-bg)' }}
              >
                Copiar
              </button>
            </div>
            <button
              onClick={() => setJustCreated(null)}
              className="mt-2 text-[11px] cursor-pointer"
              style={{ color: 'var(--ts-muted)' }}
            >
              Ya la he guardado, ocultar
            </button>
          </div>
        )}

        {/* Create */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Nombre de la clave (ej. Producción)"
            maxLength={60}
            className="flex-1 rounded text-[13px] px-3 py-2 outline-none"
            style={{ background: 'var(--ts-card2)', border: '1px solid var(--ts-border)', color: 'var(--ts-text)' }}
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="px-4 py-2 rounded text-[13px] font-bold cursor-pointer whitespace-nowrap"
            style={{ background: 'var(--ts-primary)', color: 'var(--ts-bg)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, opacity: creating ? 0.5 : 1 }}
          >
            {creating ? 'Creando…' : '+ Nueva clave'}
          </button>
        </div>

        {/* Key list */}
        <div className="rounded-lg overflow-hidden mb-10" style={{ border: '1px solid var(--ts-border)' }}>
          {loading ? (
            <div className="py-10 text-center text-[13px]" style={{ color: 'var(--ts-muted)' }}>Cargando…</div>
          ) : keys.filter(k => !k.revoked).length === 0 ? (
            <div className="py-10 text-center text-[13px]" style={{ color: 'var(--ts-muted)' }}>
              Aún no tienes claves. Crea la primera arriba.
            </div>
          ) : (
            keys.filter(k => !k.revoked).map(k => (
              <div
                key={k.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--ts-divider)', background: 'var(--ts-card)' }}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold" style={{ color: 'var(--ts-text)' }}>{k.label}</div>
                  <code className="text-[11px]" style={{ color: 'var(--ts-muted)', fontFamily: 'monospace' }}>{k.key_prefix}</code>
                  <span className="text-[10px] ml-2" style={{ color: 'var(--ts-faint)' }}>
                    {k.last_used_at ? `Usada ${new Date(k.last_used_at).toLocaleDateString('es-ES')}` : 'Sin uso aún'}
                  </span>
                </div>
                <button
                  onClick={() => revokeKey(k.id)}
                  className="px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer shrink-0"
                  style={{ background: 'transparent', border: '1px solid var(--ts-red)', color: 'var(--ts-red)' }}
                >
                  Revocar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Docs */}
        <h2
          className="font-bold mb-3"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, color: 'var(--ts-text)' }}
        >
          Cómo usar la API
        </h2>
        <div className="rounded-lg p-4" style={{ background: 'var(--ts-card2)', border: '1px solid var(--ts-border)' }}>
          <pre className="text-[12px] overflow-x-auto" style={{ color: 'var(--ts-muted)', fontFamily: 'monospace', lineHeight: 1.7 }}>
{`# Top goleadores de La Liga
curl https://www.top-scorers.com/api/v1/scorers?league=La%20Liga \\
  -H "Authorization: Bearer tsk_live_…"

# Jugadores (filtros: league, position, season, limit)
curl "https://www.top-scorers.com/api/v1/players?position=FW&limit=50" \\
  -H "Authorization: Bearer tsk_live_…"

# Clasificación (league = código corto: PD, PL, BL1, SA, FL1)
curl "https://www.top-scorers.com/api/v1/standings?league=PD&season=2025" \\
  -H "Authorization: Bearer tsk_live_…"`}
          </pre>
        </div>
        <p className="text-[11px] mt-3" style={{ color: 'var(--ts-faint)' }}>
          Límite: 50.000 peticiones/mes. Cada respuesta incluye cabeceras{' '}
          <code style={{ color: 'var(--ts-muted)' }}>X-RateLimit-Remaining</code>.
        </p>
      </div>
    </main>
    </SaasShell>
  )
}
