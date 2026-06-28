import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { resolvePlayerProfile } from '@/lib/resolve-player'
import { playerPhoto } from '@/lib/player-photo'
import { positionLabel } from '@/lib/position'
import { isLocale, type Lang } from '@/lib/i18n'

// Dynamic Open Graph card for a single player page (?slug=<slug>&lang=<es|en>).
// Pointed at by app/[lang]/jugadores/[slug]/page.tsx generateMetadata.
export const runtime = 'nodejs'
export const revalidate = false // dataset solo cambia en deploy → no time-revalidate

export const size = { width: 1200, height: 630 }
// La ruta es dinámica (lee searchParams) → su revalidate se ignora y regeneraría
// la imagen en CADA fetch (~24K/día = el grueso del Fluid Active CPU). El contenido
// es determinista del dataset estático (cambia solo en deploy), así que cacheamos
// duro en el CDN: un deploy resetea la caché de funciones → se regenera 1× por deploy.
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800' }
export const contentType = 'image/png'

// Brand palette literals (lib/palette.ts DARK + deeper teal for black bg).
const BG = '#0a0908'
const CARD = '#15130f'
const GOLD = '#f0c040'
const TEAL = '#3ed6c2'
const TEXT = '#f1e8d2'
const MUTED = 'rgba(241,232,210,.6)'
const fallbackAvatar = 'https://media.api-sports.io/football/players/0.png'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const rawLang = sp.get('lang') ?? 'es'
  const lang: Lang = isLocale(rawLang) ? rawLang : 'es'
  const slug = sp.get('slug')

  let resolved = null
  try {
    resolved = slug ? await resolvePlayerProfile(slug) : null
  } catch {
    resolved = null
  }
  const p = resolved?.base

  if (!p) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: BG, color: GOLD, fontSize: 64, fontWeight: 800,
          }}
        >
          TopScorers
        </div>
      ),
      { ...size, headers: CACHE_HEADERS },
    )
  }

  const photo = playerPhoto(p) || fallbackAvatar
  const pj = p.pj || 0
  const ratio = pj ? (p.goles / pj).toFixed(2) : '0.00'
  const stats = [
    { label: 'GOLES', value: String(p.goles ?? 0) },
    { label: 'ASIST', value: String(p.asist ?? 0) },
    { label: 'PJ', value: String(pj) },
    { label: 'G/PJ', value: ratio },
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex',
          backgroundColor: BG, padding: 64, alignItems: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          width={320}
          height={320}
          style={{
            width: 320, height: 320, borderRadius: 24, objectFit: 'cover',
            border: `5px solid ${GOLD}`, backgroundColor: CARD,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 56, flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: GOLD, letterSpacing: 1 }}>TopScorers</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: TEXT, marginTop: 14, lineHeight: 1.02 }}>
            {p.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: TEAL }}>{p.club || '—'}</span>
            <span style={{ fontSize: 22, color: MUTED, marginLeft: 14 }}>· {positionLabel(p, lang)}</span>
          </div>
          <div style={{ display: 'flex', gap: 40, marginTop: 40 }}>
            {stats.map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: TEXT }}>{s.value}</div>
                <div style={{ fontSize: 16, color: MUTED, letterSpacing: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: 36 }}>
            <div style={{ display: 'flex', height: 6, width: 220, backgroundColor: GOLD, borderRadius: 3 }} />
            <div style={{ display: 'flex', height: 6, width: 60, backgroundColor: TEAL, borderRadius: 3, marginLeft: 12 }} />
          </div>
        </div>
      </div>
    ),
    { ...size, headers: CACHE_HEADERS },
  )
}
