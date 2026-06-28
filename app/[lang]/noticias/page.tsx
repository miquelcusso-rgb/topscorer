import type { Metadata } from 'next'
import { isLocale, type Lang } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import NewsFeed from '@/components/saas/NewsFeed'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const path = '/noticias'
  const title = en ? 'Football news' : 'Noticias de fútbol'
  const description = en
    ? 'Latest football headlines from top sources, with big international clubs first.'
    : 'Últimas noticias de fútbol de los mejores medios, priorizando los grandes clubes internacionales.'
  return {
    title, description,
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: { title, description, url: `https://www.top-scorers.com/${lang}${path}`, siteName: 'TopScorers', locale: en ? 'en_US' : 'es_ES', type: 'website' },
  }
}

export default async function NoticiasPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  return (
    <SaasShell activeKey="news" breadcrumb={en ? ['News'] : ['Noticias']}>
      <div className="saas-page-header" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.012em', color: 'var(--ts-text)' }}>
          {en ? 'Football news' : 'Noticias de fútbol'}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ts-muted)' }}>
          {en ? 'Top headlines · big international clubs first' : 'Titulares destacados · grandes clubes internacionales primero'}
        </p>
      </div>
      <NewsFeed scope="general" lang={lang} />
    </SaasShell>
  )
}
