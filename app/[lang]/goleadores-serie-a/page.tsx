import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/goleadores-serie-a'
  return {
    title: 'Goleadores Serie A 2025/26 — Capocannoniere y Máximos Anotadores | TopScorers',
    description: 'Ranking completo de goleadores de la Serie A 2025/26. Lautaro Martínez, Thuram, Vlahović… histórico del Capocannoniere y máximos goleadores del calcio italiano.',
    keywords: [
      'goleadores serie a', 'máximos goleadores serie a', 'capocannoniere 2025',
      'capocannoniere 2026', 'top goleadores serie a', 'goles serie a 2025 2026',
      'clasificación goleadores serie a', 'goleadores calcio', 'pichichi serie a',
      'quien mete más goles en la serie a',
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
      title: 'Goleadores Serie A 2025/26 | TopScorers',
      description: 'Ranking completo de goleadores de la Serie A 2025/26 con histórico del Capocannoniere de las últimas temporadas.',
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
    { pos: 1, name: 'Lautaro Martínez',  club: 'Inter de Milán', goles: 16, pj: 26 },
    { pos: 2, name: 'Marcus Thuram',     club: 'Inter de Milán', goles: 12, pj: 26 },
    { pos: 3, name: 'Dušan Vlahović',    club: 'Juventus',       goles: 12, pj: 25 },
    { pos: 4, name: 'Moise Kean',        club: 'Fiorentina',     goles: 11, pj: 30 },
    { pos: 5, name: 'Christian Pulisic', club: 'AC Milan',       goles: 11, pj: 28 },
    { pos: 6, name: 'Ademola Lookman',   club: 'Atalanta',       goles: 10, pj: 27 },
    { pos: 7, name: 'Riccardo Orsolini', club: 'Bologna',        goles: 9,  pj: 31 },
    { pos: 8, name: 'Rafael Leão',       club: 'AC Milan',       goles: 9,  pj: 29 },
  ],
}

// Real Serie A Capocannoniere (Paolo Rossi Award) winners.
const HISTORICAL = [
  { season: '2024/25', winner: 'Mateo Retegui',      club: 'Atalanta',       goles: 25 },
  { season: '2023/24', winner: 'Lautaro Martínez',   club: 'Inter de Milán', goles: 24 },
  { season: '2022/23', winner: 'Victor Osimhen',     club: 'Napoli',         goles: 26 },
  { season: '2021/22', winner: 'Ciro Immobile',      club: 'Lazio',          goles: 27 },
  { season: '2020/21', winner: 'Cristiano Ronaldo',  club: 'Juventus',       goles: 29 },
]

const FAQS = [
  {
    q: '¿Quién es el máximo goleador de la Serie A en 2025/26?',
    a: 'Lautaro Martínez (Inter de Milán) lidera la tabla de goleadores de la Serie A con 16 goles, por delante de su compañero Marcus Thuram y de Dušan Vlahović (Juventus), ambos con 12 tantos. La carrera por el Capocannoniere sigue muy abierta a falta de jornadas por disputar.',
  },
  {
    q: '¿Qué es el Capocannoniere?',
    a: 'El Capocannoniere es el galardón que reconoce al máximo goleador de la Serie A italiana cada temporada. Desde 2023 se entrega de forma oficial como Premio Paolo Rossi, en homenaje al delantero campeón del mundo en 1982. Es el equivalente italiano al Trofeo Pichichi en España o a la Golden Boot inglesa.',
  },
  {
    q: '¿Quién tiene más títulos de Capocannoniere en la historia de la Serie A?',
    a: 'Gunnar Nordahl, leyenda del AC Milan, es el jugador con más títulos de Capocannoniere, con 5 galardones en los años 50. En la era moderna destacan Ciro Immobile y Luca Toni con varios trofeos. El récord de goles en una sola temporada lo ostenta Gonzalo Higuaín, con 36 tantos en la 2015/16.',
  },
  {
    q: '¿Cuántos goles hacen falta para ganar el Capocannoniere?',
    a: 'No existe un mínimo fijo: depende de la competencia de cada temporada. En las últimas campañas, el ganador ha necesitado entre 24 y 29 goles. Cristiano Ronaldo ganó en 2020/21 con 29 goles, mientras que Lautaro Martínez se proclamó en 2023/24 con 24.',
  },
  {
    q: '¿Dónde puedo ver las estadísticas de goleadores de la Serie A en tiempo real?',
    a: 'En TopScorers.com puedes consultar el ranking de goleadores y asistentes de la Serie A actualizado en tiempo real, junto con las estadísticas de La Liga, la Premier League, la Bundesliga y la Ligue 1.',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Goleadores Serie A 2025/26',
  description: 'Ranking de máximos goleadores de la Serie A temporada 2025/26 (Capocannoniere)',
  url: 'https://www.top-scorers.com/goleadores-serie-a',
  numberOfItems: CURRENT_SEASON.players.length,
  itemListElement: CURRENT_SEASON.players.map((p) => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.name} — ${p.goles} goles (${p.club})`,
    url: `https://www.top-scorers.com/goleadores-serie-a#pos-${p.pos}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Goleadores Serie A', item: 'https://www.top-scorers.com/goleadores-serie-a' },
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

export default function GoleadoresSerieAPage() {
  return (
    <SaasShell activeKey="leagues" breadcrumb={['Competiciones', 'Goleadores Serie A']}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex gap-1.5 items-center">
          <Link href="/" className="hover:text-gray-300 transition-colors">TopScorers</Link>
          <span>›</span>
          <span className="text-gray-400">Goleadores Serie A</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: '#eef4ff', marginBottom: 8 }}>
          Goleadores Serie A 2025/26
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Ranking actualizado de los máximos anotadores de la <strong style={{ color: '#e2e8f0' }}>Serie A</strong>, con goles, partidos jugados y media por encuentro. La carrera por el <strong style={{ color: '#e2e8f0' }}>Capocannoniere</strong> y el histórico de ganadores de las últimas temporadas.
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
            Serie A 2025/26: análisis de la tabla de goleadores
          </h2>
          <p style={{ marginBottom: 12 }}>
            La temporada 2025/26 de la <strong style={{ color: '#e2e8f0' }}>Serie A</strong> mantiene el sello del fútbol italiano: equilibrio defensivo y una lucha por el Capocannoniere muy repartida. <strong style={{ color: '#e2e8f0' }}>Lautaro Martínez</strong> lidera la tabla con 16 goles y aspira a repetir el título de máximo goleador que ya conquistó en la 2023/24, impulsando el ataque de un <strong style={{ color: '#e2e8f0' }}>Inter de Milán</strong> que pelea por el Scudetto.
          </p>
          <p style={{ marginBottom: 12 }}>
            Su compañero <strong style={{ color: '#e2e8f0' }}>Marcus Thuram</strong> y el delantero de la <strong style={{ color: '#e2e8f0' }}>Juventus</strong> <strong style={{ color: '#e2e8f0' }}>Dušan Vlahović</strong> comparten la segunda posición con 12 tantos, mientras que <strong style={{ color: '#e2e8f0' }}>Moise Kean</strong> confirma su resurgir en la Fiorentina. El AC Milan aporta dos nombres al top con Christian Pulisic y Rafael Leão.
          </p>
          <p>
            A diferencia de otras grandes ligas, la Serie A reparte los goles entre más equipos: del primer al octavo clasificado median apenas 7 dianas, reflejo de una competición donde el gol es un bien escaso y muy disputado.
          </p>
        </section>

        {/* Historical Capocannoniere */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 16 }}>
            Histórico Capocannoniere — Últimas Temporadas
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
            Preguntas Frecuentes sobre Goleadores de la Serie A
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
              { href: '/goleadores-bundesliga', label: 'Goleadores Bundesliga' },
              { href: '/goleadores-ligue-1', label: 'Goleadores Ligue 1' },
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
