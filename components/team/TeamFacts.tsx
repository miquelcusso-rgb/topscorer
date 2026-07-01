'use client'
import { useEffect, useState } from 'react'
import type { Lang } from '@/lib/i18n'

// Lazy club facts + history for a team page. Fetches /api/team-info after paint
// (so the many team pages don't each make an external call at build) and renders
// founded / stadium / capacity / country + a short Wikipedia history. Fully
// defensive — anything missing simply doesn't render. Brand --ts-* tokens only.

interface Facts {
  founded: number | null
  country: string | null
  venue: string | null
  city: string | null
  capacity: number | null
}
interface History { extract: string; url: string; title: string }

const card: React.CSSProperties = {
  background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 18,
}
const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--ts-primary)', marginBottom: 12,
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>{label}</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--ts-text)', lineHeight: 1.1 }}>{value}</div>
    </div>
  )
}

export default function TeamFacts({ slug, lang }: { slug: string; lang: Lang }) {
  const en = lang === 'en'
  const [facts, setFacts] = useState<Facts | null>(null)
  const [history, setHistory] = useState<History | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    fetch(`/api/team-info?slug=${encodeURIComponent(slug)}&lang=${lang}`)
      .then(r => r.json())
      .then(j => {
        if (cancel || !j?.ok) return
        setFacts(j.facts ?? null)
        setHistory(j.history ?? null)
      })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [slug, lang])

  const hasFacts = facts && (facts.founded || facts.venue || facts.capacity || facts.country)

  if (loading) {
    return (
      <section style={card} aria-busy="true">
        <div style={eyebrow}>{en ? 'Club info' : 'Datos del club'}</div>
        <div style={{ fontSize: 13, color: 'var(--ts-faint)' }}>{en ? 'Loading…' : 'Cargando…'}</div>
      </section>
    )
  }
  if (!hasFacts && !history) return null

  return (
    <>
      {hasFacts && (
        <section style={card}>
          <div style={eyebrow}>{en ? 'Club info' : 'Datos del club'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 14 }}>
            {facts!.founded ? <Fact label={en ? 'Founded' : 'Fundado'} value={String(facts!.founded)} /> : null}
            {facts!.venue ? <Fact label={en ? 'Stadium' : 'Estadio'} value={facts!.venue} /> : null}
            {facts!.capacity ? <Fact label={en ? 'Capacity' : 'Aforo'} value={facts!.capacity.toLocaleString(en ? 'en' : 'es')} /> : null}
            {facts!.city ? <Fact label={en ? 'City' : 'Ciudad'} value={facts!.city} /> : null}
            {facts!.country ? <Fact label={en ? 'Country' : 'País'} value={facts!.country} /> : null}
          </div>
        </section>
      )}

      {history && (
        <section style={card}>
          <div style={eyebrow}>{en ? 'History' : 'Historia'}</div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--ts-text)' }}>{history.extract}</p>
          <a href={history.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 10, fontSize: 12.5, fontWeight: 600, color: 'var(--ts-teal)', textDecoration: 'none' }}>
            {en ? 'Read more on Wikipedia →' : 'Leer más en Wikipedia →'}
          </a>
        </section>
      )}
    </>
  )
}
