import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import { COMPETITIONS, GOLDEN_BOOT_PUBLISHED, GOLDEN_BOOT_UPDATED } from '@/lib/golden-boot-data'

// Hub estático del cluster golden-boot: enlaza las 7 competiciones. Antes 404
// (el llms.txt y los breadcrumbs lo referencian) — descubrimiento del cluster
// sin depender solo del sitemap.
export const dynamicParams = false

export function generateStaticParams() {
  return ['es', 'en'].map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const title = 'Golden Boot winners by competition — MLS, Champions League, AFCON & more'
  const description =
    'Golden Boot and top scorer awards by competition: MLS, Champions League, AFCON, Liga MX, Saudi Pro League, Primeira Liga and Brasileirão. Winners year by year, all-time top scorers and records.'
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}/golden-boot`,
      languages: {
        es: 'https://www.top-scorers.com/es/golden-boot',
        en: 'https://www.top-scorers.com/en/golden-boot',
        'x-default': 'https://www.top-scorers.com/en/golden-boot',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://www.top-scorers.com/${lang}/golden-boot`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630 }],
    },
  }
}

const headingStyle = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
}

export default async function GoldenBootHubPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const base = 'https://www.top-scorers.com'
  const url = `${base}/${lang}/golden-boot`

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Golden Boot winners by competition',
    url,
    numberOfItems: COMPETITIONS.length,
    itemListElement: COMPETITIONS.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.award,
      url: `${base}/${lang}/golden-boot/${c.slug}`,
    })),
  }
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Golden Boot winners by competition',
    url,
    datePublished: GOLDEN_BOOT_PUBLISHED,
    dateModified: GOLDEN_BOOT_UPDATED,
    publisher: { '@type': 'Organization', name: 'Furiosa Studio', url: 'https://furiosadata.com' },
  }

  return (
    <SaasShell activeKey="leagues" breadcrumb={['Golden Boot']}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        <nav className="text-xs mb-6 flex gap-1.5 items-center" style={{ color: 'var(--ts-faint)' }}>
          <Link href="/" style={{ color: 'var(--ts-muted)', textDecoration: 'none' }}>TopScorers</Link>
          <span>›</span>
          <span style={{ color: 'var(--ts-muted)' }}>Golden Boot</span>
        </nav>

        <h1 style={{ ...headingStyle, fontSize: 38, color: 'var(--ts-text)', marginBottom: 8 }}>
          Golden Boot winners by competition
        </h1>
        <p style={{ color: 'var(--ts-muted)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Every major league and tournament crowns its top scorer. These pages track the Golden
          Boot and top scorer awards competition by competition — winners year by year, all-time
          leading scorers and the records that still stand. Updated as each season closes.
        </p>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-primary)', marginBottom: 16 }}>
            Which competitions are covered?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {COMPETITIONS.map((c) => (
              <Link
                key={c.slug}
                href={`/golden-boot/${c.slug}`}
                style={{ padding: '16px 20px', background: 'var(--ts-card2)', borderRadius: 10, border: '1px solid var(--ts-border)', textDecoration: 'none', display: 'block' }}
                className="hover:bg-white/5"
              >
                <div style={{ color: 'var(--ts-text)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{c.award}</div>
                <div style={{ color: 'var(--ts-muted)', fontSize: 13, lineHeight: 1.5 }}>{c.metaDescription}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section style={{ padding: '20px 24px', background: 'var(--ts-primary-soft)', borderRadius: 12, border: '1px solid var(--ts-border-hot)' }}>
          <h3 style={{ ...headingStyle, fontSize: 16, color: 'var(--ts-primary)', marginBottom: 12 }}>More scoring charts</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { href: '/maximos-goleadores-europa', label: 'Top scorers in Europe' },
              { href: '/goleadores-premier-league', label: 'Premier League Golden Boot' },
              { href: '/goleadores-liga-espanola', label: 'La Liga (Pichichi)' },
              { href: '/bota-de-oro', label: 'European Golden Shoe' },
              { href: '/', label: 'Live top 25' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ color: 'var(--ts-primary)', textDecoration: 'none', fontSize: 13, padding: '6px 14px', background: 'var(--ts-primary-soft)', borderRadius: 20, border: '1px solid var(--ts-border-hot)' }} className="hover:bg-yellow-400/20">
                {label}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </SaasShell>
  )
}
