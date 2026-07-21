import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale, type Lang } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import RelatedLinks from '@/components/RelatedLinks'
import { getDailyDigest, type DailyDigest } from '@/lib/daily-goals'
import { slugify } from '@/lib/slugify'

const BASE = 'https://www.top-scorers.com'
const PATH = '/daily'

// This page exists BECAUSE it is fresh — a long ISR window would defeat it.
// 30 min matches the underlying fixture-list cache, so a regen inside that
// window costs zero api-football requests.
export const revalidate = 1800

const t = (lang: Lang, es: string, en: string) => (lang === 'en' ? en : es)

function dayLabel(date: string, lang: Lang): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

function timeLabel(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleTimeString(lang === 'en' ? 'en-US' : 'es-ES', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false,
  })
}

/** "45+2'" — the way a minute is actually written. */
function minuteLabel(minute: number, extra: number | null): string {
  return extra ? `${minute}+${extra}'` : `${minute}'`
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const en = lang === 'en'

  // The query is "top scorer daily" / "who scored today", so the title carries
  // "today" and the description carries the actual date — the freshness promise
  // is the whole reason someone clicks this result.
  const digest = await getDailyDigest()
  const dateStr = dayLabel(digest.date, lang)

  const title = en
    ? 'Top Scorer Daily — Who Scored Today'
    : 'Goleadores del día — Quién ha marcado hoy'
  const description = digest.goals.length > 0
    ? (en
        ? `Every goal scored on ${dateStr}: ${digest.goals.length} goals in ${digest.matchCount} matches across ${digest.leagueCount} competitions, with scorer and minute. Updated through the day.`
        : `Todos los goles del ${dateStr}: ${digest.goals.length} goles en ${digest.matchCount} partidos de ${digest.leagueCount} competiciones, con goleador y minuto. Actualizado durante el día.`)
    : (en
        ? 'Who scored today: every goal from the top competitions, with scorer, minute and match, updated through the day.'
        : 'Quién ha marcado hoy: todos los goles de las principales competiciones, con goleador, minuto y partido, actualizado durante el día.')

  return {
    title,
    description,
    keywords: en
      ? ['top scorer daily', 'topscorerdaily', 'who scored today', 'goals today', 'todays goalscorers', 'football goals today', 'daily top scorers']
      : ['goleadores del día', 'quién ha marcado hoy', 'goles de hoy', 'goleadores hoy', 'top scorer daily'],
    alternates: {
      canonical: `${BASE}/${lang}${PATH}`,
      languages: {
        es: `${BASE}/es${PATH}`,
        en: `${BASE}/en${PATH}`,
        'x-default': `${BASE}/es${PATH}`,
      },
    },
    openGraph: {
      title: `${title} | TopScorers`,
      description,
      url: `${BASE}/${lang}${PATH}`,
      siteName: 'TopScorers',
      locale: en ? 'en_US' : 'es_ES',
      type: 'website',
      images: [{ url: `${BASE}/og-default-${lang}.jpg`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | TopScorers`,
      description,
      site: '@Furiosadata',
      creator: '@Furiosadata',
    },
  }
}

// ── FAQ (visible answers mirror the FAQPage JSON-LD) ─────────────────────────

function dailyFaqs(lang: Lang, digest: DailyDigest): { q: string; a: string }[] {
  const en = lang === 'en'
  const dateStr = dayLabel(digest.date, lang)
  const top = digest.multiScorers[0]

  return [
    {
      q: en ? 'Who scored today?' : '¿Quién ha marcado hoy?',
      a: digest.goals.length === 0
        ? (en
            ? 'No matches in the competitions we track have finished with goals in the last few days. This page fills up again as soon as the next matchday is played.'
            : 'No hay partidos con goles terminados en los últimos días en las competiciones que seguimos. Esta página vuelve a llenarse en cuanto se juegue la próxima jornada.')
        : (en
            ? `${digest.isToday ? 'Today' : `On ${dateStr}`} there ${digest.goals.length === 1 ? 'was 1 goal' : `were ${digest.goals.length} goals`} in ${digest.matchCount} ${digest.matchCount === 1 ? 'match' : 'matches'} across ${digest.leagueCount} ${digest.leagueCount === 1 ? 'competition' : 'competitions'}.${top ? ` ${top.player} (${top.team}) scored ${top.goals}.` : ''} The full list of scorers and minutes is on this page.`
            : `${digest.isToday ? 'Hoy' : `El ${dateStr}`} se ${digest.goals.length === 1 ? 'marcó 1 gol' : `marcaron ${digest.goals.length} goles`} en ${digest.matchCount} ${digest.matchCount === 1 ? 'partido' : 'partidos'} de ${digest.leagueCount} ${digest.leagueCount === 1 ? 'competición' : 'competiciones'}.${top ? ` ${top.player} (${top.team}) marcó ${top.goals}.` : ''} La lista completa de goleadores y minutos está en esta página.`),
    },
    {
      q: en ? 'How often is this page updated?' : '¿Cada cuánto se actualiza esta página?',
      a: en
        ? 'Every 30 minutes. Goals appear once a match is finished and its events are confirmed, so a game still in play shows up shortly after the final whistle rather than live, minute by minute.'
        : 'Cada 30 minutos. Los goles aparecen cuando el partido ha terminado y sus eventos están confirmados, así que un partido en juego se refleja poco después del pitido final, no en directo minuto a minuto.',
    },
    {
      q: en ? 'Which competitions are covered?' : '¿Qué competiciones cubre?',
      a: en
        ? 'The 40+ competitions TopScorers tracks: the Big-5 European leagues, the rest of the European top divisions and the main second divisions, the Champions, Europa and Conference League, plus MLS, Liga MX, Brasileirão, the Argentine league and the main Asian and Middle-East leagues.'
        : 'Las 40+ competiciones que sigue TopScorers: las cinco grandes ligas europeas, el resto de primeras divisiones europeas y las principales segundas, Champions, Europa League y Conference, además de MLS, Liga MX, Brasileirão, la liga argentina y las principales ligas asiáticas y de Oriente Medio.',
    },
    {
      q: en ? 'Where does the data come from?' : '¿De dónde salen los datos?',
      a: en
        ? 'Match events come from api-football, the same feed behind the rest of the site. Each goal is shown with its scorer, minute, and the match and competition it was scored in, so any entry can be checked against the match itself.'
        : 'Los eventos de los partidos vienen de api-football, la misma fuente que alimenta el resto del sitio. Cada gol se muestra con su goleador, minuto y el partido y la competición en que se marcó, así que cualquier dato se puede contrastar con el partido.',
    },
  ]
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DailyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params
  const lang: Lang = isLocale(raw) ? raw : 'es'
  const digest = await getDailyDigest()
  const canonicalUrl = `${BASE}/${lang}${PATH}`
  const dateStr = dayLabel(digest.date, lang)
  const faqs = dailyFaqs(lang, digest)

  // Group by match so the page reads like a results page, not a flat log.
  const byFixture = new Map<number, typeof digest.goals>()
  for (const g of digest.goals) {
    const arr = byFixture.get(g.fixtureId)
    if (arr) arr.push(g)
    else byFixture.set(g.fixtureId, [g])
  }

  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': canonicalUrl,
    url: canonicalUrl,
    name: t(lang, 'Goleadores del día', 'Top Scorer Daily'),
    inLanguage: lang === 'en' ? 'en' : 'es',
    dateModified: digest.fetchedAt,
    isPartOf: { '@type': 'WebSite', name: 'TopScorers', url: BASE },
    publisher: { '@type': 'Organization', name: 'Furiosa Studio', url: 'https://furiosadata.com' },
  }

  const datasetJsonLd = digest.goals.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: t(lang, `Goleadores del ${dateStr}`, `Goalscorers on ${dateStr}`),
    description: t(lang,
      `Todos los goles marcados el ${dateStr} en las competiciones seguidas por TopScorers, con goleador, minuto, partido y competición.`,
      `Every goal scored on ${dateStr} across the competitions TopScorers tracks, with scorer, minute, match and competition.`),
    url: canonicalUrl,
    dateModified: digest.fetchedAt,
    temporalCoverage: digest.date,
    creator: { '@type': 'Organization', name: 'Furiosa Studio', url: 'https://furiosadata.com' },
    publisher: { '@type': 'Organization', name: 'Furiosa Studio', url: 'https://furiosadata.com' },
  } : null

  const itemListJsonLd = digest.goals.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t(lang, `Goleadores del ${dateStr}`, `Goalscorers on ${dateStr}`),
    url: canonicalUrl,
    numberOfItems: digest.goals.length,
    itemListElement: digest.goals.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${g.player} (${g.scoringTeam}) ${minuteLabel(g.minute, g.extra)} — ${g.homeName} ${g.homeGoals}-${g.awayGoals} ${g.awayName}, ${g.leagueName}`,
    })),
  } : null

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  // Citable lead — the answer, first, with the date spelled out.
  const lead = digest.goals.length > 0
    ? t(lang,
        `${digest.isToday ? 'Hoy' : `El ${dateStr}`} se ${digest.goals.length === 1 ? 'ha marcado 1 gol' : `han marcado ${digest.goals.length} goles`} en ${digest.matchCount} ${digest.matchCount === 1 ? 'partido' : 'partidos'} de ${digest.leagueCount} ${digest.leagueCount === 1 ? 'competición' : 'competiciones'}.`,
        `${digest.isToday ? 'Today' : `On ${dateStr}`} there ${digest.goals.length === 1 ? 'has been 1 goal' : `have been ${digest.goals.length} goals`} in ${digest.matchCount} ${digest.matchCount === 1 ? 'match' : 'matches'} across ${digest.leagueCount} ${digest.leagueCount === 1 ? 'competition' : 'competitions'}.`)
    : t(lang,
        'No hay goles que mostrar: ningún partido de las competiciones que seguimos ha terminado con goles en los últimos días.',
        'No goals to show: no match in the competitions we track has finished with goals in the last few days.')

  return (
    <SaasShell activeKey="stats" breadcrumb={[t(lang, 'Goleadores del día', 'Top Scorer Daily')]}>
      {ld(webPageJsonLd)}
      {datasetJsonLd && ld(datasetJsonLd)}
      {itemListJsonLd && ld(itemListJsonLd)}
      {ld(faqJsonLd)}

      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', background: 'var(--ts-bg)' }}>
        <div style={{ background: 'linear-gradient(180deg, var(--ts-primary-soft), var(--ts-bg))', borderBottom: '1px solid var(--ts-border)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 26px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)', border: '1px solid var(--ts-border-hot)', marginBottom: 10 }}>
              {t(lang, 'Actualizado cada 30 min', 'Updated every 30 min')}
            </div>
            {/* The H1 carries the keyword, but it must not claim "today" while
                showing an earlier matchday — which is what it does every morning
                before the day's games finish. */}
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(30px, 5.4vw, 48px)', fontWeight: 800, color: 'var(--ts-primary)', letterSpacing: 1, lineHeight: 0.98, margin: 0 }}>
              {digest.isToday
                ? t(lang, `Goleadores de hoy — ${dateStr}`, `Top scorers today — ${dateStr}`)
                : t(lang, `Goleadores del día — última jornada, ${dateStr}`, `Top scorers of the day — latest matchday, ${dateStr}`)}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ts-text)', fontWeight: 600, margin: '12px 0 0', lineHeight: 1.55, maxWidth: 720 }}>
              {lead}
            </p>
            <p style={{ fontSize: 11, color: 'var(--ts-faint)', margin: '8px 0 0' }}>
              {/* Both halves come from fetchedAt — pairing the DATA's date with
                  the CURRENT time would read as a timestamp that never existed. */}
              <time dateTime={digest.fetchedAt}>
                {t(lang,
                  `Actualizado el ${dayLabel(digest.fetchedAt.slice(0, 10), lang)} a las ${timeLabel(digest.fetchedAt, lang)} UTC`,
                  `Updated ${dayLabel(digest.fetchedAt.slice(0, 10), lang)} at ${timeLabel(digest.fetchedAt, lang)} UTC`)}
              </time>
            </p>
            {!digest.isToday && digest.goals.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--ts-teal)', margin: '8px 0 0', fontWeight: 600 }}>
                {t(lang,
                  `Todavía no hay partidos terminados hoy. Esta es la última jornada con goles.`,
                  `No matches have finished today yet. This is the most recent matchday with goals.`)}
              </p>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 80px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Multi-goal players — the headline of any given day */}
          {digest.multiScorers.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 10px' }}>
                🔥 {t(lang, 'Más de un gol', 'More than one goal')}
              </h2>
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {digest.multiScorers.map(s => (
                  <div key={`${s.playerId ?? s.player}-${s.team}`} style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border-hot)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {s.goals}
                    </div>
                    <Link href={`/${lang}/jugadores/${slugify(s.player)}`} style={{ display: 'block', fontSize: 14, fontWeight: 700, marginTop: 6, color: 'var(--ts-text)', textDecoration: 'none' }}>
                      {s.player}
                    </Link>
                    <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2 }}>{s.team}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Goals, grouped by match */}
          {digest.goals.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
                ⚽ {t(lang, 'Todos los goles', 'Every goal')}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--ts-faint)', margin: '0 0 14px' }}>
                {t(lang,
                  `Goleador, minuto, partido y competición. Ordenado por importancia de la competición.`,
                  `Scorer, minute, match and competition. Ordered by competition tier.`)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[...byFixture.entries()].map(([fixtureId, goals]) => {
                  const g0 = goals[0]
                  return (
                    <article key={fixtureId} style={{ borderRadius: 12, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', overflow: 'hidden' }}>
                      <header style={{ padding: '11px 14px', borderBottom: '1px solid var(--ts-border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-teal)' }}>
                          {g0.leagueName}
                          {g0.leagueCountry && g0.leagueCountry !== 'World' ? <span style={{ color: 'var(--ts-faint)' }}> · {g0.leagueCountry}</span> : null}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ts-text)', marginLeft: 'auto' }}>
                          {g0.homeName} <span style={{ color: 'var(--ts-primary)' }}>{g0.homeGoals}–{g0.awayGoals}</span> {g0.awayName}
                        </span>
                      </header>
                      <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0' }}>
                        {goals.map((g, i) => (
                          <li key={`${g.playerId ?? g.player}-${g.minute}-${i}`} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '7px 14px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ts-primary)', minWidth: 44, fontFamily: "'Barlow Condensed', sans-serif" }}>
                              {minuteLabel(g.minute, g.extra)}
                            </span>
                            <Link href={`/${lang}/jugadores/${slugify(g.player)}`} style={{ fontSize: 14, fontWeight: 700, color: 'var(--ts-text)', textDecoration: 'none' }}>
                              {g.player}
                            </Link>
                            {g.kind !== 'goal' && (
                              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, padding: '1px 6px', borderRadius: 4, color: g.kind === 'own' ? 'var(--ts-red)' : 'var(--ts-muted)', border: `1px solid ${g.kind === 'own' ? 'var(--ts-red)' : 'var(--ts-border)'}` }}>
                                {g.kind === 'own' ? t(lang, 'En propia', 'Own goal') : t(lang, 'Penalti', 'Penalty')}
                              </span>
                            )}
                            <span style={{ fontSize: 12, color: 'var(--ts-muted)' }}>{g.scoringTeam}</span>
                            {g.assist && (
                              <span style={{ fontSize: 11, color: 'var(--ts-faint)' }}>
                                {t(lang, 'asist.', 'assist')} {g.assist}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </article>
                  )
                })}
              </div>
              {digest.truncated && (
                <p style={{ fontSize: 11, color: 'var(--ts-faint)', margin: '12px 0 0' }}>
                  {t(lang,
                    `Se muestran los partidos de las competiciones más seguidas. Hubo más encuentros con goles ese día en ligas menores.`,
                    `Showing matches from the most-followed competitions. There were further matches with goals that day in smaller leagues.`)}
                </p>
              )}
            </section>
          )}

          {digest.goals.length === 0 && (
            <section style={{ borderRadius: 12, padding: '40px 24px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
                {t(lang, 'Sin goles que mostrar', 'No goals to show')}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 460, margin: '0 auto' }}>
                {t(lang,
                  'Ningún partido de las competiciones que seguimos ha terminado con goles estos días. Mientras tanto, mira los líderes de la temporada.',
                  'No match in the competitions we track has finished with goals in the last few days. In the meantime, check the season leaders.')}
              </p>
              <Link href={`/${lang}/records`} style={{ display: 'inline-block', marginTop: 14, fontSize: 12, fontWeight: 700, color: 'var(--ts-primary)', textDecoration: 'none' }}>
                {t(lang, 'Ver los líderes de la temporada →', 'See the season leaders →')}
              </Link>
            </section>
          )}

          {/* FAQ — visible answers mirror the FAQPage JSON-LD (GEO citable) */}
          <section>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 12px' }}>
              {t(lang, 'Preguntas frecuentes', 'FAQ')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqs.map(({ q, a }) => (
                <div key={q} style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ts-text)', margin: '0 0 6px' }}>{q}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ts-muted)', margin: 0 }}>{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Outbound links the brief asks for, lang-prefixed so they resolve
              inside the current locale. */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }} aria-label={t(lang, 'Enlaces relacionados', 'Related links')}>
            {[
              { href: `/${lang}/records`, label: t(lang, 'Líderes de la temporada', 'Season leaders') },
              { href: `/${lang}/golden-boot`, label: t(lang, 'Bota de Oro', 'Golden Boot') },
              { href: `/${lang}/scouter`, label: t(lang, 'Scouter — Top 20 por liga', 'Scouter — Top 20 by league') },
              { href: `/${lang}/resultados`, label: t(lang, 'Resultados', 'Results') },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ color: 'var(--ts-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '6px 14px', background: 'var(--ts-primary-soft)', borderRadius: 20, border: '1px solid var(--ts-border-hot)' }}>
                {l.label}
              </Link>
            ))}
          </nav>

          <RelatedLinks title={t(lang, 'Más rankings', 'More rankings')} exclude={[]} />
        </div>
      </main>
    </SaasShell>
  )
}
