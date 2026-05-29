'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { isScout, isTeam } from '@/lib/plans'

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
      <main className="relative z-10 min-h-screen" style={{ background: '#0b0c1a' }}>
        <div className="max-w-[680px] mx-auto px-5 py-16 text-center">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ background: 'rgba(160,96,255,.12)', border: '1px solid rgba(160,96,255,.3)' }}
          >
            <span style={{ fontSize: 26 }}>🔑</span>
          </div>
          <h1
            className="font-bold mb-3"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, color: '#e8e8f8', letterSpacing: 0.5 }}
          >
            Acceso API
          </h1>
          <p className="text-[14px] mb-6" style={{ color: '#7888aa', lineHeight: 1.6 }}>
            La API REST de TopScorers está disponible en el plan <strong style={{ color: '#a060ff' }}>Scout</strong>:
            50.000 peticiones/mes a goleadores, jugadores y clasificaciones de las grandes ligas.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 rounded font-bold text-[14px]"
            style={{ background: '#a060ff', color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}
          >
            Ver plan Scout
          </Link>
        </div>
      </main>
    )
  }

  // ── Scout: full key management ──────────────────────────────────────────────
  return (
    <main className="relative z-10 min-h-screen" style={{ background: '#0b0c1a' }}>
      <div className="max-w-[820px] mx-auto px-5 py-10">
        <h1
          className="font-bold mb-1"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, color: '#e8e8f8', letterSpacing: 0.5 }}
        >
          Claves API
        </h1>
        <p className="text-[13px] mb-6" style={{ color: '#5060a0' }}>
          Plan Scout · 50.000 peticiones/mes · máx. 5 claves activas
        </p>

        {/* Newly created key — shown once */}
        {justCreated && (
          <div
            className="rounded-lg p-4 mb-6"
            style={{ background: 'rgba(56,196,122,.08)', border: '1px solid rgba(56,196,122,.3)' }}
          >
            <div className="text-[12px] font-bold mb-2" style={{ color: '#38c47a' }}>
              ✓ Clave creada — cópiala ahora, no volverá a mostrarse
            </div>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 text-[12px] px-3 py-2 rounded overflow-x-auto"
                style={{ background: '#05060c', color: '#c8c8e0', border: '1px solid #1a1c38', fontFamily: 'monospace' }}
              >
                {justCreated}
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText(justCreated); }}
                className="px-3 py-2 rounded text-[12px] font-bold cursor-pointer"
                style={{ background: '#38c47a', color: '#05060c' }}
              >
                Copiar
              </button>
            </div>
            <button
              onClick={() => setJustCreated(null)}
              className="mt-2 text-[11px] cursor-pointer"
              style={{ color: '#5060a0' }}
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
            style={{ background: '#07070f', border: '1px solid #1a1c38', color: '#c8c8e0' }}
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="px-4 py-2 rounded text-[13px] font-bold cursor-pointer whitespace-nowrap"
            style={{ background: '#f0c040', color: '#05060c', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, opacity: creating ? 0.5 : 1 }}
          >
            {creating ? 'Creando…' : '+ Nueva clave'}
          </button>
        </div>

        {/* Key list */}
        <div className="rounded-lg overflow-hidden mb-10" style={{ border: '1px solid #1a1c38' }}>
          {loading ? (
            <div className="py-10 text-center text-[13px]" style={{ color: '#5060a0' }}>Cargando…</div>
          ) : keys.filter(k => !k.revoked).length === 0 ? (
            <div className="py-10 text-center text-[13px]" style={{ color: '#5060a0' }}>
              Aún no tienes claves. Crea la primera arriba.
            </div>
          ) : (
            keys.filter(k => !k.revoked).map(k => (
              <div
                key={k.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid #14152a', background: '#0d0e24' }}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold" style={{ color: '#e8e8f8' }}>{k.label}</div>
                  <code className="text-[11px]" style={{ color: '#5060a0', fontFamily: 'monospace' }}>{k.key_prefix}</code>
                  <span className="text-[10px] ml-2" style={{ color: '#3a3b52' }}>
                    {k.last_used_at ? `Usada ${new Date(k.last_used_at).toLocaleDateString('es-ES')}` : 'Sin uso aún'}
                  </span>
                </div>
                <button
                  onClick={() => revokeKey(k.id)}
                  className="px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer shrink-0"
                  style={{ background: 'rgba(224,58,58,.1)', border: '1px solid rgba(224,58,58,.3)', color: '#e03a3a' }}
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
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, color: '#e8e8f8' }}
        >
          Cómo usar la API
        </h2>
        <div className="rounded-lg p-4" style={{ background: '#05060c', border: '1px solid #1a1c38' }}>
          <pre className="text-[12px] overflow-x-auto" style={{ color: '#9aa8d0', fontFamily: 'monospace', lineHeight: 1.7 }}>
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
        <p className="text-[11px] mt-3" style={{ color: '#3a3b52' }}>
          Límite: 50.000 peticiones/mes. Cada respuesta incluye cabeceras{' '}
          <code style={{ color: '#5060a0' }}>X-RateLimit-Remaining</code>.
        </p>
      </div>
    </main>
  )
}
