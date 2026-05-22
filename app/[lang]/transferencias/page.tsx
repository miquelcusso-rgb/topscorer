import type { Metadata } from 'next'
import TransferenciasClient from './TransferenciasClient'

export const metadata: Metadata = {
  title: 'Transferencias — TopScorers',
  description: 'Últimas transferencias del fútbol europeo. Fichajes, cesiones y movimientos de los principales clubes.',
  alternates: { canonical: 'https://www.top-scorers.com/transferencias' },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Transferencias', item: 'https://www.top-scorers.com/transferencias' },
  ],
}

export default function TransferenciasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <TransferenciasClient />
    </>
  )
}
