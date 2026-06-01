import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/goleadores-ligue-1'
  return {
    title: 'Goleadores Ligue 1 2025/26 — Máximos Anotadores Liga Francesa | TopScorers',
    description: 'Ranking completo de goleadores de la Ligue 1 2025/26. Lepaul, Panichelli, Greenwood… histórico de máximos goleadores del fútbol francés y carrera por el trofeo.',
    keywords: [
      'goleadores ligue 1', 'máximos goleadores ligue 1', 'top goleadores ligue 1',
      'goles ligue 1 2025 2026', 'clasificación goleadores ligue 1', 'goleadores liga francesa',
      'pichichi ligue 1', 'máximo goleador ligue 1 2026', 'top scorer ligue 1',
      'quien mete más goles en la ligue 1',
    ],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    openGraph: {
      title: 'Goleadores Ligue 1 2025/26 | TopScorers',
      description: 'Ranking completo de goleadores de la Ligue 1 2025/26 con histórico de máximos anotadores de las últimas temporadas.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630 }],
    },
  }
}

// ── Data ─────────────────────────────────────────────────────────────────────

const CURRENT_SEASON = {
  label: 'Temporada 2025/26',
  players: [
    { pos: 1, name: 'Esteban Lepaul',     club: 'Stade Rennais', goles: 18, pj: 30 },
    { pos: 2, name: 'Joaquín Panichelli', club: 'Estrasburgo',   goles: 16, pj: 27 },
    { pos: 3, name: 'Mason Greenwood',    club: 'Marsella',      goles: 15, pj: 30 },
    { pos: 4, name: 'Ousmane Dembélé',    club: 'Paris SG',      goles: 14, pj: 28 },
    { pos: 5, name: 'Bradley Barcola',    club: 'Paris SG',      goles: 12, pj: 30 },
    { pos: 6, name: 'Gonçalo Ramos',      club: 'Paris SG',      goles: 11, pj: 29 },
  ],
}

// Real Ligue 1 top scorer winners.
const HISTORICAL = [
  { season: '2024/25', winner: 'Ousmane Dembélé', club: 'Paris SG',     goles: 21 },
  { season: '2023/24', winner: 'Kylian Mbappé',   club: 'Paris SG',     goles: 27 },
  { season: '2022/23', winner: 'Kylian Mbappé',   club: 'Paris SG',     goles: 29 },
  { season: '2021/22', winner: 'Kylian Mbappé',   club: 'Paris SG',     goles: 28 },
  { season: '2020/21', winner: 'Kylian Mbappé',   club: 'Paris SG',     goles: 27 },
]

const FAQS = [
  {
    q: '¿Quién es el máximo goleador de la Ligue 1 en 2025/26?',
    a: 'Esteban Lepaul (Stade Rennais) lidera la tabla de goleadores de la Ligue 1 con 18 goles, una de las grandes sorpresas de la temporada. Le siguen el joven Joaquín Panichelli (Estrasburgo) con 16 y Mason Greenwood (Marsella) con 15. El PSG aporta varios nombres al top encabezados por Ousmane Dembélé.',
  },
  {
    q: '¿Cómo se llama el trofeo al máximo goleador de la Ligue 1?',
    a: 'La Ligue 1 no tiene un nombre propio tan icónico como el Pichichi o la Torjägerkanone, pero entrega el trofeo al "meilleur buteur" (mejor goleador) dentro de los Trophées UNFP, los premios oficiales del fútbol francés. Reconoce al jugador con más goles en la temporada regular.',
  },
  {
    q: '¿Quién ha sido el máximo goleador de la Ligue 1 más veces?',
    a: 'Kylian Mbappé dominó la Ligue 1 con cinco títulos de máximo goleador antes de marcharse al Real Madrid, encadenando cuatro de ellos de forma consecutiva entre 2020/21 y 2023/24. Su marcha ha abierto la lucha por el trofeo a una nueva generación de delanteros.',
  },
  {
    q: '¿Cuántos goles suelen hacer falta para ser máximo goleador de la Ligue 1?',
    a: 'En las últimas temporadas el ganador ha rondado entre los 21 y los 29 goles. Mbappé llegó a marcar 29 en la 2022/23, mientras que Ousmane Dembélé se llevó el premio en 2024/25 con 21 tantos en una carrera muy igualada.',
  },
  {
    q: '¿Dónde puedo ver las estadísticas de goleadores de la Ligue 1 en tiempo real?',
    a: 'En TopScorers.com puedes consultar el ranking de goleadores y asistentes de la Ligue 1 actualizado en tiempo real, junto con las estadísticas de La Liga, la Premier League, la Bundesliga y la Serie A.',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Goleadores Ligue 1 2025/26',
  description: 'Ranking de máximos goleadores de la Ligue 1 temporada 2025/26',
  url: 'https://www.top-scorers.com/goleadores-ligue-1',
  numberOfItems: CURRENT_SEASON.players.length,
  itemListElement: CURRENT_SEASON.players.map((p) => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.name} — ${p.goles} goles (${p.club})`,
    url: `https://www.top-scorers.com/goleadores-ligue-1#pos-${p.pos}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Goleadores Ligue 1', item: 'https://www.top-scorers.com/goleadores-ligue-1' },
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

// ── Page ─────────────────────────────────────────────────────────────────────

const headingStyle = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
}

export default function GoleadoresLigue1Page() {
  return (
    <SaasShell activeKey="leagues" breadcrumb={['Competiciones', 'Goleadores Ligue 1']}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex gap-1.5 items-center">
          <Link href="/" className="hover:text-gray-300 transition-colors">TopScorers</Link>
          <span>›</span>
          <span className="text-gray-400">Goleadores Ligue 1</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: '#eef4ff', marginBottom: 8 }}>
          Goleadores Ligue 1 2025/26
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Ranking actualizado de los máximos anotadores de la <strong style={{ color: '#e2e8f0' }}>Ligue 1</strong>, con goles, partidos jugados y media por encuentro. La carrera por el título de <strong style={{ color: '#e2e8f0' }}>máximo goleador</strong> y el histórico de ganadores de las últimas temporadas.
        </p>

        {/* Current season table */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#f0c040', marginBottom: 16 }}>
            Clasificación — {CURRENT_SEASON.label}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['#', 'Jugador', 'Club', 'PJ', 'Goles', 'Media'].map(col => (
                    <th key={col} style={{ padding: '8px 12px', textAlign: col === '#' || col === 'PJ' || col === 'Goles' || col === 'Media' ? 'center' : 'left', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CURRENT_SEASON.players.map((p) => (
                  <tr key={p.name} id={`pos-${p.pos}`} style={{ borderBottom: '1px solid #0f172a', transition: 'background 0.15s' }} className="hover:bg-white/5">
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: p.pos <= 3 ? '#f0c040' : '#475569', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{p.pos}</td>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.club}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontFamily: 'monospace' }}>{p.pj}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#f0c040', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{p.goles}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#94a3b8', fontFamily: 'monospace' }}>{(p.goles / p.pj).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 10, color: '#475569', fontSize: 13 }}>
            Datos actualizados. Fuente: API-Football (Rapid API). Ver{' '}
            <Link href="/" style={{ color: '#f0c040', textDecoration: 'none' }}>estadísticas en tiempo real →</Link>
          </p>
        </section>

        {/* Explanatory content — important for SEO */}
        <section style={{ marginBottom: 40, color: '#94a3b8', lineHeight: 1.75, fontSize: 15 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 14 }}>
            Ligue 1 2025/26: análisis de la tabla de goleadores
          </h2>
          <p style={{ marginBottom: 12 }}>
            La temporada 2025/26 de la <strong style={{ color: '#e2e8f0' }}>Ligue 1</strong> vive una transición histórica tras la marcha de Kylian Mbappé, que durante años monopolizó el trofeo de máximo goleador. En su lugar ha emergido <strong style={{ color: '#e2e8f0' }}>Esteban Lepaul</strong>, que lidera la tabla con 18 goles y se ha convertido en la gran revelación del <strong style={{ color: '#e2e8f0' }}>Stade Rennais</strong>.
          </p>
          <p style={{ marginBottom: 12 }}>
            El argentino <strong style={{ color: '#e2e8f0' }}>Joaquín Panichelli</strong>, del Estrasburgo, confirma con 16 dianas el buen momento de la cantera sudamericana en Francia, mientras que <strong style={{ color: '#e2e8f0' }}>Mason Greenwood</strong> mantiene al Marsella entre los mejores. El <strong style={{ color: '#e2e8f0' }}>Paris Saint-Germain</strong> reparte sus goles entre Dembélé, Barcola y Gonçalo Ramos.
          </p>
          <p>
            La Ligue 1 confirma así su fama de liga reveladora de talento joven: nombres emergentes y futbolistas en pleno crecimiento copan una tabla de goleadores más abierta que nunca.
          </p>
        </section>

        {/* Historical top scorers */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 16 }}>
            Histórico Máximos Goleadores Ligue 1 — Últimas Temporadas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HISTORICAL.map((h) => (
              <div key={h.season} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: 13, width: 60, flexShrink: 0 }}>{h.season}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600, flex: 1 }}>{h.winner}</span>
                <span style={{ color: '#64748b', fontSize: 13 }}>{h.club}</span>
                <span style={{ color: '#f0c040', fontWeight: 700, fontFamily: 'monospace', width: 50, textAlign: 'right' }}>{h.goles}G</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 16 }}>
            Preguntas Frecuentes sobre Goleadores de la Ligue 1
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {FAQS.map(({ q, a }) => (
              <details key={q} style={{ borderBottom: '1px solid #1e293b', padding: '14px 0' }}>
                <summary style={{ color: '#e2e8f0', fontWeight: 600, cursor: 'pointer', fontSize: 15, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {q}
                  <span style={{ color: '#f0c040', fontSize: 18, fontWeight: 400, flexShrink: 0, marginLeft: 12 }}>+</span>
                </summary>
                <p style={{ color: '#94a3b8', marginTop: 10, lineHeight: 1.7, fontSize: 14 }}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section style={{ padding: '20px 24px', background: 'rgba(240,192,64,0.06)', borderRadius: 12, border: '1px solid rgba(240,192,64,0.15)' }}>
          <h3 style={{ ...headingStyle, fontSize: 16, color: '#f0c040', marginBottom: 12 }}>
            Más estadísticas en TopScorers
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { href: '/maximos-goleadores-europa', label: 'Máximos goleadores de Europa' },
              { href: '/goleadores-liga-espanola', label: 'Goleadores La Liga (Pichichi)' },
              { href: '/goleadores-premier-league', label: 'Goleadores Premier League' },
              { href: '/goleadores-serie-a', label: 'Goleadores Serie A' },
              { href: '/goleadores-bundesliga', label: 'Goleadores Bundesliga' },
              { href: '/bota-de-oro', label: 'Bota de Oro' },
              { href: '/records', label: 'Records y líderes' },
              { href: '/', label: 'Goleadores en tiempo real' },
              { href: '/competiciones', label: 'Todas las ligas' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{ color: '#f0c040', textDecoration: 'none', fontSize: 13, padding: '6px 14px', background: 'rgba(240,192,64,0.1)', borderRadius: 20, border: '1px solid rgba(240,192,64,0.2)', transition: 'background 0.15s' }}
                className="hover:bg-yellow-400/20"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </SaasShell>
  )
}
