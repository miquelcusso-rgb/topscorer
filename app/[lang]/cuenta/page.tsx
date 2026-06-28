import type { Metadata } from 'next'
import { currentUser } from '@clerk/nextjs/server'
import { isLocale, type Lang } from '@/lib/i18n'
import { getUserPlan } from '@/lib/plans'
import CuentaClient from './CuentaClient'
import SaasShell from '@/components/saas/SaasShell'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const es = lang === 'es'
  const title = es ? 'Mi cuenta' : 'My account'
  return {
    title,
    description: es ? 'Tu progreso, badge, watchlist, comparaciones guardadas, predicciones y plan.' : 'Your progress, badge, watchlist, saved comparisons, picks and plan.',
    robots: { index: false, follow: false }, // private page
    alternates: { canonical: `${BASE}/${lang}/cuenta` },
  }
}

export default async function CuentaPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const user = await currentUser()
  const plan = getUserPlan(user?.publicMetadata as Record<string, unknown> | undefined)
  const breadcrumb = lang === 'en' ? ['Account'] : ['Cuenta']
  return (
    <SaasShell activeKey="stats" breadcrumb={breadcrumb} plan={plan}>
      <CuentaClient />
    </SaasShell>
  )
}
