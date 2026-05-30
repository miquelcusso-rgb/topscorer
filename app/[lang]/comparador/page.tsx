import { redirect } from 'next/navigation'
import { isLocale } from '@/lib/i18n'

// Sidebar links to `/[lang]/comparador` but the actual page lives at
// `/[lang]/estadisticas/comparador`. Keep the user-facing short URL working
// by redirecting here. Forwards search params so `?p1=slug` survives.
// (audit pass 1)
export default async function ComparadorRedirect({
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
