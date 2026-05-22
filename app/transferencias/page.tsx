import type { Metadata } from 'next'
import TransferenciasClient from './TransferenciasClient'

export const metadata: Metadata = {
  title: 'Transferencias — TopScorers',
  description: 'Últimas transferencias del fútbol europeo. Fichajes, cesiones y movimientos de los principales clubes.',
}

export default function TransferenciasPage() {
  return <TransferenciasClient />
}
