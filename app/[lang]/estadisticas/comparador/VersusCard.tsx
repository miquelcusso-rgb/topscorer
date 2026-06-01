'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import Avatar from '@/components/saas/Avatar'
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
  // higher is better? (always true here, but kept explicit)
  higherWins: boolean
}

// On-target shooting accuracy from real shotsOn / shotsTotal.
function shotPct(p: EnrichedPlayer): number {
  const total = p.shotsTotal ?? 0
  const on = p.shotsOn ?? 0
  if (total <= 0) return 0
  return Math.round((on / total) * 1000) / 10
}

// Key passes: generated dataset uses `keyPasses`, curated uses `passesKey`.
function keyPassesOf(p: EnrichedPlayer): number {
  return p.keyPasses ?? p.passesKey ?? 0
}

function buildMetrics(a: EnrichedPlayer, b: EnrichedPlayer, es: boolean): Metric[] {
  const kpA = keyPassesOf(a)
  const kpB = keyPassesOf(b)
  const ratingA = typeof a.rating === 'number' ? a.rating : 0
  const ratingB = typeof b.rating === 'number' ? b.rating : 0
  const iigA = iig(a)
  const iigB = iig(b)
  const pctA = shotPct(a)
  const pctB = shotPct(b)

  return [
    { label: es ? 'Goles' : 'Goals',          va: a.goles, vb: b.goles, da: String(a.goles), db: String(b.goles), higherWins: true },
    { label: es ? 'Asist.' : 'Assists',        va: a.asist, vb: b.asist, da: String(a.asist), db: String(b.asist), higherWins: true },
    { label: es ? 'Tiros' : 'Shots',           va: a.shotsTotal ?? 0, vb: b.shotsTotal ?? 0, da: String(a.shotsTotal ?? '—'), db: String(b.shotsTotal ?? '—'), higherWins: true },
    { label: es ? '% Puerta' : 'Shot acc.',    va: pctA, vb: pctB, da: pctA ? `${pctA}%` : '—', db: pctB ? `${pctB}%` : '—', higherWins: true },
    { label: es ? 'Pases clave' : 'Key passes', va: kpA, vb: kpB, da: kpA ? String(kpA) : '—', db: kpB ? String(kpB) : '—', higherWins: true },
    { label: es ? 'Nota' : 'Rating',           va: ratingA, vb: ratingB, da: ratingA ? ratingA.toFixed(2) : '—', db: ratingB ? ratingB.toFixed(2) : '—', higherWins: true },
    { label: 'IIG',                            va: iigA, vb: iigB, da: iigA.toFixed(1), db: iigB.toFixed(1), higherWins: true },
  ]
}

const COLOR_A = 'var(--ts-primary)'
const COLOR_B = 'var(--ts-teal)'

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
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={18} height={18} crossOrigin="anonymous" loading="lazy" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
          )}
          <span>{p.club}</span>
        </div>
      </div>
    </div>
  )
}

export default function VersusCard({ a, b, es }: VersusCardProps) {
  const metrics = buildMetrics(a, b, es)
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

      {/* Metric rows */}
      <div style={{ padding: '4px 16px 16px' }}>
        {metrics.map(m => {
          const aWins = m.va > m.vb
          const bWins = m.vb > m.va
          const max = Math.max(m.va, m.vb, 1)
          const wa = Math.round((m.va / max) * 100)
          const wb = Math.round((m.vb / max) * 100)
          return (
            <div key={m.label} style={{ padding: '10px 0', borderBottom: '1px solid var(--ts-divider)' }}>
              <div style={{
                textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1,
                textTransform: 'uppercase', color: 'var(--ts-faint)', marginBottom: 6,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>
                {m.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* A value + bar (right-aligned) */}
                <span style={{
                  width: 52, textAlign: 'right', flexShrink: 0,
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16,
                  color: aWins ? COLOR_A : 'var(--ts-text)',
                }}>
                  {m.da}
                </span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', height: 8, background: 'var(--ts-hairline)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${wa}%`, background: aWins ? COLOR_A : 'var(--ts-border-hot)', borderRadius: 4 }} />
                </div>
                <span style={{ width: 14, textAlign: 'center', flexShrink: 0, fontSize: 12, color: 'var(--ts-faint)' }}>·</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', height: 8, background: 'var(--ts-hairline)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${wb}%`, background: bWins ? COLOR_B : 'var(--ts-border-hot)', borderRadius: 4 }} />
                </div>
                <span style={{
                  width: 52, textAlign: 'left', flexShrink: 0,
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16,
                  color: bWins ? COLOR_B : 'var(--ts-text)',
                }}>
                  {m.db}
                </span>
              </div>
            </div>
          )
        })}
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
