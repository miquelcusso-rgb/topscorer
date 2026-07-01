import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

// Side-by-side composite of two players' api-football headshots, for news/rumours
// that involve two players ("Messi vs Ronaldo"). Returned as a single PNG so
// every existing single-image renderer shows it with no layout changes. Cached
// hard on the CDN (deterministic per id pair) → cheap on the free tier.
export const runtime = 'nodejs'
export const contentType = 'image/png'
const CACHE = { 'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800' }

const photo = (id: string) => `https://media.api-sports.io/football/players/${id}.png`

export async function GET(req: NextRequest) {
  const a = req.nextUrl.searchParams.get('a')
  const b = req.nextUrl.searchParams.get('b')
  if (!a || !b || !/^\d+$/.test(a) || !/^\d+$/.test(b)) {
    return new Response('missing/invalid ids', { status: 400 })
  }
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#20242c' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo(a)} width={200} height={260} style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
        <div style={{ width: 2, height: '100%', background: '#f0c040' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo(b)} width={200} height={260} style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
      </div>
    ),
    { width: 400, height: 260, headers: CACHE },
  )
}
