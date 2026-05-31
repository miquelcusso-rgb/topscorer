import { redirect } from 'next/navigation'
import { isLocale } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

// The SaaS player profile is now canonical at /[lang]/jugadores/[slug].
// Keep this old /v2 URL working by redirecting.
export default async function V2PlayerRedirect({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: raw, slug } = await params
  const lang = isLocale(raw) ? raw : 'es'
  redirect(`/${lang}/jugadores/${slug}`)
}
