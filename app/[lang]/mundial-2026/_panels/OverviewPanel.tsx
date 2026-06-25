'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LangContext'
import { slugify } from '@/lib/slugify'
import type { ApiFixture, ApiPlayerResponse } from '@/lib/api-football'
import { wcFaqs } from '../wc-faqs'
import { type Lang, t, flagOf } from './shared'
import CrestImg from '@/components/saas/CrestImg'

// ─── Overview dashboard teaser cards ──────────────────────────────────────────
// Small, self-contained cards used by the Overview dashboard. Each mirrors the
// existing panels' "seed-or-fetch" / client-fetch pattern and the brand `--ts-*`
// tokens. All player/team names are clickable to their pages. "See more" links
// now point at the dedicated WC routes (not in-page tab state).

// Shared card shell: header (icon + title) + a "see more" link on the right.
function DashCard({
  title, icon, action, children,
}: {
  title: string
  icon: ReactNode
  action?: { label: string; href: string }
  children: ReactNode
}) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--ts-card)', border: '1px solid var(--ts-border)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--ts-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ts-muted)', fontFamily: "'Barlow Condensed', sans-serif" }}>
          <span style={{ color: 'var(--ts-primary)', display: 'inline-flex' }}>{icon}</span>
          {title}
        </span>
        {action && (
          <Link
            href={action.href}
            style={{ fontSize: 10, color: 'var(--ts-primary)', background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, fontFamily: 'inherit', padding: '4px 2px', flexShrink: 0, textDecoration: 'none' }}
          >
            {action.label} →
          </Link>
        )}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}

// Compact scorer/assist teaser row → player page. `metric` picks goals or assists
// as the headline number; the other is shown as the small secondary stat.
function TeaserStatRow({ p, i, lang, metric }: { p: ApiPlayerResponse; i: number; lang: Lang; metric: 'goals' | 'assists' }) {
  const stat = p.statistics[0]
  const goals = stat?.goals?.total ?? 0
  const ast = stat?.goals?.assists ?? 0
  const headline = metric === 'goals' ? goals : ast
  const headlineLabel = metric === 'goals' ? t(lang, 'goles', 'goals') : t(lang, 'asist', 'ast')
  return (
    <Link
      href={`/${lang}/jugadores/${slugify(p.player.name)}`}
      style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, padding: '8px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, width: 18, flexShrink: 0, textAlign: 'center', color: i === 0 ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>{i + 1}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.player.photo} alt={p.player.name} width={26} height={26} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.player.name}</div>
        <div style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{stat?.team?.name}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: "'Barlow Condensed', sans-serif" }}>{headline}</span>
        <span style={{ fontSize: 10, marginLeft: 4, color: 'var(--ts-muted)' }}>{headlineLabel}</span>
      </div>
    </Link>
  )
}

// Latest results teaser — most-recent FINISHED World Cup fixtures (league 1,
// season 2026). Client-fetch, mirroring LiveDataPanel. Renders nothing (card
// hidden) until at least one match has actually finished.
function ResultsTeaserCard({ lang }: { lang: Lang }) {
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/football/fixtures?league=1&season=2026&last=8')
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.data)) setFixtures(j.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [])

  // Only FINISHED matches, newest first.
  const finished = fixtures
    .filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short))
    .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)
    .slice(0, 4)

  // Hide gracefully until data exists (pre-tournament / no finished matches yet).
  if (!loaded || finished.length === 0) return null

  return (
    <DashCard
      title={t(lang, 'Últimos resultados', 'Latest results')}
      icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>}
      action={{ label: t(lang, 'Ver todos', 'See all'), href: `/${lang}/mundial-2026/resultados` }}
    >
      {finished.map(f => (
        <div
          key={f.fixture.id}
          style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '8px 16px', borderBottom: '1px solid var(--ts-divider)', color: 'inherit' }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end', minWidth: 0 }}>
            <Link href={`/${lang}/mundial-2026/${slugify(f.teams.home.name)}`} style={{ fontSize: 12, color: f.teams.home.winner ? 'var(--ts-text)' : 'var(--ts-muted)', fontWeight: f.teams.home.winner ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none', cursor: 'pointer' }}>{f.teams.home.name}</Link>
            <CrestImg src={f.teams.home.logo} alt={f.teams.home.name} size={16} />
          </div>
          <Link href={`/${lang}/mundial-2026/partido/${f.fixture.id}`} aria-label={t(lang, 'Ver detalle del partido', 'View match detail')} style={{ fontSize: 13, fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums', color: 'var(--ts-text)', width: 40, textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>
            {f.goals.home ?? 0}-{f.goals.away ?? 0}
          </Link>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <CrestImg src={f.teams.away.logo} alt={f.teams.away.name} size={16} />
            <Link href={`/${lang}/mundial-2026/${slugify(f.teams.away.name)}`} style={{ fontSize: 12, color: f.teams.away.winner ? 'var(--ts-text)' : 'var(--ts-muted)', fontWeight: f.teams.away.winner ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none', cursor: 'pointer' }}>{f.teams.away.name}</Link>
          </div>
        </div>
      ))}
    </DashCard>
  )
}

// News teaser — 3–4 World Cup headlines via /api/news?scope=worldcup. Headline +
// source + link only (ToS). Links out to the original article in a new tab.
interface TeaserNewsItem { title: string; link: string; source: string; date: string }
function NewsTeaserCard({ lang }: { lang: Lang }) {
  const [items, setItems] = useState<TeaserNewsItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/news?lang=${lang}&scope=worldcup`)
      .then(r => r.json())
      .then(j => { if (!cancelled && j.ok && Array.isArray(j.items)) setItems(j.items) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [lang])

  if (!loaded || items.length === 0) return null
  const top = items.slice(0, 4)

  return (
    <DashCard
      title={t(lang, 'Noticias', 'News')}
      icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>}
      action={{ label: t(lang, 'Más noticias', 'More news'), href: `/${lang}/mundial-2026/noticias` }}
    >
      {top.map((it, i) => (
        <a
          key={i}
          href={it.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 44, justifyContent: 'center', padding: '8px 16px', borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit' }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ts-text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{it.title}</span>
          <span style={{ fontSize: 10, color: 'var(--ts-faint)' }}>{it.source}</span>
        </a>
      ))}
    </DashCard>
  )
}

// ─── Overview panel ───────────────────────────────────────────────────────────

export default function OverviewPanel({ scorers = [], assists = [] }: { scorers?: ApiPlayerResponse[]; assists?: ApiPlayerResponse[] }) {
  const { lang } = useLang()
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

  // Phase boxes link to a route: group stage → /grupos, everything else → /calendario.
  const groupsHref = `/${lang}/mundial-2026/grupos`
  const calendarHref = `/${lang}/mundial-2026/calendario`

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
            const href = isGroups ? groupsHref : calendarHref
            return (
              <div key={p.phase} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <span style={{ color: 'var(--ts-primary)', fontSize: 16, padding: '0 6px', flexShrink: 0 }}>›</span>
                )}
                <Link
                  href={href}
                  title={isGroups ? t(lang, 'Ver los 12 grupos', 'See the 12 groups') : t(lang, 'Ver calendario', 'See calendar')}
                  style={{
                    minWidth: 96, padding: '12px 14px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    fontFamily: 'inherit', textDecoration: 'none', display: 'block',
                    background: i === phases.length - 1 ? 'var(--ts-primary-soft)' : 'var(--ts-card2)',
                    border: `1px solid ${i === phases.length - 1 ? 'var(--ts-border-hot)' : 'var(--ts-border)'}`,
                    transition: 'border-color .15s, transform .15s',
                  }}
                >
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, lineHeight: 1, color: i === phases.length - 1 ? 'var(--ts-primary)' : 'var(--ts-text)' }}>{p.teams}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: 'var(--ts-text)' }}>{p.phase}</div>
                  <div style={{ fontSize: 9, marginTop: 2, color: isGroups ? 'var(--ts-primary)' : 'var(--ts-muted)' }}>
                    {isGroups ? t(lang, 'Ver grupos →', 'See groups →') : p.detail}
                  </div>
                </Link>
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

      {/* Dashboard grid — balanced teaser cards. Golden Boot is ONE card here
          (not the hero): format + favourites lead above. All names clickable. */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Golden Boot teaser (data: `scorers` prop) — hidden until scorers exist. */}
        {scorers.length > 0 && (
          <DashCard
            title={t(lang, 'Bota de Oro', 'Golden Boot')}
            icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9a6 6 0 0 0 12 0V3H6Z" /><path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 21h6M12 15v6" /></svg>}
            action={{ label: t(lang, 'Ver completa', 'See full'), href: `/${lang}/mundial-2026/bota-de-oro` }}
          >
            {scorers.slice(0, 5).map((p, i) => <TeaserStatRow key={p.player.id} p={p} i={i} lang={lang} metric="goals" />)}
          </DashCard>
        )}

        {/* Assists teaser (data: `assists` prop) — hidden until assists exist. */}
        {assists.length > 0 && (
          <DashCard
            title={t(lang, 'Asistencias', 'Assists')}
            icon={<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 9V5a3 3 0 0 0-6 0v4M5 9h14l1 12H4Z" /></svg>}
            action={{ label: t(lang, 'Ver completas', 'See full'), href: `/${lang}/mundial-2026/asistentes` }}
          >
            {assists.slice(0, 5).map((p, i) => <TeaserStatRow key={p.player.id} p={p} i={i} lang={lang} metric="assists" />)}
          </DashCard>
        )}

        {/* Latest results teaser (client-fetch) — self-hides until a match ends. */}
        <ResultsTeaserCard lang={lang} />

        {/* News teaser (client-fetch) — self-hides when no headlines. */}
        <NewsTeaserCard lang={lang} />
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
