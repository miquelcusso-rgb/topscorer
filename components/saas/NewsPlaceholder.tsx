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
      {/* Brand SVG football glyph (never an emoji — AGENTS.md). Inherits the
          gold via currentColor; theme-aware through --ts-primary. */}
      <svg
        viewBox="0 0 24 24"
        width={compact ? 20 : 30}
        height={compact ? 20 : 30}
        fill="none"
        stroke="var(--ts-primary)"
        strokeWidth={1.6}
        strokeLinejoin="round"
        style={{ opacity: 0.85, flexShrink: 0 }}
        role="img"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9.2" />
        <path d="M12 6.6l3.6 2.6-1.4 4.3H9.8L8.4 9.2 12 6.6z" />
        <path d="M12 6.6V3.2M15.6 9.2l3.1-1.2M14.2 13.5l2.2 2.7M9.8 13.5l-2.2 2.7M8.4 9.2L5.3 8" />
      </svg>
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
