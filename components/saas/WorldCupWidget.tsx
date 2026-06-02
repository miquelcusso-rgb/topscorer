'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// Opening match: 11 Jun 2026, 19:00 local (Estadio Azteca, CDMX = UTC-6).
const KICKOFF = new Date('2026-06-12T01:00:00Z').getTime()

function diff() {
  const ms = KICKOFF - Date.now()
  if (ms <= 0) return null
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return { d, h, m }
}

export default function WorldCupWidget({ lang }: { lang: 'es' | 'en' }) {
  const [tl, setTl] = useState<{ d: number; h: number; m: number } | null | undefined>(undefined)
  useEffect(() => {
    setTl(diff())
    const id = setInterval(() => setTl(diff()), 30_000)
    return () => clearInterval(id)
  }, [])

  if (tl === undefined) return <div style={{ width: 232, height: 56 }} aria-hidden />
  if (tl === null) return null

  const unit = (v: number, es: string, en: string) => (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: 30 }}>
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, lineHeight: 1, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {String(v).padStart(2, '0')}
      </span>
      <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)' }}>{lang === 'en' ? en : es}</span>
    </span>
  )

  return (
    <Link
      href={`/${lang}/mundial-2026`}
      title={lang === 'en' ? 'World Cup 2026 — Jun 11' : 'Mundial 2026 — 11 jun'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 12,
        background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)',
        textDecoration: 'none', color: 'inherit', flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 18 }} aria-hidden>🏆</span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
          {lang === 'en' ? 'World Cup 2026' : 'Mundial 2026'}
        </span>
        <span style={{ display: 'flex', gap: 8, marginTop: 3 }}>
          {unit(tl.d, 'd', 'd')}{unit(tl.h, 'h', 'h')}{unit(tl.m, 'm', 'm')}
        </span>
      </span>
    </Link>
  )
}
