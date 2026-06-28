import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'
import { createServerClient } from '@/lib/supabase'
import SaasShell from '@/components/saas/SaasShell'
import EncuestaDetailClient from './EncuestaDetailClient'

const BASE = 'https://www.top-scorers.com'

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang: raw, id } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const sb = createServerClient()
  const { data: p } = await sb.from('polls').select('question_es, question_en').eq('id', id).maybeSingle()
  if (!p) return { title: 'Encuesta' }
  const es = lang === 'es'
  const title = `${es ? p.question_es : p.question_en}`
  return {
    title,
    description: es ? 'Vota y comparte tu opinión con la comunidad TopScorers.' : 'Vote and share your take with the TopScorers community.',
    alternates: {
      canonical: `${BASE}/${lang}/encuestas/${id}`,
      languages: {
        es: `${BASE}/es/encuestas/${id}`,
        en: `${BASE}/en/encuestas/${id}`,
        'x-default': `${BASE}/es/encuestas/${id}`,
      },
    },
    openGraph: {
      title: `${title} | TopScorers`, description: es ? p.question_es : p.question_en,
      url: `${BASE}/${lang}/encuestas/${id}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'article',
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | TopScorers` },
  }
}

export default async function EncuestaPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: raw, id } = await params
  const en = (isLocale(raw) ? raw : 'es') === 'en'
  const breadcrumb = en ? ['Community', 'Polls'] : ['Comunidad', 'Encuestas']
  return (
    <SaasShell activeKey="stats" breadcrumb={breadcrumb}>
      <EncuestaDetailClient id={id} />
    </SaasShell>
  )
}
