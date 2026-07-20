import type { Metadata } from 'next'
import { isLocale, type Lang } from '@/lib/i18n'
import TransferenciasClient from './TransferenciasClient'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const path = '/transferencias'
  return {
    title: en ? 'Transfers' : 'Transferencias',
    description: en
      ? 'Latest transfers in European football. Signings, loans and moves from the top clubs.'
      : 'Últimas transferencias del fútbol europeo. Fichajes, cesiones y movimientos de los principales clubes.',
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
  }
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Transferencias', item: 'https://www.top-scorers.com/transferencias' },
  ],
}

export default async function TransferenciasPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const breadcrumb = lang === 'en' ? ['Transfers'] : ['Transferencias']
  return (
    <SaasShell activeKey="transfers" breadcrumb={breadcrumb}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <TransferenciasClient />
    </SaasShell>
  )
}
