import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import { getNationalTeamId, getSquad, getCoach, getNationalTeamRecentLineups, getNationalTeamAggregateStats, getNationalTeamSeasonStats, type SquadPlayer } from '@/lib/api-football'
import { resolveNation, nationName, nationFact, nationSlug, WC_NATIONS } from '@/lib/wc-nations'
import { nationScorersFaqs } from '../wc-faqs'
import {
  nationWcScorers, nationWcCampaign, goldenBootRank, stageReached, outcomeClause, roundLabel,
  WC_CAPTURED_AT, type WcNationScorer, type WcCampaign,
} from '@/lib/wc2026'
import WcFaqList from '../_panels/WcFaqList'
import WcAd from '../_panels/WcAd'
import WcSignupCta from '../_panels/WcSignupCta'
import { flagFor } from '@/lib/flags'
import { PLAYERS } from '@/data/players'
import { iig } from '@/lib/iig'
import { playerSlug } from '@/lib/player-slug'
import { slugify } from '@/lib/slugify'
import type { PlayerData } from '@/types'

// 69 nations × es/en = ~138 ISR pages — by far the biggest ISR-write driver.
// Squads/coaches/facts are effectively static; the only live element is the WC
// top-scorers section, whose underlying getTopScorers call already carries its
// own shorter cache and is shared across all nation pages. Daily ISR here is the
// right trade: ~24× fewer background regen writes than the old 3600 while the
// live scorer numbers still refresh via the cached fetch + on next daily build.
// Defensive everywhere: missing data hides the section, the page never 500s.
export const revalidate = 86400 // 24h ISR (was 3600) — 138 pages, free-tier ISR writes

// Pre-render every WC nation at build time (ISR). The parent `[lang]` layout
// already emits both locales, so Next builds the lang × seleccion product — i.e.
// every nation page in both es/en is SSG. We return the canonical (ES-derived)
// slug per nation, deduped because WC_NATIONS lists a couple of teams twice with
// the same slug. Unlisted late qualifiers still render on demand (ISR fallback).
export function generateStaticParams() {
  const seen = new Set<string>()
  const params: { seleccion: string }[] = []
  for (const n of WC_NATIONS) {
    const slug = nationSlug(n)
    if (seen.has(slug)) continue
    seen.add(slug)
    params.push({ seleccion: slug })
  }
  return params
}

const t = (lang: 'es' | 'en', es: string, en: string) => (lang === 'en' ? en : es)

// ─── Metadata (canonical + hreflang, same shape as sibling WC pages) ──────────

export async function generateMetadata({ params }: { params: Promise<{ lang: string; seleccion: string }> }): Promise<Metadata> {
  const { lang: raw, seleccion } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const nation = resolveNation(seleccion)
  const name = nationName(nation, lang)
  const path = `/mundial-2026/${seleccion}`

  // The whole point of this page's title is to ANSWER the query in the SERP.
  // These nations rank top-10 for "<nation> top scorer 2026" but took ~0 clicks
  // with a generic title: the searcher wants a name and a number, and a rival
  // snippet that shows them wins the click. So the name and the goal count go
  // in the title itself. Read from the frozen snapshot → no API call.
  const teamId = await getNationalTeamId(nation.api)
  const scorers = nationWcScorers(teamId)
  const top = scorers[0]
  const totalGoals = scorers.reduce((s, p) => s + p.goals, 0)
  const goalWord = (n: number) => (lang === 'en' ? (n === 1 ? 'goal' : 'goals') : (n === 1 ? 'gol' : 'goles'))

  const title = top
    ? (lang === 'en'
        ? `${name} Top Scorer 2026 — ${top.name}, ${top.goals} ${goalWord(top.goals)}`
        : `Goleador de ${name} 2026 — ${top.name}, ${top.goals} ${goalWord(top.goals)}`)
    : (lang === 'en'
        ? `${name} Top Scorers · World Cup 2026: Squad, Goals & Lineup`
        : `Goleadores de ${name} · Mundial 2026: Plantilla, Goles y Once`)

  const description = top
    ? (lang === 'en'
        ? `${top.name} was ${name}'s top scorer at the 2026 World Cup with ${top.goals} ${goalWord(top.goals)}. Full ${name} scorers table, every goal, match-by-match run and the squad.`
        : `${top.name} fue el máximo goleador de ${name} en el Mundial 2026 con ${top.goals} ${goalWord(top.goals)}. Tabla completa de goleadores de ${name}, sus ${totalGoals} goles, recorrido partido a partido y plantilla.`)
    : (lang === 'en'
        ? `Every ${name} goal at the 2026 World Cup, the full scorers table, the match-by-match run and the squad that played it.`
        : `Todos los goles de ${name} en el Mundial 2026, la tabla completa de goleadores, el recorrido partido a partido y la plantilla.`)

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
    // Mirrors the query family these pages actually rank for in GSC — the
    // singular "top scorer" variants pull the most impressions, not the plural.
    keywords: [
      `${nation.en} top scorer 2026`, `${nation.en} top scorer world cup 2026`,
      `${nation.en} top goal scorers 2026`, `${nation.en} goal scorers world cup 2026`,
      `goleador de ${name} 2026`, `goleadores ${name} mundial 2026`,
      `${name} mundial 2026`, `${name} world cup 2026`, `plantilla ${name}`, `${name} squad`,
      'mundial 2026', 'world cup 2026',
    ],
  }
}

// ─── Position helpers ─────────────────────────────────────────────────────────

type Line = 'GK' | 'DEF' | 'MID' | 'ATT'
function lineOf(pos: string): Line {
  const p = (pos || '').toLowerCase()
  if (p.startsWith('goal')) return 'GK'
  if (p.startsWith('def')) return 'DEF'
  if (p.startsWith('mid')) return 'MID'
  return 'ATT'
}
const LINE_LABEL: Record<Line, { es: string; en: string }> = {
  GK: { es: 'Porteros', en: 'Goalkeepers' },
  DEF: { es: 'Defensas', en: 'Defenders' },
  MID: { es: 'Centrocampistas', en: 'Midfielders' },
  ATT: { es: 'Delanteros', en: 'Forwards' },
}

// ─── Match a squad member to our dataset (apiId → name) for ratings/value ─────

const norm = (s?: string) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim()
const lastName = (s: string) => { const parts = s.split(/\s+/); return parts[parts.length - 1] }

function matchDataset(player: SquadPlayer): PlayerData | undefined {
  // Prefer exact apiId match (unambiguous), then normalized full-name, then
  // last-name + a loose check, all against our curated dataset.
  const byId = PLAYERS.find(p => p.apiId === player.id)
  if (byId) return byId
  const n = norm(player.name)
  const byName = PLAYERS.find(p => norm(p.name) === n || (p.fullName && norm(p.fullName) === n))
  if (byName) return byName
  const ln = norm(lastName(player.name))
  return PLAYERS.find(p => norm(lastName(p.name)) === ln)
}

function parseMarketValue(mv?: string): number {
  // "€70M" → 70_000_000 ; "€900K" → 900_000. Returns 0 when absent/unparseable.
  if (!mv) return 0
  const m = mv.match(/([\d.]+)\s*([MmKk])?/)
  if (!m) return 0
  const n = parseFloat(m[1])
  if (!isFinite(n)) return 0
  const unit = (m[2] ?? '').toUpperCase()
  return unit === 'M' ? n * 1e6 : unit === 'K' ? n * 1e3 : n
}

function formatValue(total: number, lang: 'es' | 'en'): string {
  if (total >= 1e9) return `€${(total / 1e9).toFixed(total >= 1e10 ? 0 : 1)}${t(lang, 'B', 'B')}`
  if (total >= 1e6) return `€${Math.round(total / 1e6)}M`
  if (total >= 1e3) return `€${Math.round(total / 1e3)}K`
  return `€${Math.round(total)}`
}

interface Enriched extends SquadPlayer {
  data?: PlayerData
  impact: number        // ranking metric: IIG when available, else seniority proxy
  hasMetric: boolean
  recentStarts: number  // starts in the team's recent finished matches
  recentMinutes: number // minutes in those recent matches
  /** XI selection score: dominated by recent starts+minutes, IIG as tiebreak. */
  xiScore: number
}

// Parse the digits of a formation string ("4-3-3" → [4,3,3] meaning DEF/MID/ATT).
function parseFormation(f: string | null): { def: number; mid: number; att: number } {
  const parts = (f ?? '').split('-').map(n => parseInt(n, 10)).filter(n => n > 0)
  if (parts.length >= 3) {
    const def = parts[0]
    const att = parts[parts.length - 1]
    const mid = parts.slice(1, -1).reduce((s, n) => s + n, 0)
    return { def, mid, att }
  }
  return { def: 4, mid: 3, att: 3 }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NationalTeamPage({ params }: { params: Promise<{ lang: string; seleccion: string }> }) {
  const { lang: raw, seleccion } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const nation = resolveNation(seleccion)
  const name = nationName(nation, lang)
  const flag = flagFor(nation.api) ?? '🏳️'
  const fact = nationFact(nation, lang)

  const breadcrumb = lang === 'en' ? ['Competitions', 'World Cup 2026', name] : ['Competiciones', 'Mundial 2026', name]

  // ── Data (all defensive) ──
  const teamId = await getNationalTeamId(nation.api)
  const [squad, coach, recent, teamStats, seasonStats] = teamId
    ? await Promise.all([
        getSquad(teamId),
        getCoach(teamId),
        getNationalTeamRecentLineups(teamId),
        getNationalTeamAggregateStats(teamId),
        getNationalTeamSeasonStats(teamId),
      ])
    : [[] as SquadPlayer[], null, null, null, null]

  // This nation's World Cup scorers, from the frozen tournament snapshot. The
  // old code filtered the tournament-wide top-20 endpoint by team, which only
  // ever surfaced a nation's single best player (Mexico → Quiñones and nobody
  // else) — a one-row "table" that read as thin, duplicated boilerplate. The
  // snapshot carries EVERY scorer of every nation, costs no API quota, and can
  // never be blanked by the daily quota running out.
  const wcScorers: WcNationScorer[] = nationWcScorers(teamId)
  const campaign: WcCampaign | null = nationWcCampaign(teamId)
  const wcGoalsTotal = wcScorers.reduce((s, p) => s + p.goals, 0)
  const topScorerWc = wcScorers[0]
  const topScorerWcName = topScorerWc?.name
  const topScorerWcGoals = topScorerWc?.goals ?? 0
  const bootRank = topScorerWc ? goldenBootRank(topScorerWc.id) : null
  const stage = campaign ? stageReached(campaign, lang) : undefined
  // The nation's true goal tally is the one from the fixtures. It can exceed the
  // sum of its players' goals, because an opponent's own goal counts for the
  // team but has no scorer — Spain's 14 vs their scorers' 13. Report the team
  // total, and account for the gap instead of letting the page contradict itself.
  const teamGoals = campaign?.goalsFor ?? wcGoalsTotal
  const ownGoalsFor = Math.max(0, teamGoals - wcGoalsTotal)

  // Opponent names come from api-football in English. On the ES page they run
  // inside Spanish prose, so route them through our nation table ("Spain" →
  // "España"). Unlisted nations resolve to themselves, so this never breaks.
  const opponentName = (apiName: string) => nationName(resolveNation(slugify(apiName)), lang)

  // Citable lead — the direct answer, in the first sentence, in the first 40
  // words. This is what a snippet and an AI answer both lift verbatim.
  const goalW = (n: number) => t(lang, n === 1 ? 'gol' : 'goles', n === 1 ? 'goal' : 'goals')
  // A nation with no fixtures never qualified — saying "nobody scored" would be
  // technically true but read as a false claim about a team that played.
  const played = campaign != null
  const scorerLead = topScorerWcName
    ? t(lang,
        `${topScorerWcName} fue el máximo goleador de ${name} en el Mundial 2026 con ${topScorerWcGoals} ${goalW(topScorerWcGoals)}.`,
        `${topScorerWcName} was ${name}'s top scorer at the 2026 World Cup with ${topScorerWcGoals} ${goalW(topScorerWcGoals)}.`)
    : played
      ? t(lang,
          `Ningún jugador de ${name} marcó en el Mundial 2026.`,
          `No ${name} player scored at the 2026 World Cup.`)
      : t(lang,
          `${name} no se clasificó para el Mundial 2026, así que no tiene goleadores en el torneo. Abajo están su plantilla actual y sus figuras.`,
          `${name} did not qualify for the 2026 World Cup, so they have no scorers at the tournament. Their current squad and standout players are below.`)
  // Second sentence: the nation-level totals that make the answer self-contained.
  const outcome = campaign && stage ? ` ${outcomeClause(stage, lang)}` : ''
  const ogNote = ownGoalsFor > 0
    ? t(lang,
        ` (más ${ownGoalsFor} en propia puerta del rival)`,
        ` (plus ${ownGoalsFor} opposition own ${ownGoalsFor === 1 ? 'goal' : 'goals'})`)
    : ''
  const scorerLead2 = campaign
    ? t(lang,
        `${name} marcó ${teamGoals} ${goalW(teamGoals)} en ${campaign.played} ${campaign.played === 1 ? 'partido' : 'partidos'}${outcome}. Marcaron ${wcScorers.length} ${wcScorers.length === 1 ? 'jugador' : 'jugadores'} distintos${ogNote}.`,
        `${name} scored ${teamGoals} ${goalW(teamGoals)} in ${campaign.played} ${campaign.played === 1 ? 'match' : 'matches'}${outcome}. ${wcScorers.length} different ${wcScorers.length === 1 ? 'player' : 'players'} got on the scoresheet${ogNote}.`)
    : null
  // The tournament is over: "updated" is the capture date of the final data, not
  // today's date. Claiming daily freshness on frozen results would be a lie.
  const updatedLabel = new Date(`${WC_CAPTURED_AT}T00:00:00Z`).toLocaleDateString(
    lang === 'en' ? 'en-US' : 'es-ES',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
  )

  // Do we have real recent-match usage? If so, the XI is "based on recent XI";
  // otherwise we fall back to the squad heuristic ("based on squad").
  const hasRecent = !!(recent && Object.keys(recent.byPlayer).length > 0)

  // Enrich each squad member with our dataset row, an "impact" ranking value, and
  // recent national-team usage (starts + minutes in the last ~10 matches).
  const enriched: Enriched[] = squad.map(p => {
    const data = matchDataset(p)
    const hasMetric = !!(data && data.rating != null)
    // IIG when we have a dataset row; otherwise a seniority proxy (lower shirt
    // numbers tend to be established starters) so standouts still surface.
    const impact = data ? iig(data) : (p.number ? 100 - p.number : 0)
    const r = recent?.byPlayer[p.id]
    const recentStarts = r?.starts ?? 0
    const recentMinutes = r?.minutes ?? 0
    // XI selection score: starts dominate (each start ≈ 1000 pts), minutes add
    // granularity, IIG breaks ties / ranks players with equal recent usage.
    // Players with NO recent national-team minutes fall to the bottom (only IIG).
    const xiScore = recentStarts * 1000 + recentMinutes + impact / 1000
    return { ...p, data, impact, hasMetric, recentStarts, recentMinutes, xiScore }
  })

  // Standouts: when we have recent-match data, rank by who actually plays
  // (recent usage), then dataset metric; otherwise fall back to metric/impact.
  const ranked = hasRecent
    ? [...enriched].sort((a, b) => b.xiScore - a.xiScore)
    : [...enriched].sort((a, b) => Number(b.hasMetric) - Number(a.hasMetric) || b.impact - a.impact)
  const standouts = ranked.slice(0, 3)

  // Grouped full squad (shirt-number order for readability).
  const byLine: Record<Line, Enriched[]> = { GK: [], DEF: [], MID: [], ATT: [] }
  for (const p of enriched) byLine[lineOf(p.position)].push(p)
  for (const k of Object.keys(byLine) as Line[]) {
    byLine[k].sort((a, b) => (a.number ?? 99) - (b.number ?? 99))
  }

  // Potential XI: pick per line by recent starts+minutes (xiScore) when we have
  // recent data — this surfaces real starters (Pedri, Vinícius…) over shirt
  // numbers — falling back to dataset impact otherwise. Formation from the
  // most-used recent shape, else 4-3-3.
  const sortKey: (a: Enriched, b: Enriched) => number = hasRecent
    ? (a, b) => b.xiScore - a.xiScore
    : (a, b) => b.impact - a.impact
  const topBy = (line: Line, n: number) => [...byLine[line]].sort(sortKey).slice(0, n)
  const shape = parseFormation(recent?.formation ?? null)
  const lineup = {
    GK: topBy('GK', 1),
    DEF: topBy('DEF', shape.def),
    MID: topBy('MID', shape.mid),
    ATT: topBy('ATT', shape.att),
  }
  const formationLabel = `${shape.def}-${shape.mid}-${shape.att}`
  const hasLineup = lineup.GK.length + lineup.DEF.length + lineup.MID.length + lineup.ATT.length >= 7

  // Stats strip.
  const size = squad.length
  const ages = squad.map(p => p.age).filter((a): a is number => a != null && a > 0)
  const avgAge = ages.length ? (ages.reduce((s, a) => s + a, 0) / ages.length) : null
  const ratings = enriched.map(p => p.data?.rating).filter((r): r is number => r != null)
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length) : null
  const valueTotal = enriched.reduce((s, p) => s + parseMarketValue(p.data?.marketValue), 0)

  const dataAvailable = size > 0

  // Squad top scorer (from our dataset rows, club-season goals) — an "extra".
  const topScorer = [...enriched]
    .filter(p => p.data?.goles != null)
    .sort((a, b) => (b.data!.goles ?? 0) - (a.data!.goles ?? 0))[0]

  // Form string → coloured chips (newest last). W gold, D muted, L red.
  const formColor = (c: string) => (c === 'W' ? 'var(--ts-primary)' : c === 'L' ? 'var(--ts-red)' : 'var(--ts-muted)')

  // ── Small presentational helpers (server, inline styles, --ts tokens) ──
  const PlayerCard = ({ p, big }: { p: Enriched; big?: boolean }) => {
    const inner = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.photo} alt={p.name} width={big ? 72 : 40} height={big ? 72 : 40}
          style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: big ? '2px solid var(--ts-primary)' : '1px solid var(--ts-border)' }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: big ? 16 : 13, fontWeight: big ? 800 : 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: big ? "'Barlow Condensed', sans-serif" : 'inherit' }}>{p.name}</div>
          <div style={{ fontSize: big ? 11 : 10, color: 'var(--ts-muted)' }}>
            {p.number != null ? `#${p.number}` : ''}{p.number != null && p.age ? ' · ' : ''}{p.age ? `${p.age} ${t(lang, 'años', 'yrs')}` : ''}
          </div>
          {big && p.data?.rating != null && (
            <div style={{ fontSize: 10, marginTop: 2, color: 'var(--ts-primary)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {t(lang, 'Valoración', 'Rating')} {p.data.rating.toFixed(2)}
            </div>
          )}
        </div>
      </>
    )
    const style: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: big ? 14 : 10,
      padding: big ? '16px 18px' : '8px 12px',
      borderRadius: big ? 14 : 10,
      background: big ? 'var(--ts-primary-soft)' : 'var(--ts-card)',
      border: `1px solid ${big ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
      textDecoration: 'none', color: 'inherit',
    }
    // Every squad member is clickable: use the canonical dataset slug when we
    // have a match, otherwise a name-derived slug (the player profile resolves
    // names via its search index, so these still land on a profile).
    const slug = p.data ? playerSlug(p.data) : slugify(p.name)
    return (
      <Link href={`/${lang}/jugadores/${slug}`} style={{ ...style, cursor: 'pointer' }}>{inner}</Link>
    )
  }

  // ── Structured data: SportsTeam (+ BreadcrumbList), using only data the page
  //    actually has. Squad → athlete members when available; coach → SportsTeam
  //    coach. No fabricated fields. The English name is the canonical `name`. ──
  const canonicalUrl = `https://www.top-scorers.com/${lang}/mundial-2026/${seleccion}`
  const sportsTeamJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name,
    alternateName: nation.en !== name ? nation.en : undefined,
    sport: 'Soccer',
    url: canonicalUrl,
    memberOf: { '@type': 'SportsOrganization', name: 'FIFA World Cup 2026' },
    ...(coach ? { coach: { '@type': 'Person', name: coach.name } } : {}),
    ...(squad.length > 0
      ? { athlete: squad.map(p => ({ '@type': 'Person', name: p.name })) }
      : {}),
  }
  // Drop undefined keys so the emitted JSON-LD stays clean.
  for (const k of Object.keys(sportsTeamJsonLd)) {
    if (sportsTeamJsonLd[k] === undefined) delete sportsTeamJsonLd[k]
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : 'Inicio', item: 'https://www.top-scorers.com' },
      { '@type': 'ListItem', position: 2, name: lang === 'en' ? 'World Cup 2026' : 'Mundial 2026', item: `https://www.top-scorers.com/${lang}/mundial-2026` },
      { '@type': 'ListItem', position: 3, name, item: canonicalUrl },
    ],
  }

  // ItemList JSON-LD of this nation's WC top scorers (mirrors the server-rendered
  // list below). Only emitted when there's real data → no empty/fabricated list.
  const goalsWord = lang === 'en' ? 'goals' : 'goles'
  const scorersItemListJsonLd = wcScorers.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'en'
      ? `${name} top scorers — 2026 World Cup`
      : `Goleadores de ${name} — Mundial 2026`,
    description: lang === 'en'
      ? `${name}'s top scorers at the 2026 FIFA World Cup, ranked by goals.`
      : `Goleadores de ${name} en el Mundial 2026, ordenados por goles.`,
    url: canonicalUrl,
    numberOfItems: wcScorers.length,
    itemListElement: wcScorers.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.name} — ${p.goals} ${goalsWord}`,
    })),
  } : null

  // Person JSON-LD for the nation's top scorer — the entity the query is
  // actually about ("who is Mexico's top scorer?"). Only real, sourced fields.
  const topScorerJsonLd = topScorerWc ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: topScorerWc.name,
    ...(topScorerWc.photo ? { image: topScorerWc.photo } : {}),
    ...(topScorerWc.position ? { jobTitle: topScorerWc.position } : {}),
    nationality: { '@type': 'Country', name: nation.en },
    memberOf: { '@type': 'SportsTeam', name: nation.en, sport: 'Soccer' },
    url: canonicalUrl,
    description: lang === 'en'
      ? `${name}'s top scorer at the 2026 FIFA World Cup with ${topScorerWcGoals} ${topScorerWcGoals === 1 ? 'goal' : 'goals'}.`
      : `Máximo goleador de ${name} en el Mundial 2026 con ${topScorerWcGoals} ${topScorerWcGoals === 1 ? 'gol' : 'goles'}.`,
  } : null

  // WebPage node carrying a real dateModified (the date the final tournament
  // data was frozen) + the Furiosa Studio publisher, per the brand rule.
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': canonicalUrl,
    url: canonicalUrl,
    name: lang === 'en' ? `${name} top scorers 2026` : `Goleadores de ${name} 2026`,
    inLanguage: lang === 'en' ? 'en' : 'es',
    dateModified: WC_CAPTURED_AT,
    isPartOf: { '@type': 'WebSite', name: 'TopScorers', url: 'https://www.top-scorers.com' },
    publisher: { '@type': 'Organization', name: 'Furiosa Studio', url: 'https://furiosadata.com' },
  }

  // FAQPage JSON-LD built from the SAME source the visible FAQ renders (concrete
  // when a scorer exists → citable for GEO). Mirrors the <details> accordion.
  const nationFaqs = nationScorersFaqs(lang, name, {
    topName: topScorerWcName,
    topGoals: topScorerWcName ? topScorerWcGoals : undefined,
    scorerCount: wcScorers.length,
    totalGoals: teamGoals,
    outcome: campaign && stage ? outcomeClause(stage, lang) : undefined,
    played: campaign?.played ?? 0,
    rank: bootRank,
  })
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: nationFaqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  const ld = (obj: object) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }} />
  )

  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
      {ld(webPageJsonLd)}
      {ld(sportsTeamJsonLd)}
      {ld(breadcrumbJsonLd)}
      {topScorerJsonLd && ld(topScorerJsonLd)}
      {scorersItemListJsonLd && ld(scorersItemListJsonLd)}
      {ld(faqJsonLd)}
      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', background: 'var(--ts-bg)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(180deg, var(--ts-primary-soft), var(--ts-bg))', borderBottom: '1px solid var(--ts-border)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 24px' }}>
            <Link href={`/${lang}/mundial-2026`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)', textDecoration: 'none' }}>
              ← {t(lang, 'Mundial 2026', 'World Cup 2026')}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 56, lineHeight: 1 }} aria-hidden>{flag}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)', border: '1px solid var(--ts-border-hot)', marginBottom: 6 }}>
                  FIFA World Cup 2026
                </div>
                {/* H1 carries the keyword. It used to be the bare nation name
                    ("Mexico"), which matched no query the page ranks for. */}
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(30px, 5.4vw, 48px)', fontWeight: 800, color: 'var(--ts-primary)', letterSpacing: 1, lineHeight: 0.95, margin: 0 }}>
                  {t(lang, `Goleadores de ${name} 2026`, `${name} top scorers 2026`)}
                </h1>
                {stage && (
                  <div style={{ fontSize: 12, color: 'var(--ts-teal)', fontWeight: 700, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t(lang, `Mundial 2026 · ${stage.label}`, `World Cup 2026 · ${stage.label}`)}
                  </div>
                )}
                {coach && (
                  <div style={{ fontSize: 13, color: 'var(--ts-muted)', marginTop: 6 }}>
                    {t(lang, 'Seleccionador', 'Head coach')}: <span style={{ color: 'var(--ts-text)', fontWeight: 600 }}>{coach.name}</span>
                    {coach.nationality ? ` · ${coach.nationality}` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* WC top scorers — the answer, then the evidence. The lead answers
              "<nation> top scorer 2026" in the first sentence; the table is the
              per-nation content that no other page repeats. */}
          <section>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
              ⚽ {t(lang, `Goleadores de ${name} · Mundial 2026`, `${name} Top Scorers · World Cup 2026`)}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ts-text)', fontWeight: 700, margin: '0 0 6px', lineHeight: 1.55 }}>
              {scorerLead}
            </p>
            {scorerLead2 && (
              <p style={{ fontSize: 14, color: 'var(--ts-text)', margin: '0 0 6px', lineHeight: 1.6 }}>
                {scorerLead2}
              </p>
            )}
            <p style={{ fontSize: 11, color: 'var(--ts-faint)', margin: '0 0 12px' }}>
              {t(lang, `Datos finales del torneo · actualizado ${updatedLabel}`, `Final tournament data · updated ${updatedLabel}`)}
            </p>

            {wcScorers.length > 0 && (
              <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
                    <caption style={{ captionSide: 'top', textAlign: 'left', padding: '12px 14px 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>
                      {t(lang, `Todos los goleadores de ${name} en el Mundial 2026`, `Every ${name} scorer at the 2026 World Cup`)}
                    </caption>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--ts-border)' }}>
                        <th scope="col" style={{ textAlign: 'left', padding: '8px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>#</th>
                        <th scope="col" style={{ textAlign: 'left', padding: '8px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'Jugador', 'Player')}</th>
                        <th scope="col" style={{ textAlign: 'right', padding: '8px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'Goles', 'Goals')}</th>
                        <th scope="col" style={{ textAlign: 'right', padding: '8px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'Asist.', 'Assists')}</th>
                        <th scope="col" style={{ textAlign: 'right', padding: '8px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'PJ', 'Apps')}</th>
                        <th scope="col" style={{ textAlign: 'right', padding: '8px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'Min', 'Min')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wcScorers.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: i === wcScorers.length - 1 ? 'none' : '1px solid var(--ts-border)' }}>
                          <td style={{ padding: '10px 14px', color: 'var(--ts-faint)', fontWeight: 700 }}>{i + 1}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.photo} alt={p.name} width={26} height={26} loading="lazy"
                                style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--ts-border)' }} />
                              <Link href={`/${lang}/jugadores/${slugify(p.name)}`} style={{ color: 'var(--ts-text)', fontWeight: 700, textDecoration: 'none' }}>
                                {p.name}
                              </Link>
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', color: 'var(--ts-primary)', fontWeight: 800 }}>{p.goals}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: 'var(--ts-muted)' }}>{p.assists}</td>
                          <td style={{ padding: '10px', textAlign: 'right', color: 'var(--ts-muted)' }}>{p.apps}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--ts-muted)' }}>{p.minutes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Golden Boot context — turns a bare number into a ranking the
                reader can place, and feeds the /golden-boot hub a real link. */}
            {topScorerWc && (
              <p style={{ fontSize: 13, color: 'var(--ts-text)', lineHeight: 1.7, margin: '14px 0 0' }}>
                {bootRank
                  ? t(lang,
                      `Con sus ${topScorerWcGoals} ${goalW(topScorerWcGoals)}, ${topScorerWcName} terminó en el puesto ${bootRank}.º de la carrera por la Bota de Oro del Mundial 2026, que ganó Kylian Mbappé con 10 goles.`,
                      `Those ${topScorerWcGoals} ${goalW(topScorerWcGoals)} left ${topScorerWcName} ${bootRank}${bootRank === 1 ? 'st' : bootRank === 2 ? 'nd' : bootRank === 3 ? 'rd' : 'th'} in the 2026 World Cup Golden Boot race, won by Kylian Mbappé with 10 goals.`)
                  : t(lang,
                      `${topScorerWcName} quedó fuera del top-20 de la Bota de Oro del Mundial 2026, que ganó Kylian Mbappé con 10 goles.`,
                      `${topScorerWcName} finished outside the top 20 of the 2026 World Cup Golden Boot race, won by Kylian Mbappé with 10 goals.`)}
                {' '}
                <Link href={`/${lang}/golden-boot`} style={{ color: 'var(--ts-primary)', fontWeight: 700, textDecoration: 'none' }}>
                  {t(lang, 'Ver la tabla completa de la Bota de Oro →', 'See the full Golden Boot table →')}
                </Link>
              </p>
            )}
          </section>

          {/* Match-by-match run — the section that makes this page genuinely
              unique per nation instead of a shared template with a name swapped
              in. Derived from the frozen fixture list, so no API cost. */}
          {campaign && (
            <section>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
                🗓 {t(lang, `El Mundial 2026 de ${name}, partido a partido`, `${name}'s 2026 World Cup, match by match`)}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ts-text)', lineHeight: 1.7, margin: '0 0 12px' }}>
                {t(lang,
                  `${name} disputó ${campaign.played} ${campaign.played === 1 ? 'partido' : 'partidos'} en el Mundial 2026: ${campaign.won} ${campaign.won === 1 ? 'victoria' : 'victorias'}, ${campaign.drawn} ${campaign.drawn === 1 ? 'empate' : 'empates'} y ${campaign.lost} ${campaign.lost === 1 ? 'derrota' : 'derrotas'}, con ${campaign.goalsFor} ${goalW(campaign.goalsFor)} a favor y ${campaign.goalsAgainst} en contra.`,
                  `${name} played ${campaign.played} ${campaign.played === 1 ? 'match' : 'matches'} at the 2026 World Cup: ${campaign.won} ${campaign.won === 1 ? 'win' : 'wins'}, ${campaign.drawn} ${campaign.drawn === 1 ? 'draw' : 'draws'} and ${campaign.lost} ${campaign.lost === 1 ? 'defeat' : 'defeats'}, scoring ${campaign.goalsFor} and conceding ${campaign.goalsAgainst}.`)}
              </p>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {campaign.matches.map((m, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderRadius: 10, padding: '10px 14px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 800, flexShrink: 0,
                      color: 'var(--ts-bg)', fontFamily: "'Barlow Condensed', sans-serif",
                      background: m.result === 'W' ? 'var(--ts-primary)' : m.result === 'L' ? 'var(--ts-red)' : 'var(--ts-muted)',
                    }}>
                      {t(lang, m.result === 'W' ? 'V' : m.result === 'L' ? 'D' : 'E', m.result)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ts-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 130 }}>
                      {roundLabel(m.round, lang)}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ts-text)' }}>
                      {m.scored}–{m.conceded}
                      {m.penalties ? <span style={{ fontSize: 11, color: 'var(--ts-muted)', fontWeight: 600 }}> ({m.penalties.for}–{m.penalties.against} {t(lang, 'pen.', 'pens')})</span> : null}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--ts-muted)' }}>
                      {t(lang, m.home ? 'vs' : 'a domicilio ante', m.home ? 'vs' : 'away to')} <span style={{ color: 'var(--ts-text)', fontWeight: 600 }}>{opponentName(m.opponent)}</span>
                    </span>
                    <time dateTime={m.date.slice(0, 10)} style={{ fontSize: 11, color: 'var(--ts-faint)', marginLeft: 'auto' }}>
                      {new Date(m.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                    </time>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* In-content ad after the citable scorers lead (self-gates for Pro) */}
          <WcAd />

          {!dataAvailable && (
            <div style={{ borderRadius: 12, padding: '40px 24px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
                {t(lang, 'Plantilla no disponible', 'Squad unavailable')}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 460, margin: '0 auto' }}>
                {t(lang,
                  `No tenemos la lista de jugadores de ${name} para el Mundial 2026. Los goles y el recorrido del torneo sí están arriba, con datos finales.`,
                  `We don't have ${name}'s player list for the 2026 World Cup. The goals and the tournament run above are complete and final.`)}
              </p>
              <Link href={`/${lang}/mundial-2026`} style={{ display: 'inline-block', marginTop: 14, fontSize: 12, fontWeight: 700, color: 'var(--ts-primary)', textDecoration: 'none' }}>
                {t(lang, 'Ir al Mundial 2026 →', 'Go to World Cup 2026 →')}
              </Link>
            </div>
          )}

          {/* Standouts */}
          {standouts.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 12px' }}>
                ⭐ {t(lang, 'Figuras', 'Standout players')}
              </h2>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {standouts.map(p => <PlayerCard key={p.id} p={p} big />)}
              </div>
            </section>
          )}

          {/* Stats strip */}
          {dataAvailable && (
            <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
              {[
                { v: String(size), l: t(lang, 'Convocados', 'Squad size') },
                ...(avgAge != null ? [{ v: avgAge.toFixed(1), l: t(lang, 'Edad media', 'Average age') }] : []),
                ...(avgRating != null ? [{ v: avgRating.toFixed(2), l: t(lang, 'Valoración media', 'Avg rating') }] : []),
                ...(valueTotal > 0 ? [{ v: formatValue(valueTotal, lang), l: t(lang, 'Valor estimado', 'Est. value') }] : []),
              ].map(s => (
                <div key={s.l} style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{s.v}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{s.l}</div>
                </div>
              ))}
            </section>
          )}

          {/* Team performance — cross-% block (FootyStats-style), from recent
              finished matches. Defensive: whole section hidden without data. */}
          {teamStats && teamStats.played > 0 && (
            <section>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
                📊 {t(lang, 'Rendimiento del equipo', 'Team performance')}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--ts-faint)', margin: '0 0 12px' }}>
                {t(lang,
                  `Promedios de los últimos ${teamStats.played} partidos oficiales.`,
                  `Averages from the last ${teamStats.played} competitive matches.`)}
              </p>
              <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                {[
                  { v: `${teamStats.winPct}%`, l: t(lang, 'Victorias', 'Win rate') },
                  { v: `${teamStats.drawPct}%`, l: t(lang, 'Empates', 'Draws') },
                  { v: `${teamStats.lossPct}%`, l: t(lang, 'Derrotas', 'Losses') },
                  { v: `${teamStats.cleanSheetPct}%`, l: t(lang, 'Portería a cero', 'Clean sheets') },
                  { v: `${teamStats.bttsPct}%`, l: t(lang, 'Ambos marcan', 'Both teams score') },
                  { v: teamStats.goalsForAvg.toFixed(2), l: t(lang, 'Goles a favor/partido', 'Goals for / match') },
                  { v: teamStats.goalsAgainstAvg.toFixed(2), l: t(lang, 'Goles en contra/partido', 'Goals against / match') },
                ].map(s => (
                  <div key={s.l} style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{s.v}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{s.l}</div>
                  </div>
                ))}
                {/* Form chips */}
                {teamStats.form.length > 0 && (
                  <div style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {teamStats.form.split('').map((c, i) => (
                        <span key={i} style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 22, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 800,
                          color: 'var(--ts-bg)', background: formColor(c), fontFamily: "'Barlow Condensed', sans-serif",
                        }}>{c}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'Forma (últimos 5)', 'Form (last 5)')}</div>
                  </div>
                )}
              </div>

              {/* Real season statistics (/teams/statistics): clean sheets, biggest
                  win, win streak, formations used, W/D/L home/away split. Richer
                  and more accurate than the recent-fixture aggregate above. */}
              {seasonStats && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-teal)', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {t(lang, 'Estadísticas de temporada', 'Season statistics')}
                    {seasonStats.leagueName ? <span style={{ color: 'var(--ts-faint)', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}> · {seasonStats.leagueName} {seasonStats.season}</span> : null}
                  </div>
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                    {[
                      { v: String(seasonStats.cleanSheet.total), l: t(lang, 'Porterías a cero', 'Clean sheets') },
                      { v: String(seasonStats.failedToScore.total), l: t(lang, 'Sin marcar', 'Failed to score') },
                      ...(seasonStats.biggestWinHome || seasonStats.biggestWinAway
                        ? [{ v: (seasonStats.biggestWinHome ?? seasonStats.biggestWinAway) as string, l: t(lang, 'Mayor victoria', 'Biggest win') }]
                        : []),
                      ...(seasonStats.biggestStreak.wins > 0
                        ? [{ v: String(seasonStats.biggestStreak.wins), l: t(lang, 'Racha victorias', 'Win streak') }]
                        : []),
                      { v: `${seasonStats.fixtures.wins.home}-${seasonStats.fixtures.draws.home}-${seasonStats.fixtures.loses.home}`, l: t(lang, 'Local (V-E-D)', 'Home (W-D-L)') },
                      { v: `${seasonStats.fixtures.wins.away}-${seasonStats.fixtures.draws.away}-${seasonStats.fixtures.loses.away}`, l: t(lang, 'Visitante (V-E-D)', 'Away (W-D-L)') },
                    ].map(s => (
                      <div key={s.l} style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{s.v}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{s.l}</div>
                      </div>
                    ))}
                    {seasonStats.lineups.length > 0 && (
                      <div style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {seasonStats.lineups.slice(0, 2).map(l => l.formation).join(' · ')}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'Formaciones usadas', 'Formations used')}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extra data lines (titles/ranking from the editorial fact + squad top scorer) */}
              {(fact || topScorer) && (
                <div style={{ marginTop: 12, borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topScorer?.data && (
                    <div style={{ fontSize: 13, color: 'var(--ts-text)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'Máximo goleador de la plantilla', 'Squad top scorer')}:</span>
                      <Link href={`/${lang}/jugadores/${playerSlug(topScorer.data)}`} style={{ color: 'var(--ts-primary)', fontWeight: 700, textDecoration: 'none' }}>{topScorer.name}</Link>
                      <span style={{ color: 'var(--ts-muted)' }}>· {topScorer.data.goles} {t(lang, 'goles (club, temporada)', 'goals (club, season)')}</span>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Potential lineup */}
          {hasLineup && (
            <section>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
                {t(lang, 'Once probable', 'Potential lineup')} <span style={{ fontSize: 14, color: 'var(--ts-muted)' }}>· {formationLabel}</span>
              </h2>
              <p style={{ fontSize: 11, color: 'var(--ts-faint)', margin: '0 0 12px' }}>
                {hasRecent
                  ? t(lang,
                      `Once probable (${formationLabel}) basado en quién juega los últimos partidos de la selección (titularidades y minutos recientes). No es la alineación oficial.`,
                      `Probable XI (${formationLabel}) based on who actually plays the team's recent matches (recent starts and minutes). Not the official lineup.`)
                  : t(lang,
                      `Estimación (${formationLabel}) basada en nuestra valoración y la convocatoria. No es la alineación oficial.`,
                      `Estimate (${formationLabel}) based on our rating and the squad list. Not the official lineup.`)}
              </p>
              <div style={{
                borderRadius: 16, padding: '22px 16px',
                background: 'linear-gradient(180deg, #1f7a44, #155f34)',
                border: '1px solid var(--ts-border)',
                display: 'flex', flexDirection: 'column', gap: 22,
              }}>
                {(['ATT', 'MID', 'DEF', 'GK'] as Line[]).map(line => (
                  <div key={line} style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(8px, 3vw, 28px)', flexWrap: 'wrap' }}>
                    {lineup[line].map(p => (
                      <Link
                        key={p.id}
                        href={`/${lang}/jugadores/${p.data ? playerSlug(p.data) : slugify(p.name)}`}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 64, textDecoration: 'none', cursor: 'pointer' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.photo} alt={p.name} width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--ts-primary)', background: '#fff' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 64 }}>
                          {p.number != null ? `${p.number} ` : ''}{lastName(p.name)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Full squad grouped */}
          {dataAvailable && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: 0 }}>
                {t(lang, 'Plantilla completa', 'Full squad')}
              </h2>
              {(['GK', 'DEF', 'MID', 'ATT'] as Line[]).filter(l => byLine[l].length > 0).map(line => (
                <div key={line}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, color: 'var(--ts-muted)', fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {t(lang, LINE_LABEL[line].es, LINE_LABEL[line].en)} <span style={{ color: 'var(--ts-faint)' }}>({byLine[line].length})</span>
                  </div>
                  <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
                    {byLine[line].map(p => <PlayerCard key={p.id} p={p} />)}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Curious fact */}
          {fact && (
            <section style={{ borderRadius: 12, padding: '18px 20px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-teal)', marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>
                {t(lang, '¿Sabías que…?', 'Did you know?')}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ts-text)', margin: 0 }}>{fact}</p>
            </section>
          )}

          {/* Soft account capture — personalised to this nation. Signed-in
              users see nothing; never blocks the indexable content above. */}
          <WcSignupCta nation={name} />

          {/* FAQ — visible answers mirror the FAQPage JSON-LD (GEO citable). */}
          <WcFaqList
            faqs={nationFaqs}
            lang={lang}
            title={t(lang, `Preguntas frecuentes — Goleadores de ${name}`, `FAQ — ${name} Top Scorers`)}
          />
        </div>
      </main>
    </SaasShell>
  )
}
