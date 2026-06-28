import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang = isLocale(raw) ? raw : 'en'
  const path = '/europe-top-scorers'
  return {
    title: "Europe's Top Scorers 2025/26 — Top Goalscorers Ranking",
    description:
      "Europe's top scorers 2025/26: the live goalscoring ranking across the big five leagues. Kane, Mbappé, Haaland and more — goals, games and goals-per-match for every top scorer.",
    keywords: [
      'europe top scorers', 'european top scorers', 'european top scorer', 'europe top scorer',
      "europe's top scorers", 'top scorers europe', 'european golden boot', 'best goalscorers europe',
      'who is the top scorer in europe', 'top goalscorers europe 2025 2026',
      'la liga premier league bundesliga serie a ligue 1 top scorers',
    ],
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        en: `https://www.top-scorers.com/en${path}`,
        es: `https://www.top-scorers.com/es${path}`,
        'x-default': `https://www.top-scorers.com/en${path}`,
      },
    },
    openGraph: {
      title: "Europe's Top Scorers 2025/26 | TopScorers",
      description:
        "The live ranking of Europe's top goalscorers across the big five leagues, updated with goals, games and goals per match.",
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-default-${lang}.jpg`, width: 1200, height: 630 }],
    },
  }
}

// ── Data ─────────────────────────────────────────────────────────────────────
// Curated big-five top-10 (mirrors /maximos-goleadores-europa, kept in sync).

const CURRENT_SEASON = {
  label: '2025/26 season',
  players: [
    { pos: 1,  name: 'Harry Kane',       club: 'Bayern München',  league: 'Bundesliga',      goals: 33, gp: 29 },
    { pos: 2,  name: 'Kylian Mbappé',    club: 'Real Madrid',      league: 'La Liga',         goals: 24, gp: 28 },
    { pos: 3,  name: 'Erling Haaland',   club: 'Manchester City',  league: 'Premier League',  goals: 24, gp: 32 },
    { pos: 4,  name: 'Thiago',           club: 'Brentford',        league: 'Premier League',  goals: 22, gp: 35 },
    { pos: 5,  name: 'Vedat Muriqi',     club: 'Mallorca',         league: 'La Liga',         goals: 21, gp: 33 },
    { pos: 6,  name: 'Esteban Lepaul',   club: 'Stade Rennais',    league: 'Ligue 1',         goals: 18, gp: 30 },
    { pos: 7,  name: 'Deniz Undav',      club: 'VfB Stuttgart',    league: 'Bundesliga',      goals: 18, gp: 27 },
    { pos: 8,  name: 'Lamine Yamal',     club: 'FC Barcelona',     league: 'La Liga',         goals: 16, gp: 28 },
    { pos: 9,  name: 'Patrik Schick',    club: 'Bayer Leverkusen', league: 'Bundesliga',      goals: 16, gp: 26 },
    { pos: 10, name: 'Lautaro Martínez', club: 'Inter Milan',      league: 'Serie A',         goals: 16, gp: 26 },
  ],
}

// European Golden Shoe winners (Europe's top scorer by league-weighted coefficient).
const HISTORICAL = [
  { season: '2024/25', winner: 'Kylian Mbappé',      club: 'Real Madrid',     league: 'La Liga',     goals: 31 },
  { season: '2023/24', winner: 'Harry Kane',          club: 'Bayern München',  league: 'Bundesliga',  goals: 36 },
  { season: '2022/23', winner: 'Erling Haaland',      club: 'Manchester City', league: 'Premier',     goals: 36 },
  { season: '2021/22', winner: 'Robert Lewandowski',  club: 'Bayern München',  league: 'Bundesliga',  goals: 35 },
  { season: '2020/21', winner: 'Robert Lewandowski',  club: 'Bayern München',  league: 'Bundesliga',  goals: 41 },
]

const FAQS = [
  {
    q: "Who is Europe's top scorer in 2025/26?",
    a: "Harry Kane (Bayern Munich) leads Europe's top scorers in 2025/26 with 33 goals across the big five leagues, ahead of Kylian Mbappé (Real Madrid) and Erling Haaland (Manchester City), both on 24. The ranking combines goals scored in La Liga, the Premier League, the Bundesliga, Serie A and Ligue 1.",
  },
  {
    q: "How is Europe's top scorer decided?",
    a: "There are two ways. The simplest is the raw goal ranking across all leagues — whoever scores most wins. The official one is the European Golden Shoe, which applies a per-league coefficient (×2 for the big five) to balance how hard each league is. See our Golden Boot page for the full calculation.",
  },
  {
    q: 'What is the record for goals in a season in the big European leagues?',
    a: 'Lionel Messi scored 50 league goals in La Liga in 2011/12, the highest single-season tally in any of the big five leagues. Robert Lewandowski holds the Bundesliga record with 41 goals (2020/21), beating Gerd Müller’s 40.',
  },
  {
    q: "Which leagues count for Europe's top scorers ranking?",
    a: "This ranking covers the top scorers in the big five leagues: La Liga (Spain), the Premier League (England), the Bundesliga (Germany), Serie A (Italy) and Ligue 1 (France). TopScorers also tracks Portugal, Turkey and Greece, plus the Champions League.",
  },
  {
    q: "Where can I see Europe's top scorers ranking in real time?",
    a: 'On TopScorers.com you get the live Top 25 of Europe’s scorers and assist leaders, updated in real time with filters by league, age and season, plus a player comparison tool.',
  },
]

// ── JSON-LD ───────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: "Europe's top scorers 2025/26",
  description: "Ranking of the top goalscorers across the big five European leagues in the 2025/26 season",
  url: 'https://www.top-scorers.com/en/europe-top-scorers',
  numberOfItems: CURRENT_SEASON.players.length,
  itemListElement: CURRENT_SEASON.players.map((p) => ({
    '@type': 'ListItem',
    position: p.pos,
    name: `${p.name} — ${p.goals} goals (${p.club}, ${p.league})`,
    url: `https://www.top-scorers.com/en/europe-top-scorers#pos-${p.pos}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TopScorers', item: 'https://www.top-scorers.com' },
    { '@type': 'ListItem', position: 2, name: "Europe's top scorers", item: 'https://www.top-scorers.com/en/europe-top-scorers' },
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

export default function EuropeTopScorersPage() {
  return (
    <SaasShell activeKey="leagues" breadcrumb={['Competitions', "Europe's top scorers"]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-[900px] mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs mb-6 flex gap-1.5 items-center" style={{ color: 'var(--ts-faint)' }}>
          <Link href="/" style={{ color: 'var(--ts-muted)', textDecoration: 'none' }}>TopScorers</Link>
          <span>›</span>
          <span style={{ color: 'var(--ts-muted)' }}>Europe&apos;s top scorers</span>
        </nav>

        {/* H1 */}
        <h1 style={{ ...headingStyle, fontSize: 38, color: 'var(--ts-text)', marginBottom: 8 }}>
          Europe&apos;s Top Scorers 2025/26
        </h1>
        <p style={{ color: 'var(--ts-muted)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          The ranking of the <strong style={{ color: 'var(--ts-text)' }}>top goalscorers across the big five European leagues</strong> — La Liga, the Premier League, the Bundesliga, Serie A and Ligue 1 — with goals, games played and goals per match. The race for the season&apos;s <Link href="/bota-de-oro" style={{ color: 'var(--ts-primary)', textDecoration: 'none' }}>European Golden Boot</Link>.
        </p>

        {/* Current season table */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-primary)', marginBottom: 16 }}>
            Top 10 scorers — {CURRENT_SEASON.label}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                  {['#', 'Player', 'League', 'GP', 'Goals', 'Avg'].map(col => (
                    <th key={col} style={{ padding: '8px 12px', textAlign: col === 'Player' || col === 'League' ? 'left' : 'center', color: 'var(--ts-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CURRENT_SEASON.players.map((p) => (
                  <tr key={p.name} id={`pos-${p.pos}`} style={{ borderBottom: '1px solid var(--ts-divider)', transition: 'background 0.15s' }} className="hover:bg-white/5">
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: p.pos <= 3 ? 'var(--ts-primary)' : 'var(--ts-faint)', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{p.pos}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--ts-text)', fontWeight: 600 }}>
                      {p.name}
                      <span style={{ display: 'block', color: 'var(--ts-muted)', fontWeight: 400, fontSize: 13 }}>{p.club}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--ts-muted)' }}>{p.league}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-muted)', fontFamily: 'monospace' }}>{p.gp}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{p.goals}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ts-muted)', fontFamily: 'monospace' }}>{(p.goals / p.gp).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 10, color: 'var(--ts-faint)', fontSize: 13 }}>
            Data updated regularly. Source: API-Football. See the{' '}
            <Link href="/" style={{ color: 'var(--ts-primary)', textDecoration: 'none' }}>live Top 25 scorers →</Link>
          </p>
        </section>

        {/* Explanatory content */}
        <section style={{ marginBottom: 40, color: 'var(--ts-muted)', lineHeight: 1.75, fontSize: 15 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 14 }}>
            Europe&apos;s goalscoring race in 2025/26
          </h2>
          <p style={{ marginBottom: 12 }}>
            The 2025/26 season confirms <strong style={{ color: 'var(--ts-text)' }}>Harry Kane</strong> as the most lethal striker on the continent. The England forward at <strong style={{ color: 'var(--ts-text)' }}>Bayern Munich</strong> has 33 Bundesliga goals, extending a run that already earned him the Golden Shoe in 2023/24 and cementing him as the German league&apos;s leading marksman.
          </p>
          <p style={{ marginBottom: 12 }}>
            Behind him, the duel between <strong style={{ color: 'var(--ts-text)' }}>Kylian Mbappé</strong> (Real Madrid) and <strong style={{ color: 'var(--ts-text)' }}>Erling Haaland</strong> (Manchester City), level on 24 goals, keeps the fight for second place on the continent alive. The big surprise is <strong style={{ color: 'var(--ts-text)' }}>Thiago</strong> of Brentford, whose 22 goals break him into the elite and prove that scoring is no longer the preserve of the giant clubs.
          </p>
          <p>
            The ranking reflects Europe&apos;s goalscoring spread: La Liga contributes Mbappé, Muriqi and Yamal; the Bundesliga Kane, Undav and Schick; the Premier League Haaland and Thiago; and Serie A Lautaro Martínez. To crown the single top scorer of the continent, the <Link href="/bota-de-oro" style={{ color: 'var(--ts-primary)', textDecoration: 'none' }}>European Golden Boot</Link> comes into play, weighting goals by the difficulty of each league.
          </p>
        </section>

        {/* Historical winners */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>
            Europe&apos;s top scorers — recent seasons (Golden Shoe)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HISTORICAL.map((h) => (
              <div key={h.season} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--ts-card2)', borderRadius: 10, border: '1px solid var(--ts-border)' }}>
                <span style={{ color: 'var(--ts-faint)', fontFamily: 'monospace', fontSize: 13, width: 60, flexShrink: 0 }}>{h.season}</span>
                <span style={{ color: 'var(--ts-text)', fontWeight: 600, flex: 1 }}>{h.winner}</span>
                <span style={{ color: 'var(--ts-muted)', fontSize: 13 }}>{h.club}</span>
                <span style={{ color: 'var(--ts-primary)', fontWeight: 700, fontFamily: 'monospace', width: 50, textAlign: 'right' }}>{h.goals}G</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ ...headingStyle, fontSize: 22, color: 'var(--ts-text)', marginBottom: 16 }}>
            Europe&apos;s top scorers — frequently asked questions
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
            More top scorer rankings
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { href: '/maximos-goleadores-europa', label: 'Goleadores de Europa (ES)' },
              { href: '/goleadores-liga-espanola', label: 'La Liga top scorers (Pichichi)' },
              { href: '/goleadores-premier-league', label: 'Premier League top scorers' },
              { href: '/goleadores-serie-a', label: 'Serie A top scorers' },
              { href: '/goleadores-bundesliga', label: 'Bundesliga top scorers' },
              { href: '/goleadores-ligue-1', label: 'Ligue 1 top scorers' },
              { href: '/bota-de-oro', label: 'European Golden Boot' },
              { href: '/records', label: 'Records & leaders' },
              { href: '/', label: 'Live Top 25' },
              { href: '/competiciones', label: 'All leagues' },
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
