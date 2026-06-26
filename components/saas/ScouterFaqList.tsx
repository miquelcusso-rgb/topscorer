import type { ScouterFaq, Lang } from './scouter-abbrevs'

// Visible FAQ accordion for the Scouter pages ("What is IIG?"). Mirrors the
// FAQPage JSON-LD emitted by the server page (same `iigFaqs()` source), so the
// citable content lives in both the DOM and the structured data. Uses native
// <details> — no JS, keyboard-accessible. Brand `--ts-*` tokens only.

export default function ScouterFaqList({
  faqs,
  lang,
  title,
}: {
  faqs: ScouterFaq[]
  lang: Lang
  title?: string
}) {
  if (!faqs.length) return null
  return (
    <section
      aria-label={title ?? (lang === 'en' ? 'Frequently asked questions' : 'Preguntas frecuentes')}
      style={{ borderRadius: 12, padding: '18px 20px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}
    >
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 8,
          color: 'var(--ts-text)',
          fontFamily: "'Barlow Condensed', sans-serif",
        }}
      >
        {title ?? (lang === 'en' ? 'FAQ' : 'Preguntas frecuentes')}
      </h2>
      {faqs.map(({ q, a }) => (
        <details key={q} style={{ borderTop: '1px solid var(--ts-divider)', padding: '12px 0' }}>
          <summary
            style={{
              color: 'var(--ts-text)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              listStyle: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              minHeight: 44,
            }}
          >
            {q}
            <span style={{ color: 'var(--ts-primary)', fontSize: 18, fontWeight: 400, flexShrink: 0 }}>+</span>
          </summary>
          <p style={{ color: 'var(--ts-muted)', marginTop: 8, lineHeight: 1.7, fontSize: 13 }}>{a}</p>
        </details>
      ))}
    </section>
  )
}
