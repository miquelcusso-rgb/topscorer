import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Iframe-friendly bare layout: no nav, no footer, no Clerk provider.
// Self-contained styles via inline CSS so the widget renders even when the
// host page strips external stylesheets.

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: 'transparent',
          fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
          color: '#1c1608',
          fontSize: 14,
        }}
      >
        {children}
      </body>
    </html>
  )
}
