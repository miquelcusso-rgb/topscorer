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
  // Audit pass 2: pages wrapped in <SaasShell>
  /^\/(es|en)\/pricing\/?$/,
  /^\/(es|en)\/cuenta(\/.*)?$/,
  /^\/(es|en)\/resultados(\/.*)?$/,
  /^\/(es|en)\/jugadores(\/.*)?$/,
  /^\/(es|en)\/transferencias(\/.*)?$/,
  /^\/(es|en)\/competiciones(\/.*)?$/,
  /^\/(es|en)\/estadisticas\/comparador(\/.*)?$/,
  /^\/(es|en)\/about\/?$/,
  /^\/(es|en)\/legal\/?$/,
  /^\/(es|en)\/privacidad\/?$/,
  // Audit pass 3: SaaS-wrapped content pages
  /^\/(es|en)\/rumores(\/.*)?$/,
  /^\/(es|en)\/encuestas(\/.*)?$/,
  /^\/(es|en)\/predicciones(\/.*)?$/,
  /^\/(es|en)\/mundial-2026(\/.*)?$/,
  /^\/(es|en)\/clasificacion(\/.*)?$/,
  /^\/(es|en)\/descubrir(\/.*)?$/,
  /^\/(es|en)\/wiki(\/.*)?$/,
  /^\/(es|en)\/bota-de-oro(\/.*)?$/,
  /^\/(es|en)\/records(\/.*)?$/,
  /^\/(es|en)\/centrocampistas(\/.*)?$/,
  /^\/(es|en)\/maximos-goleadores-europa(\/.*)?$/,
  /^\/(es|en)\/goleadores-[a-z0-9-]+(\/.*)?$/,
  // Audit pass 4: SaaS-wrapped content pages
  /^\/(es|en)\/fantasy(\/.*)?$/,
  /^\/(es|en)\/embed-docs(\/.*)?$/,
  /^\/(es|en)\/brackets(\/.*)?$/,
  // Full-bleed embedded docs viewer (Stoplight Elements ships its own
  // chrome/sidebar) — render bare, no legacy navbar/footer.
  /^\/(es|en)\/api-docs(\/.*)?$/,
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
