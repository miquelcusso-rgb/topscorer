import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/goleadores-premier-league'
  return {
    title: 'Goleadores Premier League 2025/26 — Golden Boot & Top Scorers | TopScorers',
    description: 'Ranking de máximos goleadores de la Premier League 2025/26. Haaland, Thiago, Gyökeres… tabla de la Golden Boot con goles, partidos e histórico de ganadores.',
    keywords: [
      'goleadores premier league', 'top scorers premier league', 'golden boot premier league',
      'máximos goleadores premier league', 'premier league top scorers 2025 2026',
      'bota de oro premier league', 'goleadores premier 2025', 'haaland goles premier',
      'quién es el máximo goleador de la premier league', 'estadísticas goles premier league',
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
      title: 'Goleadores Premier League 2025/26 | TopScorers',
      description: 'Ranking de máximos anotadores de la Premier League 2025/26 con histórico de ganadores de la Golden Boot.',
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
    { pos: 1, name: 'Erling Haaland',  club: 'Manchester City', goles: 24, pj: 32 },
    { pos: 2, name: 'Thiago',          club: 'Brentford',       goles: 22, pj: 35 },
    { pos: 3, name: 'João Pedro',      club: 'Chelsea',         goles: 14, pj: 32 },
    { pos: 4, name: 'Viktor Gyökeres', club: 'Arsenal',         goles: 14, pj: 33 },
    { pos: 5, name: 'Benjamin Šeško',  club: 'Manchester Utd',  goles: 11, pj: 27 },
    { pos: 6, name: 'Cole Palmer',     club: 'Chelsea',         goles: 11, pj: 28 },
    { pos: 7, name: 'Florian Wirtz',   club: 'Liverpool',       goles: 10, pj: 30 },
    { pos: 8, name: 'Mikel Merino',    club: 'Arsenal',         goles: 9,  pj: 27 },
  ],
}

// Real Premier League Golden Boot winners.
const HISTORICAL = [
  { season: '2024/25', winner: 'Mohamed Salah',           club: 'Liverpool',       goles: 29 },
  { season: '2023/24', winner: 'Erling Haaland',          club: 'Manchester City', goles: 27 },
  { season: '2022/23', winner: 'Erling Haaland',          club: 'Manchester City', goles: 36 },
  { season: '2021/22', winner: 'Son Heung-min / Salah',   club: 'Tottenham / Liverpool', goles: 23 },
  { season: '2020/21', winner: 'Harry Kane',              club: 'Tottenham',       goles: 23 },
]

const FAQS = [
  {
    q: '¿Quién es el máximo goleador de la Premier League en 2025/26?',
    a: 'Erling Haaland (Manchester City) lidera la carrera por la Golden Boot con 24 goles, por delante de la revelación Thiago (Brentford), que suma 22. Más atrás aparecen João Pedro y Viktor Gyökeres, ambos con 14 tantos.',
  },
  {
    q: '¿Qué es la Golden Boot de la Premier League?',
    a: 'La Premier League Golden Boot es el trofeo que premia al máximo goleador de la liga inglesa cada temporada. Es el equivalente al Trofeo Pichichi en España. Si dos o más jugadores empatan a goles, el premio se comparte entre todos ellos.',
  },
  {
    q: '¿Cuál es el récord de goles en una temporada de Premier League?',
    a: 'Erling Haaland marcó 36 goles en la temporada 2022/23, récord absoluto desde que la Premier pasó a 38 jornadas. En la era de 42 partidos, Alan Shearer y Andy Cole comparten el récord con 34 goles.',
  },
  {
    q: '¿Quién es el máximo goleador histórico de la Premier League?',
    a: 'Alan Shearer es el máximo goleador histórico de la Premier League con 260 goles. Le siguen Harry Kane y Wayne Rooney como referentes ingleses, mientras que Mohamed Salah encabeza la lista de goleadores extranjeros del siglo XXI.',
  },
  {
    q: '¿Dónde puedo ver los goleadores de la Premier League en tiempo real?',
    a: 'En TopScorers.com puedes consultar el ranking de goleadores y asistentes de la Premier League actualizado en tiempo real, junto con la clasificación, los resultados y las estadísticas del resto de grandes ligas europeas.',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Goleadores Premier League 2025/26',
  description: 'Ranking de máximos goleadores de la Premier League temporada 2025/26 (Golden Boot)',
  url: 'https://www.top-scorers.com/goleadores-premier-league',
  numberOfItems: CURRENT_SEASON.players.length,
  itemListElement: CURRENT_SEASON.players.map((p) => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.name} — ${p.goles} goles (${p.club})`,
    url: `https://www.top-scorers.com/goleadores-premier-league#pos-${p.pos}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Goleadores Premier League', item: 'https://www.top-scorers.com/goleadores-premier-league' },
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

export default function GoleadoresPremierLeaguePage() {
  return (
    <SaasShell activeKey="leagues" breadcrumb={['Competiciones', 'Goleadores Premier League']}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex gap-1.5 items-center">
          <Link href="/" className="hover:text-gray-300 transition-colors">TopScorers</Link>
          <span>›</span>
          <span className="text-gray-400">Goleadores Premier League</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: '#eef4ff', marginBottom: 8 }}>
          Goleadores Premier League 2025/26
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Ranking actualizado de los máximos anotadores de la <strong style={{ color: '#e2e8f0' }}>Premier League</strong>, con goles, partidos jugados y media por encuentro. La carrera por la <strong style={{ color: '#e2e8f0' }}>Golden Boot</strong> y el histórico de ganadores de las últimas temporadas.
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
                    <th key={col} style={{ padding: '8px 12px', textAlign: col === 'Jugador' || col === 'Club' ? 'left' : 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</th>
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
            Datos actualizados. Fuente: API-Football. Ver{' '}
            <Link href="/competiciones/eng" style={{ color: '#f0c040', textDecoration: 'none' }}>la Premier League en tiempo real →</Link>
          </p>
        </section>

        {/* Explanatory content */}
        <section style={{ marginBottom: 40, color: '#94a3b8', lineHeight: 1.75, fontSize: 15 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 14 }}>
            Premier League 2025/26: análisis de la Golden Boot
          </h2>
          <p style={{ marginBottom: 12 }}>
            La carrera por la <strong style={{ color: '#e2e8f0' }}>Golden Boot</strong> de la Premier League 2025/26 vuelve a tener un nombre propio: <strong style={{ color: '#e2e8f0' }}>Erling Haaland</strong>. El noruego del Manchester City suma 24 goles y persigue una nueva bota de oro inglesa que reafirme su condición de delantero más determinante de la liga desde su llegada en 2022.
          </p>
          <p style={{ marginBottom: 12 }}>
            La gran historia de la temporada es <strong style={{ color: '#e2e8f0' }}>Thiago</strong>, el ariete del Brentford, que con 22 dianas planta cara a los grandes presupuestos y se mantiene como el perseguidor más serio de Haaland. Por detrás, <strong style={{ color: '#e2e8f0' }}>João Pedro</strong> y <strong style={{ color: '#e2e8f0' }}>Viktor Gyökeres</strong> lideran un pelotón de delanteros que reparte los goles entre Chelsea, Arsenal y Liverpool.
          </p>
          <p>
            La Premier es históricamente la liga más igualada en el reparto de goles: no es raro que la Golden Boot se decida en la última jornada o se comparta entre dos jugadores, como ocurrió en 2021/22 entre Son Heung-min y Mohamed Salah. Esa competitividad la convierte en una de las botas de oro más prestigiosas de Europa.
          </p>
        </section>

        {/* Historical winners */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 16 }}>
            Histórico Golden Boot — Últimas temporadas
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
            Preguntas frecuentes sobre los goleadores de la Premier League
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
            Más rankings de goleadores
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { href: '/maximos-goleadores-europa', label: 'Máximos goleadores de Europa' },
              { href: '/goleadores-liga-espanola', label: 'Goleadores La Liga (Pichichi)' },
              { href: '/goleadores-serie-a', label: 'Goleadores Serie A' },
              { href: '/goleadores-bundesliga', label: 'Goleadores Bundesliga' },
              { href: '/goleadores-ligue-1', label: 'Goleadores Ligue 1' },
              { href: '/bota-de-oro', label: 'Bota de Oro' },
              { href: '/competiciones/eng', label: 'Premier League en directo' },
              { href: '/', label: 'Top 25 en tiempo real' },
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
