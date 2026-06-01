import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = '/goleadores-liga-espanola'
  return {
    title: 'Goleadores Liga Española 2025/26 — Top Máximos Anotadores | TopScorers',
    description: 'Ranking completo de goleadores de La Liga Española 2025/26. Mbappé, Muriqi, Yamal, Vinicius… histórico de máximos goleadores de la liga desde 2022.',
    keywords: [
      'goleadores liga española', 'goleadores la liga', 'máximos goleadores la liga',
      'pichichi 2025', 'pichichi 2026', 'top goleadores liga española',
      'estadísticas goles la liga', 'goles laliga 2025 2026',
      'goleadores primera división española', 'quien mete más goles en la liga',
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
      title: 'Goleadores Liga Española 2025/26 | TopScorers',
      description: 'Ranking completo de goleadores de La Liga EA Sports 2025/26 con histórico de las últimas temporadas.',
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
    { pos: 1,  name: 'Kylian Mbappé',      club: 'Real Madrid',     goles: 24, pj: 28 },
    { pos: 2,  name: 'Vedat Muriqi',        club: 'Mallorca',        goles: 21, pj: 33 },
    { pos: 3,  name: 'Lamine Yamal',        club: 'FC Barcelona',    goles: 16, pj: 28 },
    { pos: 4,  name: 'Ante Budimir',        club: 'Osasuna',         goles: 16, pj: 33 },
    { pos: 5,  name: 'Vinicius Junior',     club: 'Real Madrid',     goles: 15, pj: 33 },
    { pos: 6,  name: 'Ferran Torres',       club: 'FC Barcelona',    goles: 15, pj: 30 },
    { pos: 7,  name: 'Mikel Oyarzabal',     club: 'Real Sociedad',   goles: 14, pj: 29 },
    { pos: 8,  name: 'Raphinha',            club: 'FC Barcelona',    goles: 10, pj: 27 },
  ],
}

const HISTORICAL = [
  {
    season: '2024/25',
    winner: 'Kylian Mbappé',
    club: 'Real Madrid',
    goles: 31,
    pj: 35,
  },
  {
    season: '2023/24',
    winner: 'Artem Dovbyk',
    club: 'Girona FC',
    goles: 24,
    pj: 36,
  },
  {
    season: '2022/23',
    winner: 'Robert Lewandowski',
    club: 'FC Barcelona',
    goles: 23,
    pj: 34,
  },
  {
    season: '2021/22',
    winner: 'Karim Benzema',
    club: 'Real Madrid',
    goles: 27,
    pj: 32,
  },
  {
    season: '2020/21',
    winner: 'Lionel Messi',
    club: 'FC Barcelona',
    goles: 30,
    pj: 35,
  },
]

const FAQS = [
  {
    q: '¿Quién es el máximo goleador de La Liga en 2025/26?',
    a: 'Kylian Mbappé (Real Madrid) lidera el ranking con 24 goles en 28 partidos a falta de jornadas por disputar. Le siguen Vedat Muriqi (Mallorca) con 21 goles y Lamine Yamal (Barcelona) con 16.',
  },
  {
    q: '¿Qué es el Trofeo Pichichi?',
    a: 'El Trofeo Pichichi es el galardón que otorga el diario Marca al máximo goleador de La Liga española cada temporada. Su nombre homenajea a Rafael Moreno "Pichichi", delantero del Athletic Club que fue uno de los primeros grandes goleadores del fútbol español, fallecido en 1922.',
  },
  {
    q: '¿Quién tiene más Trofeos Pichichi en la historia de La Liga?',
    a: 'Lionel Messi es el jugador con más Trofeos Pichichi de la historia, con 8 galardones (2009/10, 2011/12, 2012/13, 2016/17, 2017/18, 2018/19, 2019/20 y 2021/22 con Messi compartido). Telmo Zarra ostenta el récord histórico de goles en La Liga con 251 tantos en 278 partidos.',
  },
  {
    q: '¿Cuántos goles hay que marcar para ganar el Pichichi?',
    a: 'No hay un mínimo fijo: depende de la competencia de esa temporada. En temporadas recientes, el ganador ha necesitado entre 23 y 31 goles. Mbappé ganó en 2024/25 con 31 goles, mientras que Dovbyk lo hizo en 2023/24 con 24.',
  },
  {
    q: '¿Dónde puedo ver las estadísticas de goleadores de La Liga en tiempo real?',
    a: 'En TopScorers.com puedes consultar el ranking de goleadores y asistentes de La Liga actualizado en tiempo real, junto con estadísticas de la Premier League, Bundesliga, Serie A y Ligue 1.',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Goleadores La Liga Española 2025/26',
  description: 'Ranking de máximos goleadores de La Liga EA Sports temporada 2025/26',
  url: 'https://www.top-scorers.com/goleadores-liga-espanola',
  numberOfItems: CURRENT_SEASON.players.length,
  itemListElement: CURRENT_SEASON.players.map((p) => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.name} — ${p.goles} goles (${p.club})`,
    url: `https://www.top-scorers.com/goleadores-liga-espanola#pos-${p.pos}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Goleadores La Liga', item: 'https://www.top-scorers.com/goleadores-liga-espanola' },
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

export default function GoleadoresLigaEspanolaPage() {
  return (
    <SaasShell activeKey="leagues" breadcrumb={['Competiciones', 'Goleadores La Liga']}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs mb-6 flex gap-1.5 items-center" style={{ color: 'var(--ts-faint)' }}>
          <Link href="/" style={{ color: 'var(--ts-muted)', textDecoration: 'none' }}>TopScorers</Link>
          <span>›</span>
          <span style={{ color: 'var(--ts-muted)' }}>Goleadores La Liga</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: 'var(--ts-text)', marginBottom: 8 }}>
          Goleadores Liga Española 2025/26
        </h1>
        <p style={{ color: 'var(--ts-muted)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Ranking actualizado de los máximos anotadores de <strong style={{ color: 'var(--ts-text)' }}>La Liga EA Sports</strong>, con datos de goles, partidos jugados y media por encuentro. Incluye histórico del <strong style={{ color: 'var(--ts-text)' }}>Trofeo Pichichi</strong> de las últimas temporadas.
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
            La Liga 2025/26: análisis de la tabla de goleadores
          </h2>
          <p style={{ marginBottom: 12 }}>
            La temporada 2025/26 de <strong style={{ color: 'var(--ts-text)' }}>La Liga EA Sports</strong> está marcada por el duelo entre el poderío goleador de <strong style={{ color: 'var(--ts-text)' }}>Real Madrid</strong> y <strong style={{ color: 'var(--ts-text)' }}>FC Barcelona</strong>, con <strong style={{ color: 'var(--ts-text)' }}>Kylian Mbappé</strong> liderando con 24 dianas en 28 partidos. El delantero francés, en su segunda temporada en el Santiago Bernabéu, sigue la estela de su extraordinaria campaña 2024/25 cuando se proclamó Pichichi con 31 goles.
          </p>
          <p style={{ marginBottom: 12 }}>
            La sorpresa de la temporada es <strong style={{ color: 'var(--ts-text)' }}>Vedat Muriqi</strong> del Mallorca, que con 21 goles se mantiene como el segundo máximo goleador de la competición y demuestra que los equipos modestos también tienen artilleros de élite. <strong style={{ color: 'var(--ts-text)' }}>Lamine Yamal</strong>, con apenas 17 años, comparte el tercer puesto y confirma que puede convertirse en uno de los grandes goleadores de la próxima década.
          </p>
          <p>
            La diferencia entre el primero (24 goles) y el octavo (10 goles) refleja la concentración del talento goleador en los grandes clubes, aunque Muriqi y Budimir del Osasuna rompen esa tendencia desde la zona media-baja de la tabla.
          </p>
        </section>

        {/* Historical Pichichi */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>
            Histórico Trofeo Pichichi — Últimas Temporadas
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
            Preguntas Frecuentes sobre Goleadores de La Liga
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
              { href: '/goleadores-premier-league', label: 'Goleadores Premier League' },
              { href: '/goleadores-serie-a', label: 'Goleadores Serie A' },
              { href: '/goleadores-bundesliga', label: 'Goleadores Bundesliga' },
              { href: '/goleadores-ligue-1', label: 'Goleadores Ligue 1' },
              { href: '/bota-de-oro', label: 'Bota de Oro' },
              { href: '/records', label: 'Records y líderes' },
              { href: '/', label: 'Goleadores en tiempo real' },
              { href: '/competiciones', label: 'Todas las ligas' },
              { href: '/mundial-2026', label: 'Mundial 2026' },
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
