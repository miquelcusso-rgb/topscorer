import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { resolvePlayerProfile } from '@/lib/resolve-player'
import { playerPhoto } from '@/lib/player-photo'
import { positionLabel } from '@/lib/position'
import { isLocale, type Lang } from '@/lib/i18n'
import type { PlayerData } from '@/types'

// Dynamic Open Graph "A vs B" share card for the player comparador.
// Pointed at by the comparador page's generateMetadata (og:image / twitter:image)
// with the same ?a=<slug>&b=<slug> params the page itself uses. Node runtime so
// it can reuse resolvePlayerProfile (static dataset + live API-Football fallback).
export const runtime = 'nodejs'
export const revalidate = 86400

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand palette — ImageResponse/Satori needs literal colors (no CSS vars).
// Dark card (black bg) reads best on social. Hexes taken from lib/palette.ts:
// DARK.primary (gold) + LIGHT.teal (deeper teal reads better on black than the
// light-mode neon) and the dark text/muted tones.
const BG = '#0a0908'
const CARD = '#15130f'
const GOLD = '#f0c040'
const TEAL = '#3ed6c2'
const TEXT = '#f1e8d2'
const MUTED = 'rgba(241,232,210,.6)'
const BORDER = 'rgba(240,200,90,.18)'

const fallbackAvatar =
  'https://media.api-sports.io/football/players/0.png'

function statLine(p: PlayerData) {
  const pj = p.pj || 0
  const ratio = pj ? (p.goles / pj).toFixed(2) : '0.00'
  return [
    { label: 'GOLES', value: String(p.goles ?? 0) },
    { label: 'ASIST', value: String(p.asist ?? 0) },
    { label: 'G/PJ', value: ratio },
  ]
}

async function resolve(slug: string | null): Promise<PlayerData | null> {
  if (!slug) return null
  try {
    const r = await resolvePlayerProfile(slug)
    return r?.base ?? null
  } catch {
    return null
  }
}

function PlayerColumn({
  p,
  lang,
  accent,
}: {
  p: PlayerData
  lang: Lang
  accent: string
}) {
  const photo = playerPhoto(p) || fallbackAvatar
  const stats = statLine(p)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 420,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt=""
        width={180}
        height={180}
        style={{
          width: 180,
          height: 180,
          borderRadius: 90,
          objectFit: 'cover',
          border: `4px solid ${accent}`,
          backgroundColor: CARD,
        }}
      />
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: TEXT,
          marginTop: 24,
          textAlign: 'center',
          lineHeight: 1.05,
          maxWidth: 400,
        }}
      >
        {p.name}
      </div>
      <div style={{ fontSize: 22, color: accent, marginTop: 8, fontWeight: 700 }}>
        {p.club || '—'}
      </div>
      <div style={{ fontSize: 18, color: MUTED, marginTop: 2 }}>
        {positionLabel(p, lang)}
      </div>
      <div style={{ display: 'flex', gap: 28, marginTop: 22 }}>
        {stats.map(s => (
          <div
            key={s.label}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ fontSize: 34, fontWeight: 800, color: TEXT }}>{s.value}</div>
            <div style={{ fontSize: 14, color: MUTED, letterSpacing: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const rawLang = sp.get('lang') ?? 'es'
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const [a, b] = await Promise.all([
    resolve(sp.get('a') ?? sp.get('p1')),
    resolve(sp.get('b') ?? sp.get('p2')),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BG,
          padding: 56,
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: GOLD, letterSpacing: 1 }}>
              TopScorers
            </div>
          </div>
          <div style={{ fontSize: 18, color: MUTED, letterSpacing: 3, textTransform: 'uppercase' }}>
            {lang === 'en' ? 'Player comparison' : 'Comparador de jugadores'}
          </div>
        </div>

        {/* Body: A vs B */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          {a ? (
            <PlayerColumn p={a} lang={lang} accent={GOLD} />
          ) : (
            <div style={{ display: 'flex', width: 420, justifyContent: 'center', color: MUTED, fontSize: 30 }}>?</div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: TEXT,
                border: `3px solid ${BORDER}`,
                borderRadius: 70,
                width: 110,
                height: 110,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: CARD,
              }}
            >
              VS
            </div>
          </div>

          {b ? (
            <PlayerColumn p={b} lang={lang} accent={TEAL} />
          ) : (
            <div style={{ display: 'flex', width: 420, justifyContent: 'center', color: MUTED, fontSize: 30 }}>?</div>
          )}
        </div>

        {/* Footer accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
          <div style={{ display: 'flex', height: 6, flex: 1, backgroundColor: GOLD, borderRadius: 3 }} />
          <div style={{ display: 'flex', width: 24 }} />
          <div style={{ display: 'flex', height: 6, flex: 1, backgroundColor: TEAL, borderRadius: 3 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
          <div style={{ fontSize: 16, color: MUTED }}>top-scorers.com</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
