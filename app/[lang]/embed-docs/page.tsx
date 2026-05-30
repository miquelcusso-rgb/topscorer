import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Embed widgets · TopScorers',
  description:
    'Embed live top-scorer leaderboards on your blog or site. Free, no API key needed for the widget.',
  alternates: {
    canonical: '/es/embed-docs',
    languages: { es: '/es/embed-docs', en: '/en/embed-docs' },
  },
}

const EXAMPLES: Array<{ slug: string; label: string }> = [
  { slug: 'premier-league',  label: 'Premier League' },
  { slug: 'la-liga',          label: 'La Liga' },
  { slug: 'serie-a',          label: 'Serie A' },
  { slug: 'bundesliga',       label: 'Bundesliga' },
  { slug: 'ligue-1',          label: 'Ligue 1' },
]

const SNIPPET = (slug: string, theme: 'light' | 'dark') => `<iframe
  src="https://www.top-scorers.com/embed/top10/${slug}?theme=${theme}"
  width="100%" height="520"
  frameborder="0" loading="lazy"
  style="border-radius:12px;max-width:560px;"
  title="Top 10 ${slug.replace(/-/g, ' ')} — TopScorers"
></iframe>`

export default function EmbedDocs() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', color: '#eef4ff' }}>
      <div
        style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#f0c040',
        }}
      >
        TopScorers · Embeds
      </div>
      <h1
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.01em',
          margin: '12px 0 8px',
        }}
      >
        Embed Top 10 widgets
      </h1>
      <p style={{ fontSize: 16, color: '#9aa3b8', lineHeight: 1.55, marginBottom: 28 }}>
        Drop a live Top-10 scorers leaderboard onto your blog or site. Updates
        every 5 minutes during match days. Free, no API key required.
      </p>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Quick start</h2>
        <p style={{ color: '#9aa3b8', fontSize: 14, lineHeight: 1.55 }}>
          Copy the iframe snippet below and paste it into your post&apos;s HTML
          source. Replace <code style={{ background: 'rgba(255,255,255,.08)', padding: '1px 6px', borderRadius: 4 }}>premier-league</code> with any supported league slug.
        </p>
        <pre
          style={{
            background: '#0c0d18',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 10,
            padding: 16,
            overflow: 'auto',
            fontSize: 12,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color: '#e6e9f5',
            marginTop: 12,
          }}
        >{SNIPPET('premier-league', 'light')}</pre>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Available leagues</h2>
        <p style={{ color: '#9aa3b8', fontSize: 14, marginBottom: 8 }}>
          30+ competitions supported. Most common slugs:
        </p>
        <ul style={{ columns: 2, color: '#cbd5e1', fontSize: 14, lineHeight: 1.8, paddingLeft: 18 }}>
          {EXAMPLES.map(e => (
            <li key={e.slug}>
              <code style={{ background: 'rgba(255,255,255,.08)', padding: '1px 6px', borderRadius: 4 }}>{e.slug}</code>
              {' — '}{e.label}
            </li>
          ))}
        </ul>
        <p style={{ color: '#9aa3b8', fontSize: 13, marginTop: 8 }}>
          Want a different league? <a href="mailto:hola@top-scorers.com" style={{ color: '#f0c040' }}>Email us</a>.
        </p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Themes</h2>
        <p style={{ color: '#9aa3b8', fontSize: 14, marginBottom: 12 }}>
          Append <code style={{ background: 'rgba(255,255,255,.08)', padding: '1px 6px', borderRadius: 4 }}>?theme=light</code> (default) or <code style={{ background: 'rgba(255,255,255,.08)', padding: '1px 6px', borderRadius: 4 }}>?theme=dark</code>.
        </p>
        <pre
          style={{
            background: '#0c0d18',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 10,
            padding: 16,
            overflow: 'auto',
            fontSize: 12,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace',",
            color: '#e6e9f5',
          }}
        >{SNIPPET('la-liga', 'dark')}</pre>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Live preview</h2>
        <iframe
          src="/embed/top10/premier-league?theme=light"
          width="100%"
          height="520"
          frameBorder={0}
          loading="lazy"
          style={{ borderRadius: 12, maxWidth: 560, background: '#fff' }}
          title="Top 10 Premier League"
        />
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>License</h2>
        <p style={{ color: '#9aa3b8', fontSize: 14, lineHeight: 1.55 }}>
          Free for personal blogs and editorial use. Attribution to <strong>top-scorers.com</strong> is
          required (we keep it inside the widget — please don&apos;t hide it).
          Commercial / high-volume embeds? <a href="mailto:hola@top-scorers.com" style={{ color: '#f0c040' }}>Get in touch</a>.
        </p>
      </section>

      <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 12, color: '#475569' }}>
        by Furiosa Studio
      </footer>
    </main>
  )
}
