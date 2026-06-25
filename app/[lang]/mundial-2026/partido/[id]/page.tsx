import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import CrestImg from '@/components/saas/CrestImg'
import {
  getMatchDetail,
  getStatusLabel,
  type FixtureLineup,
  type FixtureEvent,
  type FixturePlayersGroup,
  type FixtureTeamStatistics,
  type LineupPlayer,
} from '@/lib/api-football'
import { slugify } from '@/lib/slugify'

// A match can be live → revalidate frequently (ISR). Fully defensive: missing
// data hides the section; a missing fixture renders a graceful not-found state.
export const revalidate = 300

const t = (lang: 'es' | 'en', es: string, en: string) => (lang === 'en' ? en : es)

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang: raw, id } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const path = `/mundial-2026/partido/${id}`
  const detail = await getMatchDetail(Number(id) || 0)
  const fx = detail.fixture

  const home = fx?.teams.home.name ?? ''
  const away = fx?.teams.away.name ?? ''
  const matchup = home && away ? `${home} vs ${away}` : t(lang, 'Partido', 'Match')
  const scored = fx && fx.goals.home != null && fx.goals.away != null
  const scoreStr = scored ? ` (${fx!.goals.home}-${fx!.goals.away})` : ''

  const title = lang === 'en'
    ? `${matchup}${scoreStr}: Lineups, Stats & Timeline — World Cup 2026`
    : `${matchup}${scoreStr}: Alineaciones, Estadísticas y Goles — Mundial 2026`
  const description = lang === 'en'
    ? `${matchup} at the 2026 World Cup: starting lineups, formations, goals and assists, cards, substitutions and full team stats.`
    : `${matchup} en el Mundial 2026: alineaciones, formaciones, goles y asistencias, tarjetas, cambios y estadísticas completas del partido.`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | TopScorers`,
      description,
      url: `https://www.top-scorers.com/${lang}${path}`,
      siteName: 'TopScorers',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `https://www.top-scorers.com/og-mundial-${lang}.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | TopScorers`, description },
    alternates: {
      canonical: `https://www.top-scorers.com/${lang}${path}`,
      languages: {
        es: `https://www.top-scorers.com/es${path}`,
        en: `https://www.top-scorers.com/en${path}`,
        'x-default': `https://www.top-scorers.com/es${path}`,
      },
    },
    keywords: [`${matchup} mundial 2026`, `${matchup} world cup 2026`, 'alineaciones', 'lineups', 'mundial 2026', 'world cup 2026'],
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FINISHED = ['FT', 'AET', 'PEN']

function statusLabel(short: string, lang: 'es' | 'en'): string {
  if (lang === 'es') return getStatusLabel(short)
  const map: Record<string, string> = {
    FT: 'Full time', AET: 'After extra time', PEN: 'Penalties',
    '1H': 'Live', '2H': 'Live', ET: 'Extra time', HT: 'Half-time',
    NS: 'Scheduled', PST: 'Postponed', CANC: 'Cancelled', TBD: 'TBD',
  }
  return map[short] ?? short
}

const lastName = (s: string) => { const parts = (s || '').trim().split(/\s+/); return parts[parts.length - 1] || s }

// Twin-bar team-stat rows. We pick the meaningful stats the API exposes and lay
// them out as a centred label with two opposing bars (home left / away right).
const STAT_ORDER: { type: string; es: string; en: string; pct?: boolean }[] = [
  { type: 'Ball Possession', es: 'Posesión', en: 'Possession', pct: true },
  { type: 'Total Shots', es: 'Tiros totales', en: 'Total shots' },
  { type: 'Shots on Goal', es: 'Tiros a puerta', en: 'Shots on target' },
  { type: 'Total passes', es: 'Pases', en: 'Passes' },
  { type: 'Passes %', es: 'Precisión de pase', en: 'Pass accuracy', pct: true },
  { type: 'Fouls', es: 'Faltas', en: 'Fouls' },
  { type: 'Corner Kicks', es: 'Córners', en: 'Corners' },
  { type: 'Offsides', es: 'Fueras de juego', en: 'Offsides' },
  { type: 'Yellow Cards', es: 'Tarjetas amarillas', en: 'Yellow cards' },
  { type: 'Red Cards', es: 'Tarjetas rojas', en: 'Red cards' },
]

const numOf = (v: string | number | null | undefined): number => {
  if (v == null) return 0
  const n = parseFloat(String(v).replace('%', ''))
  return Number.isFinite(n) ? n : 0
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MatchPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: raw, id } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const fixtureId = Number(id) || 0
  const locale = lang === 'en' ? 'en-US' : 'es-ES'

  const { fixture: fx, lineups, events, players, statistics } = await getMatchDetail(fixtureId)

  const breadcrumb = lang === 'en' ? ['Competitions', 'World Cup 2026', 'Match'] : ['Competiciones', 'Mundial 2026', 'Partido']

  // ── Fixture not found → graceful state (no 500) ──
  if (!fx) {
    return (
      <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
        <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', background: 'var(--ts-bg)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
            <Link href={`/${lang}/mundial-2026`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)', textDecoration: 'none' }}>
              ← {t(lang, 'Mundial 2026', 'World Cup 2026')}
            </Link>
            <div style={{ marginTop: 24, borderRadius: 12, padding: '40px 24px', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
                {t(lang, 'Partido no encontrado', 'Match not found')}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 420, margin: '0 auto' }}>
                {t(lang,
                  'No hemos podido cargar este partido. Vuelve al calendario del Mundial para ver todos los encuentros.',
                  "We couldn't load this match. Head back to the World Cup calendar to see every fixture.")}
              </p>
              <Link href={`/${lang}/mundial-2026`} style={{ display: 'inline-block', marginTop: 16, fontSize: 12, fontWeight: 700, color: 'var(--ts-primary)', textDecoration: 'none' }}>
                {t(lang, 'Ir al Mundial 2026 →', 'Go to World Cup 2026 →')}
              </Link>
            </div>
          </div>
        </main>
      </SaasShell>
    )
  }

  const home = fx.teams.home
  const away = fx.teams.away
  const homeSlug = slugify(home.name)
  const awaySlug = slugify(away.name)
  const short = fx.fixture.status.short
  const finished = FINISHED.includes(short)
  const live = ['1H', '2H', 'ET', 'HT', 'P'].includes(short)
  const scheduled = short === 'NS' || short === 'TBD'
  const hasScore = fx.goals.home != null && fx.goals.away != null
  const dateStr = new Date(fx.fixture.date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = new Date(fx.fixture.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

  const homeLineup = lineups.find(l => l.teamId === home.id)
  const awayLineup = lineups.find(l => l.teamId === away.id)
  const hasLineups = (homeLineup?.startXI.length ?? 0) > 0 || (awayLineup?.startXI.length ?? 0) > 0

  const homePlayers = players.find(p => p.teamId === home.id)
  const awayPlayers = players.find(p => p.teamId === away.id)
  const ratingFor = (group: FixturePlayersGroup | undefined, playerId: number | null): number | null => {
    if (!group || playerId == null) return null
    return group.players.find(p => p.id === playerId)?.rating ?? null
  }

  // ── Player-match ratings: top rated across both teams (MVP-style strip) ──
  const allRated = [...(homePlayers?.players ?? []), ...(awayPlayers?.players ?? [])]
    .filter(p => p.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  const topRated = allRated.slice(0, 6)

  // ── Team stats twin-bar rows ──
  const homeStats = statistics.find(s => s.teamId === home.id)
  const awayStats = statistics.find(s => s.teamId === away.id)
  const statVal = (group: FixtureTeamStatistics | undefined, type: string) =>
    group?.stats.find(s => s.type === type)?.value ?? null
  const statRows = STAT_ORDER
    .map(s => ({ ...s, home: statVal(homeStats, s.type), away: statVal(awayStats, s.type) }))
    .filter(s => s.home != null || s.away != null)
  const hasStats = statRows.length > 0

  // ── JSON-LD: SportsEvent (finished/scheduled both valid) ──
  const canonicalUrl = `https://www.top-scorers.com/${lang}/mundial-2026/partido/${fixtureId}`
  const eventName = `${home.name} vs ${away.name}`
  const sportsEventJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: eventName,
    sport: 'Soccer',
    startDate: fx.fixture.date,
    eventStatus: scheduled
      ? 'https://schema.org/EventScheduled'
      : short === 'PST' ? 'https://schema.org/EventPostponed'
        : short === 'CANC' ? 'https://schema.org/EventCancelled'
          : 'https://schema.org/EventScheduled',
    url: canonicalUrl,
    superEvent: { '@type': 'SportsOrganization', name: 'FIFA World Cup 2026' },
    competitor: [
      { '@type': 'SportsTeam', name: home.name },
      { '@type': 'SportsTeam', name: away.name },
    ],
    ...(fx.fixture.venue?.name
      ? { location: { '@type': 'Place', name: fx.fixture.venue.name, ...(fx.fixture.venue.city ? { address: fx.fixture.venue.city } : {}) } }
      : {}),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name: eventName, item: canonicalUrl },
    ],
  }
  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  // ── Presentational helpers (server, inline styles, --ts tokens) ──
  const TeamCrestLink = ({ team, slug, align }: { team: typeof home; slug: string; align: 'left' | 'right' }) => (
    <Link
      href={`/${lang}/mundial-2026/${slug}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0, cursor: 'pointer', minHeight: 44, justifyContent: 'center' }}
    >
      <CrestImg src={team.logo} alt={team.name} size={64} />
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(15px, 3.5vw, 22px)', fontWeight: 800, color: 'var(--ts-text)', textAlign: 'center', lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {team.name}
      </span>
    </Link>
  )

  // A player chip used in lineups + bench. Links to the player profile by name
  // slug (the profile resolves names via its search index, like the rest of the WC UI).
  const PlayerLink = ({ p, group }: { p: LineupPlayer; group?: FixturePlayersGroup }) => {
    const rating = ratingFor(group, p.id)
    const inner = (
      <>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 5, fontSize: 11, fontWeight: 800, color: 'var(--ts-muted)', background: 'var(--ts-card2)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {p.number ?? '–'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{p.name}</span>
        {rating != null && (
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{rating.toFixed(1)}</span>
        )}
      </>
    )
    const style: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', minHeight: 44,
      borderRadius: 9, background: 'var(--ts-card)', border: '1px solid var(--ts-border)',
      textDecoration: 'none', color: 'inherit', cursor: 'pointer',
    }
    if (!p.name) return <div style={style}>{inner}</div>
    return <Link href={`/${lang}/jugadores/${slugify(p.name)}`} style={style}>{inner}</Link>
  }

  // Goal / card / sub icon (SVG, brand colours — no emoji icons per AGENTS.md).
  const EventIcon = ({ type, detail }: { type: string; detail: string }) => {
    const c = { width: 16, height: 16, viewBox: '0 0 24 24' as const }
    if (type === 'Goal') {
      return (
        <svg {...c} fill="none" stroke="var(--ts-primary)" strokeWidth={2} aria-hidden>
          <circle cx="12" cy="12" r="9" /><path d="m12 7 1.5 3 3.3.3-2.5 2.2.8 3.2L12 16l-3.1 1.9.8-3.2L7.2 12.3l3.3-.3z" fill="var(--ts-primary)" />
        </svg>
      )
    }
    if (type === 'Card') {
      const red = /red/i.test(detail)
      return <svg {...c} viewBox="0 0 24 24" aria-hidden><rect x="6" y="3" width="12" height="18" rx="2" fill={red ? 'var(--ts-red)' : 'var(--ts-primary)'} /></svg>
    }
    if (type === 'subst') {
      return (
        <svg {...c} fill="none" stroke="var(--ts-teal)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M17 4v6h-6" /><path d="M3 11a9 9 0 0 1 15-6.7L21 7" /><path d="M7 20v-6h6" /><path d="M21 13a9 9 0 0 1-15 6.7L3 17" />
        </svg>
      )
    }
    return <svg {...c} fill="none" stroke="var(--ts-muted)" strokeWidth={2} aria-hidden><circle cx="12" cy="12" r="3" /></svg>
  }

  // A scorer/assister/card-getter name inside the timeline, linked to its profile.
  const NameLink = ({ name }: { name: string }) =>
    name
      ? <Link href={`/${lang}/jugadores/${slugify(name)}`} style={{ color: 'var(--ts-text)', fontWeight: 600, textDecoration: 'none' }}>{name}</Link>
      : null

  const eventLabel = (e: FixtureEvent): React.ReactNode => {
    if (e.type === 'Goal') {
      const own = /own/i.test(e.detail)
      const pen = /penalty/i.test(e.detail)
      return (
        <span>
          <NameLink name={e.player} />
          {own ? <span style={{ color: 'var(--ts-muted)' }}> ({t(lang, 'p.p.', 'o.g.')})</span> : null}
          {pen ? <span style={{ color: 'var(--ts-muted)' }}> ({t(lang, 'penalti', 'pen.')})</span> : null}
          {e.assist && !own ? <span style={{ color: 'var(--ts-muted)', fontSize: 12 }}> · {t(lang, 'asist.', 'assist')} <NameLink name={e.assist} /></span> : null}
        </span>
      )
    }
    if (e.type === 'subst') {
      // For subs the API puts the player coming ON in `player` and the one going
      // OFF in `assist` (it varies by provider; we present in → / out ←).
      return (
        <span style={{ fontSize: 13 }}>
          <span style={{ color: 'var(--ts-teal)' }}>▲ </span><NameLink name={e.player} />
          {e.assist ? <span style={{ color: 'var(--ts-muted)' }}> <span style={{ color: 'var(--ts-red)' }}>▼</span> <NameLink name={e.assist} /></span> : null}
        </span>
      )
    }
    return (
      <span>
        <NameLink name={e.player} />
        <span style={{ color: 'var(--ts-muted)', fontSize: 12 }}> · {e.detail}</span>
      </span>
    )
  }

  const LineupColumn = ({ team, slug, lineup, group }: { team: typeof home; slug: string; lineup?: FixtureLineup; group?: FixturePlayersGroup }) => (
    <div style={{ flex: 1, minWidth: 260 }}>
      <Link href={`/${lang}/mundial-2026/${slug}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, textDecoration: 'none', color: 'inherit', minHeight: 44 }}>
        <CrestImg src={team.logo} alt={team.name} size={22} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 800, color: 'var(--ts-text)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{team.name}</span>
        {lineup?.formation && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ts-primary)' }}>· {lineup.formation}</span>}
      </Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(lineup?.startXI ?? []).map((p, i) => <PlayerLink key={`${p.id ?? i}-s`} p={p} group={group} />)}
      </div>
      {(lineup?.substitutes?.length ?? 0) > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ts-muted)', margin: '14px 0 8px', fontFamily: "'Barlow Condensed', sans-serif" }}>
            {t(lang, 'Suplentes', 'Substitutes')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(lineup?.substitutes ?? []).map((p, i) => <PlayerLink key={`${p.id ?? i}-b`} p={p} group={group} />)}
          </div>
        </>
      )}
      {lineup?.coach && (
        <div style={{ fontSize: 12, color: 'var(--ts-muted)', marginTop: 12 }}>
          {t(lang, 'Entrenador', 'Coach')}: <span style={{ color: 'var(--ts-text)', fontWeight: 600 }}>{lineup.coach}</span>
        </div>
      )}
    </div>
  )

  const sectionTitle = (icon: React.ReactNode, label: string) => (
    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 14px' }}>
      {icon}{label}
    </h2>
  )

  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      {ld(sportsEventJsonLd)}
      {ld(breadcrumbJsonLd)}
      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', background: 'var(--ts-bg)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(180deg, var(--ts-primary-soft), var(--ts-bg))', borderBottom: '1px solid var(--ts-border)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '18px 20px 26px' }}>
            <Link href={`/${lang}/mundial-2026`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)', textDecoration: 'none' }}>
              ← {t(lang, 'Mundial 2026', 'World Cup 2026')}
            </Link>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)', border: '1px solid var(--ts-border-hot)', margin: '12px 0 2px' }}>
              FIFA World Cup 2026{fx.league.round ? ` · ${fx.league.round}` : ''}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 3vw, 24px)', marginTop: 14 }}>
              <TeamCrestLink team={home} slug={homeSlug} align="left" />
              <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 90 }}>
                {hasScore ? (
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(34px, 9vw, 52px)', fontWeight: 800, lineHeight: 1, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>
                    {fx.goals.home}<span style={{ color: 'var(--ts-faint)', margin: '0 4px' }}>-</span>{fx.goals.away}
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, color: 'var(--ts-muted)' }}>{timeStr}</div>
                )}
                <div style={{
                  marginTop: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  color: live ? 'var(--ts-red)' : finished ? 'var(--ts-teal)' : 'var(--ts-muted)',
                }}>
                  {live && <span aria-hidden style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--ts-red)', marginRight: 5 }} />}
                  {statusLabel(short, lang)}{live && fx.fixture.status.elapsed != null ? ` ${fx.fixture.status.elapsed}'` : ''}
                </div>
              </div>
              <TeamCrestLink team={away} slug={awaySlug} align="right" />
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12, color: 'var(--ts-muted)' }}>
              <span style={{ textTransform: 'capitalize' }}>{dateStr}{!hasScore ? '' : ` · ${timeStr}`}</span>
              {fx.fixture.venue?.name && (
                <span>{fx.fixture.venue.name}{fx.fixture.venue.city ? `, ${fx.fixture.venue.city}` : ''}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 80px', display: 'flex', flexDirection: 'column', gap: 30 }}>

          {/* Scheduled — no data yet */}
          {scheduled && !hasLineups && events.length === 0 && (
            <div style={{ borderRadius: 12, padding: '36px 24px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
                {t(lang, 'Partido por jugarse', 'Match not played yet')}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto' }}>
                {t(lang,
                  'Las alineaciones se publican habitualmente alrededor de una hora antes del saque inicial. Vuelve cerca del inicio del partido para ver los onces, los goles y las estadísticas en directo.',
                  'Lineups are usually released about an hour before kick-off. Check back near kick-off for the starting XIs, goals and live stats.')}
              </p>
            </div>
          )}

          {/* Timeline / key events */}
          {events.length > 0 && (
            <section>
              {sectionTitle(
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>,
                t(lang, 'Cronología', 'Timeline'),
              )}
              <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
                {events.map((e, i) => {
                  const homeSide = e.teamId === home.id
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < events.length - 1 ? '1px solid var(--ts-divider)' : 'none', flexDirection: homeSide ? 'row' : 'row-reverse' }}>
                      <span style={{ flexShrink: 0, width: 40, fontSize: 12, fontWeight: 800, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums', textAlign: homeSide ? 'left' : 'right' }}>
                        {e.minute}{e.extra ? `+${e.extra}` : ''}&apos;
                      </span>
                      <span style={{ flexShrink: 0, display: 'inline-flex' }}><EventIcon type={e.type} detail={e.detail} /></span>
                      <div style={{ flex: 1, minWidth: 0, textAlign: homeSide ? 'left' : 'right', fontSize: 13 }}>
                        {eventLabel(e)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Lineups */}
          {hasLineups && (
            <section>
              {sectionTitle(
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 5h18v14H3z" /><path d="M12 5v14M3 9h4M3 15h4M17 9h4M17 15h4" /></svg>,
                t(lang, 'Alineaciones', 'Lineups'),
              )}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <LineupColumn team={home} slug={homeSlug} lineup={homeLineup} group={homePlayers} />
                <LineupColumn team={away} slug={awaySlug} lineup={awayLineup} group={awayPlayers} />
              </div>
            </section>
          )}

          {/* Player ratings */}
          {topRated.length > 0 && (
            <section>
              {sectionTitle(
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m12 3 2.5 5.5 6 .5-4.5 4 1.5 6L12 16l-5.5 3 1.5-6-4.5-4 6-.5z" /></svg>,
                t(lang, 'Mejores valoraciones', 'Top player ratings'),
              )}
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {topRated.map((p, i) => (
                  <Link
                    key={`${p.id ?? i}`}
                    href={p.name ? `/${lang}/jugadores/${slugify(p.name)}` : `/${lang}/mundial-2026`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', minHeight: 44, borderRadius: 10, background: i === 0 ? 'var(--ts-primary-soft)' : 'var(--ts-card)', border: `1px solid ${i === 0 ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.photo ? <img src={p.photo} alt={p.name} width={36} height={36} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--ts-border)' }} /> : null}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--ts-muted)' }}>
                        {(p.goals ?? 0) > 0 ? `${p.goals} ${t(lang, 'g', 'g')} ` : ''}{(p.assists ?? 0) > 0 ? `${p.assists} ${t(lang, 'a', 'a')}` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif", fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{p.rating!.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Team stats — twin bars */}
          {hasStats && (
            <section>
              {sectionTitle(
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="7" /><rect x="13" y="6" width="3" height="11" /></svg>,
                t(lang, 'Estadísticas del partido', 'Match stats'),
              )}
              <div style={{ borderRadius: 12, padding: '16px 18px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {statRows.map(s => {
                  const h = numOf(s.home)
                  const a = numOf(s.away)
                  const total = h + a
                  const hPct = total > 0 ? (h / total) * 100 : 50
                  const aPct = total > 0 ? (a / total) * 100 : 50
                  const fmt = (v: string | number | null) => (v == null ? '0' : `${v}`)
                  return (
                    <div key={s.type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums', width: 56, textAlign: 'left' }}>{fmt(s.home)}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)', textAlign: 'center', flex: 1 }}>{t(lang, s.es, s.en)}</span>
                        <span style={{ fontWeight: 800, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums', width: 56, textAlign: 'right' }}>{fmt(s.away)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, height: 7 }} aria-hidden>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', background: 'var(--ts-card2)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${hPct}%`, background: 'var(--ts-primary)' }} />
                        </div>
                        <div style={{ flex: 1, background: 'var(--ts-card2)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${aPct}%`, background: 'var(--ts-teal)' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Finished match with no detailed data (older/limited fixtures) */}
          {(finished || live) && !hasLineups && events.length === 0 && !hasStats && (
            <div style={{ borderRadius: 12, padding: '32px 24px', textAlign: 'center', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto' }}>
                {t(lang,
                  'No hay alineaciones ni estadísticas detalladas disponibles para este partido.',
                  'No detailed lineups or stats are available for this match.')}
              </p>
            </div>
          )}
        </div>
      </main>
    </SaasShell>
  )
}
