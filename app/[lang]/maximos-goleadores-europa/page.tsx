import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/maximos-goleadores-europa'
  return {
    title: 'Máximos Goleadores de Europa 2025/26 — Ranking Top Scorers | TopScorers',
    description: 'Ranking de los máximos goleadores de Europa 2025/26 en las 5 grandes ligas. Kane, Mbappé, Haaland, Muriqi… goles, partidos y media por encuentro actualizados.',
    keywords: [
      'máximos goleadores europa', 'máximos goleadores europa 2025', 'goleadores europa 2025 2026',
      'top scorers europe', 'mejores goleadores del mundo', 'ranking goleadores europa',
      'pichichi europa', 'goleadores cinco grandes ligas', 'quién es el máximo goleador de europa',
      'goleadores la liga premier bundesliga serie a ligue 1',
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
      title: 'Máximos Goleadores de Europa 2025/26 | TopScorers',
      description: 'El ranking de máximos anotadores de las 5 grandes ligas europeas, actualizado con goles, partidos y media por partido.',
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
    { pos: 1,  name: 'Harry Kane',       club: 'Bayern München',  league: 'Bundesliga',      goles: 33, pj: 29 },
    { pos: 2,  name: 'Kylian Mbappé',    club: 'Real Madrid',      league: 'La Liga',         goles: 24, pj: 28 },
    { pos: 3,  name: 'Erling Haaland',   club: 'Manchester City',  league: 'Premier League',  goles: 24, pj: 32 },
    { pos: 4,  name: 'Thiago',           club: 'Brentford',        league: 'Premier League',  goles: 22, pj: 35 },
    { pos: 5,  name: 'Vedat Muriqi',     club: 'Mallorca',         league: 'La Liga',         goles: 21, pj: 33 },
    { pos: 6,  name: 'Esteban Lepaul',   club: 'Stade Rennais',    league: 'Ligue 1',         goles: 18, pj: 30 },
    { pos: 7,  name: 'Deniz Undav',      club: 'VfB Stuttgart',    league: 'Bundesliga',      goles: 18, pj: 27 },
    { pos: 8,  name: 'Lamine Yamal',     club: 'FC Barcelona',     league: 'La Liga',         goles: 16, pj: 28 },
    { pos: 9,  name: 'Patrik Schick',    club: 'Bayer Leverkusen', league: 'Bundesliga',      goles: 16, pj: 26 },
    { pos: 10, name: 'Lautaro Martínez', club: 'Inter de Milán',   league: 'Serie A',         goles: 16, pj: 26 },
  ],
}

// Real European Golden Shoe (máximo goleador de Europa por coeficiente) winners.
const HISTORICAL = [
  { season: '2024/25', winner: 'Kylian Mbappé',      club: 'Real Madrid',     league: 'La Liga',     goles: 31 },
  { season: '2023/24', winner: 'Harry Kane',          club: 'Bayern München',  league: 'Bundesliga',  goles: 36 },
  { season: '2022/23', winner: 'Erling Haaland',      club: 'Manchester City', league: 'Premier',     goles: 36 },
  { season: '2021/22', winner: 'Robert Lewandowski',  club: 'Bayern München',  league: 'Bundesliga',  goles: 35 },
  { season: '2020/21', winner: 'Robert Lewandowski',  club: 'Bayern München',  league: 'Bundesliga',  goles: 41 },
]

const FAQS = [
  {
    q: '¿Quién es el máximo goleador de Europa en 2025/26?',
    a: 'Harry Kane (Bayern de Múnich) encabeza la tabla de goleadores de las cinco grandes ligas con 33 goles, por delante de Kylian Mbappé (Real Madrid) y Erling Haaland (Manchester City), ambos con 24. El ranking suma los tantos en La Liga, Premier League, Bundesliga, Serie A y Ligue 1.',
  },
  {
    q: '¿Cómo se decide el máximo goleador de Europa?',
    a: 'Hay dos formas. La más directa es el ranking de goles brutos entre todas las ligas, donde gana quien más anota. La oficial es la Bota de Oro (European Golden Shoe), que aplica un coeficiente por liga (×2 para las 5 grandes) para igualar la dificultad de cada campeonato. Consulta nuestra página de la Bota de Oro para ver el cálculo completo.',
  },
  {
    q: '¿Cuál es el récord de goles en una temporada en las grandes ligas europeas?',
    a: 'Lionel Messi marcó 50 goles en La Liga 2011/12, la mejor cifra de la historia en una de las cinco grandes ligas. Robert Lewandowski ostenta el récord de la Bundesliga con 41 goles (2020/21), superando los 40 de Gerd Müller.',
  },
  {
    q: '¿Qué ligas cuentan para el ranking de goleadores de Europa?',
    a: 'Este ranking recoge a los máximos anotadores de las cinco grandes ligas: La Liga (España), Premier League (Inglaterra), Bundesliga (Alemania), Serie A (Italia) y Ligue 1 (Francia). En TopScorers también puedes consultar Portugal, Turquía y Grecia, además de la Champions League.',
  },
  {
    q: '¿Dónde puedo ver el ranking de goleadores de Europa en tiempo real?',
    a: 'En TopScorers.com tienes el Top 25 de goleadores y asistentes de Europa actualizado en tiempo real, con filtros por liga, edad y temporada, y comparador de jugadores.',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Máximos goleadores de Europa 2025/26',
  description: 'Ranking de máximos anotadores de las cinco grandes ligas europeas en la temporada 2025/26',
  url: 'https://www.top-scorers.com/maximos-goleadores-europa',
  numberOfItems: CURRENT_SEASON.players.length,
  itemListElement: CURRENT_SEASON.players.map((p) => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.name} — ${p.goles} goles (${p.club}, ${p.league})`,
    url: `https://www.top-scorers.com/maximos-goleadores-europa#pos-${p.pos}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Máximos goleadores de Europa', item: 'https://www.top-scorers.com/maximos-goleadores-europa' },
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

export default function MaximosGoleadoresEuropaPage() {
  return (
    <SaasShell activeKey="leagues" breadcrumb={['Competiciones', 'Máximos goleadores Europa']}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex gap-1.5 items-center">
          <Link href="/" className="hover:text-gray-300 transition-colors">TopScorers</Link>
          <span>›</span>
          <span className="text-gray-400">Máximos goleadores de Europa</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: '#eef4ff', marginBottom: 8 }}>
          Máximos Goleadores de Europa 2025/26
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Ranking de los <strong style={{ color: '#e2e8f0' }}>máximos anotadores de las cinco grandes ligas</strong> — La Liga, Premier League, Bundesliga, Serie A y Ligue 1 — con goles, partidos jugados y media por encuentro. La carrera por la <Link href="/bota-de-oro" style={{ color: '#f0c040', textDecoration: 'none' }}>Bota de Oro</Link> de la temporada.
        </p>

        {/* Current season table */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#f0c040', marginBottom: 16 }}>
            Top 10 Goleadores — {CURRENT_SEASON.label}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['#', 'Jugador', 'Liga', 'PJ', 'Goles', 'Media'].map(col => (
                    <th key={col} style={{ padding: '8px 12px', textAlign: col === 'Jugador' || col === 'Liga' ? 'left' : 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CURRENT_SEASON.players.map((p) => (
                  <tr key={p.name} id={`pos-${p.pos}`} style={{ borderBottom: '1px solid #0f172a', transition: 'background 0.15s' }} className="hover:bg-white/5">
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: p.pos <= 3 ? '#f0c040' : '#475569', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{p.pos}</td>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 600 }}>
                      {p.name}
                      <span style={{ display: 'block', color: '#64748b', fontWeight: 400, fontSize: 13 }}>{p.club}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.league}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontFamily: 'monospace' }}>{p.pj}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#f0c040', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{p.goles}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#94a3b8', fontFamily: 'monospace' }}>{(p.goles / p.pj).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 10, color: '#475569', fontSize: 13 }}>
            Datos actualizados. Fuente: API-Football. Ver el{' '}
            <Link href="/" style={{ color: '#f0c040', textDecoration: 'none' }}>Top 25 de goleadores en tiempo real →</Link>
          </p>
        </section>

        {/* Explanatory content */}
        <section style={{ marginBottom: 40, color: '#94a3b8', lineHeight: 1.75, fontSize: 15 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 14 }}>
            La carrera goleadora de Europa en 2025/26
          </h2>
          <p style={{ marginBottom: 12 }}>
            La temporada 2025/26 confirma a <strong style={{ color: '#e2e8f0' }}>Harry Kane</strong> como el goleador más letal del continente. El delantero inglés del <strong style={{ color: '#e2e8f0' }}>Bayern de Múnich</strong> firma 33 goles en la Bundesliga, ampliando una racha que ya le valió la Bota de Oro en 2023/24 y que le consolida como el gran cazador de la liga alemana.
          </p>
          <p style={{ marginBottom: 12 }}>
            Por detrás, el duelo entre <strong style={{ color: '#e2e8f0' }}>Kylian Mbappé</strong> (Real Madrid) y <strong style={{ color: '#e2e8f0' }}>Erling Haaland</strong> (Manchester City), empatados a 24 goles, mantiene viva la pugna por el segundo puesto continental. La gran sorpresa es <strong style={{ color: '#e2e8f0' }}>Thiago</strong>, del Brentford, que con 22 dianas se cuela entre la élite y demuestra que el gol ya no es exclusivo de los grandes clubes.
          </p>
          <p>
            El ranking refleja la diversidad goleadora de Europa: La Liga aporta a Mbappé, Muriqi y Yamal; la Bundesliga a Kane, Undav y Schick; la Premier a Haaland y Thiago; y la Serie A a Lautaro Martínez. Para coronar al máximo goleador absoluto del continente entra en juego la <Link href="/bota-de-oro" style={{ color: '#f0c040', textDecoration: 'none' }}>Bota de Oro</Link>, que pondera los goles según la dificultad de cada liga.
          </p>
        </section>

        {/* Historical winners */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 16 }}>
            Máximos goleadores de Europa — Últimas temporadas (Bota de Oro)
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
            Preguntas frecuentes sobre los goleadores de Europa
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
              { href: '/goleadores-liga-espanola', label: 'Goleadores La Liga (Pichichi)' },
              { href: '/goleadores-premier-league', label: 'Goleadores Premier League' },
              { href: '/goleadores-serie-a', label: 'Goleadores Serie A' },
              { href: '/goleadores-bundesliga', label: 'Goleadores Bundesliga' },
              { href: '/goleadores-ligue-1', label: 'Goleadores Ligue 1' },
              { href: '/bota-de-oro', label: 'Bota de Oro' },
              { href: '/records', label: 'Records y líderes' },
              { href: '/', label: 'Top 25 en tiempo real' },
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
