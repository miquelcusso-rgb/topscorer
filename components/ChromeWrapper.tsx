'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

// Hides the legacy Navbar/Footer on routes that ship the new SaaS shell
// (sidebar + topbar built into the page).
//
// Routes that already have their own chrome:
//   /[lang]            → SaaS landing
//   /[lang]/v2/**      → SaaS preview / showcase
//
// Everything else keeps the legacy Navbar+Footer.

const PATTERNS = [
  // Home (exact /es or /en, optionally with trailing slash)
  /^\/(es|en)\/?$/,
  // v2 namespace
  /^\/(es|en)\/v2(\/.*)?$/,
]

export default function ChromeWrapper({
  navbar,
  footer,
  children,
}: {
  navbar: ReactNode
  footer: ReactNode
  children: ReactNode
}) {
  const path = usePathname() ?? ''
  const chromeless = PATTERNS.some(re => re.test(path))
  return (
    <>
      {chromeless ? null : navbar}
      {children}
      {chromeless ? null : footer}
    </>
  )
}
