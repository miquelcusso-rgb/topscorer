'use client'

import { type Lang, t } from './shared'
import type { WcFaq } from '../wc-faqs'

// ─── Shared World Cup FAQ accordion ──────────────────────────────────────────
// Visible answers that mirror the FAQPage JSON-LD emitted by the server page
// (same `wc-faqs.ts` source), so the citable content is both in the DOM and in
// structured data. Reused by the Golden Boot + Assists panels. Brand `--ts-*`
// tokens only; <details> needs no JS and is keyboard-accessible.

export default function WcFaqList({ faqs, lang, title }: { faqs: WcFaq[]; lang: Lang; title?: string }) {
  if (!faqs.length) return null
  return (
    <div style={{ borderRadius: 12, padding: '18px 20px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, color: 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif" }}>
        {title ?? t(lang, 'Preguntas frecuentes', 'FAQ')}
      </h2>
      {faqs.map(({ q, a }) => (
        <details key={q} style={{ borderTop: '1px solid var(--ts-divider)', padding: '12px 0' }}>
          <summary style={{ color: 'var(--ts-text)', fontWeight: 600, cursor: 'pointer', fontSize: 14, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 44 }}>
            {q}
            <span style={{ color: 'var(--ts-primary)', fontSize: 18, fontWeight: 400, flexShrink: 0 }}>+</span>
          </summary>
          <p style={{ color: 'var(--ts-muted)', marginTop: 8, lineHeight: 1.7, fontSize: 13 }}>{a}</p>
        </details>
      ))}
    </div>
  )
}
