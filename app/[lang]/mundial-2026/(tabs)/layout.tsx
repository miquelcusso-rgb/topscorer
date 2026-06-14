import SaasShell from '@/components/saas/SaasShell'
import { isLocale } from '@/lib/i18n'
import WorldCupChrome from '../_panels/WorldCupChrome'

// Shared layout for every World Cup *tab* route (Overview + grupos, calendario,
// resultados, asistentes, disciplina, bajas, noticias, sedes, bota-de-oro). It
// wraps the SaaS shell + the hero/title/countdown/tab-nav once, and each route
// page below renders only its panel into {children}.
//
// NOTE: this layout lives in a `(tabs)` route group so it does NOT wrap the
// sibling `partido/[id]` and `[seleccion]` pages — those render their own
// SaasShell and must not be double-wrapped.

export default async function WorldCupTabsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const breadcrumb = lang === 'en' ? ['Competitions', 'World Cup 2026'] : ['Competiciones', 'Mundial 2026']

  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      <WorldCupChrome>{children}</WorldCupChrome>
    </SaasShell>
  )
}
