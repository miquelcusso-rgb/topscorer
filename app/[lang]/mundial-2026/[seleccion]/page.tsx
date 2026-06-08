import type { Metadata } from 'next'
import Link from 'next/link'
import { isLocale } from '@/lib/i18n'
import SaasShell from '@/components/saas/SaasShell'
import { getNationalTeamId, getSquad, getCoach, type SquadPlayer } from '@/lib/api-football'
import { resolveNation, nationName, nationFact, nationSlug, WC_NATIONS } from '@/lib/wc-nations'
import { flagFor } from '@/lib/flags'
import { PLAYERS } from '@/data/players'
import { iig } from '@/lib/iig'
import { playerSlug } from '@/lib/player-slug'
import type { PlayerData } from '@/types'

// Squads/coaches change rarely → revalidate daily. Defensive everywhere: no data
// for a section just hides it (graceful "coming soon"), the page never 500s.
export const revalidate = 86400

const t = (lang: 'es' | 'en', es: string, en: string) => (lang === 'en' ? en : es)

// ─── Metadata (canonical + hreflang, same shape as sibling WC pages) ──────────

export async function generateMetadata({ params }: { params: Promise<{ lang: string; seleccion: string }> }): Promise<Metadata> {
  const { lang: raw, seleccion } = await params
  const lang = isLocale(raw) ? raw : 'es'
  const nation = resolveNation(seleccion)
  const name = nationName(nation, lang)
  const path = `/mundial-2026/${seleccion}`
  const title = lang === 'en'
    ? `${name} at the 2026 World Cup: Squad, Lineup & Players`
    : `${name} en el Mundial 2026: Plantilla, Once probable y Jugadores`
  const description = lang === 'en'
    ? `${name}'s 2026 World Cup squad: full player list, coach, potential lineup and key players. Live profile updated for the tournament.`
    : `Plantilla de ${name} para el Mundial 2026: lista completa de jugadores, seleccionador, once probable y figuras. Perfil actualizado para el torneo.`
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
    keywords: [`${name} mundial 2026`, `${name} world cup 2026`, `plantilla ${name}`, `${name} squad`, 'mundial 2026', 'world cup 2026'],
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
  const [squad, coach] = teamId
    ? await Promise.all([getSquad(teamId), getCoach(teamId)])
    : [[] as SquadPlayer[], null]

  // Enrich each squad member with our dataset row + an "impact" ranking value.
  const enriched: Enriched[] = squad.map(p => {
    const data = matchDataset(p)
    const hasMetric = !!(data && data.rating != null)
    // IIG when we have a dataset row; otherwise a seniority proxy (lower shirt
    // numbers tend to be established starters) so standouts still surface.
    const impact = data ? iig(data) : (p.number ? 100 - p.number : 0)
    return { ...p, data, impact, hasMetric }
  })

  // Standouts: prefer players we actually have a metric for; fall back to all.
  const ranked = [...enriched].sort((a, b) => Number(b.hasMetric) - Number(a.hasMetric) || b.impact - a.impact)
  const standouts = ranked.slice(0, 3)

  // Grouped full squad.
  const byLine: Record<Line, Enriched[]> = { GK: [], DEF: [], MID: [], ATT: [] }
  for (const p of enriched) byLine[lineOf(p.position)].push(p)
  for (const k of Object.keys(byLine) as Line[]) {
    byLine[k].sort((a, b) => (a.number ?? 99) - (b.number ?? 99))
  }

  // Potential lineup (4-3-3): top N per line by impact.
  const topBy = (line: Line, n: number) =>
    [...byLine[line]].sort((a, b) => b.impact - a.impact).slice(0, n)
  const lineup = {
    GK: topBy('GK', 1),
    DEF: topBy('DEF', 4),
    MID: topBy('MID', 3),
    ATT: topBy('ATT', 3),
  }
  const hasLineup = lineup.GK.length + lineup.DEF.length + lineup.MID.length + lineup.ATT.length >= 7

  // Stats strip.
  const size = squad.length
  const ages = squad.map(p => p.age).filter((a): a is number => a != null && a > 0)
  const avgAge = ages.length ? (ages.reduce((s, a) => s + a, 0) / ages.length) : null
  const ratings = enriched.map(p => p.data?.rating).filter((r): r is number => r != null)
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length) : null
  const valueTotal = enriched.reduce((s, p) => s + parseMarketValue(p.data?.marketValue), 0)

  const dataAvailable = size > 0

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
    return p.data
      ? <Link href={`/${lang}/jugadores/${playerSlug(p.data)}`} style={style}>{inner}</Link>
      : <div style={style}>{inner}</div>
  }

  return (
    <SaasShell activeKey="leagues" breadcrumb={breadcrumb}>
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
                <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(34px, 6vw, 52px)', fontWeight: 800, color: 'var(--ts-primary)', letterSpacing: 1, lineHeight: 0.95, margin: 0 }}>
                  {name}
                </h1>
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

          {!dataAvailable && (
            <div style={{ borderRadius: 12, padding: '40px 24px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
                {t(lang, 'Plantilla en camino', 'Squad coming soon')}
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 460, margin: '0 auto' }}>
                {t(lang,
                  `La convocatoria de ${name} para el Mundial 2026 se publicará aquí en cuanto esté disponible. Mientras tanto, explora el resto del Mundial.`,
                  `${name}'s 2026 World Cup squad will appear here as soon as it's available. In the meantime, explore the rest of the World Cup.`)}
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

          {/* Potential lineup */}
          {hasLineup && (
            <section>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
                {t(lang, 'Once probable', 'Potential lineup')}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--ts-faint)', margin: '0 0 12px' }}>
                {t(lang, 'Estimación (4-3-3) basada en nuestra valoración y la convocatoria. No es la alineación oficial.', 'Estimate (4-3-3) based on our rating and the squad list. Not the official lineup.')}
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
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 64 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.photo} alt={p.name} width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--ts-primary)', background: '#fff' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 64 }}>
                          {p.number != null ? `${p.number} ` : ''}{lastName(p.name)}
                        </span>
                      </div>
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
        </div>
      </main>
    </SaasShell>
  )
}
