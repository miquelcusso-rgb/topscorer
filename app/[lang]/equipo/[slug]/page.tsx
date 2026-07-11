import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import Footer from '@/components/Footer'
import TeamFacts from '@/components/team/TeamFacts'
import TeamEnrichment from '@/components/team/TeamEnrichment'
import SetMyTeamButton from '@/components/team/SetMyTeamButton'
import LeagueTeamsGrid from '@/components/saas/LeagueTeamsGrid'
import { teamsForLeagueId } from '@/lib/second-divisions'
import { majorTeamSlugs, findTeamBySlug, datasetStatsByName, type TeamData } from '@/lib/team-data'
import { getSquad, getCoach, type SquadPlayer } from '@/lib/api-football'
import { slugify } from '@/lib/slugify'
import { IIG_NAME } from '@/lib/iig'

const BASE = 'https://www.top-scorers.com'

// 24h ISR. Only the major clubs are prerendered at build; the long tail renders
// on first visit (dynamicParams) and is cached, so a build never fires hundreds
// of live squad fetches at once. Squad/coach come from api-football (cached 30d
// in the data layer); club facts + history are lazy client-side via /api/team-info.
export const revalidate = 86400
export const dynamicParams = true

export function generateStaticParams() {
  return majorTeamSlugs().map(slug => ({ slug }))
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

// A merged roster row: the full-squad player from api-football + our tracked
// stats (goals/assists/games) when we have them.
interface RosterRow {
  id: number
  name: string
  slug: string          // fiche slug (clean when tracked; name-<id> otherwise)
  photo: string | null
  flag: string | null
  number: number | null
  age: number | null
  position: string | null
  goles: number | null
  asist: number | null
  pj: number | null
  tracked: boolean
}

// Build the merged, position-grouped roster for a team. Falls back to the
// dataset squad when the API returns nothing (defensive — page never empties).
async function buildRoster(team: TeamData): Promise<{ rows: RosterRow[]; fromApi: boolean }> {
  const stats = datasetStatsByName(team)
  const api: SquadPlayer[] = team.teamId ? await getSquad(team.teamId) : []
  if (api.length) {
    const rows = api.map<RosterRow>(p => {
      const tracked = stats.get(norm(p.name))
      return {
        id: p.id,
        name: p.name,
        slug: tracked?.slug ?? `${slugify(p.name)}-${p.id}`,
        photo: p.photo ?? tracked?.photo ?? null,
        flag: tracked?.flag ?? null,
        number: p.number ?? null,
        age: p.age ?? tracked?.age ?? null,
        position: p.position || tracked?.position || null,
        goles: tracked?.goles ?? null,
        asist: tracked?.asist ?? null,
        pj: tracked?.pj ?? null,
        tracked: !!tracked,
      }
    })
    return { rows, fromApi: true }
  }
  // Fallback: dataset squad only.
  const rows = team.squad.map<RosterRow>((p, i) => ({
    id: i, name: p.name, slug: p.slug, photo: p.photo, flag: p.flag,
    number: null, age: p.age, position: p.position,
    goles: p.goles, asist: p.asist, pj: p.pj, tracked: true,
  }))
  return { rows, fromApi: false }
}

const POS_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'] as const
const POS_GROUP: Record<string, { es: string; en: string }> = {
  Goalkeeper: { es: 'Porteros', en: 'Goalkeepers' },
  Defender: { es: 'Defensas', en: 'Defenders' },
  Midfielder: { es: 'Centrocampistas', en: 'Midfielders' },
  Attacker: { es: 'Delanteros', en: 'Forwards' },
  Other: { es: 'Otros', en: 'Others' },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang: raw, slug } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const team = findTeamBySlug(slug)
  if (!team) return {}
  const path = `/equipo/${slug}`
  const squadN = team.teamId ? (await getSquad(team.teamId)).length : 0
  const rosterN = squadN || team.squad.length
  const title =
    lang === 'en'
      ? `${team.name} — Squad, Stats & Top Scorers 25/26`
      : `${team.name} — Plantilla, Estadísticas y Goleadores 25/26`
  const description =
    lang === 'en'
      ? `${team.name} full squad (${rosterN} players), top scorers and season stats for 25/26 in the ${team.league}: goals, assists, ratings, club info and history.`
      : `Plantilla completa del ${team.name} (${rosterN} jugadores), goleadores y estadísticas de la temporada 25/26 en la ${team.league}: goles, asistencias, datos del club e historia.`
  return {
    title,
    description,
    keywords: [team.name, team.league, 'plantilla', 'goleadores', 'estadísticas', 'squad', 'top scorers', 'temporada 2025 2026'],
    alternates: {
      canonical: `${BASE}/${lang}${path}`,
      languages: { es: `${BASE}/es${path}`, en: `${BASE}/en${path}`, 'x-default': `${BASE}/es${path}` },
    },
    openGraph: { title, description, url: `${BASE}/${lang}${path}`, images: team.crest ? [team.crest] : undefined },
    // Index only pages backed by a real roster (≥10 players from the API or ≥5
    // tracked in the dataset), so empty/sparse pages stay out of the index.
    robots: rosterN >= 10 || team.squad.length >= 5 ? undefined : { index: false, follow: true },
  }
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang: raw, slug } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'
  const team = findTeamBySlug(slug)
  if (!team) notFound()

  const [{ rows, fromApi }, coach] = await Promise.all([
    buildRoster(team),
    team.teamId ? getCoach(team.teamId) : Promise.resolve(null),
  ])

  const breadcrumb = en ? ['Teams', team.name] : ['Equipos', team.name]
  const leagueHref = `/${lang}/competiciones/${slugify(team.league)}`
  const accent = team.accent
  const topScorer = [...rows].filter(r => r.goles != null).sort((a, b) => (b.goles ?? 0) - (a.goles ?? 0))[0]
  const goals = rows.reduce((s, r) => s + (r.goles ?? 0), 0)
  const assists = rows.reduce((s, r) => s + (r.asist ?? 0), 0)
  // Exclusive: the club's leaders by our IIG impact index (tracked players).
  const iigLeaders = [...team.squad].filter(p => p.iig > 0).sort((a, b) => b.iig - a.iig).slice(0, 5)

  // Group roster by position, in football order; unknown positions last.
  const groups: { key: string; players: RosterRow[] }[] = []
  for (const key of POS_ORDER) {
    const players = rows.filter(r => r.position === key)
    if (players.length) groups.push({ key, players })
  }
  const others = rows.filter(r => !POS_ORDER.includes((r.position ?? '') as typeof POS_ORDER[number]))
  if (others.length) groups.push({ key: 'Other', players: others })

  const card: React.CSSProperties = {
    background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, padding: 18,
  }
  const eyebrow: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 12,
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: team.name,
    sport: 'Association football',
    ...(team.crest ? { logo: team.crest } : {}),
    ...(coach ? { coach: { '@type': 'Person', name: coach.name } } : {}),
    memberOf: { '@type': 'SportsOrganization', name: team.league },
    url: `${BASE}/${lang}/equipo/${slug}`,
    numberOfEmployees: rows.length,
    athlete: rows.slice(0, 35).map(p => ({ '@type': 'Person', name: p.name })),
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: en ? 'Teams' : 'Equipos', item: `${BASE}/${lang}/competiciones` },
      { '@type': 'ListItem', position: 2, name: team.name, item: `${BASE}/${lang}/equipo/${slug}` },
    ],
  }

  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <header style={{ ...card, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', borderTop: accent ? `3px solid ${accent}` : undefined }}>
          <div style={{ width: 72, height: 72, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ts-card2)', borderRadius: 14, overflow: 'hidden' }}>
            {team.crest
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={team.crest} alt={team.name} width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }} />
              : <span aria-hidden style={{ fontSize: 32 }}>🛡️</span>}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 800, lineHeight: 1, color: 'var(--ts-text)' }}>{team.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
              <Link href={leagueHref} style={{ fontSize: 13.5, fontWeight: 600, color: accent ?? 'var(--ts-teal)', textDecoration: 'none' }}>{team.league} →</Link>
              <SetMyTeamButton club={team.name} lang={lang} />
            </div>
            {coach ? <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--ts-muted)' }}>{en ? 'Head coach' : 'Entrenador'}: <strong style={{ color: 'var(--ts-text)' }}>{coach.name}</strong></div> : null}
          </div>
          <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
            <Stat label={en ? 'Squad' : 'Plantilla'} value={String(rows.length)} accent={accent} />
            <Stat label={en ? 'Goals' : 'Goles'} value={String(goals)} />
            <Stat label={en ? 'Assists' : 'Asist.'} value={String(assists)} />
          </div>
        </header>

        {/* Lazy club facts + history */}
        <TeamFacts slug={slug} lang={lang} />

        {/* Season standing, statistics, fixtures, transfers, injuries (SSR) */}
        {team.teamId ? <TeamEnrichment teamId={team.teamId} leagueId={team.leagueId} teamName={team.name} lang={lang} /> : null}

        {/* Exclusive: club leaders by our IIG impact index (something TM doesn't have) */}
        {iigLeaders.length ? (
          <section style={{ ...card, borderTop: `3px solid var(--ts-primary)` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={eyebrow}>{en ? 'Exclusive · Impact index' : 'Exclusivo · Índice de impacto'}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ts-teal)' }}>{IIG_NAME[lang]}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {iigLeaders.map((p, i) => (
                <Link key={p.slug + i} href={`/${lang}/jugadores/${p.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', minHeight: 44,
                    borderBottom: i < iigLeaders.length - 1 ? '1px solid var(--ts-hairline)' : 'none', textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ width: 18, flexShrink: 0, textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-faint)' }}>{i + 1}</span>
                  <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: 'var(--ts-card2)' }}>
                    {p.photo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.photo} alt="" width={34} height={34} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : null}
                  </div>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.flag ? `${p.flag} ` : ''}{p.name}
                    <span style={{ fontWeight: 500, color: 'var(--ts-faint)' }}> · {p.goles}G {p.asist}A</span>
                  </span>
                  <span style={{ flexShrink: 0, width: 52, textAlign: 'right', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.iig}
                  </span>
                </Link>
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'var(--ts-faint)' }}>
              {en ? 'IIG = goals × league weight + rating impact + assists. A TopScorers metric.' : 'IIG = goles × peso de liga + impacto de rating + asistencias. Métrica propia de TopScorers.'}
            </p>
          </section>
        ) : null}

        {/* Full squad, grouped by position */}
        <section style={card}>
          <div style={eyebrow}>{en ? `Squad · ${rows.length}` : `Plantilla · ${rows.length}`}</div>
          {groups.map(g => (
            <div key={g.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ts-muted)', margin: '4px 0 6px' }}>
                {POS_GROUP[g.key]?.[lang] ?? g.key}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {g.players.map((p, i) => (
                  <Link key={p.slug + i} href={`/${lang}/jugadores/${p.slug}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', minHeight: 44,
                      borderBottom: i < g.players.length - 1 ? '1px solid var(--ts-hairline)' : 'none', textDecoration: 'none', color: 'inherit' }}>
                    {p.number != null
                      ? <span style={{ width: 22, flexShrink: 0, textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--ts-faint)' }}>{p.number}</span>
                      : <span style={{ width: 22, flexShrink: 0 }} />}
                    <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: 'var(--ts-card2)' }}>
                      {p.photo
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.photo} alt="" width={34} height={34} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : null}
                    </div>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.flag ? `${p.flag} ` : ''}{p.name}
                      {p.age != null ? <span style={{ fontWeight: 500, color: 'var(--ts-faint)' }}> · {p.age}{en ? '' : ' a'}</span> : null}
                    </span>
                    {p.goles != null ? (
                      <>
                        <span style={{ flexShrink: 0, width: 40, textAlign: 'right', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>{p.goles}<span style={{ fontSize: 10, color: 'var(--ts-muted)', fontWeight: 600 }}>G</span></span>
                        <span style={{ flexShrink: 0, width: 40, textAlign: 'right', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--ts-teal)', fontVariantNumeric: 'tabular-nums' }}>{p.asist ?? 0}<span style={{ fontSize: 10, color: 'var(--ts-muted)', fontWeight: 600 }}>A</span></span>
                      </>
                    ) : (
                      <span style={{ flexShrink: 0, width: 80, textAlign: 'right', fontSize: 11, color: 'var(--ts-faint)' }}>{en ? 'view →' : 'ver →'}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {topScorer && (topScorer.goles ?? 0) > 0 ? (
            <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--ts-muted)' }}>
              {en ? `Top scorer this season: ${topScorer.name} (${topScorer.goles} goals).` : `Máximo goleador esta temporada: ${topScorer.name} (${topScorer.goles} goles).`}
            </p>
          ) : null}
          {!fromApi ? (
            <p style={{ margin: '6px 0 0', fontSize: 11.5, color: 'var(--ts-faint)' }}>
              {en ? 'Showing tracked players; full squad updating.' : 'Mostrando jugadores seguidos; plantilla completa actualizándose.'}
            </p>
          ) : null}
        </section>

        {/* Related: the league's other clubs — keeps sessions going and is the
            internal-link mesh the long-tail team pages rely on for discovery. */}
        {(() => {
          if (!team.leagueId) return null
          const rivals = teamsForLeagueId(team.leagueId).filter(t => t.teamId !== team.teamId)
          if (!rivals.length) return null
          return <LeagueTeamsGrid teams={rivals} lang={lang}
            title={en ? `More ${team.league} clubs` : `Más equipos de ${team.league}`} />
        })()}
      </div>

      <div style={{ marginTop: 32, marginLeft: -24, marginRight: -24, marginBottom: -24 }}>
        <Footer />
      </div>
    </SaasShell>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, lineHeight: 1, color: accent ?? 'var(--ts-text)' }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginTop: 3 }}>{label}</div>
    </div>
  )
}
