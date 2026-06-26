import type { Metadata } from 'next'

// Authenticated product route (API-key dashboard). Must never be indexed.
// The page itself is a client component and can't export metadata, so the
// noindex lives here in the segment layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ApiKeysLayout({ children }: { children: React.ReactNode }) {
  return children
}
