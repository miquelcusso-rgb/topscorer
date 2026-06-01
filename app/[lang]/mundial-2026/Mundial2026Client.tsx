'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import type { ApiFixture, ApiPlayerResponse } from '@/lib/api-football'

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

const WC_GROUPS = [
  { id: 'A', teams: ['Qatar', 'Ecuador', 'Senegal', 'Netherlands'] },
  { id: 'B', teams: ['England', 'Iran', 'USA', 'Wales'] },
  { id: 'C', teams: ['Argentina', 'Saudi Arabia', 'Mexico', 'Poland'] },
  { id: 'D', teams: ['France', 'Australia', 'Denmark', 'Tunisia'] },
  { id: 'E', teams: ['Spain', 'Costa Rica', 'Germany', 'Japan'] },
  { id: 'F', teams: ['Belgium', 'Canada', 'Morocco', 'Croatia'] },
  { id: 'G', teams: ['Brazil', 'Serbia', 'Switzerland', 'Cameroon'] },
  { id: 'H', teams: ['Portugal', 'Ghana', 'Uruguay', 'South Korea'] },
  { id: 'I', teams: ['Italy', 'Colombia', 'USA', 'Egypt'] },
  { id: 'J', teams: ['Netherlands', 'Chile', 'Austria', 'Algeria'] },
  { id: 'K', teams: ['Mexico', 'New Zealand', 'Ivory Coast', 'Iraq'] },
  { id: 'L', teams: ['Canada', 'Peru', 'Senegal', 'Slovenia'] },
]

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

const START_DATE = new Date('2026-06-11T00:00:00Z')
const END_DATE = new Date('2026-07-19T00:00:00Z')

function getDaysUntilStart() {
  const now = new Date()
  if (now >= END_DATE) return -2
  if (now >= START_DATE) return -1 // already started
  return Math.ceil((START_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

const t = (lang: 'es' | 'en', es: string, en: string) => (lang === 'en' ? en : es)

// ─── Countdown component ──────────────────────────────────────────────────────

function Countdown({ lang }: { lang: 'es' | 'en' }) {
  const days = getDaysUntilStart()

  if (days === -2) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <span style={{ fontSize: 13, color: 'var(--ts-primary)' }}>
          {t(lang, 'El Mundial 2026 ha concluido', 'World Cup 2026 has concluded')}
        </span>
      </div>
    )
  }

  if (days === -1) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '12px 0' }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--ts-teal)', boxShadow: '0 0 7px var(--ts-teal)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ts-teal)', fontFamily: "'Barlow Condensed', sans-serif" }}>
          {t(lang, 'En curso', 'Live now')}
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: '12px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>
          {days}
        </div>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4, color: 'var(--ts-muted)' }}>
          {t(lang, 'días', 'days')}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ts-faint)' }}>{t(lang, 'hasta el', 'until')}</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ts-text)', fontFamily: "'Barlow Condensed', sans-serif" }}>
          11 Jun 2026
        </div>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4, color: 'var(--ts-muted)' }}>
          {t(lang, 'Copa del Mundo', 'World Cup')}
        </div>
      </div>
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
      fetch('/api/football/fixtures?league=1&season=2024&last=8').then(r => r.json()),
      fetch('/api/football/topscorers?league=1&season=2024').then(r => r.json()),
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

export default function Mundial2026Client() {
  const { lang } = useLang()
  const [view, setView] = useState<'overview' | 'groups' | 'venues' | 'live'>('overview')

  return (
    <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>

      {/* Hero header */}
      <div style={{ background: 'linear-gradient(180deg, var(--ts-primary-soft), var(--ts-bg))', borderBottom: '1px solid var(--ts-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
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

            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 700, color: 'var(--ts-primary)', letterSpacing: 1, lineHeight: 1 }}>
              {t(lang, 'MUNDIAL 2026', 'WORLD CUP 2026')}
            </h1>
            <p style={{ marginTop: 4, fontSize: 13, color: 'var(--ts-muted)' }}>
              {t(lang, '48 selecciones · 16 sedes · 104 partidos · 11 jun – 19 jul 2026', '48 teams · 16 venues · 104 matches · Jun 11 – Jul 19, 2026')}
            </p>

            <Countdown lang={lang} />
          </div>

          {/* Nav tabs */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            {([
              { id: 'overview', es: 'Resumen', en: 'Overview' },
              { id: 'groups', es: 'Grupos', en: 'Groups' },
              { id: 'venues', es: 'Sedes', en: 'Venues' },
              { id: 'live', es: 'En vivo', en: 'Live' },
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--ts-bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px' }}>
          {view === 'overview' && <OverviewPanel lang={lang} />}
          {view === 'groups' && <GroupsPanel lang={lang} />}
          {view === 'venues' && <VenuesPanel lang={lang} />}
          {view === 'live' && <LiveDataPanel lang={lang} />}
        </div>
      </div>
    </main>
  )
}

// ─── Overview panel ───────────────────────────────────────────────────────────

function OverviewPanel({ lang }: { lang: 'es' | 'en' }) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
          {phases.map((p, i) => (
            <div key={p.phase} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <span style={{ color: 'var(--ts-primary)', fontSize: 16, padding: '0 6px', flexShrink: 0 }}>›</span>
              )}
              <div style={{
                minWidth: 96, padding: '12px 14px', borderRadius: 10, textAlign: 'center',
                background: i === phases.length - 1 ? 'var(--ts-primary-soft)' : 'var(--ts-card2)',
                border: `1px solid ${i === phases.length - 1 ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, lineHeight: 1, color: i === phases.length - 1 ? 'var(--ts-primary)' : 'var(--ts-text)' }}>{p.teams}</div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: 'var(--ts-text)' }}>{p.phase}</div>
                <div style={{ fontSize: 9, marginTop: 2, color: 'var(--ts-muted)' }}>{p.detail}</div>
              </div>
            </div>
          ))}
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
            href={`/${lang}/records`}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < favourites.length - 1 ? '1px solid var(--ts-divider)' : 'none', textDecoration: 'none', color: 'inherit' }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, width: 20, flexShrink: 0, color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
            <span style={{ fontSize: 16 }}>{flagOf(f.country)}</span>
            <span style={{ fontSize: 13, color: 'var(--ts-text)' }}>{f.name}</span>
            <span style={{ fontSize: 11, marginLeft: 'auto', color: 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>x{f.odds}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Groups panel ─────────────────────────────────────────────────────────────

function GroupsPanel({ lang }: { lang: 'es' | 'en' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, marginBottom: 8, color: 'var(--ts-muted)' }}>
        {t(
          lang,
          'El sorteo del Mundial 2026 se realizará en diciembre de 2025. Grupos provisionales basados en clasificaciones UEFA/CONMEBOL.',
          'The World Cup 2026 draw takes place in December 2025. Provisional groups based on UEFA/CONMEBOL rankings.',
        )}
      </p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {WC_GROUPS.map(g => (
          <div key={g.id} style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)' }}>
            <div style={{
              padding: '8px 12px', fontSize: 13, fontWeight: 800, color: 'var(--ts-primary)',
              fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: 'uppercase',
              borderBottom: '1px solid var(--ts-border)', borderLeft: '3px solid var(--ts-primary)',
            }}>
              {t(lang, 'GRUPO', 'GROUP')} {g.id}
            </div>
            {g.teams.map((team, ti) => (
              <div key={team + ti} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: ti < g.teams.length - 1 ? '1px solid var(--ts-divider)' : 'none' }}>
                <span style={{ fontSize: 14 }}>{flagOf(team)}</span>
                <span style={{ fontSize: 12, color: 'var(--ts-text)' }}>{team}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, marginTop: 8, color: 'var(--ts-faint)' }}>
        {t(lang, '* Se actualizarán tras el sorteo oficial.', '* Will update after the official draw.')}
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
