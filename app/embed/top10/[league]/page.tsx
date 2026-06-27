import { PLAYERS } from '@/data/players'
import { ALL_LEAGUES } from '@/lib/api-football'
import { notFound } from 'next/navigation'
import { slugify } from '@/lib/slugify'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CURRENT_SEASON_CODE, CURRENT_SEASON_SHORT } from '@/lib/season'

export const revalidate = 1800 // was 300 (free-tier ISR writes)

// Iframe-friendly Top-10 scorers widget.
// URL: /embed/top10/[league]?theme=light|dark
// Designed to be embedded by blogs:
//   <iframe src="https://www.top-scorers.com/embed/top10/premier-league"
//           width="100%" height="520" frameborder="0"></iframe>

type Props = { params: Promise<{ league: string }>; searchParams: Promise<{ theme?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { league } = await params
  return {
    title: `Top 10 — ${league} · TopScorers embed`,
    robots: { index: false, follow: false },
  }
}

// Map slugified league -> canonical name in PLAYERS dataset.
function findLeagueName(slug: string): string | null {
  const match = ALL_LEAGUES.find(l => slugify(l.name) === slug)
  return match?.name ?? null
}

export default async function EmbedTop10({ params, searchParams }: Props) {
  const { league: leagueSlug } = await params
  const { theme = 'light' } = await searchParams
  const leagueName = findLeagueName(leagueSlug)
  if (!leagueName) notFound()

  const top = PLAYERS
    .filter(p => p.season === CURRENT_SEASON_CODE && p.league === leagueName && p.tab === 's')
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 10)

  const isDark = theme === 'dark'
  const bg     = isDark ? '#0a0908' : '#ffffff'
  const card   = isDark ? '#15130f' : '#ffffff'
  const card2  = isDark ? '#1c1a16' : '#faf8f2'
  const text   = isDark ? '#f1e8d2' : '#1c1608'
  const muted  = isDark ? 'rgba(241,232,210,.6)' : 'rgba(28,22,8,.62)'
  const primary = isDark ? '#f0c040' : '#a8761a'
  const primarySoft = isDark ? 'rgba(240,192,64,.14)' : '#f6ecd2'
  const border = isDark ? 'rgba(240,200,90,.08)' : 'rgba(24,18,4,.09)'

  return (
    <div style={{ background: bg, padding: 16, minHeight: 480 }}>
      <div
        style={{
          background: card,
          border: `1px solid ${border}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: card2,
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: primary,
              }}
            >
              Top scorers · {CURRENT_SEASON_SHORT}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: text, marginTop: 2 }}>
              {leagueName}
            </div>
          </div>
          <Link
            href={`https://www.top-scorers.com/es/goleadores-${leagueSlug.replace(/-/g, '-')}`}
            target="_top"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: primary,
              textDecoration: 'none',
              padding: '6px 12px',
              border: `1px solid ${primary}`,
              borderRadius: 6,
            }}
          >
            View all →
          </Link>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle(muted), width: 32, textAlign: 'right' }}>#</th>
              <th style={{ ...thStyle(muted), textAlign: 'left' }}>Player</th>
              <th style={{ ...thStyle(muted), textAlign: 'left' }}>Club</th>
              <th style={{ ...thStyle(muted), textAlign: 'right', width: 50 }}>G</th>
              <th style={{ ...thStyle(muted), textAlign: 'right', width: 50 }}>A</th>
              <th style={{ ...thStyle(muted), textAlign: 'right', width: 50 }}>GP</th>
            </tr>
          </thead>
          <tbody>
            {top.map((p, i) => (
              <tr key={p.name} style={{ borderTop: `1px solid ${border}` }}>
                <td style={{ ...tdStyle(text), textAlign: 'right', color: i < 3 ? primary : muted, fontWeight: 600 }}>
                  {i + 1}
                </td>
                <td style={{ ...tdStyle(text), fontWeight: 600 }}>
                  <Link
                    href={`https://www.top-scorers.com/es/jugadores/${slugify(p.name)}`}
                    target="_top"
                    style={{ color: text, textDecoration: 'none' }}
                  >
                    {p.name}
                  </Link>
                </td>
                <td style={{ ...tdStyle(muted) }}>{p.club}</td>
                <td style={{ ...tdStyle(text), textAlign: 'right' }}>
                  <span style={{
                    background: i === 0 ? primary : primarySoft,
                    color: i === 0 ? bg : primary,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 13,
                  }}>{p.goles}</span>
                </td>
                <td style={{ ...tdStyle(text), textAlign: 'right' }}>{p.asist}</td>
                <td style={{ ...tdStyle(muted), textAlign: 'right' }}>{p.pj}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            padding: '10px 16px',
            fontSize: 11,
            color: muted,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: card2,
            borderTop: `1px solid ${border}`,
          }}
        >
          <span>by Furiosa Studio</span>
          <Link
            href="https://www.top-scorers.com"
            target="_top"
            style={{ color: primary, textDecoration: 'none', fontWeight: 600 }}
          >
            top-scorers.com
          </Link>
        </div>
      </div>
    </div>
  )
}

function thStyle(color: string): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color,
    padding: '10px 12px',
  }
}
function tdStyle(color: string): React.CSSProperties {
  return { padding: '10px 12px', fontSize: 13, color }
}
