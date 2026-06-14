'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import NewsFeed from '@/components/saas/NewsFeed'
import type { ApiFixture, ApiPlayerResponse, ApiStandingEntry, BookedPlayer, TeamInjuryGroup, FixturePrediction } from '@/lib/api-football'
import { wcFaqs } from './wc-faqs'

// ─── Country → flag emoji ─────────────────────────────────────────────────────
// Small inline map covering the qualified / likely WC 2026 nations referenced on
// this page (groups + favourites + venues). Used to make the page more visual.
const FLAG: Record<string, string> = {
  Qatar: '🇶🇦', Ecuador: '🇪🇨', Senegal: '🇸🇳', Netherlands: '🇳🇱',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Iran: '🇮🇷', USA: '🇺🇸', Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  Argentina: '🇦🇷', 'Saudi Arabia': '🇸🇦', Mexico: '🇲🇽', Poland: '🇵🇱',
  France: '🇫🇷', Australia: '🇦🇺', Denmark: '🇩🇰', Tunisia: '🇹🇳',
  Spain: '🇪🇸', 'Costa Rica': '🇨🇷', Germany: '🇩🇪', Japan: '🇯🇵',
  Belgium: '🇧🇪', Canada: '🇨🇦', Morocco: '🇲🇦', Croatia: '🇭🇷',
  Brazil: '🇧🇷', Serbia: '🇷🇸', Switzerland: '🇨🇭', Cameroon: '🇨🇲',
  Portugal: '🇵🇹', Ghana: '🇬🇭', Uruguay: '🇺🇾', 'South Korea': '🇰🇷',
  Italy: '🇮🇹', Colombia: '🇨🇴', Egypt: '🇪🇬',
  Chile: '🇨🇱', Austria: '🇦🇹', Algeria: '🇩🇿',
  'New Zealand': '🇳🇿', 'Ivory Coast': '🇨🇮', Iraq: '🇮🇶',
  Peru: '🇵🇪', Slovenia: '🇸🇮',
}
const flagOf = (country: string): string => FLAG[country] ?? '🏳️'

// ─── Static WC 2026 data ──────────────────────────────────────────────────────

const VENUES = [
  { city: 'New York/New Jersey', stadium: 'MetLife Stadium', country: 'USA', capacity: '82,500', final: true },
  { city: 'Los Angeles', stadium: 'SoFi Stadium', country: 'USA', capacity: '70,240', final: false },
  { city: 'Dallas', stadium: 'AT&T Stadium', country: 'USA', capacity: '80,000', final: false },
  { city: 'San Francisco', stadium: 'Levi\'s Stadium', country: 'USA', capacity: '68,500', final: false },
  { city: 'Miami', stadium: 'Hard Rock Stadium', country: 'USA', capacity: '64,767', final: false },
  { city: 'Seattle', stadium: 'Lumen Field', country: 'USA', capacity: '69,000', final: false },
  { city: 'Boston', stadium: 'Gillette Stadium', country: 'USA', capacity: '65,878', final: false },
  { city: 'Philadelphia', stadium: 'Lincoln Financial Field', country: 'USA', capacity: '69,176', final: false },
  { city: 'Kansas City', stadium: 'Arrowhead Stadium', country: 'USA', capacity: '76,416', final: false },
  { city: 'Atlanta', stadium: 'Mercedes-Benz Stadium', country: 'USA', capacity: '71,000', final: false },
  { city: 'Houston', stadium: 'NRG Stadium', country: 'USA', capacity: '72,220', final: false },
  { city: 'Toronto', stadium: 'BMO Field', country: 'Canada', capacity: '30,000', final: false },
  { city: 'Vancouver', stadium: 'BC Place', country: 'Canada', capacity: '54,500', final: false },
  { city: 'Guadalajara', stadium: 'Estadio Akron', country: 'Mexico', capacity: '49,850', final: false },
  { city: 'Ciudad de México', stadium: 'Estadio Azteca', country: 'Mexico', capacity: '87,523', final: false },
  { city: 'Monterrey', stadium: 'Estadio BBVA', country: 'Mexico', capacity: '53,500', final: false },
]

// Opening match: 11 Jun 2026, 19:00 local (Estadio Azteca, CDMX = UTC-6 → 01:00 UTC Jun 12).
const KICKOFF = new Date('2026-06-12T01:00:00Z')
const END_DATE = new Date('2026-07-19T23:59:00Z')

const t = (lang: 'es' | 'en', es: string, en: string) => (lang === 'en' ? en : es)

// ─── Live countdown to the opening match (days · hours · minutes · seconds) ────

interface TimeLeft { d: number; h: number; m: number; s: number }
function diffNow(): TimeLeft | 'live' | 'done' {
  const now = Date.now()
  if (now >= END_DATE.getTime()) return 'done'
  if (now >= KICKOFF.getTime()) return 'live'
  let ms = KICKOFF.getTime() - now
  const d = Math.floor(ms / 86_400_000); ms -= d * 86_400_000
  const h = Math.floor(ms / 3_600_000); ms -= h * 3_600_000
  const m = Math.floor(ms / 60_000); ms -= m * 60_000
  const s = Math.floor(ms / 1000)
  return { d, h, m, s }
}

function Countdown({ lang }: { lang: 'es' | 'en' }) {
  // Mount-guarded so SSR (static build) and first client render match — we render
  // a neutral placeholder until the effect runs on the client.
  const [tl, setTl] = useState<TimeLeft | 'live' | 'done' | null>(null)
  useEffect(() => {
    setTl(diffNow())
    const id = setInterval(() => setTl(diffNow()), 1000)
    return () => clearInterval(id)
  }, [])

  if (tl === null) {
    return <div style={{ height: 96 }} aria-hidden />
  }

  if (tl === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <span style={{ fontSize: 14, color: 'var(--ts-primary)' }}>
          {t(lang, 'El Mundial 2026 ha concluido', 'World Cup 2026 has concluded')}
        </span>
      </div>
    )
  }

  if (tl === 'live') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '16px 0' }}>
        <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: 'var(--ts-teal)', boxShadow: '0 0 8px var(--ts-teal)' }} />
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-teal)', fontFamily: "'Barlow Condensed', sans-serif" }}>
          {t(lang, 'En curso', 'Live now')}
        </span>
      </div>
    )
  }

  const units: { v: number; es: string; en: string }[] = [
    { v: tl.d, es: 'días', en: 'days' },
    { v: tl.h, es: 'horas', en: 'hours' },
    { v: tl.m, es: 'min', en: 'min' },
    { v: tl.s, es: 'seg', en: 'sec' },
  ]

  return (
    <div style={{ padding: '14px 0 6px' }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-faint)', marginBottom: 10, textAlign: 'center' }}>
        {/* Kickoff shown in the user's LOCAL time (client-only branch), so a
            European viewer doesn't see "Jun 11" while the timer runs into Jun 12
            their time. The match itself is the opener at Estadio Azteca. */}
        {t(lang,
          `Comienza — ${KICKOFF.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} (tu hora) · Estadio Azteca`,
          `Kicks off — ${KICKOFF.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} (your time) · Estadio Azteca`)}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {units.map(u => (
          <div key={u.en} style={{
            minWidth: 66, padding: '10px 12px', borderRadius: 10, textAlign: 'center',
            background: 'var(--ts-card)', border: '1px solid var(--ts-border)',
          }}>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
              {String(u.v).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginTop: 5, color: 'var(--ts-muted)' }}>
              {t(lang, u.es, u.en)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── World Cup Golden Boot (Bota de Oro del Mundial) ──────────────────────────
// The star section during the tournament: live top scorers of the World Cup
// itself (league 1 = FIFA World Cup, season 2026). Used both as its own tab and
// (compact) inside the Overview. FAQs live in ./wc-faqs (shared server+client).

// Reusable scorer rows → player pages. Shared by the Golden Boot tab + Overview.
function WcScorerList({ scorers, lang, limit }: { scorers: ApiPlayerResponse[]; lang: 'es' | 'en'; limit: number }) {
  return (
    <>
      {scorers.slice(0, limit).map((p, i) => {
        const stat = p.statistics[0]
        return (
          <Link
            key={p.player.id}
            href={`/${lang}/jugadores/${slugify(p.player.name)}`}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, width: 22, flexShrink: 0, textAlign: 'center', color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.player.photo} alt={p.player.name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.player.name}</div>
              <div style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{stat?.team?.name}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
              {stat?.goals?.assists ? <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{stat.goals.assists} {t(lang, 'asist', 'ast')}</span> : null}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{stat?.goals?.total ?? 0}</span>
                <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--ts-muted)' }}>{t(lang, 'goles', 'goals')}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </>
  )
}

function GoldenBootPanel({ lang, initial }: { lang: 'es' | 'en'; initial: ApiPlayerResponse[] }) {
  const [scorers, setScorers] = useState<ApiPlayerResponse[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)

  // Only client-fetch if the server didn't already seed us (keeps scorers in the
  // initial HTML for SEO when data exists; refreshes live when it doesn't). When
  // seeded, `loading` already starts false — no synchronous setState needed.
  useEffect(() => {
    if (initial.length > 0) return
    let cancelled = false
    fetch('/api/football/topscorers?league=1&season=2026')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data)) setScorers(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [initial.length])

  const leader = scorers[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
          🥇 {t(lang, 'Bota de Oro del Mundial 2026', '2026 World Cup Golden Boot')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: 0, lineHeight: 1.6 }}>
          {t(lang,
            'Máximos goleadores del Mundial 2026 en tiempo real. La Bota de Oro premia al jugador con más goles del torneo; en caso de empate, decide quien dé más asistencias y juegue menos minutos.',
            'Live top scorers of the 2026 World Cup. The Golden Boot goes to the tournament’s top scorer; ties are broken by most assists, then fewest minutes played.')}
        </p>
      </div>

      {loading && <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando goleadores…', 'Loading scorers…')}</div>}

      {!loading && scorers.length === 0 && (
        <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
            {t(lang, 'La carrera por la Bota de Oro arranca el 11 de junio', 'The Golden Boot race kicks off on June 11')}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto 14px' }}>
            {t(lang,
              'Los goleadores del Mundial 2026 aparecerán aquí en directo desde el primer partido. Mientras tanto, sigue la Bota de Oro europea de clubes.',
              'The 2026 World Cup scorers will appear here live from the first match. Meanwhile, follow the European club Golden Shoe.')}
          </p>
          <Link href={`/${lang}/bota-de-oro`} style={{ fontSize: 12, fontWeight: 700, color: 'var(--ts-primary)', textDecoration: 'none' }}>
            {t(lang, 'Bota de Oro europea (clubes) →', 'European club Golden Shoe →')}
          </Link>
        </div>
      )}

      {!loading && leader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 14, background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={leader.player.photo} alt={leader.player.name} width={56} height={56} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--ts-primary)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-primary)', fontWeight: 700 }}>{t(lang, 'Líder · Bota de Oro', 'Leader · Golden Boot')}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leader.player.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ts-muted)' }}>{leader.statistics[0]?.team?.name}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{leader.statistics[0]?.goals?.total ?? 0}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-muted)' }}>{t(lang, 'goles', 'goals')}</div>
          </div>
        </div>
      )}

      {!loading && scorers.length > 0 && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
          <WcScorerList scorers={scorers} lang={lang} limit={25} />
        </div>
      )}
    </div>
  )
}

// ─── Top assists (Asistentes) ─────────────────────────────────────────────────
// Twin of the Golden Boot list but ranked by assists (the headline number).
// Reuses the same row layout as WcScorerList; goals shown as the secondary stat.

function WcAssistList({ players, lang, limit }: { players: ApiPlayerResponse[]; lang: 'es' | 'en'; limit: number }) {
  return (
    <>
      {players.slice(0, limit).map((p, i) => {
        const stat = p.statistics[0]
        return (
          <Link
            key={p.player.id}
            href={`/${lang}/jugadores/${slugify(p.player.name)}`}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, width: 22, flexShrink: 0, textAlign: 'center', color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.player.photo} alt={p.player.name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.player.name}</div>
              <div style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{stat?.team?.name}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
              {stat?.goals?.total ? <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{stat.goals.total} {t(lang, 'goles', 'goals')}</span> : null}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{stat?.goals?.assists ?? 0}</span>
                <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--ts-muted)' }}>{t(lang, 'asist', 'ast')}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </>
  )
}

function AssistsPanel({ lang, initial }: { lang: 'es' | 'en'; initial: ApiPlayerResponse[] }) {
  const [players, setPlayers] = useState<ApiPlayerResponse[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)

  useEffect(() => {
    if (initial.length > 0) return
    let cancelled = false
    fetch('/api/football/topscorers?league=1&season=2026&type=assists')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data)) setPlayers(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [initial.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
          🅰️ {t(lang, 'Máximos asistentes del Mundial 2026', '2026 World Cup top assists')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: 0, lineHeight: 1.6 }}>
          {t(lang,
            'Jugadores con más asistencias del Mundial 2026 en tiempo real. La asistencia es el último pase antes de un gol.',
            'Players with the most assists at the 2026 World Cup, live. An assist is the final pass before a goal.')}
        </p>
      </div>

      {loading && <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando asistentes…', 'Loading assists…')}</div>}

      {!loading && players.length === 0 && (
        <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
            {t(lang, 'Los asistentes aparecerán desde el primer partido', 'Assists will appear from the first match')}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto' }}>
            {t(lang,
              'El ranking de asistencias del Mundial 2026 se actualiza en directo durante el torneo.',
              'The 2026 World Cup assists ranking updates live throughout the tournament.')}
          </p>
        </div>
      )}

      {!loading && players.length > 0 && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
          <WcAssistList players={players} lang={lang} limit={25} />
        </div>
      )}
    </div>
  )
}

// ─── Discipline (Disciplina) ──────────────────────────────────────────────────
// Most-booked ranking from /players/topyellowcards (yellows + reds).

function DisciplinePanel({ lang }: { lang: 'es' | 'en' }) {
  const [players, setPlayers] = useState<BookedPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/football/yellowcards?league=1&season=2026')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data)) setPlayers(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
          🟨 {t(lang, 'Disciplina del Mundial 2026', '2026 World Cup discipline')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: 0, lineHeight: 1.6 }}>
          {t(lang,
            'Jugadores con más tarjetas del Mundial 2026. Una acumulación de amarillas conlleva sanción.',
            'Most-booked players at the 2026 World Cup. Accumulated yellow cards lead to a suspension.')}
        </p>
      </div>

      {loading && <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando tarjetas…', 'Loading cards…')}</div>}

      {!loading && players.length === 0 && (
        <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
            {t(lang, 'Sin tarjetas todavía', 'No cards yet')}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto' }}>
            {t(lang,
              'El ranking de tarjetas del Mundial 2026 se llenará desde el primer partido.',
              'The 2026 World Cup booking ranking will fill from the first match.')}
          </p>
        </div>
      )}

      {!loading && players.length > 0 && (
        <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderBottom: '1px solid var(--ts-border)', background: 'var(--ts-card2)' }}>
            <span style={{ width: 22, flexShrink: 0 }} />
            <span style={{ width: 28, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-muted)' }}>{t(lang, 'Jugador', 'Player')}</span>
            <span style={{ width: 38, flexShrink: 0, textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--ts-muted)' }}>🟨</span>
            <span style={{ width: 38, flexShrink: 0, textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--ts-muted)' }}>🟥</span>
          </div>
          {players.map((p, i) => (
            <Link
              key={p.id}
              href={`/${lang}/jugadores/${slugify(p.name)}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, width: 22, flexShrink: 0, textAlign: 'center', color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={p.name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{p.team}</div>
              </div>
              <span style={{ width: 38, flexShrink: 0, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif", fontVariantNumeric: 'tabular-nums' }}>{p.yellow}</span>
              <span style={{ width: 38, flexShrink: 0, textAlign: 'center', fontSize: 16, fontWeight: 700, color: p.red > 0 ? 'var(--ts-red)' : 'var(--ts-faint)', fontFamily: "'Barlow Condensed', sans-serif", fontVariantNumeric: 'tabular-nums' }}>{p.red}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Injuries (Bajas) ─────────────────────────────────────────────────────────
// League-wide injuries grouped by national team. Empty before the tournament →
// graceful empty state that auto-fills as records appear.

function InjuriesPanel({ lang }: { lang: 'es' | 'en' }) {
  const [groups, setGroups] = useState<TeamInjuryGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/football/injuries?league=1&season=2026')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data)) setGroups(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-primary)', margin: '0 0 4px' }}>
          🏥 {t(lang, 'Bajas del Mundial 2026', '2026 World Cup injuries')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ts-muted)', margin: 0, lineHeight: 1.6 }}>
          {t(lang,
            'Jugadores lesionados o sancionados por selección, actualizado durante el torneo.',
            'Injured or suspended players by national team, updated during the tournament.')}
        </p>
      </div>

      {loading && <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando bajas…', 'Loading injuries…')}</div>}

      {!loading && groups.length === 0 && (
        <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
            {t(lang, 'Sin bajas reportadas todavía', 'No injuries reported yet')}
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 440, margin: '0 auto' }}>
            {t(lang,
              'Las bajas por lesión o sanción aparecerán aquí, agrupadas por selección, a medida que se confirmen durante el Mundial 2026.',
              'Injury and suspension news will appear here, grouped by national team, as it is confirmed during the 2026 World Cup.')}
          </p>
        </div>
      )}

      {!loading && groups.length > 0 && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {groups.map(g => (
            <div key={g.teamId} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: '1px solid var(--ts-border)', background: 'var(--ts-card2)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {g.teamLogo ? <img src={g.teamLogo} alt="" width={20} height={20} style={{ objectFit: 'contain', flexShrink: 0 }} /> : null}
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>{g.team}</span>
              </div>
              {g.players.map(pl => (
                <div key={`${pl.playerId}-${pl.reason}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: '1px solid var(--ts-divider)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {pl.photo ? <img src={pl.photo} alt={pl.player} width={26} height={26} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> : null}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.player}</div>
                    <div style={{ fontSize: 10, color: 'var(--ts-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.reason || pl.type}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Live data panel ──────────────────────────────────────────────────────────

function LiveDataPanel({ lang }: { lang: 'es' | 'en' }) {
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [scorers, setScorers] = useState<ApiPlayerResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/football/fixtures?league=1&season=2026&last=8').then(r => r.json()),
      fetch('/api/football/topscorers?league=1&season=2026').then(r => r.json()),
    ]).then(([fix, sc]) => {
      if (fix.ok) setFixtures(fix.data)
      if (sc.ok) setScorers(sc.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>
        {t(lang, 'Cargando datos del torneo...', 'Loading tournament data...')}
      </div>
    )
  }

  const hasData = fixtures.length > 0 || scorers.length > 0

  if (!hasData) {
    return (
      <div style={{ borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--ts-primary)' }}>
          {t(lang, 'Datos en tiempo real — disponibles al inicio del torneo', 'Live data — available when the tournament starts')}
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ts-muted)', maxWidth: 400, margin: '0 auto' }}>
          {t(
            lang,
            'Los resultados, clasificaciones y estadísticas de goleadores aparecerán aquí desde el 11 de junio de 2026, actualizados cada 30 minutos.',
            'Results, standings and scorer stats will appear here from June 11, 2026, updated every 30 minutes.',
          )}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {/* Fixtures */}
      <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ts-border)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
            {t(lang, 'Últimos partidos', 'Latest matches')}
          </span>
        </div>
        {fixtures.slice().reverse().map(f => (
          <div key={f.fixture.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)' }}>
            <span style={{ fontSize: 10, flexShrink: 0, color: 'var(--ts-muted)', width: 32 }}>
              {['FT', 'AET', 'PEN'].includes(f.fixture.status.short) ? 'FIN' : f.fixture.status.short}
            </span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 11, color: f.teams.home.winner ? 'var(--ts-text)' : 'var(--ts-muted)' }}>{f.teams.home.name}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.teams.home.logo} alt="" width={14} height={14} style={{ objectFit: 'contain', flexShrink: 0 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums', color: 'var(--ts-text)', width: 40, textAlign: 'center' }}>
              {f.goals.home} - {f.goals.away}
            </span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.teams.away.logo} alt="" width={14} height={14} style={{ objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: f.teams.away.winner ? 'var(--ts-text)' : 'var(--ts-muted)' }}>{f.teams.away.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top scorers — clickable to player pages */}
      <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ts-border)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
            {t(lang, 'Goleadores del torneo', 'Tournament scorers')}
          </span>
        </div>
        {scorers.slice(0, 10).map((p, i) => {
          const stat = p.statistics[0]
          return (
            <Link
              key={p.player.id}
              href={`/${lang}/jugadores/${slugify(p.player.name)}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, width: 20, flexShrink: 0, color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.player.photo} alt={p.player.name} width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.player.name}</div>
                <div style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{stat?.team?.name}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{stat?.goals?.total ?? 0}</span>
                <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--ts-muted)' }}>{t(lang, 'goles', 'goals')}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Mundial2026Client({ initialScorers = [], initialAssists = [], started = false }: { initialScorers?: ApiPlayerResponse[]; initialAssists?: ApiPlayerResponse[]; started?: boolean }) {
  const { lang } = useLang()
  // During the tournament the Golden Boot is the headline → default to it.
  // Always land on the Overview dashboard. The Golden Boot is only shown when the
  // user explicitly clicks its button/tab (never the default, even mid-tournament).
  const [view, setView] = useState<'overview' | 'golden' | 'assists' | 'discipline' | 'injuries' | 'news' | 'groups' | 'calendar' | 'venues' | 'live'>('overview')

  return (
    <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>

      {/* Hero header */}
      <div style={{ background: 'linear-gradient(180deg, var(--ts-primary-soft), var(--ts-bg))', borderBottom: '1px solid var(--ts-border)' }}>
        <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ paddingTop: 24 }}>
            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)', border: '1px solid var(--ts-border-hot)' }}>
                FIFA WORLD CUP
              </span>
              <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
                🇺🇸 USA · 🇨🇦 CANADA · 🇲🇽 MEXICO
              </span>
            </div>

            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(44px, 8vw, 64px)', fontWeight: 800, color: 'var(--ts-primary)', letterSpacing: 1, lineHeight: 0.95 }}>
              {t(lang, 'MUNDIAL 2026', 'WORLD CUP 2026')}
            </h1>
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--ts-muted)' }}>
              {t(lang, '48 selecciones · 16 sedes · 104 partidos · 11 jun – 19 jul 2026', '48 teams · 16 venues · 104 matches · Jun 11 – Jul 19, 2026')}
            </p>

            <Countdown lang={lang} />

            {/* Calendar shortcut button */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 4 }}>
              <button
                type="button"
                onClick={() => setView('calendar')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8,
                  background: 'var(--ts-primary)', color: 'var(--ts-bg)', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, letterSpacing: 0.5, fontFamily: 'inherit',
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {t(lang, 'Ver calendario completo', 'See full calendar')}
              </button>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Friendlies: scroll-jump (NOT a tab view) to the build-up section
                rendered by page.tsx below — only present before the tournament. */}
            {!started && (
              <button
                type="button"
                onClick={() => document.getElementById('wc-friendlies')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase',
                  color: 'var(--ts-teal)', background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: '2px solid transparent', padding: '9px 18px', marginBottom: -1, flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}
              >
                <span aria-hidden>🤝</span>{t(lang, 'Amistosos', 'Friendlies')} <span aria-hidden style={{ opacity: 0.7 }}>↓</span>
              </button>
            )}
            {([
              { id: 'overview', es: 'Resumen', en: 'Overview' },
              { id: 'groups', es: 'Grupos', en: 'Groups' },
              { id: 'calendar', es: 'Calendario', en: 'Calendar' },
              { id: 'live', es: 'Resultados', en: 'Results' },
              { id: 'assists', es: 'Asistentes', en: 'Assists' },
              { id: 'discipline', es: 'Disciplina', en: 'Discipline' },
              { id: 'injuries', es: 'Bajas', en: 'Injuries' },
              { id: 'news', es: 'Noticias', en: 'News' },
              { id: 'venues', es: 'Sedes', en: 'Venues' },
            ] as const).map(tab => {
              const active = view === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  style={{
                    fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase',
                    color: active ? 'var(--ts-primary)' : 'var(--ts-muted)', background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: active ? '2px solid var(--ts-primary)' : '2px solid transparent', padding: '9px 18px', marginBottom: -1, flexShrink: 0,
                  }}
                >
                  {t(lang, tab.es, tab.en)}
                </button>
              )
            })}

            {/* Golden Boot — gold button pinned to the FAR-RIGHT end of the tab
                row (margin-left:auto). Activates the same Golden Boot view. */}
            <button
              type="button"
              onClick={() => setView('golden')}
              aria-label={t(lang, 'Ver la Bota de Oro del Mundial 2026', 'View the 2026 World Cup Golden Boot')}
              className="wc-golden-tab"
              style={{
                marginLeft: 'auto', marginBottom: 4, flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                padding: '8px 16px', borderRadius: 8,
                background: 'linear-gradient(135deg, var(--ts-primary), color-mix(in srgb, var(--ts-primary) 75%, #fff))',
                color: '#1a1300', border: '1px solid var(--ts-primary)',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
                ...(view === 'golden' ? { outline: '2px solid var(--ts-primary)', outlineOffset: 2 } : {}),
              }}
            >
              <span aria-hidden style={{ fontSize: 15, lineHeight: 1 }}>🏆</span>
              <span className="wc-golden-tab-label">{t(lang, 'Bota de Oro', 'Golden Boot')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--ts-bg)' }}>
        <div style={{ maxWidth: 1500, margin: '0 auto', padding: '24px 20px 80px' }}>
          {view === 'overview' && <OverviewPanel lang={lang} scorers={initialScorers} onGoGroups={() => setView('groups')} onGoCalendar={() => setView('calendar')} onGoGolden={() => setView('golden')} />}
          {view === 'golden' && <GoldenBootPanel lang={lang} initial={initialScorers} />}
          {view === 'assists' && <AssistsPanel lang={lang} initial={initialAssists} />}
          {view === 'discipline' && <DisciplinePanel lang={lang} />}
          {view === 'injuries' && <InjuriesPanel lang={lang} />}
          {view === 'news' && <NewsFeed scope="worldcup" lang={lang} />}
          {view === 'groups' && <GroupsPanel lang={lang} />}
          {view === 'calendar' && <CalendarPanel lang={lang} />}
          {view === 'venues' && <VenuesPanel lang={lang} />}
          {view === 'live' && <LiveDataPanel lang={lang} />}
        </div>
      </div>
    </main>
  )
}

// ─── Overview panel ───────────────────────────────────────────────────────────

function OverviewPanel({ lang, scorers, onGoGroups, onGoCalendar, onGoGolden }: { lang: 'es' | 'en'; scorers: ApiPlayerResponse[]; onGoGroups: () => void; onGoCalendar: () => void; onGoGolden: () => void }) {
  const stats = [
    { label: t(lang, 'Selecciones', 'Teams'), value: '48', desc: t(lang, 'Primer mundial con 48 equipos', 'First 48-team World Cup') },
    { label: t(lang, 'Grupos', 'Groups'), value: '12', desc: t(lang, 'Grupos de 4 — top 2 + mejores 8 terceros', 'Groups of 4 — top 2 + best 8 thirds') },
    { label: t(lang, 'Partidos', 'Matches'), value: '104', desc: t(lang, '56 más que en Qatar 2022', '56 more than Qatar 2022') },
    { label: t(lang, 'Sedes', 'Venues'), value: '16', desc: 'USA (11) + México (3) + Canadá (2)' },
    { label: t(lang, 'Fechas', 'Dates'), value: t(lang, '39 días', '39 days'), desc: t(lang, '11 jun — 19 jul 2026', 'Jun 11 — Jul 19, 2026') },
    { label: t(lang, 'Inicio', 'Opener'), value: 'CDMX', desc: t(lang, 'Estadio Azteca, inauguración', 'Estadio Azteca, opening match') },
  ]

  // Format phases rendered as visual boxes + connectors.
  const phases = [
    { phase: t(lang, 'Fase de grupos', 'Group stage'), detail: t(lang, '12 grupos × 4', '12 groups × 4'), teams: 48 },
    { phase: t(lang, 'Dieciseisavos', 'Round of 32'), detail: t(lang, '32 equipos', '32 teams'), teams: 32 },
    { phase: t(lang, 'Octavos', 'Round of 16'), detail: t(lang, '16 equipos', '16 teams'), teams: 16 },
    { phase: t(lang, 'Cuartos', 'Quarter-finals'), detail: t(lang, '8 equipos', '8 teams'), teams: 8 },
    { phase: t(lang, 'Semifinales', 'Semi-finals'), detail: t(lang, '4 equipos', '4 teams'), teams: 4 },
    { phase: t(lang, 'Final', 'Final'), detail: 'MetLife · NJ', teams: 2 },
  ]

  const favourites = [
    { name: t(lang, 'Brasil', 'Brazil'), country: 'Brazil', odds: '5.0' },
    { name: t(lang, 'Francia', 'France'), country: 'France', odds: '5.5' },
    { name: t(lang, 'Inglaterra', 'England'), country: 'England', odds: '6.0' },
    { name: t(lang, 'España', 'Spain'), country: 'Spain', odds: '7.0' },
    { name: 'Argentina', country: 'Argentina', odds: '7.5' },
    { name: t(lang, 'Alemania', 'Germany'), country: 'Germany', odds: '8.0' },
    { name: 'Portugal', country: 'Portugal', odds: '10.0' },
    { name: t(lang, 'Países Bajos', 'Netherlands'), country: 'Netherlands', odds: '11.0' },
  ]

  const faqs = wcFaqs(lang, scorers[0]?.player?.name)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Golden Boot lives ONLY on its own tab/page — the Overview leads with the
          tournament format + favourites, not the scorer table. */}

      {/* Key stats grid */}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {stats.map(s => (
          <div key={s.label} style={{ borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif" }}>{s.label}</div>
            <div style={{ fontSize: 10, marginTop: 3, lineHeight: 1.5, color: 'var(--ts-muted)' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Format as visual boxes */}
      <div style={{ borderRadius: 12, padding: '18px 20px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, color: 'var(--ts-muted)', fontFamily: "'Barlow Condensed', sans-serif" }}>
          {t(lang, 'Formato del torneo', 'Tournament format')}
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, flexWrap: 'wrap' }}>
          {phases.map((p, i) => {
            const isGroups = i === 0
            const onClick = isGroups ? onGoGroups : onGoCalendar
            return (
              <div key={p.phase} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <span style={{ color: 'var(--ts-primary)', fontSize: 16, padding: '0 6px', flexShrink: 0 }}>›</span>
                )}
                <button
                  type="button"
                  onClick={onClick}
                  title={isGroups ? t(lang, 'Ver los 12 grupos', 'See the 12 groups') : t(lang, 'Ver calendario', 'See calendar')}
                  style={{
                    minWidth: 96, padding: '12px 14px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: i === phases.length - 1 ? 'var(--ts-primary-soft)' : 'var(--ts-card2)',
                    border: `1px solid ${i === phases.length - 1 ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
                    transition: 'border-color .15s, transform .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ts-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = i === phases.length - 1 ? 'var(--ts-border-hot)' : 'var(--ts-border)' }}
                >
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, lineHeight: 1, color: i === phases.length - 1 ? 'var(--ts-primary)' : 'var(--ts-text)' }}>{p.teams}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: 'var(--ts-text)' }}>{p.phase}</div>
                  <div style={{ fontSize: 9, marginTop: 2, color: isGroups ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>
                    {isGroups ? t(lang, 'Ver grupos →', 'See groups →') : p.detail}
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Favourites — clickable to rankings */}
      <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ts-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ts-muted)', fontFamily: "'Barlow Condensed', sans-serif" }}>
            {t(lang, 'Favoritos al título', 'Title favourites')}
          </span>
          <Link href={`/${lang}/bota-de-oro`} style={{ fontSize: 10, color: 'var(--ts-primary)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t(lang, 'Bota de Oro →', 'Golden Boot →')}
          </Link>
        </div>
        {favourites.map((f, i) => (
          <Link
            key={f.name}
            href={`/${lang}/mundial-2026/${slugify(f.country)}`}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < favourites.length - 1 ? '1px solid var(--ts-divider)' : 'none', textDecoration: 'none', color: 'inherit' }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, width: 20, flexShrink: 0, color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
            <span style={{ fontSize: 16 }}>{flagOf(f.country)}</span>
            <span style={{ fontSize: 13, color: 'var(--ts-text)' }}>{f.name}</span>
            <span style={{ fontSize: 11, marginLeft: 'auto', color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>x{f.odds}</span>
          </Link>
        ))}
      </div>

      {/* FAQ — visible answers mirror the FAQPage JSON-LD (GEO citable content) */}
      <div style={{ borderRadius: 12, padding: '18px 20px', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, color: 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif" }}>
          {t(lang, 'Preguntas frecuentes — Mundial 2026', 'FAQ — 2026 World Cup')}
        </h2>
        {faqs.map(({ q, a }) => (
          <details key={q} style={{ borderTop: '1px solid var(--ts-divider)', padding: '12px 0' }}>
            <summary style={{ color: 'var(--ts-text)', fontWeight: 600, cursor: 'pointer', fontSize: 14, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              {q}
              <span style={{ color: 'var(--ts-primary)', fontSize: 18, fontWeight: 400, flexShrink: 0 }}>+</span>
            </summary>
            <p style={{ color: 'var(--ts-muted)', marginTop: 8, lineHeight: 1.7, fontSize: 13 }}>{a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

// ─── Groups panel ─────────────────────────────────────────────────────────────

function GroupsPanel({ lang }: { lang: 'es' | 'en' }) {
  const [groups, setGroups] = useState<ApiStandingEntry[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/football/standings?league=1&season=2026&groups=1')
      .then(r => r.json())
      .then(j => { if (j.ok && Array.isArray(j.data)) setGroups(j.data); else setError(true) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Real draw groups only (Group A–L) — exclude the "third-placed ranking" table.
  // Tolerant to the API's label format, which is "Group Stage - Group A"
  // (it used to be just "Group A"); we extract the trailing group letter so a
  // label change can't silently blank the whole tab again.
  const groupLetter = (name?: string) => (name ?? '').match(/group\s+([a-l])\s*$/i)?.[1]?.toUpperCase()
  const realGroups = groups
    .filter(g => g.length >= 2 && groupLetter(g[0]?.group))
    .sort((a, b) => (groupLetter(a[0]?.group) ?? '').localeCompare(groupLetter(b[0]?.group) ?? ''))
  // Whether the tournament has begun (any matches played) → show points table.
  const started = realGroups.some(g => g.some(r => (r.all?.played ?? 0) > 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, marginBottom: 8, color: 'var(--ts-muted)' }}>
        {t(lang, 'Grupos oficiales del sorteo del Mundial 2026.', 'Official 2026 World Cup draw groups.')}
      </p>

      {loading && <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando grupos…', 'Loading groups…')}</div>}

      {!loading && realGroups.length > 0 && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {realGroups.map(g => (
            <div key={g[0]!.group} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
              <div style={{
                padding: '8px 12px', fontSize: 13, fontWeight: 800, color: 'var(--ts-primary)',
                fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: 'uppercase',
                borderBottom: '1px solid var(--ts-border)', borderLeft: '3px solid var(--ts-primary)',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{t(lang, 'Grupo', 'Group')} {groupLetter(g[0]?.group)}</span>
                {started && <span style={{ fontSize: 10, color: 'var(--ts-muted)' }}>{t(lang, 'Pts', 'Pts')}</span>}
              </div>
              {g.map((row, ti) => (
                <Link key={row.team.id} href={`/${lang}/mundial-2026/${slugify(row.team.name)}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: ti < g.length - 1 ? '1px solid var(--ts-divider)' : 'none', textDecoration: 'none', color: 'inherit' }}>
                  {started && <span style={{ width: 14, fontSize: 11, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>{row.rank}</span>}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={row.team.logo} alt="" width={18} height={18} style={{ objectFit: 'contain', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--ts-text)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.team.name}</span>
                  {started && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{row.points}</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}

      {!loading && realGroups.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--ts-muted)' }}>
          {error
            ? t(lang, 'No se pudieron cargar los grupos ahora mismo.', 'Could not load the groups right now.')
            : t(lang, 'Los grupos se publicarán tras el sorteo.', 'Groups will be published after the draw.')}
        </p>
      )}
    </div>
  )
}

// ─── Calendar panel ───────────────────────────────────────────────────────────
// Official FIFA-announced phase schedule for the 2026 World Cup. Individual
// match-by-match fixtures depend on the December 2025 draw; we show the
// confirmed phase windows + key milestones (real, public dates).

const WC_SCHEDULE: { es: string; en: string; dates_es: string; dates_en: string; note_es?: string; note_en?: string; highlight?: boolean }[] = [
  { es: 'Partido inaugural', en: 'Opening match', dates_es: '11 jun 2026', dates_en: 'Jun 11, 2026', note_es: 'Estadio Azteca, Ciudad de México', note_en: 'Estadio Azteca, Mexico City', highlight: true },
  { es: 'Fase de grupos', en: 'Group stage', dates_es: '11 – 27 jun 2026', dates_en: 'Jun 11 – 27, 2026', note_es: '12 grupos × 4 · 72 partidos', note_en: '12 groups × 4 · 72 matches' },
  { es: 'Dieciseisavos (R32)', en: 'Round of 32', dates_es: '28 jun – 3 jul 2026', dates_en: 'Jun 28 – Jul 3, 2026' },
  { es: 'Octavos (R16)', en: 'Round of 16', dates_es: '4 – 7 jul 2026', dates_en: 'Jul 4 – 7, 2026' },
  { es: 'Cuartos de final', en: 'Quarter-finals', dates_es: '9 – 11 jul 2026', dates_en: 'Jul 9 – 11, 2026' },
  { es: 'Semifinales', en: 'Semi-finals', dates_es: '14 – 15 jul 2026', dates_en: 'Jul 14 – 15, 2026' },
  { es: 'Tercer puesto', en: 'Third place', dates_es: '18 jul 2026', dates_en: 'Jul 18, 2026' },
  { es: 'FINAL', en: 'FINAL', dates_es: '19 jul 2026', dates_en: 'Jul 19, 2026', note_es: 'MetLife Stadium, Nueva York/Nueva Jersey', note_en: 'MetLife Stadium, New York/New Jersey', highlight: true },
]

// Phase-windows summary (used below the real fixtures; knockout match-ups are
// only scheduled once the groups resolve).
function PhaseWindows({ lang }: { lang: 'es' | 'en' }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
      {WC_SCHEDULE.map((row, i) => (
        <div key={row.en} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
          borderBottom: i < WC_SCHEDULE.length - 1 ? '1px solid var(--ts-divider)' : 'none',
          background: row.highlight ? 'var(--ts-primary-soft)' : 'transparent',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: row.highlight ? 'var(--ts-primary)' : 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {t(lang, row.es, row.en)}
            </div>
            {(row.note_es || row.note_en) && (
              <div style={{ fontSize: 11, marginTop: 2, color: 'var(--ts-muted)' }}>{t(lang, row.note_es ?? '', row.note_en ?? '')}</div>
            )}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, textAlign: 'right' }}>
            {t(lang, row.dates_es, row.dates_en)}
          </div>
        </div>
      ))}
    </div>
  )
}

// Compact, informational win/draw/loss probability bar for an upcoming fixture.
// Pulls /predictions via our route. No betting/odds wording. Renders nothing if
// the API has no usable prediction (e.g. finished match or pre-draw fixture).
function PredictionBar({ fixtureId, lang }: { fixtureId: number; lang: 'es' | 'en' }) {
  const [pred, setPred] = useState<FixturePrediction | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/football/prediction?fixture=${fixtureId}`)
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && j.data) setPred(j.data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [fixtureId])

  if (!pred) return null

  const segs: { pct: number; color: string; label: string }[] = [
    { pct: pred.homePct, color: 'var(--ts-primary)', label: '1' },
    { pct: pred.drawPct, color: 'var(--ts-muted)', label: 'X' },
    { pct: pred.awayPct, color: 'var(--ts-teal)', label: '2' },
  ]

  return (
    <div style={{ padding: '4px 14px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-faint)', fontWeight: 700 }}>
          {t(lang, 'Pronóstico', 'Forecast')}
        </span>
        <span style={{ fontSize: 10, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {pred.homePct}% · {pred.drawPct}% · {pred.awayPct}%
        </span>
      </div>
      <div style={{ display: 'flex', height: 8, borderRadius: 5, overflow: 'hidden', background: 'var(--ts-card2)' }} aria-hidden>
        {segs.map((s, i) => s.pct > 0 ? (
          <div key={i} style={{ width: `${s.pct}%`, background: s.color }} />
        ) : null)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 9, color: 'var(--ts-primary)', fontWeight: 700 }}>{t(lang, '1 · local', '1 · home')}</span>
        <span style={{ fontSize: 9, color: 'var(--ts-muted)', fontWeight: 700 }}>{t(lang, 'X · empate', 'X · draw')}</span>
        <span style={{ fontSize: 9, color: 'var(--ts-teal)', fontWeight: 700 }}>{t(lang, '2 · visitante', '2 · away')}</span>
      </div>
    </div>
  )
}

function MatchRow({ f, lang }: { f: ApiFixture; lang: 'es' | 'en' }) {
  const locale = lang === 'en' ? 'en-US' : 'es-ES'
  const time = new Date(f.fixture.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const finished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
  const score = finished || f.goals.home != null
  // Only upcoming matches (not started) get a forecast; the API returns nothing
  // for finished fixtures anyway, but we gate to avoid the wasted request.
  const upcoming = f.fixture.status.short === 'NS'
  return (
    <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: upcoming ? 'none' : '1px solid var(--ts-divider)' }}>
      <span style={{ width: 46, flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>{time}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', minWidth: 0 }}>
        <span style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.teams.home.name}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={f.teams.home.logo} alt="" width={18} height={18} style={{ objectFit: 'contain', flexShrink: 0 }} />
      </div>
      <span style={{ width: 44, textAlign: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
        {score ? `${f.goals.home ?? 0}-${f.goals.away ?? 0}` : 'vs'}
      </span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={f.teams.away.logo} alt="" width={18} height={18} style={{ objectFit: 'contain', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.teams.away.name}</span>
      </div>
      <span className="wc-venue" style={{ width: 150, flexShrink: 0, textAlign: 'right', fontSize: 11, color: 'var(--ts-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {f.fixture.venue?.name ?? ''}
      </span>
    </div>
    {upcoming && <PredictionBar fixtureId={f.fixture.id} lang={lang} />}
    </>
  )
}

function CalendarPanel({ lang }: { lang: 'es' | 'en' }) {
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/football/fixtures?league=1&season=2026&all=1')
      .then(r => r.json())
      .then(j => { if (j.ok && Array.isArray(j.data)) setFixtures(j.data); else setError(true) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const locale = lang === 'en' ? 'en-US' : 'es-ES'
  // Group by calendar date (local), sorted chronologically.
  const byDay = (() => {
    const sorted = [...fixtures].sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
    const groups: { day: string; label: string; matches: ApiFixture[] }[] = []
    for (const f of sorted) {
      const d = new Date(f.fixture.date)
      const day = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
      let g = groups.find(x => x.day === day)
      if (!g) { g = { day, label, matches: [] }; groups.push(g) }
      g.matches.push(f)
    }
    return groups
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 12, color: 'var(--ts-muted)', lineHeight: 1.6 }}>
        {t(lang,
          'Calendario del Mundial 2026 con todos los partidos y horarios (hora local de tu dispositivo). Las eliminatorias se cuadran al cerrarse la fase de grupos.',
          'World Cup 2026 calendar with every match and kick-off time (your device’s local time). Knockout match-ups are set once the group stage ends.')}
      </p>

      {loading && <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 12, color: 'var(--ts-faint)' }}>{t(lang, 'Cargando calendario…', 'Loading calendar…')}</div>}

      {!loading && byDay.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {byDay.map(g => (
            <div key={g.day} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
              <div style={{ padding: '9px 14px', borderBottom: '1px solid var(--ts-border)', background: 'var(--ts-card2)', fontSize: 12, fontWeight: 700, textTransform: 'capitalize', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
                {g.label}
              </div>
              {g.matches.map(f => <MatchRow key={f.fixture.id} f={f} lang={lang} />)}
            </div>
          ))}
        </div>
      )}

      {!loading && byDay.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--ts-muted)' }}>
          {error
            ? t(lang, 'No se pudo cargar el calendario ahora mismo.', 'Could not load the calendar right now.')
            : t(lang, 'El calendario de partidos se publicará pronto.', 'The match calendar will be published soon.')}
        </p>
      )}

      {/* Phase windows reference (knockouts not yet drawn) */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginTop: 6 }}>
        {t(lang, 'Fases del torneo', 'Tournament phases')}
      </div>
      <PhaseWindows lang={lang} />
      <p style={{ fontSize: 10, color: 'var(--ts-faint)' }}>
        {t(lang, '* Partidos y horarios oficiales FIFA / API-Football.', '* Official FIFA / API-Football fixtures and times.')}
      </p>
    </div>
  )
}

// ─── Venues panel ────────────────────────────────────────────────────────────

function VenuesPanel({ lang }: { lang: 'es' | 'en' }) {
  const countries = ['USA', 'Mexico', 'Canada']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {countries.map(country => (
        <div key={country}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, color: 'var(--ts-muted)', fontFamily: "'Barlow Condensed', sans-serif" }}>
            <span style={{ fontSize: 16 }}>{flagOf(country)}</span>
            {country}
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {VENUES.filter(v => v.country === country).map(venue => (
              <div key={venue.stadium} style={{
                borderRadius: 12, padding: '14px 16px', background: 'var(--ts-card)',
                border: `1px solid ${venue.final ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
              }}>
                {venue.final && (
                  <span style={{ display: 'inline-block', fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 5, marginBottom: 8, background: 'var(--ts-primary-soft)', color: 'var(--ts-primary)', border: '1px solid var(--ts-border-hot)' }}>
                    {t(lang, 'SEDE FINAL', 'FINAL VENUE')}
                  </span>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif" }}>{venue.stadium}</div>
                <div style={{ fontSize: 12, marginTop: 2, color: 'var(--ts-muted)' }}>{venue.city}</div>
                <div style={{ fontSize: 10, marginTop: 4, color: 'var(--ts-faint)' }}>{t(lang, 'Cap.', 'Cap.')} {venue.capacity}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
