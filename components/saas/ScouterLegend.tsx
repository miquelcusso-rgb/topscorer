import { SCOUTER_ABBREVS, type Lang } from './scouter-abbrevs'

// Visible mini-legend (<dl>) for the Scouter table abbreviations. Renders the
// meaning as real HTML text (GEO-citable, not hidden in a tooltip). Server
// component — no JS needed. Brand `--ts-*` tokens only; mobile-safe.

export default function ScouterLegend({ lang }: { lang: Lang }) {
  return (
    <section
      aria-label={lang === 'en' ? 'Column key' : 'Leyenda de columnas'}
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 10,
        padding: '14px 16px',
      }}
    >
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: 'var(--ts-text)',
          margin: '0 0 10px',
        }}
      >
        {lang === 'en' ? 'What the columns mean' : 'Qué significa cada columna'}
      </h2>
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '6px 14px',
          margin: 0,
          fontSize: 13,
          lineHeight: 1.5,
          alignItems: 'baseline',
        }}
      >
        {SCOUTER_ABBREVS.map(({ abbr, term, def }) => (
          <div key={abbr} style={{ display: 'contents' }}>
            <dt
              style={{
                fontWeight: 700,
                color: abbr === 'IIG' ? 'var(--ts-primary)' : 'var(--ts-text)',
                fontFamily: "'Barlow Condensed', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {abbr}
            </dt>
            <dd style={{ margin: 0, color: 'var(--ts-muted)' }}>
              <strong style={{ color: 'var(--ts-text)', fontWeight: 600 }}>{term[lang]}</strong>
              {' — '}
              {def[lang]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
