import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import { COMPETITIONS, getComp, GOLDEN_BOOT_PUBLISHED, GOLDEN_BOOT_UPDATED } from '@/lib/golden-boot-data'

// Static programmatic cluster: every competition is prerendered at build time
// (no per-request data fetch) → free-tier-safe. Unknown slugs 404.
export const dynamicParams = false

export function generateStaticParams() {
  const langs = ['es', 'en']
  return langs.flatMap((lang) => COMPETITIONS.map((c) => ({ lang, comp: c.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; comp: string }>
}): Promise<Metadata> {
  const { lang: raw, comp } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const data = getComp(comp)
  if (!data) return {}
  const path = `/golden-boot/${data.slug}`
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/en${path}`,
      },
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `https://www.top-scorers.com/${lang}${path}`,
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

export default async function GoldenBootCompPage({
  params,
}: {
  params: Promise<{ lang: string; comp: string }>
}) {
  const { comp } = await params
  const data = getComp(comp)
  if (!data) notFound()

  const base = 'https://www.top-scorers.com'
  const url = `${base}/golden-boot/${data.slug}`

  const listRows: string[] = data.allTime
    ? data.allTime.map((p) => `${p.player} — ${p.goals} goals (${p.detail})`)
    : (data.recentWinners ?? []).map((w) => `${w.season}: ${w.winner} — ${w.goals} goals (${w.club})`)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${data.award}`,
    description: data.metaDescription,
    url,
    numberOfItems: listRows.length,
    itemListElement: listRows.map((name, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
    })),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TopScorers', item: base },
      { '@type': 'ListItem', position: 2, name: 'Golden Boot', item: `${base}/golden-boot/${data.slug}` },
      { '@type': 'ListItem', position: 3, name: data.competition, item: url },
    ],
  }
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
  // Señal de freshness para AI-search (GEO): fechas reales de revisión del dataset
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.metaTitle,
    description: data.metaDescription,
    url,
    datePublished: GOLDEN_BOOT_PUBLISHED,
    dateModified: GOLDEN_BOOT_UPDATED,
    publisher: { '@type': 'Organization', name: 'Furiosa Studio', url: 'https://furiosadata.com' },
  }

  return (
    <SaasShell activeKey="leagues" breadcrumb={['Golden Boot', data.competition]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        <nav className="text-xs mb-6 flex gap-1.5 items-center" style={{ color: 'var(--ts-faint)' }}>
          <Link href="/" style={{ color: 'var(--ts-muted)', textDecoration: 'none' }}>TopScorers</Link>
          <span>›</span>
          <span style={{ color: 'var(--ts-muted)' }}>{data.award}</span>
        </nav>

        <h1 style={{ ...headingStyle, fontSize: 38, color: 'var(--ts-text)', marginBottom: 8 }}>{data.h1}</h1>
        <p style={{ color: 'var(--ts-muted)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>{data.intro}</p>

        {/* All-time top scorers (evergreen — cup competitions) */}
        {data.allTime && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-primary)', marginBottom: 16 }}>
              Who are the all-time top scorers?
            </h2>
            <div className="ts-hscroll" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                    {['#', 'Player', '', 'Goals'].map((col, i) => (
                      <th key={i} style={{ padding: '8px 12px', textAlign: i === 1 || i === 2 ? 'left' : 'center', color: 'var(--ts-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.allTime.map((p, i) => (
                    <tr key={p.player} style={{ borderBottom: '1px solid var(--ts-divider)' }} className="hover:bg-white/5">
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: i < 3 ? 'var(--ts-primary)' : 'var(--ts-faint)', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ts-text)', fontWeight: 600 }}>{p.player}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ts-muted)', fontSize: 13 }}>{p.detail}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{p.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Recent winners (annual competitions) */}
        {data.recentWinners && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-primary)', marginBottom: 16 }}>
              {data.award} — recent {data.allTime ? 'top scorers' : 'winners'}
            </h2>
            <div className="ts-hscroll" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                    {['Season', 'Player', 'Club', 'Goals'].map((col) => (
                      <th key={col} style={{ padding: '8px 12px', textAlign: col === 'Player' || col === 'Club' ? 'left' : 'center', color: 'var(--ts-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentWinners.map((w) => (
                    <tr key={w.season} id={`season-${w.season}`} style={{ borderBottom: '1px solid var(--ts-divider)' }} className="hover:bg-white/5">
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-faint)', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{w.season}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ts-text)', fontWeight: 600 }}>{w.winner}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ts-muted)' }}>{w.club}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{w.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Explanatory body */}
        <section style={{ marginBottom: 40, color: 'var(--ts-muted)', lineHeight: 1.75, fontSize: 15 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 14 }}>
            {data.competition}: the Golden Boot race
          </h2>
          {data.body.map((p, i) => (
            <p key={i} style={{ marginBottom: 12 }}>{p}</p>
          ))}
        </section>

        {/* Records */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>What are the scoring records?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.records.map((r) => (
              <div key={r} style={{ padding: '12px 16px', background: 'var(--ts-card2)', borderRadius: 10, border: '1px solid var(--ts-border)', color: 'var(--ts-text)', fontSize: 14 }}>{r}</div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>
            Frequently asked questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data.faqs.map(({ q, a }) => (
              <details key={q} style={{ borderBottom: '1px solid var(--ts-border)', padding: '14px 0' }}>
                <summary style={{ color: 'var(--ts-text)', fontWeight: 600, cursor: 'pointer', fontSize: 15, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {q}
                  <span style={{ color: 'var(--ts-primary)', fontSize: 18, fontWeight: 400, flexShrink: 0, marginLeft: 12 }}>+</span>
                </summary>
                <p style={{ color: 'var(--ts-muted)', marginTop: 10, lineHeight: 1.7, fontSize: 14 }}>{a}</p>
              </details>
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
              { href: '/goleadores-serie-a', label: 'Serie A' },
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
