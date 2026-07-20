import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import { PLAYERS } from '@/data/players'
import { iig, leagueCoef, IIG_EXPLAINER } from '@/lib/iig'
import type { PlayerData } from '@/types'

// Real, weighted Golden Shoe ranking ordered by IIG (league-weighted goals +
// rating quality + assists). Built from the static dataset, top 25 forwards.
interface BotaRow {
  pos: number
  name: string
  club: string
  league: string
  flag?: string
  goles: number
  coef: number
  iig: number
}

function buildBotaRanking(): BotaRow[] {
  const season = (Array.isArray(PLAYERS) ? PLAYERS : []).filter(
    (p): p is PlayerData => !!p && p.season === '2526' && (p.goles ?? 0) > 0
  )
  return season
    .map(p => ({ p, score: iig(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25)
    .map((entry, i) => ({
      pos: i + 1,
      name: entry.p.name,
      club: entry.p.club,
      league: entry.p.league,
      flag: entry.p.flag,
      goles: entry.p.goles ?? 0,
      coef: leagueCoef(entry.p.league),
      iig: entry.score,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const path = '/bota-de-oro'
  return {
    title: en
      ? 'European Golden Shoe 2025/26 — Race & Ranking'
      : 'Bota de Oro 2025/26 — European Golden Shoe & Ranking',
    description: en
      ? 'The European Golden Shoe 2025/26 race: how it is calculated with per-league coefficients, current contenders (Kane, Mbappé, Haaland) and past winners.'
      : 'Carrera por la Bota de Oro 2025/26 (European Golden Shoe). Cómo se calcula con coeficientes por liga, candidatos actuales (Kane, Mbappé, Haaland) e histórico de ganadores.',
    keywords: en
      ? [
          'european golden shoe', 'golden shoe 2025', 'golden boot europe',
          'european golden shoe 2025 2026', 'how is the golden shoe calculated', 'golden shoe winners',
          'europe top scorer coefficient', 'who will win the golden shoe',
          'golden shoe messi cristiano ronaldo',
        ]
      : [
          'bota de oro', 'bota de oro 2025', 'european golden shoe', 'golden boot europa',
          'bota de oro 2025 2026', 'cómo se calcula la bota de oro', 'ganadores bota de oro',
          'máximo goleador europa coeficiente', 'quién va a ganar la bota de oro',
          'bota de oro messi cristiano ronaldo',
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
        ? 'European Golden Shoe 2025/26 | TopScorers'
        : 'Bota de Oro 2025/26 — European Golden Shoe | TopScorers',
      description: en
        ? 'Who leads the 2025/26 European Golden Shoe, how it is calculated with per-league coefficients, and past winners.'
        : 'Quién lidera la Bota de Oro 2025/26, cómo se calcula con coeficientes por liga e histórico de ganadores.',
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630 }],
    },
  }
}

// ── Data ─────────────────────────────────────────────────────────────────────

// Coefficient ×2 applies to the 5 top-ranked UEFA leagues.
const CONTENDERS = {
  label: 'Temporada 2025/26',
  players: [
    { pos: 1, name: 'Harry Kane',     club: 'Bayern München',  league: 'Bundesliga',     goles: 33, coef: 2 },
    { pos: 2, name: 'Kylian Mbappé',  club: 'Real Madrid',     league: 'La Liga',        goles: 24, coef: 2 },
    { pos: 3, name: 'Erling Haaland', club: 'Manchester City', league: 'Premier League', goles: 24, coef: 2 },
    { pos: 4, name: 'Thiago',         club: 'Brentford',       league: 'Premier League', goles: 22, coef: 2 },
    { pos: 5, name: 'Vedat Muriqi',   club: 'Mallorca',        league: 'La Liga',        goles: 21, coef: 2 },
  ],
}

// Real European Golden Shoe winners with their weighted points (goals × league coefficient).
const HISTORICAL = [
  { season: '2024/25', winner: 'Kylian Mbappé',     club: 'Real Madrid',     goles: 31, pts: 62 },
  { season: '2023/24', winner: 'Harry Kane',         club: 'Bayern München',  goles: 36, pts: 72 },
  { season: '2022/23', winner: 'Erling Haaland',     club: 'Manchester City', goles: 36, pts: 72 },
  { season: '2021/22', winner: 'Robert Lewandowski', club: 'Bayern München',  goles: 35, pts: 70 },
  { season: '2020/21', winner: 'Robert Lewandowski', club: 'Bayern München',  goles: 41, pts: 82 },
  { season: '2019/20', winner: 'Ciro Immobile',      club: 'Lazio',           goles: 36, pts: 72 },
]

const FAQS = [
  {
    q: '¿Qué es la Bota de Oro?',
    a: 'La Bota de Oro (European Golden Shoe) es el galardón que premia al máximo goleador de las ligas europeas en cada temporada. Se concede desde 1968 y, a diferencia del Pichichi o la Golden Boot, no se limita a una sola liga: compara a los goleadores de toda Europa aplicando un coeficiente que iguala la dificultad de cada campeonato.',
  },
  {
    q: '¿Cómo se calcula la Bota de Oro?',
    a: 'Cada gol se multiplica por un coeficiente según el nivel de la liga: ×2 para las cinco grandes ligas (Inglaterra, España, Alemania, Italia y Francia), ×1,5 para las ligas situadas entre los puestos 6 y 21 del ranking UEFA, y ×1 para el resto. Gana quien sume más puntos. Así, 30 goles en La Liga (60 puntos) valen más que 30 goles en una liga menor.',
  },
  {
    q: '¿Quién lidera la Bota de Oro 2025/26?',
    a: 'Harry Kane (Bayern de Múnich) encabeza la carrera con 33 goles en la Bundesliga, que equivalen a 66 puntos. Le siguen Kylian Mbappé y Erling Haaland, ambos con 24 goles (48 puntos) en La Liga y la Premier League respectivamente.',
  },
  {
    q: '¿Quién tiene más Botas de Oro de la historia?',
    a: 'Lionel Messi es el máximo ganador con 6 Botas de Oro, por delante de Cristiano Ronaldo, que ha conseguido 4. Messi también firmó la mejor marca individual moderna con 50 goles en La Liga 2011/12.',
  },
  {
    q: '¿Qué diferencia hay entre la Bota de Oro, el Pichichi y la Golden Boot?',
    a: 'El Pichichi (España) y la Golden Boot (Inglaterra) premian al máximo goleador de una sola liga nacional. La Bota de Oro es un premio paneuropeo que enfrenta a los goleadores de todas las ligas del continente ponderando sus goles por coeficiente.',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Candidatos a la Bota de Oro 2025/26',
  description: 'Ranking de candidatos a la Bota de Oro (European Golden Shoe) 2025/26 con puntos por coeficiente de liga',
  url: 'https://www.top-scorers.com/bota-de-oro',
  numberOfItems: CONTENDERS.players.length,
  itemListElement: CONTENDERS.players.map((p) => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.name} — ${p.goles * p.coef} pts (${p.goles} goles, ${p.club})`,
    url: `https://www.top-scorers.com/bota-de-oro#pos-${p.pos}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Bota de Oro', item: 'https://www.top-scorers.com/bota-de-oro' },
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

export default async function BotaDeOroPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang: 'es' | 'en' = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const ranking = buildBotaRanking()
  return (
    <SaasShell activeKey="stats" breadcrumb={['Estadísticas', 'Bota de Oro']}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* H1 (breadcrumb is already shown in the SaaS topbar) */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: 'var(--ts-text)', marginBottom: 8 }}>
          Bota de Oro 2025/26
        </h1>
        <p style={{ color: 'var(--ts-muted)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          La <strong style={{ color: 'var(--ts-text)' }}>Bota de Oro</strong> (European Golden Shoe) premia al máximo goleador de Europa ponderando los goles por la dificultad de cada liga. Aquí tienes cómo se calcula, los candidatos de la temporada y el histórico de ganadores.
        </p>

        {/* How it works */}
        <section style={{ marginBottom: 40, color: 'var(--ts-muted)', lineHeight: 1.75, fontSize: 15 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 14 }}>
            Cómo se calcula la Bota de Oro
          </h2>
          <p style={{ marginBottom: 12 }}>
            Cada gol marcado en liga se multiplica por un <strong style={{ color: 'var(--ts-text)' }}>coeficiente</strong> según el nivel del campeonato en el ranking UEFA. Gana la Bota de Oro quien sume más puntos al final de la temporada.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
            {[
              { coef: '×2', desc: 'Las 5 grandes ligas: Inglaterra, España, Alemania, Italia y Francia' },
              { coef: '×1,5', desc: 'Ligas situadas entre los puestos 6 y 21 del ranking UEFA' },
              { coef: '×1', desc: 'Resto de ligas europeas' },
            ].map(({ coef, desc }) => (
              <div key={coef} style={{ flex: '1 1 240px', padding: '14px 16px', background: 'var(--ts-card2)', borderRadius: 10, border: '1px solid var(--ts-border)' }}>
                <span style={{ color: 'var(--ts-primary)', fontWeight: 800, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 20 }}>{coef}</span>
                <p style={{ color: 'var(--ts-muted)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--ts-faint)', fontSize: 13 }}>
            Ejemplo: 30 goles en La Liga equivalen a 60 puntos (×2), mientras que 30 goles en una liga de coeficiente ×1 valen solo 30 puntos.
          </p>
        </section>

        {/* Contenders table */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-primary)', marginBottom: 16 }}>
            Candidatos a la Bota de Oro — {CONTENDERS.label}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                  {['#', 'Jugador', 'Liga', 'Goles', 'Coef.', 'Puntos'].map(col => (
                    <th key={col} style={{ padding: '8px 12px', textAlign: col === 'Jugador' || col === 'Liga' ? 'left' : 'center', color: 'var(--ts-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONTENDERS.players.map((p) => (
                  <tr key={p.name} id={`pos-${p.pos}`} style={{ borderBottom: '1px solid var(--ts-divider)', transition: 'background 0.15s' }} className="hover:bg-white/5">
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: p.pos <= 3 ? 'var(--ts-primary)' : 'var(--ts-faint)', fontWeight: 700, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 13 }}>{p.pos}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--ts-text)', fontWeight: 600 }}>
                      {p.name}
                      <span style={{ display: 'block', color: 'var(--ts-muted)', fontWeight: 400, fontSize: 13 }}>{p.club}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--ts-muted)' }}>{p.league}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-text)', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{p.goles}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-muted)', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>×{p.coef}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 15 }}>{p.goles * p.coef}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 10, color: 'var(--ts-faint)', fontSize: 13 }}>
            Puntos = goles en liga × coeficiente. Datos actualizados, fuente: API-Football. Ver el{' '}
            <Link href="/maximos-goleadores-europa" style={{ color: 'var(--ts-primary)', textDecoration: 'none' }}>ranking de goleadores de Europa →</Link>
          </p>
        </section>

        {/* Real weighted ranking by IIG */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-primary)', marginBottom: 8 }}>
            {en ? 'Live ranking by IIG — Season 25/26' : 'Ranking en vivo por IIG — Temporada 25/26'}
          </h2>
          <p style={{ color: 'var(--ts-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
            {IIG_EXPLAINER[lang]}
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 0 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                  {[
                    { k: '#', align: 'center' as const },
                    { k: en ? 'Player' : 'Jugador', align: 'left' as const },
                    { k: en ? 'League' : 'Liga', align: 'left' as const },
                    { k: en ? 'Goals' : 'Goles', align: 'center' as const },
                    { k: en ? 'Coef.' : 'Coef.', align: 'center' as const },
                    { k: 'IIG', align: 'center' as const },
                  ].map(col => (
                    <th key={col.k} style={{ padding: '8px 12px', textAlign: col.align, color: 'var(--ts-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col.k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranking.map(r => (
                  <tr key={r.name + r.pos} style={{ borderBottom: '1px solid var(--ts-divider)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: r.pos <= 3 ? 'var(--ts-primary)' : 'var(--ts-muted)', fontWeight: 700, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 13 }}>{r.pos}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--ts-text)', fontWeight: 600 }}>
                      {r.flag ? `${r.flag} ` : ''}{r.name}
                      <span style={{ display: 'block', color: 'var(--ts-muted)', fontWeight: 400, fontSize: 13 }}>{r.club}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--ts-muted)' }}>{r.league}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-text)', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{r.goles}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-muted)', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>×{r.coef.toFixed(1)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 17 }}>{r.iig.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 10, color: 'var(--ts-faint)', fontSize: 13 }}>
            {en
              ? 'IIG (Striker Impact Index) is a TopScorers derived metric — league-weighted goals blended with season rating and assists. Source: API-Football.'
              : 'El IIG (Índice de Impacto del Goleador) es una métrica propia de TopScorers: goles ponderados por liga combinados con la nota de temporada y las asistencias. Fuente: API-Football.'}
          </p>
        </section>

        {/* Historical winners */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>
            Ganadores de la Bota de Oro — Últimas temporadas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HISTORICAL.map((h) => (
              <div key={h.season} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--ts-card2)', borderRadius: 10, border: '1px solid var(--ts-border)' }}>
                <span style={{ color: 'var(--ts-faint)', fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 13, width: 60, flexShrink: 0 }}>{h.season}</span>
                <span style={{ color: 'var(--ts-text)', fontWeight: 600, flex: 1 }}>{h.winner}</span>
                <span style={{ color: 'var(--ts-muted)', fontSize: 13 }}>{h.club}</span>
                <span style={{ color: 'var(--ts-muted)', fontSize: 13, fontFamily: 'JetBrains Mono, ui-monospace, monospace', width: 56, textAlign: 'right' }}>{h.goles}G</span>
                <span style={{ color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'JetBrains Mono, ui-monospace, monospace', width: 56, textAlign: 'right' }}>{h.pts} pts</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>
            Preguntas frecuentes sobre la Bota de Oro
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
            Más rankings de goleadores
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { href: '/maximos-goleadores-europa', label: 'Máximos goleadores de Europa' },
              { href: '/goleadores-liga-espanola', label: 'Goleadores La Liga (Pichichi)' },
              { href: '/goleadores-premier-league', label: 'Goleadores Premier League' },
              { href: '/goleadores-serie-a', label: 'Goleadores Serie A' },
              { href: '/goleadores-bundesliga', label: 'Goleadores Bundesliga' },
              { href: '/goleadores-ligue-1', label: 'Goleadores Ligue 1' },
              { href: '/records', label: 'Records y líderes' },
              { href: '/', label: 'Top 25 en tiempo real' },
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
