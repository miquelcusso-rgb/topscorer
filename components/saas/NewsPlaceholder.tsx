// Branded, ToS-safe placeholder for news items with no RSS image. NOT a
// copyrighted photo — our own graphic: a subtle gold→turquoise gradient on the
// card surface with a football glyph and the source name centered. Used wherever
// a news thumbnail/hero would render (carousel, desktop strip, news feed cards
// and hero). Adapts to both themes via --ts-* tokens.
export default function NewsPlaceholder({
  source,
  rounded = 0,
  compact = false,
}: {
  source?: string
  rounded?: number
  compact?: boolean
}) {
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 2 : 6,
        textAlign: 'center',
        padding: compact ? '4px' : '10px',
        borderRadius: rounded,
        background:
          'linear-gradient(135deg, var(--ts-primary-soft, rgba(214,158,46,0.16)) 0%, var(--ts-card2) 55%, color-mix(in srgb, var(--ts-teal) 14%, var(--ts-card2)) 100%)',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontSize: compact ? 20 : 30,
          lineHeight: 1,
          filter: 'grayscale(0.1)',
          opacity: 0.85,
        }}
      >
        ⚽
      </span>
      {source && (
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: compact ? 9 : 11,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ts-primary)',
            maxWidth: '90%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {source}
        </span>
      )}
    </div>
  )
}
