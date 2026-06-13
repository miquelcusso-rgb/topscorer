// Tiny uppercase pill marking a news item whose SOURCE language differs from the
// SITE language (e.g. "EN" on the ES site, "ES" on the EN site). No translation —
// it just flags that the linked headline is in another language. Brand --ts-* tokens.
export default function LangBadge({ itemLang, siteLang }: { itemLang: 'es' | 'en'; siteLang: 'es' | 'en' }) {
  if (itemLang === siteLang) return null
  return (
    <span
      style={{
        flexShrink: 0,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.06em',
        lineHeight: 1,
        textTransform: 'uppercase',
        padding: '2px 4px',
        borderRadius: 3,
        color: 'var(--ts-teal)',
        background: 'color-mix(in srgb, var(--ts-teal) 14%, transparent)',
        border: '1px solid color-mix(in srgb, var(--ts-teal) 35%, transparent)',
      }}
      title={itemLang === 'en' ? 'English-language source' : 'Fuente en español'}
    >
      {itemLang}
    </span>
  )
}
