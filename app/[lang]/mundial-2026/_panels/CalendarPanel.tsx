'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import type { ApiFixture, FixturePrediction } from '@/lib/api-football'
import { type Lang, t, WC_SCHEDULE } from './shared'
import CrestImg from '@/components/saas/CrestImg'

// Phase-windows summary (used below the real fixtures; knockout match-ups are
// only scheduled once the groups resolve).
function PhaseWindows({ lang }: { lang: Lang }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
      {WC_SCHEDULE.map((row, i) => (
        <div key={row.en} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
          borderBottom: i < WC_SCHEDULE.length - 1 ? '1px solid var(--ts-divider)' : 'none',
          background: row.highlight ? 'var(--ts-primary-soft)' : 'transparent',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: row.highlight ? 'var(--ts-primary)' : 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {t(lang, row.es, row.en)}
            </div>
            {(row.note_es || row.note_en) && (
              <div style={{ fontSize: 11, marginTop: 2, color: 'var(--ts-muted)' }}>{t(lang, row.note_es ?? '', row.note_en ?? '')}</div>
            )}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, textAlign: 'right' }}>
            {t(lang, row.dates_es, row.dates_en)}
          </div>
        </div>
      ))}
    </div>
  )
}

// Compact, informational win/draw/loss probability bar for an upcoming fixture.
// Pulls /predictions via our route. No betting/odds wording. Renders nothing if
// the API has no usable prediction (e.g. finished match or pre-draw fixture).
function PredictionBar({ fixtureId, lang }: { fixtureId: number; lang: Lang }) {
  const [pred, setPred] = useState<FixturePrediction | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/football/prediction?fixture=${fixtureId}`)
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && j.data) setPred(j.data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [fixtureId])

  if (!pred) return null

  const segs: { pct: number; color: string; label: string }[] = [
    { pct: pred.homePct, color: 'var(--ts-primary)', label: '1' },
    { pct: pred.drawPct, color: 'var(--ts-muted)', label: 'X' },
    { pct: pred.awayPct, color: 'var(--ts-teal)', label: '2' },
  ]

  return (
    <div style={{ padding: '4px 14px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-faint)', fontWeight: 700 }}>
          {t(lang, 'Pronóstico', 'Forecast')}
        </span>
        <span style={{ fontSize: 10, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {pred.homePct}% · {pred.drawPct}% · {pred.awayPct}%
        </span>
      </div>
      <div style={{ display: 'flex', height: 8, borderRadius: 5, overflow: 'hidden', background: 'var(--ts-card2)' }} aria-hidden>
        {segs.map((s, i) => s.pct > 0 ? (
          <div key={i} style={{ width: `${s.pct}%`, background: s.color }} />
        ) : null)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 9, color: 'var(--ts-primary)', fontWeight: 700 }}>{t(lang, '1 · local', '1 · home')}</span>
        <span style={{ fontSize: 9, color: 'var(--ts-muted)', fontWeight: 700 }}>{t(lang, 'X · empate', 'X · draw')}</span>
        <span style={{ fontSize: 9, color: 'var(--ts-teal)', fontWeight: 700 }}>{t(lang, '2 · visitante', '2 · away')}</span>
      </div>
    </div>
  )
}

function MatchRow({ f, lang }: { f: ApiFixture; lang: Lang }) {
  const locale = lang === 'en' ? 'en-US' : 'es-ES'
  const time = new Date(f.fixture.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const finished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
  const score = finished || f.goals.home != null
  // Only upcoming matches (not started) get a forecast; the API returns nothing
  // for finished fixtures anyway, but we gate to avoid the wasted request.
  const upcoming = f.fixture.status.short === 'NS'
  // Country names link to nation pages; the score/time + venue link to the match
  // detail page. (Sibling <a>s, never nested — nested anchors are invalid HTML.)
  const teamNameStyle: React.CSSProperties = { fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none', cursor: 'pointer' }
  return (
    <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: upcoming ? 'none' : '1px solid var(--ts-divider)' }}>
      <Link href={`/${lang}/mundial-2026/partido/${f.fixture.id}`} aria-label={t(lang, 'Ver detalle del partido', 'View match detail')} style={{ width: 46, flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums', textDecoration: 'none', cursor: 'pointer' }}>{time}</Link>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', minWidth: 0 }}>
        <Link href={`/${lang}/mundial-2026/${slugify(f.teams.home.name)}`} style={teamNameStyle}>{f.teams.home.name}</Link>
        <CrestImg src={f.teams.home.logo} alt={f.teams.home.name} size={18} />
      </div>
      <Link href={`/${lang}/mundial-2026/partido/${f.fixture.id}`} style={{ width: 44, textAlign: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums', textDecoration: 'none', cursor: 'pointer' }}>
        {score ? `${f.goals.home ?? 0}-${f.goals.away ?? 0}` : 'vs'}
      </Link>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <CrestImg src={f.teams.away.logo} alt={f.teams.away.name} size={18} />
        <Link href={`/${lang}/mundial-2026/${slugify(f.teams.away.name)}`} style={teamNameStyle}>{f.teams.away.name}</Link>
      </div>
      <Link href={`/${lang}/mundial-2026/partido/${f.fixture.id}`} className="wc-venue" style={{ width: 150, flexShrink: 0, textAlign: 'right', fontSize: 11, color: 'var(--ts-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none', cursor: 'pointer' }}>
        {f.fixture.venue?.name ?? ''}
      </Link>
    </div>
    {upcoming && <PredictionBar fixtureId={f.fixture.id} lang={lang} />}
    </>
  )
}

export default function CalendarPanel({ initial = [] }: { initial?: ApiFixture[] }) {
  const { lang } = useLang()
  const [fixtures, setFixtures] = useState<ApiFixture[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)
  const [error, setError] = useState(false)

  // Only client-fetch when the server didn't seed us (keeps the calendar in the
  // initial HTML for SEO when data exists; refreshes live otherwise). When
  // seeded, `loading` already starts false — no "Cargando" on first paint.
  useEffect(() => {
    if (initial.length > 0) return
    let cancelled = false
    fetch('/api/football/fixtures?league=1&season=2026&all=1')
      .then(r => r.json())
      .then(j => { if (cancelled) return; if (j.ok && Array.isArray(j.data)) setFixtures(j.data); else setError(true) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [initial.length])

  const locale = lang === 'en' ? 'en-US' : 'es-ES'
  // Group by calendar date (local), sorted chronologically.
  const byDay = (() => {
    const sorted = [...fixtures].sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
    const groups: { day: string; label: string; matches: ApiFixture[] }[] = []
    for (const f of sorted) {
      const d = new Date(f.fixture.date)
      const day = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
      let g = groups.find(x => x.day === day)
      if (!g) { g = { day, label, matches: [] }; groups.push(g) }
      g.matches.push(f)
    }
    return groups
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 12, color: 'var(--ts-muted)', lineHeight: 1.6 }}>
        {t(lang,
          'Calendario del Mundial 2026 con todos los partidos y horarios (hora local de tu dispositivo). Las eliminatorias se cuadran al cerrarse la fase de grupos.',
          'World Cup 2026 calendar with every match and kick-off time (your device’s local time). Knockout match-ups are set once the group stage ends.')}
      </p>

      {loading && <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando calendario…', 'Loading calendar…')}</div>}

      {!loading && byDay.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {byDay.map(g => (
            <div key={g.day} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
              <div style={{ padding: '9px 14px', borderBottom: '1px solid var(--ts-border)', background: 'var(--ts-card2)', fontSize: 12, fontWeight: 700, textTransform: 'capitalize', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
                {g.label}
              </div>
              {g.matches.map(f => <MatchRow key={f.fixture.id} f={f} lang={lang} />)}
            </div>
          ))}
        </div>
      )}

      {!loading && byDay.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--ts-muted)' }}>
          {error
            ? t(lang, 'No se pudo cargar el calendario ahora mismo.', 'Could not load the calendar right now.')
            : t(lang, 'El calendario de partidos se publicará pronto.', 'The match calendar will be published soon.')}
        </p>
      )}

      {/* Phase windows reference (knockouts not yet drawn) */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginTop: 6 }}>
        {t(lang, 'Fases del torneo', 'Tournament phases')}
      </div>
      <PhaseWindows lang={lang} />
      <p style={{ fontSize: 10, color: 'var(--ts-faint)' }}>
        {t(lang, '* Partidos y horarios oficiales FIFA / API-Football.', '* Official FIFA / API-Football fixtures and times.')}
      </p>
    </div>
  )
}
