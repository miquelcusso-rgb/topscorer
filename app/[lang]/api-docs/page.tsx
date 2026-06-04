import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'API Docs · TopScorers',
  description:
    'Programmatic access to top scorers, players and league standings across 30+ competitions. OpenAPI 3.1 spec, Scout plan required.',
  alternates: {
    canonical: '/es/api-docs',
    languages: {
      es: '/es/api-docs',
      en: '/en/api-docs',
    },
  },
}

// Public API documentation. Renders the OpenAPI 3.1 spec at /api/v1/openapi.json
// using Stoplight Elements via CDN — zero install, fully interactive (try-it
// requires the user to paste their Scout API key, no secrets shipped).
export default function ApiDocsPage() {
  return (
    <>
      <Script
        src="https://unpkg.com/@stoplight/elements/web-components.min.js"
        strategy="afterInteractive"
      />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/@stoplight/elements/styles.min.css"
      />
      <main
        style={{
          background: '#fff',
          color: '#0a0908',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '32px 24px 16px',
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#a8761a',
            }}
          >
            TopScorers · Public API
          </div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1,
              margin: '12px 0 8px',
              letterSpacing: '-0.01em',
            }}
          >
            API Reference
          </h1>
          <p style={{ fontSize: 16, color: '#475569', maxWidth: 720, lineHeight: 1.55 }}>
            Programmatic access to TopScorers data — top scorers, players, and
            league standings across 30+ competitions. Requires a Scout plan and
            a personal API key (create one at <a href="/es/cuenta/api" style={{ color: '#0a6e5f', fontWeight: 600 }}>/cuenta/api</a>).
            Quota: 50 000 requests/month.
          </p>
        </div>

        {/* @ts-expect-error — web component from Stoplight Elements */}
        <elements-api
          apiDescriptionUrl="/api/v1/openapi.json"
          router="hash"
          layout="sidebar"
          tryItCredentialsPolicy="omit"
          style={{ display: 'block', minHeight: 'calc(100vh - 220px)' }}
        />

        <footer
          style={{
            textAlign: 'center',
            padding: '24px',
            fontSize: 12,
            color: '#94a3b8',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          by Furiosa Studio · Spec: <a href="/api/v1/openapi.json" style={{ color: '#0a6e5f' }}>openapi.json</a>
        </footer>
      </main>
    </>
  )
}
