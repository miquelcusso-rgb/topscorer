import type { Metadata } from 'next'

// Authenticated onboarding flow (favourite-team picker). Product route, not
// public content — keep it out of the index. The page is a client component
// and can't export metadata, so the noindex lives here in the segment layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children
}
