import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import Footer from '@/components/Footer'
import TeamFacts from '@/components/team/TeamFacts'
import { allTeamSlugs, findTeamBySlug } from '@/lib/team-data'
import { slugify } from '@/lib/slugify'

const BASE = 'https://www.top-scorers.com'

// 24h ISR — the body is dataset-driven (changes on deploy); the lazy club facts
// + history come from /api/team-info's own cached fetch. One page per team × es/en.
export const revalidate = 86400

export function generateStaticParams() {
  return allTeamSlugs().map(slug => ({ slug }))
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
  const title =
    lang === 'en'
      ? `${team.name} — Squad, Stats & Top Scorers 25/26`
      : `${team.name} — Plantilla, Estadísticas y Goleadores 25/26`
  const description =
    lang === 'en'
      ? `${team.name} squad, top scorers and season stats for 25/26 in the ${team.league}: goals, assists, ratings, club info and history.`
      : `Plantilla del ${team.name}, goleadores y estadísticas de la temporada 25/26 en la ${team.league}: goles, asistencias, valoraciones, datos del club e historia.`
  return {
    title,
    description,
    keywords: [team.name, team.league, 'plantilla', 'goleadores', 'estadísticas', 'squad', 'top scorers', 'temporada 2025 2026'],
    alternates: {
      canonical: `${BASE}/${lang}${path}`,
      languages: {
        es: `${BASE}/es${path}`,
        en: `${BASE}/en${path}`,
        'x-default': `${BASE}/es${path}`,
      },
    },
    openGraph: { title, description, url: `${BASE}/${lang}${path}`, images: team.crest ? [team.crest] : undefined },
    // Thin-content guard: only index team pages with a substantial squad in the
    // dataset (≥5 players). Sparse minor-league clubs stay crawlable via internal
    // links but out of the index, to avoid the "low value / thin" flag.
    robots: team.squad.length >= 5 ? undefined : { index: false, follow: true },
  }
}

const POS_LABEL: Record<string, { es: string; en: string }> = {
  Goalkeeper: { es: 'POR', en: 'GK' }, Defender: { es: 'DEF', en: 'DEF' },
  Midfielder: { es: 'MED', en: 'MID' }, Attacker: { es: 'DEL', en: 'FW' },
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

  const breadcrumb = en ? ['Teams', team.name] : ['Equipos', team.name]
  const leagueHref = `/${lang}/competiciones/${slugify(team.league)}`
  const accent = team.accent
  const topScorer = [...team.squad].sort((a, b) => b.goles - a.goles)[0]

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
    memberOf: { '@type': 'SportsOrganization', name: team.league },
    url: `${BASE}/${lang}/equipo/${slug}`,
    athlete: team.squad.slice(0, 25).map(p => ({ '@type': 'Person', name: p.name })),
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
        <header style={{
          ...card, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          borderTop: accent ? `3px solid ${accent}` : undefined,
        }}>
          <div style={{ width: 72, height: 72, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--ts-card2)', borderRadius: 14, overflow: 'hidden' }}>
            {team.crest
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={team.crest} alt={team.name} width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, boxSizing: 'border-box' }} />
              : <span aria-hidden style={{ fontSize: 32 }}>🛡️</span>}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 800, lineHeight: 1, color: 'var(--ts-text)' }}>
              {team.name}
            </h1>
            <Link href={leagueHref} style={{ display: 'inline-block', marginTop: 6, fontSize: 13.5, fontWeight: 600, color: accent ?? 'var(--ts-teal)', textDecoration: 'none' }}>
              {team.league} →
            </Link>
          </div>
          {/* Season totals */}
          <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
            <Stat label={en ? 'Players' : 'Jugadores'} value={String(team.totals.players)} />
            <Stat label={en ? 'Goals' : 'Goles'} value={String(team.totals.goals)} accent={accent} />
            <Stat label={en ? 'Assists' : 'Asist.'} value={String(team.totals.assists)} />
            {team.totals.avgAge ? <Stat label={en ? 'Avg age' : 'Edad med.'} value={String(team.totals.avgAge)} /> : null}
          </div>
        </header>

        {/* Lazy club facts + history */}
        <TeamFacts slug={slug} lang={lang} />

        {/* Squad */}
        <section style={card}>
          <div style={eyebrow}>{en ? `Squad · ${team.squad.length}` : `Plantilla · ${team.squad.length}`}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {team.squad.map((p, i) => {
              const pos = p.position ? (POS_LABEL[p.position]?.[lang] ?? p.position) : null
              return (
                <Link key={p.slug + i} href={`/${lang}/jugadores/${p.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', minHeight: 44,
                    borderBottom: i < team.squad.length - 1 ? '1px solid var(--ts-hairline)' : 'none',
                    textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: 'var(--ts-card2)' }}>
                    {p.photo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.photo} alt="" width={34} height={34} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : null}
                  </div>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.flag ? `${p.flag} ` : ''}{p.name}
                  </span>
                  {pos ? <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: 'var(--ts-muted)', background: 'var(--ts-card2)', padding: '2px 7px', borderRadius: 6 }}>{pos}</span> : null}
                  <span style={{ flexShrink: 0, width: 44, textAlign: 'right', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.goles}<span style={{ fontSize: 10, color: 'var(--ts-muted)', fontWeight: 600 }}>G</span>
                  </span>
                  <span style={{ flexShrink: 0, width: 44, textAlign: 'right', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--ts-teal)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.asist}<span style={{ fontSize: 10, color: 'var(--ts-muted)', fontWeight: 600 }}>A</span>
                  </span>
                </Link>
              )
            })}
          </div>
          {topScorer && topScorer.goles > 0 ? (
            <p style={{ margin: '14px 0 0', fontSize: 12.5, color: 'var(--ts-muted)' }}>
              {en
                ? `Top scorer this season: ${topScorer.name} (${topScorer.goles} goals).`
                : `Máximo goleador esta temporada: ${topScorer.name} (${topScorer.goles} goles).`}
            </p>
          ) : null}
        </section>
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
