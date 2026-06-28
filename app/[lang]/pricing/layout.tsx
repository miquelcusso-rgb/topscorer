import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/pricing'
  return {
    title: 'Precios — Pro y Scout',
    description: 'Planes y precios de TopScorers: empieza gratis o desbloquea Pro y Scout para acceder a estadísticas avanzadas, comparador de jugadores, radar de talentos y datos sin límites del fútbol europeo.',
    keywords: ['precios topscorers', 'plan pro fútbol', 'plan scout', 'suscripción estadísticas fútbol', 'comparador jugadores premium'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: 'Precios — Pro y Scout | TopScorers',
      description: 'Empieza gratis o desbloquea Pro y Scout: estadísticas avanzadas, comparador y radar de talentos del fútbol europeo.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Precios — Pro y Scout | TopScorers',
      description: 'Empieza gratis o desbloquea Pro y Scout: estadísticas avanzadas y comparador del fútbol europeo.',
      images: [`https://www.top-scorers.com/og-default-${lang}.jpg`],
    },
  }
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
