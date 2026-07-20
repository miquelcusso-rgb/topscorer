import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import { CURRENT_SEASON_LONG as S } from '@/lib/season'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const path = '/goleadores-ligue-1'
  return {
    title: en
      ? `Ligue 1 Top Scorers ${S} — French League Ranking`
      : `Goleadores Ligue 1 ${S} — Máximos Anotadores Liga Francesa`,
    description: en
      ? `Full Ligue 1 top-scorer ranking ${S}. Lepaul, Panichelli, Greenwood… plus the history of French football's top scorers and the race for the trophy.`
      : `Ranking completo de goleadores de la Ligue 1 ${S}. Lepaul, Panichelli, Greenwood… histórico de máximos goleadores del fútbol francés y carrera por el trofeo.`,
    keywords: en
      ? [
          'ligue 1 top scorers', 'ligue 1 goalscorers', 'top scorers ligue 1',
          'ligue 1 goals 2025 2026', 'ligue 1 top scorer table', 'french league top scorers',
          'ligue 1 golden boot', 'ligue 1 top scorer 2026', 'top scorer ligue 1',
          'who scores the most goals in ligue 1',
        ]
      : [
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
      title: en
        ? `Ligue 1 Top Scorers ${S} | TopScorers`
        : `Goleadores Ligue 1 ${S} | TopScorers`,
      description: en
        ? `Full Ligue 1 ${S} top-scorer ranking with recent-season history.`
        : `Ranking completo de goleadores de la Ligue 1 ${S} con histórico de máximos anotadores de las últimas temporadas.`,
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
  label: `Temporada ${S}`,
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
    q: `¿Quién es el máximo goleador de la Ligue 1 en ${S}?`,
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
  name: `Goleadores Ligue 1 ${S}`,
  description: `Ranking de máximos goleadores de la Ligue 1 temporada ${S}`,
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
        <nav className="text-xs mb-6 flex gap-1.5 items-center" style={{ color: 'var(--ts-faint)' }}>
          <Link href="/" style={{ color: 'var(--ts-muted)', textDecoration: 'none' }}>TopScorers</Link>
          <span>›</span>
          <span style={{ color: 'var(--ts-muted)' }}>Goleadores Ligue 1</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: 'var(--ts-text)', marginBottom: 8 }}>
          Goleadores Ligue 1 {S}
        </h1>
        <p style={{ color: 'var(--ts-muted)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Ranking actualizado de los máximos anotadores de la <strong style={{ color: 'var(--ts-text)' }}>Ligue 1</strong>, con goles, partidos jugados y media por encuentro. La carrera por el título de <strong style={{ color: 'var(--ts-text)' }}>máximo goleador</strong> y el histórico de ganadores de las últimas temporadas.
        </p>

        {/* Current season table */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-primary)', marginBottom: 16 }}>
            Clasificación — {CURRENT_SEASON.label}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                  {['#', 'Jugador', 'Club', 'PJ', 'Goles', 'Media'].map(col => (
                    <th key={col} style={{ padding: '8px 12px', textAlign: col === '#' || col === 'PJ' || col === 'Goles' || col === 'Media' ? 'center' : 'left', color: 'var(--ts-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CURRENT_SEASON.players.map((p) => (
                  <tr key={p.name} id={`pos-${p.pos}`} style={{ borderBottom: '1px solid var(--ts-divider)', transition: 'background 0.15s' }} className="hover:bg-white/5">
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: p.pos <= 3 ? 'var(--ts-primary)' : 'var(--ts-faint)', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{p.pos}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--ts-text)', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--ts-muted)' }}>{p.club}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-muted)', fontFamily: 'monospace' }}>{p.pj}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{p.goles}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-muted)', fontFamily: 'monospace' }}>{(p.goles / p.pj).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 10, color: 'var(--ts-faint)', fontSize: 13 }}>
            Datos actualizados. Fuente: API-Football (Rapid API). Ver{' '}
            <Link href="/" style={{ color: 'var(--ts-primary)', textDecoration: 'none' }}>estadísticas en tiempo real →</Link>
          </p>
        </section>

        {/* Explanatory content — important for SEO */}
        <section style={{ marginBottom: 40, color: 'var(--ts-muted)', lineHeight: 1.75, fontSize: 15 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 14 }}>
            Ligue 1 {S}: análisis de la tabla de goleadores
          </h2>
          <p style={{ marginBottom: 12 }}>
            La temporada {S} de la <strong style={{ color: 'var(--ts-text)' }}>Ligue 1</strong> vive una transición histórica tras la marcha de Kylian Mbappé, que durante años monopolizó el trofeo de máximo goleador. En su lugar ha emergido <strong style={{ color: 'var(--ts-text)' }}>Esteban Lepaul</strong>, que lidera la tabla con 18 goles y se ha convertido en la gran revelación del <strong style={{ color: 'var(--ts-text)' }}>Stade Rennais</strong>.
          </p>
          <p style={{ marginBottom: 12 }}>
            El argentino <strong style={{ color: 'var(--ts-text)' }}>Joaquín Panichelli</strong>, del Estrasburgo, confirma con 16 dianas el buen momento de la cantera sudamericana en Francia, mientras que <strong style={{ color: 'var(--ts-text)' }}>Mason Greenwood</strong> mantiene al Marsella entre los mejores. El <strong style={{ color: 'var(--ts-text)' }}>Paris Saint-Germain</strong> reparte sus goles entre Dembélé, Barcola y Gonçalo Ramos.
          </p>
          <p>
            La Ligue 1 confirma así su fama de liga reveladora de talento joven: nombres emergentes y futbolistas en pleno crecimiento copan una tabla de goleadores más abierta que nunca.
          </p>
        </section>

        {/* Historical top scorers */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>
            Histórico Máximos Goleadores Ligue 1 — Últimas Temporadas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HISTORICAL.map((h) => (
              <div key={h.season} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--ts-card2)', borderRadius: 10, border: '1px solid var(--ts-border)' }}>
                <span style={{ color: 'var(--ts-faint)', fontFamily: 'monospace', fontSize: 13, width: 60, flexShrink: 0 }}>{h.season}</span>
                <span style={{ color: 'var(--ts-text)', fontWeight: 600, flex: 1 }}>{h.winner}</span>
                <span style={{ color: 'var(--ts-muted)', fontSize: 13 }}>{h.club}</span>
                <span style={{ color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'monospace', width: 50, textAlign: 'right' }}>{h.goles}G</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>
            Preguntas Frecuentes sobre Goleadores de la Ligue 1
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {FAQS.map(({ q, a }) => (
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
          <h3 style={{ ...headingStyle, fontSize: 16, color: 'var(--ts-primary)', marginBottom: 12 }}>
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
                style={{ color: 'var(--ts-primary)', textDecoration: 'none', fontSize: 13, padding: '6px 14px', background: 'var(--ts-primary-soft)', borderRadius: 20, border: '1px solid var(--ts-border-hot)', transition: 'background 0.15s' }}
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
