import Link from 'next/link'

// Shared internal-linking block (palette-styled, server component).
// Distributes link authority across league scorer pages, bota-de-oro,
// records and competiciones. Works light + dark via --ts-* vars.

export interface RelatedLink {
  href: string
  label: string
}

// Canonical set of cross-link targets. Pass `exclude` to drop the current page.
export const RELATED_LINKS: RelatedLink[] = [
  { href: '/maximos-goleadores-europa', label: 'Máximos goleadores de Europa' },
  { href: '/goleadores-liga-espanola', label: 'Goleadores La Liga (Pichichi)' },
  { href: '/goleadores-premier-league', label: 'Goleadores Premier League' },
  { href: '/goleadores-serie-a', label: 'Goleadores Serie A' },
  { href: '/goleadores-bundesliga', label: 'Goleadores Bundesliga' },
  { href: '/goleadores-ligue-1', label: 'Goleadores Ligue 1' },
  { href: '/bota-de-oro', label: 'Bota de Oro' },
  { href: '/records', label: 'Records y líderes' },
  { href: '/competiciones', label: 'Todas las ligas' },
]

const headingStyle = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
}

export default function RelatedLinks({
  title,
  exclude = [],
  links = RELATED_LINKS,
}: {
  title?: string
  /** hrefs to drop (e.g. the current page) */
  exclude?: string[]
  links?: RelatedLink[]
}) {
  const items = links.filter(l => !exclude.includes(l.href))
  return (
    <section
      style={{
        padding: '20px 24px',
        background: 'var(--ts-primary-soft)',
        borderRadius: 12,
        border: '1px solid var(--ts-border-hot)',
      }}
    >
      <h3 style={{ ...headingStyle, fontSize: 16, color: 'var(--ts-primary)', marginBottom: 12 }}>
        {title ?? 'Rankings relacionados'}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {items.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              color: 'var(--ts-primary)',
              textDecoration: 'none',
              fontSize: 13,
              padding: '6px 14px',
              background: 'var(--ts-primary-soft)',
              borderRadius: 20,
              border: '1px solid var(--ts-border-hot)',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  )
}
