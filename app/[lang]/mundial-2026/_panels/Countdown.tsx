'use client'

import { useState, useEffect } from 'react'
import { type Lang, t, KICKOFF, END_DATE } from './shared'

// ─── Live countdown to the opening match (days · hours · minutes · seconds) ────

interface TimeLeft { d: number; h: number; m: number; s: number }
function diffNow(): TimeLeft | 'live' | 'done' {
  const now = Date.now()
  if (now >= END_DATE.getTime()) return 'done'
  if (now >= KICKOFF.getTime()) return 'live'
  let ms = KICKOFF.getTime() - now
  const d = Math.floor(ms / 86_400_000); ms -= d * 86_400_000
  const h = Math.floor(ms / 3_600_000); ms -= h * 3_600_000
  const m = Math.floor(ms / 60_000); ms -= m * 60_000
  const s = Math.floor(ms / 1000)
  return { d, h, m, s }
}

export default function Countdown({ lang }: { lang: Lang }) {
  // Mount-guarded so SSR (static build) and first client render match — we render
  // a neutral placeholder until the effect runs on the client.
  const [tl, setTl] = useState<TimeLeft | 'live' | 'done' | null>(null)
  useEffect(() => {
    setTl(diffNow())
    const id = setInterval(() => setTl(diffNow()), 1000)
    return () => clearInterval(id)
  }, [])

  if (tl === null) {
    return <div style={{ height: 96 }} aria-hidden />
  }

  if (tl === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <span style={{ fontSize: 14, color: 'var(--ts-primary)' }}>
          {t(lang, 'El Mundial 2026 ha concluido', 'World Cup 2026 has concluded')}
        </span>
      </div>
    )
  }

  if (tl === 'live') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '16px 0' }}>
        <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: 'var(--ts-teal)', boxShadow: '0 0 8px var(--ts-teal)' }} />
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-teal)', fontFamily: "'Barlow Condensed', sans-serif" }}>
          {t(lang, 'En curso', 'Live now')}
        </span>
      </div>
    )
  }

  const units: { v: number; es: string; en: string }[] = [
    { v: tl.d, es: 'días', en: 'days' },
    { v: tl.h, es: 'horas', en: 'hours' },
    { v: tl.m, es: 'min', en: 'min' },
    { v: tl.s, es: 'seg', en: 'sec' },
  ]

  return (
    <div style={{ padding: '14px 0 6px' }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-faint)', marginBottom: 10, textAlign: 'center' }}>
        {/* Kickoff shown in the user's LOCAL time (client-only branch), so a
            European viewer doesn't see "Jun 11" while the timer runs into Jun 12
            their time. The match itself is the opener at Estadio Azteca. */}
        {t(lang,
          `Comienza — ${KICKOFF.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} (tu hora) · Estadio Azteca`,
          `Kicks off — ${KICKOFF.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} (your time) · Estadio Azteca`)}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {units.map(u => (
          <div key={u.en} style={{
            minWidth: 66, padding: '10px 12px', borderRadius: 10, textAlign: 'center',
            background: 'var(--ts-card)', border: '1px solid var(--ts-border)',
          }}>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
              {String(u.v).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginTop: 5, color: 'var(--ts-muted)' }}>
              {t(lang, u.es, u.en)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
