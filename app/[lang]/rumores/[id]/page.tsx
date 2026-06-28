import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import { createServerClient } from '@/lib/supabase'
import SaasShell from '@/components/saas/SaasShell'
import RumorDetailClient from './RumorDetailClient'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang: raw, id } = await params
  const lang = isLocale(raw) ? raw : 'es'

  const sb = createServerClient()
  const { data: r } = await sb.from('rumors').select('*').eq('id', id).eq('is_active', true).maybeSingle()
  if (!r) return { title: 'Rumor' }

  const es = lang === 'es'
  const headline = (es ? r.headline_es : r.headline_en) ?? `${r.player_name}: ${r.from_club} → ${r.to_club}`
  const summary  = (es ? r.summary_es : r.summary_en) ?? ''
  return {
    title: `${headline}`,
    description: summary,
    alternates: {
      canonical: `${BASE}/${lang}/rumores/${id}`,
      languages: {
        es: `${BASE}/es/rumores/${id}`,
        en: `${BASE}/en/rumores/${id}`,
        'x-default': `${BASE}/es/rumores/${id}`,
      },
    },
    openGraph: {
      title: headline,
      description: summary,
      url: `${BASE}/${lang}/rumores/${id}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'article',
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: r.player_name }],
    },
    twitter: { card: 'summary_large_image', title: headline, description: summary },
  }
}

export default async function RumorPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: raw, id } = await params
  const en = (isLocale(raw) ? raw : 'es') === 'en'
  const breadcrumb = en ? ['Transfers', 'Rumours'] : ['Transferencias', 'Rumores']
  return (
    <SaasShell activeKey="news" breadcrumb={breadcrumb}>
      <RumorDetailClient id={id} />
    </SaasShell>
  )
}
