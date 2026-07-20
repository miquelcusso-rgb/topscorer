import Link from 'next/link'
import { getWorldCupFixtures, type ApiFixture } from '@/lib/api-football'
import { t, type Lang } from './shared'

// Knockout bracket for the WC portada: Octavos → Cuartos → Semis → Final (+ 3er
// puesto), each match with flags, result (or kickoff time), penalties, stadium
// and city. Fixtures not yet scheduled by FIFA render as "Por definir" cards so
// the bracket shape is always complete. Data: getWorldCupFixtures (30-min cache,
// one API call). Fully defensive — with no fixtures the panel renders nothing.

interface RoundSpec {
  api: string           // league.round value in api-football
  es: string
  en: string
  slots: number         // expected matches, pads with TBD cards
  dates_es: string      // fallback dates for unscheduled slots (official FIFA calendar)
  dates_en: string
}

const ROUNDS: RoundSpec[] = [
  { api: 'Round of 16',    es: 'Octavos',       en: 'Round of 16',   slots: 8, dates_es: '4–7 jul',   dates_en: 'Jul 4–7' },
  { api: 'Quarter-finals', es: 'Cuartos',       en: 'Quarter-finals', slots: 4, dates_es: '9–11 jul',  dates_en: 'Jul 9–11' },
  { api: 'Semi-finals',    es: 'Semifinales',   en: 'Semi-finals',   slots: 2, dates_es: '14–15 jul', dates_en: 'Jul 14–15' },
  { api: 'Final',          es: 'FINAL',         en: 'FINAL',         slots: 1, dates_es: '19 jul · MetLife Stadium, NY/NJ', dates_en: 'Jul 19 · MetLife Stadium, NY/NJ' },
]
const THIRD: RoundSpec = { api: '3rd Place Final', es: 'Tercer puesto', en: 'Third place', slots: 1, dates_es: '18 jul', dates_en: 'Jul 18' }

const PLAYED = ['FT', 'AET', 'PEN']

function fmtWhen(iso: string, lang: Lang): string {
  const d = new Date(iso)
  if (lang === 'en') {
    // US-hosted tournament → Eastern Time for the EN audience.
    const s = d.toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    return `${s} ET`
  }
  const s = d.toLocaleString('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `${s} ESP`
}

function TeamRow({ name, logo, goals, pen, winner, lang }: {
  name: string; logo: string; goals: number | null; pen: number | null; winner: boolean | null; lang: Lang
}) {
  const won = winner === true
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minHeight: 22 }}>
      {logo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={logo} alt="" width={18} height={13} loading="lazy" style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2, flexShrink: 0, boxShadow: '0 0 0 1px var(--ts-hairline)' }} />
        : <span style={{ width: 18, flexShrink: 0 }} />}
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: won ? 800 : 600, color: won ? 'var(--ts-text)' : 'var(--ts-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {name}
      </span>
      {goals != null && (
        <span style={{ flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, color: won ? 'var(--ts-primary)' : 'var(--ts-faint)', fontVariantNumeric: 'tabular-nums' }}>
          {goals}{pen != null ? <span style={{ fontSize: 10, color: 'var(--ts-muted)' }}> ({pen})</span> : null}
        </span>
      )}
    </div>
  )
}

function MatchCard({ f, lang }: { f: ApiFixture; lang: Lang }) {
  const played = PLAYED.includes(f.fixture.status.short)
  const pens = f.score.penalty ?? { home: null, away: null }
  const venue = [f.fixture.venue?.name, f.fixture.venue?.city].filter(Boolean).join(' · ')
  return (
    <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, padding: '8px 10px', width: 218, boxSizing: 'border-box' }}>
      <TeamRow name={f.teams.home.name} logo={f.teams.home.logo} goals={played ? f.goals.home : null} pen={pens.home} winner={f.teams.home.winner} lang={lang} />
      <TeamRow name={f.teams.away.name} logo={f.teams.away.logo} goals={played ? f.goals.away : null} pen={pens.away} winner={f.teams.away.winner} lang={lang} />
      <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid var(--ts-hairline)', display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 10, color: 'var(--ts-faint)' }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{venue || '—'}</span>
        <span style={{ flexShrink: 0, fontWeight: 700, color: played ? 'var(--ts-muted)' : 'var(--ts-teal)' }}>
          {played ? (f.fixture.status.short === 'PEN' ? t(lang, 'Pen.', 'Pens') : t(lang, 'Final', 'FT')) : fmtWhen(f.fixture.date, lang)}
        </span>
      </div>
    </div>
  )
}

function TbdCard({ spec, lang }: { spec: RoundSpec; lang: Lang }) {
  return (
    <div style={{ background: 'var(--ts-card2)', border: '1px dashed var(--ts-border)', borderRadius: 10, padding: '10px 10px', width: 218, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ts-faint)' }}>{t(lang, 'Por definir', 'To be decided')}</div>
      <div style={{ fontSize: 10, color: 'var(--ts-faint)', marginTop: 3 }}>{lang === 'en' ? spec.dates_en : spec.dates_es}</div>
    </div>
  )
}

export default async function KnockoutPanel({ lang }: { lang: Lang }) {
  // getWorldCupFixtures throws on quota/API failure (so [] is never cached);
  // here that just means "no bracket this render" — the ChampionPanel above
  // keeps the portada complete either way.
  let fixtures: ApiFixture[] = []
  try { fixtures = await getWorldCupFixtures() } catch { fixtures = [] }
  if (!fixtures.length) return null

  const byRound = (api: string) =>
    fixtures.filter(f => f.league.round === api).sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)

  // Nothing knockout yet → don't render (pre-tournament safety).
  if (!ROUNDS.some(r => byRound(r.api).length)) return null

  const third = byRound(THIRD.api)

  return (
    <section aria-label={t(lang, 'Cuadro de eliminatorias', 'Knockout bracket')}
      style={{ borderRadius: 12, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', padding: '16px 0 6px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '0 18px', marginBottom: 10, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ts-text)' }}>
          🏆 {t(lang, 'Fase final', 'Knockout stage')}
        </h2>
        <Link href={`/${lang}/mundial-2026/resultados`} style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ts-teal)', textDecoration: 'none' }}>
          {t(lang, 'Dieciseisavos y grupos →', 'Round of 32 & groups →')}
        </Link>
      </div>

      {/* Columns scroll horizontally on narrow screens; each column centers its
          matches vertically so the bracket funnels toward the final. */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 18px 12px', alignItems: 'stretch' }}>
        {ROUNDS.map(spec => {
          const matches = byRound(spec.api)
          const pad = Math.max(0, spec.slots - matches.length)
          const isFinal = spec.api === 'Final'
          return (
            <div key={spec.api} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: isFinal ? 'var(--ts-primary)' : 'var(--ts-muted)', marginBottom: 8 }}>
                {lang === 'en' ? spec.en : spec.es}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 8 }}>
                {matches.map(f => <MatchCard key={f.fixture.id} f={f} lang={lang} />)}
                {Array.from({ length: pad }, (_, i) => <TbdCard key={'tbd' + i} spec={spec} lang={lang} />)}
                {isFinal && (
                  <div style={{ marginTop: 2 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-muted)', margin: '6px 0' }}>
                      {lang === 'en' ? THIRD.en : THIRD.es}
                    </div>
                    {third.length ? third.map(f => <MatchCard key={f.fixture.id} f={f} lang={lang} />) : <TbdCard spec={THIRD} lang={lang} />}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
