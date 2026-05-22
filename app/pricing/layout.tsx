import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Precios — Pro y Scout | TopScorers',
  description: 'Planes y precios de TopScorers: empieza gratis o desbloquea Pro y Scout para acceder a estadísticas avanzadas, comparador de jugadores, radar de talentos y datos sin límites del fútbol europeo.',
  keywords: ['precios topscorers', 'plan pro fútbol', 'plan scout', 'suscripción estadísticas fútbol', 'comparador jugadores premium'],
  alternates: { canonical: 'https://www.top-scorers.com/pricing' },
  openGraph: {
    title: 'Precios — Pro y Scout | TopScorers',
    description: 'Empieza gratis o desbloquea Pro y Scout: estadísticas avanzadas, comparador y radar de talentos del fútbol europeo.',
    url: 'https://www.top-scorers.com/pricing',
    siteName: 'TopScorers',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: 'https://www.top-scorers.com/og-default.jpg', width: 1200, height: 630, alt: 'TopScorers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Precios — Pro y Scout | TopScorers',
    description: 'Empieza gratis o desbloquea Pro y Scout: estadísticas avanzadas y comparador del fútbol europeo.',
    images: ['https://www.top-scorers.com/og-default.jpg'],
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
