import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import RelatedLinks from '@/components/RelatedLinks'
import { PLAYERS } from '@/data/players'
import { iig } from '@/lib/iig'
import { shortName } from '@/lib/player-name'
import { CURRENT_SEASON_LONG } from '@/lib/season'
import type { PlayerData } from '@/types'

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const path = '/records'
  return {
    title: en
      ? `Top Scorer Records & Leaders ${CURRENT_SEASON_LONG} — Goals, Assists & Ratings`
      : `Records y Líderes ${CURRENT_SEASON_LONG} — Goleadores, Asistencias y Nota`,
    description: en
      ? `Season ${CURRENT_SEASON_LONG} leaders and records: top scorer (IIG), most goals, most assists, best shot conversion, most key passes and best average rating. Real stats from Europe's top leagues.`
      : `Líderes y récords de la temporada ${CURRENT_SEASON_LONG}: máximo goleador (IIG), más goles, más asistencias, mejor conversión, más pases clave y mejor nota media. Datos reales de las ligas europeas.`,
    keywords: en
      ? [
          'top scorer records', 'league leaders 2025 2026', 'top goalscorer europe',
          'most assists', 'best average rating footballer', 'best shot conversion',
          'season leaders stats', 'football records 2025 2026',
        ]
      : [
          'records goleadores', 'líderes liga 2025 2026', 'máximo goleador europa',
          'más asistencias', 'mejor nota media futbolista', 'mejor conversión tiros',
          'estadísticas líderes temporada', 'records futbol 2025 2026',
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
        ? `Top Scorer Records & Leaders ${CURRENT_SEASON_LONG} | TopScorers`
        : `Records y Líderes ${CURRENT_SEASON_LONG} | TopScorers`,
      description: en
        ? `Season ${CURRENT_SEASON_LONG} leaders in goals, assists, conversion, key passes and average rating. Real stats.`
        : `Los líderes de la temporada ${CURRENT_SEASON_LONG} en goles, asistencias, conversión, pases clave y nota media. Datos reales.`,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630 }],
    },
  }
}

// ── Data ─────────────────────────────────────────────────────────────────────

interface LeaderRow {
  name: string
  club: string
  league: string
  flag?: string
  value: string
  raw: number
}

const SEASON: PlayerData[] = (Array.isArray(PLAYERS) ? PLAYERS : []).filter(
  (p): p is PlayerData => !!p && p.season === '2526'
)

// Deduplicate by name keeping the highest scorer per name (defensive: the
// dataset is single-season here but a name could appear twice).
function dedupe(list: PlayerData[]): PlayerData[] {
  const seen = new Map<string, PlayerData>()
  for (const p of list) {
    const prev = seen.get(p.name)
    if (!prev || (p.goles ?? 0) > (prev.goles ?? 0)) seen.set(p.name, p)
  }
  return Array.from(seen.values())
}

const POOL = dedupe(SEASON)

function topBy(
  score: (p: PlayerData) => number,
  format: (p: PlayerData) => string,
  filter?: (p: PlayerData) => boolean,
  limit = 10,
): LeaderRow[] {
  return POOL
    .filter(p => (filter ? filter(p) : true))
    .map(p => ({ p, raw: score(p) }))
    .filter(e => e.raw > 0)
    .sort((a, b) => b.raw - a.raw)
    .slice(0, limit)
    .map(({ p, raw }) => ({
      name: shortName(p),
      club: p.club,
      league: p.league,
      flag: p.flag,
      value: format(p),
      raw,
    }))
}

function keyPassesOf(p: PlayerData): number {
  return p.keyPasses ?? p.passesKey ?? 0
}

function conversion(p: PlayerData): number {
  const total = p.shotsTotal ?? 0
  if (total <= 0) return 0
  return (p.goles ?? 0) / total
}

const RECORDS: { id: string; title: { es: string; en: string }; note?: { es: string; en: string }; rows: LeaderRow[] }[] = [
  {
    id: 'iig',
    title: { es: 'Máximo goleador (IIG)', en: 'Top striker (IIG)' },
    note: { es: 'Líder por el Índice de Impacto del Goleador.', en: 'Leader by the Striker Impact Index.' },
    rows: topBy(p => iig(p), p => iig(p).toFixed(1)),
  },
  {
    id: 'goals',
    title: { es: 'Más goles', en: 'Most goals' },
    rows: topBy(p => p.goles ?? 0, p => String(p.goles ?? 0)),
  },
  {
    id: 'assists',
    title: { es: 'Más asistencias', en: 'Most assists' },
    rows: topBy(p => p.asist ?? 0, p => String(p.asist ?? 0)),
  },
  {
    id: 'conversion',
    title: { es: 'Mejor conversión', en: 'Best conversion' },
    note: { es: 'Goles ÷ tiros totales (mín. 20 tiros).', en: 'Goals ÷ total shots (min. 20 shots).' },
    rows: topBy(
      p => conversion(p),
      p => `${(conversion(p) * 100).toFixed(0)}%`,
      p => (p.shotsTotal ?? 0) >= 20,
    ),
  },
  {
    id: 'keypasses',
    title: { es: 'Más pases clave', en: 'Most key passes' },
    rows: topBy(p => keyPassesOf(p), p => String(keyPassesOf(p))),
  },
  {
    id: 'rating',
    title: { es: 'Mejor nota media', en: 'Best average rating' },
    note: { es: 'Nota media de temporada (mín. 10 PJ).', en: 'Average season rating (min. 10 apps).' },
    rows: topBy(
      p => (typeof p.rating === 'number' ? p.rating : 0),
      p => (typeof p.rating === 'number' ? p.rating.toFixed(2) : '—'),
      p => (p.pj ?? 0) >= 10 && typeof p.rating === 'number' && p.rating > 0,
    ),
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const iigLeaders = RECORDS.find(r => r.id === 'iig')?.rows ?? []
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `Líderes y récords ${CURRENT_SEASON_LONG}`,
  description: `Líderes de la temporada ${CURRENT_SEASON_LONG} por Índice de Impacto del Goleador (IIG)`,
  url: 'https://www.top-scorers.com/records',
  numberOfItems: iigLeaders.length,
  itemListElement: iigLeaders.map((r, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `${r.name} — IIG ${r.value} (${r.club})`,
    url: `https://www.top-scorers.com/records#iig`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: 'Records', item: 'https://www.top-scorers.com/records' },
  ],
}

// ── Page ─────────────────────────────────────────────────────────────────────

const headingStyle = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
}

function LeaderTable({ rows, lang }: { rows: LeaderRow[]; lang: 'es' | 'en' }) {
  const en = lang === 'en'
  if (rows.length === 0) {
    return (
      <p style={{ color: 'var(--ts-faint)', fontSize: 13 }}>
        {en ? 'No qualifying players yet.' : 'Aún no hay jugadores que cumplan el criterio.'}
      </p>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
            {[
              { k: '#', align: 'center' as const },
              { k: en ? 'Player' : 'Jugador', align: 'left' as const },
              { k: en ? 'League' : 'Liga', align: 'left' as const },
              { k: en ? 'Value' : 'Valor', align: 'center' as const },
            ].map(col => (
              <th key={col.k} style={{ padding: '8px 12px', textAlign: col.align, color: 'var(--ts-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col.k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name + i} style={{ borderBottom: '1px solid var(--ts-divider)' }}>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: i < 3 ? 'var(--ts-primary)' : 'var(--ts-muted)', fontWeight: 700, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 13 }}>{i + 1}</td>
              <td style={{ padding: '10px 12px', color: 'var(--ts-text)', fontWeight: 600 }}>
                {r.flag ? `${r.flag} ` : ''}{r.name}
                <span style={{ display: 'block', color: 'var(--ts-muted)', fontWeight: 400, fontSize: 13 }}>{r.club}</span>
              </td>
              <td style={{ padding: '10px 12px', color: 'var(--ts-muted)' }}>{r.league}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 17 }}>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function RecordsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang: 'es' | 'en' = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  return (
    <SaasShell activeKey="stats" breadcrumb={en ? ['Statistics', 'Records'] : ['Estadísticas', 'Records']}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs mb-6 flex gap-1.5 items-center" style={{ color: 'var(--ts-faint)' }}>
          <Link href="/" style={{ color: 'var(--ts-muted)', textDecoration: 'none' }}>TopScorers</Link>
          <span>›</span>
          <span style={{ color: 'var(--ts-muted)' }}>Records</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: 'var(--ts-text)', marginBottom: 8 }}>
          {en ? `Records & Leaders ${CURRENT_SEASON_LONG}` : `Records y Líderes ${CURRENT_SEASON_LONG}`}
        </h1>
        <p style={{ color: 'var(--ts-muted)', marginBottom: 12, fontSize: 16, lineHeight: 1.6 }}>
          {en
            ? `Season leaders across the European leagues we track — most goals, assists, best conversion, key passes and average rating, plus our IIG striker leader. All figures are real ${CURRENT_SEASON_LONG} season stats.`
            : `Líderes de la temporada ${CURRENT_SEASON_LONG} en las ligas europeas que seguimos: más goles, asistencias, mejor conversión, pases clave y nota media, además del líder por IIG. Todas las cifras son estadísticas reales de la temporada ${CURRENT_SEASON_LONG}.`}
        </p>
        <p style={{ color: 'var(--ts-faint)', marginBottom: 32, fontSize: 13, lineHeight: 1.6 }}>
          {en
            ? 'Note: these are current-season records. For historical Golden Shoe winners see the Bota de Oro page.'
            : 'Nota: son récords de la temporada en curso. Para ganadores históricos de la Bota de Oro consulta esa página.'}
        </p>

        {/* Record sections */}
        {RECORDS.map(rec => (
          <section key={rec.id} id={rec.id} style={{ marginBottom: 40 }}>
            <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-primary)', marginBottom: rec.note ? 4 : 16 }}>
              {rec.title[lang]}
            </h2>
            {rec.note && (
              <p style={{ color: 'var(--ts-muted)', fontSize: 13, marginBottom: 14 }}>{rec.note[lang]}</p>
            )}
            <LeaderTable rows={rec.rows} lang={lang} />
          </section>
        ))}

        <p style={{ marginBottom: 32, color: 'var(--ts-faint)', fontSize: 13, lineHeight: 1.6 }}>
          {en
            ? 'IIG (Striker Impact Index) is a TopScorers derived metric: league-weighted goals blended with season rating and assists. Source: API-Football.'
            : 'El IIG (Índice de Impacto del Goleador) es una métrica propia de TopScorers: goles ponderados por liga combinados con la nota de temporada y las asistencias. Fuente: API-Football.'}
        </p>

        <RelatedLinks
          title={en ? 'Related rankings' : 'Rankings relacionados'}
          exclude={['/records']}
        />

      </div>
    </SaasShell>
  )
}
