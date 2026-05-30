import { redirect } from 'next/navigation'
import { isLocale } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

// Legacy/typo URL — redirect `/compare` → `/comparador` so external links and
// the English mental model both resolve. (audit pass 1)
export default async function CompareRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const sp = await searchParams
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') qs.set(k, v)
    else if (Array.isArray(v)) v.forEach(val => qs.append(k, val))
  }
  const q = qs.toString()
  redirect(`/${lang}/estadisticas/comparador${q ? `?${q}` : ''}`)
}
