'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import type { ApiStandingEntry } from '@/lib/api-football'
import { t } from './shared'
import CrestImg from '@/components/saas/CrestImg'

// ─── Groups panel ─────────────────────────────────────────────────────────────

export default function GroupsPanel({ initial = [] }: { initial?: ApiStandingEntry[][] }) {
  const { lang } = useLang()
  const [groups, setGroups] = useState<ApiStandingEntry[][]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)
  const [error, setError] = useState(false)

  // Only client-fetch when the server didn't seed us (keeps the groups in the
  // initial HTML for SEO when data exists; refreshes live otherwise). When
  // seeded, `loading` already starts false — no "Cargando" on first paint.
  useEffect(() => {
    if (initial.length > 0) return
    let cancelled = false
    fetch('/api/football/standings?league=1&season=2026&groups=1')
      .then(r => r.json())
      .then(j => { if (cancelled) return; if (j.ok && Array.isArray(j.data)) setGroups(j.data); else setError(true) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [initial.length])

  // Real draw groups only (Group A–L) — exclude the "third-placed ranking" table.
  // Tolerant to the API's label format, which is "Group Stage - Group A"
  // (it used to be just "Group A"); we extract the trailing group letter so a
  // label change can't silently blank the whole tab again.
  const groupLetter = (name?: string) => (name ?? '').match(/group\s+([a-l])\s*$/i)?.[1]?.toUpperCase()
  const realGroups = groups
    .filter(g => g.length >= 2 && groupLetter(g[0]?.group))
    .sort((a, b) => (groupLetter(a[0]?.group) ?? '').localeCompare(groupLetter(b[0]?.group) ?? ''))
  // Whether the tournament has begun (any matches played) → show points table.
  const started = realGroups.some(g => g.some(r => (r.all?.played ?? 0) > 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, marginBottom: 8, color: 'var(--ts-muted)' }}>
        {t(lang, 'Grupos oficiales del sorteo del Mundial 2026.', 'Official 2026 World Cup draw groups.')}
      </p>

      {loading && <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando grupos…', 'Loading groups…')}</div>}

      {!loading && realGroups.length > 0 && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {realGroups.map(g => (
            <div key={g[0]!.group} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
              <div style={{
                padding: '8px 12px', fontSize: 13, fontWeight: 800, color: 'var(--ts-primary)',
                fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: 'uppercase',
                borderBottom: '1px solid var(--ts-border)', borderLeft: '3px solid var(--ts-primary)',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{t(lang, 'Grupo', 'Group')} {groupLetter(g[0]?.group)}</span>
                {started && <span style={{ fontSize: 10, color: 'var(--ts-muted)' }}>{t(lang, 'Pts', 'Pts')}</span>}
              </div>
              {g.map((row, ti) => (
                <Link key={row.team.id} href={`/${lang}/mundial-2026/${slugify(row.team.name)}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: ti < g.length - 1 ? '1px solid var(--ts-divider)' : 'none', textDecoration: 'none', color: 'inherit' }}>
                  {started && <span style={{ width: 14, fontSize: 11, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>{row.rank}</span>}
                  <CrestImg src={row.team.logo} alt={row.team.name} size={18} />
                  <span style={{ fontSize: 12, color: 'var(--ts-text)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.team.name}</span>
                  {started && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{row.points}</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}

      {!loading && realGroups.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--ts-muted)' }}>
          {error
            ? t(lang, 'No se pudieron cargar los grupos ahora mismo.', 'Could not load the groups right now.')
            : t(lang, 'Los grupos se publicarán tras el sorteo.', 'Groups will be published after the draw.')}
        </p>
      )}
    </div>
  )
}
