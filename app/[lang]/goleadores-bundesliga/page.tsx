import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/goleadores-bundesliga'
  return {
    title: 'Goleadores Bundesliga 2025/26 — Torjägerkanone y Máximos Anotadores | TopScorers',
    description: 'Ranking completo de goleadores de la Bundesliga 2025/26. Harry Kane, Undav, Schick… histórico de la Torjägerkanone y máximos goleadores del fútbol alemán.',
    keywords: [
      'goleadores bundesliga', 'máximos goleadores bundesliga', 'torjägerkanone 2025',
      'torjägerkanone 2026', 'top goleadores bundesliga', 'goles bundesliga 2025 2026',
      'clasificación goleadores bundesliga', 'pichichi bundesliga', 'goleadores liga alemana',
      'quien mete más goles en la bundesliga',
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
      title: 'Goleadores Bundesliga 2025/26 | TopScorers',
      description: 'Ranking completo de goleadores de la Bundesliga 2025/26 con histórico de la Torjägerkanone de las últimas temporadas.',
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
    { pos: 1, name: 'Harry Kane',      club: 'Bayern München',  goles: 33, pj: 29 },
    { pos: 2, name: 'Deniz Undav',     club: 'VfB Stuttgart',   goles: 18, pj: 27 },
    { pos: 3, name: 'Patrik Schick',   club: 'Bayer Leverkusen', goles: 16, pj: 26 },
    { pos: 4, name: 'Luis Díaz',       club: 'Bayern München',  goles: 15, pj: 30 },
    { pos: 5, name: 'Serhou Guirassy', club: 'B. Dortmund',     goles: 15, pj: 31 },
    { pos: 6, name: 'Michael Olise',   club: 'Bayern München',  goles: 14, pj: 29 },
  ],
}

// Real Bundesliga Torjägerkanone winners.
const HISTORICAL = [
  { season: '2024/25', winner: 'Harry Kane',                  club: 'Bayern München',  goles: 26 },
  { season: '2023/24', winner: 'Harry Kane',                  club: 'Bayern München',  goles: 36 },
  { season: '2022/23', winner: 'Füllkrug / Nkunku',           club: 'Bremen / Leipzig', goles: 16 },
  { season: '2021/22', winner: 'Robert Lewandowski',          club: 'Bayern München',  goles: 35 },
  { season: '2020/21', winner: 'Robert Lewandowski',          club: 'Bayern München',  goles: 41 },
]

const FAQS = [
  {
    q: '¿Quién es el máximo goleador de la Bundesliga en 2025/26?',
    a: 'Harry Kane (Bayern de Múnich) domina con autoridad la tabla de goleadores de la Bundesliga con 33 goles, muy por delante de Deniz Undav (Stuttgart) con 18 y Patrik Schick (Leverkusen) con 16. El inglés persigue el legendario récord de 41 goles de Lewandowski.',
  },
  {
    q: '¿Qué es la Torjägerkanone?',
    a: 'La Torjägerkanone ("cañón del goleador") es el trofeo que premia al máximo anotador de la Bundesliga cada temporada. Se entrega desde 1962 y es uno de los galardones individuales más prestigiosos del fútbol alemán, equivalente al Trofeo Pichichi en España o a la Golden Boot inglesa.',
  },
  {
    q: '¿Cuál es el récord de goles en una temporada de Bundesliga?',
    a: 'Robert Lewandowski marcó 41 goles en la temporada 2020/21, superando el histórico registro de 40 dianas de Gerd Müller que había resistido desde 1972. Es la mejor marca goleadora de la historia de la Bundesliga.',
  },
  {
    q: '¿Quién tiene más títulos de Torjägerkanone en la historia?',
    a: 'Gerd Müller es el máximo ganador histórico con 7 Torjägerkanonen. Robert Lewandowski le sigue de cerca con varios títulos consecutivos. Harry Kane se ha unido a la élite ganando el galardón en cada una de sus primeras temporadas en Alemania, una hazaña sin precedentes.',
  },
  {
    q: '¿Dónde puedo ver las estadísticas de goleadores de la Bundesliga en tiempo real?',
    a: 'En TopScorers.com puedes consultar el ranking de goleadores y asistentes de la Bundesliga actualizado en tiempo real, junto con las estadísticas de La Liga, la Premier League, la Serie A y la Ligue 1.',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Goleadores Bundesliga 2025/26',
  description: 'Ranking de máximos goleadores de la Bundesliga temporada 2025/26 (Torjägerkanone)',
  url: 'https://www.top-scorers.com/goleadores-bundesliga',
  numberOfItems: CURRENT_SEASON.players.length,
  itemListElement: CURRENT_SEASON.players.map((p) => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.name} — ${p.goles} goles (${p.club})`,
    url: `https://www.top-scorers.com/goleadores-bundesliga#pos-${p.pos}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Goleadores Bundesliga', item: 'https://www.top-scorers.com/goleadores-bundesliga' },
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

export default function GoleadoresBundesligaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex gap-1.5 items-center">
          <Link href="/" className="hover:text-gray-300 transition-colors">TopScorers</Link>
          <span>›</span>
          <span className="text-gray-400">Goleadores Bundesliga</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: '#eef4ff', marginBottom: 8 }}>
          Goleadores Bundesliga 2025/26
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Ranking actualizado de los máximos anotadores de la <strong style={{ color: '#e2e8f0' }}>Bundesliga</strong>, con goles, partidos jugados y media por encuentro. La carrera por la <strong style={{ color: '#e2e8f0' }}>Torjägerkanone</strong> y el histórico de ganadores de las últimas temporadas.
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
          <p style={{ marginTop: 10, color: '#475569', fontSize: 12 }}>
            Datos actualizados. Fuente: API-Football (Rapid API). Ver{' '}
            <Link href="/" style={{ color: '#f0c040', textDecoration: 'none' }}>estadísticas en tiempo real →</Link>
          </p>
        </section>

        {/* Explanatory content — important for SEO */}
        <section style={{ marginBottom: 40, color: '#94a3b8', lineHeight: 1.75, fontSize: 15 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 14 }}>
            Bundesliga 2025/26: análisis de la tabla de goleadores
          </h2>
          <p style={{ marginBottom: 12 }}>
            La temporada 2025/26 de la <strong style={{ color: '#e2e8f0' }}>Bundesliga</strong> está marcada por la exhibición goleadora de <strong style={{ color: '#e2e8f0' }}>Harry Kane</strong>, que con 33 goles aventaja en quince dianas al segundo clasificado. El delantero del <strong style={{ color: '#e2e8f0' }}>Bayern de Múnich</strong> apunta a su tercera Torjägerkanone consecutiva y amenaza el mítico récord de 41 goles de Lewandowski.
          </p>
          <p style={{ marginBottom: 12 }}>
            Por detrás, <strong style={{ color: '#e2e8f0' }}>Deniz Undav</strong> (Stuttgart) firma una gran campaña con 18 tantos y <strong style={{ color: '#e2e8f0' }}>Patrik Schick</strong> mantiene al Leverkusen en la pelea europea con 16. El Bayern coloca hasta tres futbolistas en el top, con Luis Díaz y Michael Olise sumándose a la fiesta ofensiva muniquesa.
          </p>
          <p>
            La Bundesliga sigue siendo la liga más prolífica de Europa en goles por partido, y la dependencia goleadora del campeón alemán respecto a Kane es uno de los grandes relatos de la temporada.
          </p>
        </section>

        {/* Historical Torjägerkanone */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: '#e2e8f0', marginBottom: 16 }}>
            Histórico Torjägerkanone — Últimas Temporadas
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
            Preguntas Frecuentes sobre Goleadores de la Bundesliga
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
              { href: '/goleadores-ligue-1', label: 'Goleadores Ligue 1' },
              { href: '/bota-de-oro', label: 'Bota de Oro' },
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
    </>
  )
}
