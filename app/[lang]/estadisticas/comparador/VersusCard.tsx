'use client'

import { useRef, useState, type ReactNode } from 'react'
import { toPng } from 'html-to-image'
import Avatar from '@/components/saas/Avatar'
import CrestImg from '@/components/saas/CrestImg'
import { iig } from '@/lib/iig'
import { shortName } from '@/lib/player-name'
import { slugify } from '@/lib/slugify'
import { clubLogo } from '@/lib/club-logos'
import type { EnrichedPlayer } from '@/types'

// Head-to-head VERSUS card. Side-by-side, real-metric comparison with a small
// bar per metric showing who leads. Leader highlighted in gold (A) / teal (B).
// Shareable via Web Share API + clipboard (no extra deps).
// Palette-only colours via --ts-* vars → works light + dark.

interface VersusCardProps {
  a: EnrichedPlayer
  b: EnrichedPlayer
  es: boolean
}

interface Metric {
  label: string
  // raw numeric value for each player (already computed from real data)
  va: number
  vb: number
  // formatted display value
  da: string
  db: string
  // true → value is a 0–100 percentage (gets a bar on an absolute 0–100 scale).
  // false → single number (shown head-to-head, NO bar — a bar there would be
  // misleading since there's no meaningful max).
  isPct: boolean
  // section header this row belongs to (Volumen/Ataque/Pase/Defensa/Disciplina)
  group: string
  // true → LOWER is better (cards, fouls) — winner highlight flips
  invert?: boolean
}

// Fila informativa de perfil (edad, altura, valor de mercado, contrato) —
// estilo Transfermarkt: se comparan pero solo el valor de mercado "gana".
interface ProfileRow {
  label: string
  da: string
  db: string
  // winner index for coloring: 0 = none, 1 = a, 2 = b
  win: 0 | 1 | 2
}

// '€200M' | '€850K' → millones (número comparable). 0 si no hay dato.
function mvNum(p: EnrichedPlayer): number {
  const s = p.marketValue ?? ''
  const m = s.replace(',', '.').match(/([\d.]+)\s*([MK])/i)
  if (!m) return 0
  return m[2].toUpperCase() === 'K' ? parseFloat(m[1]) / 1000 : parseFloat(m[1])
}

function buildProfile(a: EnrichedPlayer, b: EnrichedPlayer, es: boolean): ProfileRow[] {
  const mvA = mvNum(a), mvB = mvNum(b)
  const rows: ProfileRow[] = [
    { label: es ? 'Edad' : 'Age', da: a.age ? String(a.age) : '—', db: b.age ? String(b.age) : '—', win: 0 },
    { label: es ? 'Altura' : 'Height', da: a.height ?? '—', db: b.height ?? '—', win: 0 },
    {
      label: es ? 'Valor mercado' : 'Market value',
      da: a.marketValue ?? '—', db: b.marketValue ?? '—',
      win: mvA > mvB ? 1 : mvB > mvA ? 2 : 0,
    },
    { label: es ? 'Contrato hasta' : 'Contract until', da: a.contractUntil ?? '—', db: b.contractUntil ?? '—', win: 0 },
  ]
  return rows.filter(r => r.da !== '—' || r.db !== '—')
}

// On-target shooting accuracy from real shotsOn / shotsTotal.
function shotPct(p: EnrichedPlayer): number {
  const total = p.shotsTotal ?? 0
  const on = p.shotsOn ?? 0
  if (total <= 0) return 0
  return Math.round((on / total) * 1000) / 10
}
function convPct(p: EnrichedPlayer): number {
  const total = p.shotsTotal ?? 0
  if (total <= 0) return 0
  return Math.round(((p.goles ?? 0) / total) * 1000) / 10
}
function duelPct(p: EnrichedPlayer): number {
  const total = p.duelsTotal ?? 0
  if (total <= 0) return 0
  return Math.round(((p.duelsWon ?? 0) / total) * 1000) / 10
}

// Key passes: generated dataset uses `keyPasses`, curated uses `passesKey`.
function keyPassesOf(p: EnrichedPlayer): number {
  return p.keyPasses ?? p.passesKey ?? 0
}

// Métrica por 90 minutos (estándar FBref/Sofascore) — 0 si faltan minutos.
function per90(val: number | undefined, minutes: number | undefined): number {
  if (!val || !minutes || minutes <= 0) return 0
  return Math.round((val / minutes) * 90 * 100) / 100
}
// % regates completados
function dribblePct(p: EnrichedPlayer): number {
  const att = p.dribblesAttempts ?? 0
  if (att <= 0) return 0
  return Math.round(((p.dribblesSuccess ?? 0) / att) * 1000) / 10
}

function buildMetrics(a: EnrichedPlayer, b: EnrichedPlayer, es: boolean): Metric[] {
  const kpA = keyPassesOf(a)
  const kpB = keyPassesOf(b)
  const ratingA = typeof a.rating === 'number' ? a.rating : 0
  const ratingB = typeof b.rating === 'number' ? b.rating : 0
  const iigA = iig(a)
  const iigB = iig(b)
  const accA = a.passAccuracy ?? a.passesAccuracy ?? 0
  const accB = b.passAccuracy ?? b.passesAccuracy ?? 0
  const g90A = per90(a.goles, a.minutes), g90B = per90(b.goles, b.minutes)
  const a90A = per90(a.asist, a.minutes), a90B = per90(b.asist, b.minutes)

  const G = {
    vol: es ? 'Volumen' : 'Volume',
    atk: es ? 'Ataque' : 'Attacking',
    pass: es ? 'Pase y creación' : 'Passing & creation',
    def: es ? 'Defensa' : 'Defending',
    disc: es ? 'Disciplina' : 'Discipline',
    glob: es ? 'Global' : 'Overall',
  }
  const num = (label: string, group: string, va: number | undefined, vb: number | undefined, opts?: { invert?: boolean; fmt?: (n: number) => string }): Metric => {
    const f = opts?.fmt ?? ((n: number) => String(n))
    return {
      label, group, isPct: false, invert: opts?.invert,
      va: va ?? 0, vb: vb ?? 0,
      da: va !== undefined && va !== 0 ? f(va) : (va === 0 && vb !== undefined ? '0' : '—'),
      db: vb !== undefined && vb !== 0 ? f(vb) : (vb === 0 && va !== undefined ? '0' : '—'),
    }
  }
  const pct = (label: string, group: string, va: number, vb: number): Metric => ({
    label, group, isPct: true, va, vb,
    da: va ? `${va}%` : '—', db: vb ? `${vb}%` : '—',
  })

  const all: Metric[] = [
    // Volumen (partidos jugados, titularidades, minutos)
    num(es ? 'Partidos' : 'Matches', G.vol, a.pj, b.pj),
    num(es ? 'Titular' : 'Starts', G.vol, a.lineups, b.lineups),
    num(es ? 'Minutos' : 'Minutes', G.vol, a.minutes, b.minutes, { fmt: n => n.toLocaleString() }),
    // Ataque
    num(es ? 'Goles' : 'Goals', G.atk, a.goles, b.goles),
    num(es ? 'Goles / 90′' : 'Goals / 90′', G.atk, g90A, g90B, { fmt: n => n.toFixed(2) }),
    num(es ? 'Asistencias' : 'Assists', G.atk, a.asist, b.asist),
    num(es ? 'Asist. / 90′' : 'Assists / 90′', G.atk, a90A, a90B, { fmt: n => n.toFixed(2) }),
    num(es ? 'Tiros' : 'Shots', G.atk, a.shotsTotal, b.shotsTotal),
    num(es ? 'Penaltis marcados' : 'Penalties scored', G.atk, a.penaltiesScored, b.penaltiesScored),
    num(es ? 'Regates buenos' : 'Dribbles won', G.atk, a.dribblesSuccess, b.dribblesSuccess),
    pct(es ? '% Puerta' : 'Shot acc.', G.atk, shotPct(a), shotPct(b)),
    pct(es ? 'Conversión' : 'Conversion', G.atk, convPct(a), convPct(b)),
    pct(es ? '% Regate' : 'Dribble %', G.atk, dribblePct(a), dribblePct(b)),
    // Pase y creación
    num(es ? 'Pases clave' : 'Key passes', G.pass, kpA, kpB),
    num(es ? 'Pases' : 'Passes', G.pass, a.passes, b.passes, { fmt: n => n.toLocaleString() }),
    pct(es ? '% Acierto pase' : 'Pass acc.', G.pass, accA, accB),
    // Defensa
    num(es ? 'Entradas' : 'Tackles', G.def, a.tacklesTotal, b.tacklesTotal),
    num(es ? 'Intercepciones' : 'Interceptions', G.def, a.interceptions, b.interceptions),
    num(es ? 'Bloqueos' : 'Blocks', G.def, a.blocks, b.blocks),
    pct(es ? '% Duelos' : 'Duels won', G.def, duelPct(a), duelPct(b)),
    // Disciplina — MENOS es mejor (invert)
    num(es ? 'Amarillas' : 'Yellow cards', G.disc, a.yellowCards, b.yellowCards, { invert: true }),
    num(es ? 'Rojas' : 'Red cards', G.disc, a.redCards, b.redCards, { invert: true }),
    num(es ? 'Faltas cometidas' : 'Fouls committed', G.disc, a.foulsCommitted, b.foulsCommitted, { invert: true }),
    num(es ? 'Faltas recibidas' : 'Fouls drawn', G.disc, a.foulsDrawn, b.foulsDrawn),
    // Global
    num(es ? 'Nota media' : 'Avg. rating', G.glob, ratingA, ratingB, { fmt: n => n.toFixed(2) }),
    num('IIG', G.glob, iigA, iigB, { fmt: n => n.toFixed(1) }),
  ]
  // Drop rows we can't show (no data for either player).
  return all.filter(m => m.da !== '—' || m.db !== '—')
}

const COLOR_A = 'var(--ts-primary)'
const COLOR_B = 'var(--ts-teal)'

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{
      textAlign: 'center', fontSize: 12, fontWeight: 800, letterSpacing: 1.5,
      textTransform: 'uppercase', color: 'var(--ts-muted)', fontFamily: "'Barlow Condensed', sans-serif",
      padding: '14px 0 6px',
    }}>
      {children}
    </div>
  )
}

function PlayerHead({ p, color }: { p: EnrichedPlayer; color: string }) {
  const logo = clubLogo(p.club)
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <Avatar name={p.name} photo={p.photo} size={64} />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20,
          color, letterSpacing: 0.3, lineHeight: 1.1,
        }}>
          {p.flag ? `${p.flag} ` : ''}{shortName(p)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ts-muted)', marginTop: 3, display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
          {logo && <CrestImg src={logo} alt={p.club} size={18} crossOrigin="anonymous" />}
          <span>{p.club}</span>
        </div>
      </div>
    </div>
  )
}

export default function VersusCard({ a, b, es }: VersusCardProps) {
  const metrics = buildMetrics(a, b, es)
  const profile = buildProfile(a, b, es)
  // Secciones en orden de inserción (Volumen → Ataque → Pase → Defensa → Disciplina → Global)
  const groups = Array.from(new Set(metrics.map(m => m.group)))
  const hasPct = metrics.some(m => m.isPct)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  async function copyLink() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // ignore
      }
    }
  }

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = `${shortName(a)} vs ${shortName(b)} — TopScorers`
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled or unsupported → fall through to clipboard
      }
    }
    await copyLink()
  }

  // Resolve the current --ts-bg so the exported PNG isn't transparent (a
  // transparent card looks broken). The var is defined on the .saas-shell
  // ancestor, so read it from the card node (which inherits it) rather than
  // <html>. Falls back to the dark base bg.
  function resolveBg(node: HTMLElement | null): string {
    if (typeof window === 'undefined' || !node) return '#0a0908'
    const v = getComputedStyle(node).getPropertyValue('--ts-bg').trim()
    return v || '#0a0908'
  }

  async function downloadImage() {
    const node = cardRef.current
    if (!node || downloading) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: resolveBg(node),
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = `topscorers-${slugify(shortName(a))}-vs-${slugify(shortName(b))}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // Most likely a tainted canvas (player photo CDN without CORS) or an
      // unsupported browser. Don't crash — fall back to copy-link so the user
      // can still share the comparison.
      await copyLink()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      ref={cardRef}
      style={{
        background: 'var(--ts-card)',
        border: '1px solid var(--ts-border)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 32,
      }}
    >
      {/* Heads */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '24px 20px 16px' }}>
        <PlayerHead p={a} color={COLOR_A} />
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22,
          color: 'var(--ts-muted)', alignSelf: 'center', flexShrink: 0,
        }}>
          VS
        </div>
        <PlayerHead p={b} color={COLOR_B} />
      </div>

      {/* Metric rows — HYBRID layout:
          · Numbers  → head-to-head duel, NO bar (a bar with an arbitrary max
            misleads). Label centred, the two values flank it, leader coloured.
          · Percentages → two-sided bars on an ABSOLUTE 0–100% scale, so the bar
            length is genuinely representative (full bar = 100%). */}
      <div style={{ padding: '4px 16px 16px' }}>
        {/* Perfil (edad, altura, valor de mercado, contrato) — estilo TM */}
        {profile.length > 0 && (
          <>
            <SectionTitle>{es ? 'Perfil' : 'Profile'}</SectionTitle>
            {profile.map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--ts-divider)' }}>
                <span style={{ flex: 1, textAlign: 'right', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: r.win === 1 ? COLOR_A : 'var(--ts-text)' }}>{r.da}</span>
                <span style={{ width: 150, textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-faint)', fontFamily: "'Barlow Condensed', sans-serif" }}>{r.label}</span>
                <span style={{ flex: 1, textAlign: 'left', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: r.win === 2 ? COLOR_B : 'var(--ts-text)' }}>{r.db}</span>
              </div>
            ))}
          </>
        )}

        {/* Métricas por sección — números en duelo directo, porcentajes con barra
            0–100 absoluta. En Disciplina el ganador se invierte (menos = mejor). */}
        {groups.map(g => (
          <div key={g}>
            <SectionTitle>{g}</SectionTitle>
            {metrics.filter(m => m.group === g).map(m => {
              // Sin dato en un lado ('—') no hay duelo — nadie gana (clave con
              // invert: un dato ausente parecería "0 faltas" y ganaría).
              const bothHave = m.da !== '—' && m.db !== '—'
              const aWins = bothHave && (m.invert ? m.va < m.vb : m.va > m.vb)
              const bWins = bothHave && (m.invert ? m.vb < m.va : m.vb > m.va)
              if (!m.isPct) {
                return (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--ts-divider)' }}>
                    <span style={{ flex: 1, textAlign: 'right', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: aWins ? COLOR_A : 'var(--ts-text)' }}>{m.da}</span>
                    <span style={{ width: 150, textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ts-faint)', fontFamily: "'Barlow Condensed', sans-serif" }}>{m.label}</span>
                    <span style={{ flex: 1, textAlign: 'left', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: bWins ? COLOR_B : 'var(--ts-text)' }}>{m.db}</span>
                  </div>
                )
              }
              const wa = Math.max(0, Math.min(100, m.va))   // absolute 0–100 scale
              const wb = Math.max(0, Math.min(100, m.vb))
              return (
                <div key={m.label} style={{ padding: '9px 0', borderBottom: '1px solid var(--ts-divider)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 52, textAlign: 'right', flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: aWins ? COLOR_A : 'var(--ts-text)' }}>{m.da}</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', height: 8, background: 'var(--ts-hairline)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${wa}%`, background: aWins ? COLOR_A : 'var(--ts-border-hot)', borderRadius: 4 }} />
                    </div>
                    <span style={{ width: 110, textAlign: 'center', flexShrink: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--ts-faint)', fontFamily: "'Barlow Condensed', sans-serif" }}>{m.label}</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', height: 8, background: 'var(--ts-hairline)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${wb}%`, background: bWins ? COLOR_B : 'var(--ts-border-hot)', borderRadius: 4 }} />
                    </div>
                    <span style={{ width: 52, textAlign: 'left', flexShrink: 0, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: bWins ? COLOR_B : 'var(--ts-text)' }}>{m.db}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        {hasPct && (
          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--ts-faint)', marginTop: 8 }}>
            {es ? 'Barras a escala 0–100% (barra llena = 100%) · En Disciplina, menos es mejor' : 'Bars on a 0–100% scale (full bar = 100%) · In Discipline, lower is better'}
          </p>
        )}
      </div>

      {/* Share + download */}
      <div style={{ padding: '12px 16px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        <button
          onClick={share}
          style={{
            background: 'transparent', color: 'var(--ts-primary)',
            border: '1px solid var(--ts-border-hot)', padding: '8px 18px', borderRadius: 999,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: 0.6, textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          {copied
            ? (es ? '✓ Enlace copiado' : '✓ Link copied')
            : (es ? '🔗 Compartir / Copiar enlace' : '🔗 Share / Copy link')}
        </button>
        <button
          onClick={downloadImage}
          disabled={downloading}
          style={{
            background: 'var(--ts-primary)', color: 'var(--ts-bg)',
            border: '1px solid var(--ts-primary)', padding: '8px 18px', borderRadius: 999,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: 0.6, textTransform: 'uppercase',
            cursor: downloading ? 'wait' : 'pointer', opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading
            ? (es ? 'Generando…' : 'Generating…')
            : (es ? '⬇ Descargar imagen' : '⬇ Download image')}
        </button>
      </div>

      <p style={{ padding: '0 16px 16px', textAlign: 'center', fontSize: 11, color: 'var(--ts-faint)', lineHeight: 1.5 }}>
        {es
          ? 'Datos reales de la temporada 25/26 (fuente: API-Football). IIG = métrica propia de TopScorers.'
          : 'Real 2025/26 season data (source: API-Football). IIG is a TopScorers derived metric.'}
      </p>
    </div>
  )
}
