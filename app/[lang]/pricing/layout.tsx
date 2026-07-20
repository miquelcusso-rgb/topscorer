import type { Metadata } from 'next'
import { isLocale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const path = '/pricing'
  return {
    title: en ? 'Pricing — Pro & Scout' : 'Precios — Pro y Scout',
    description: en
      ? 'TopScorers plans and pricing: start free or unlock Pro and Scout for advanced stats, the player comparator, the talent radar and unlimited European football data.'
      : 'Planes y precios de TopScorers: empieza gratis o desbloquea Pro y Scout para acceder a estadísticas avanzadas, comparador de jugadores, radar de talentos y datos sin límites del fútbol europeo.',
    keywords: en
      ? ['topscorers pricing', 'pro football plan', 'scout plan', 'football stats subscription', 'premium player comparator']
      : ['precios topscorers', 'plan pro fútbol', 'plan scout', 'suscripción estadísticas fútbol', 'comparador jugadores premium'],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: en ? 'Pricing — Pro & Scout | TopScorers' : 'Precios — Pro y Scout | TopScorers',
      description: en
        ? 'Start free or unlock Pro and Scout: advanced stats, comparator and talent radar for European football.'
        : 'Empieza gratis o desbloquea Pro y Scout: estadísticas avanzadas, comparador y radar de talentos del fútbol europeo.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630, alt: 'TopScorers' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: en ? 'Pricing — Pro & Scout | TopScorers' : 'Precios — Pro y Scout | TopScorers',
      description: en
        ? 'Start free or unlock Pro and Scout: advanced stats and the European football comparator.'
        : 'Empieza gratis o desbloquea Pro y Scout: estadísticas avanzadas y comparador del fútbol europeo.',
      images: [`https://www.top-scorers.com/og-default-${lang}.jpg`],
    },
  }
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
