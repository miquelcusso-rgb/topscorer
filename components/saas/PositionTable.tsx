'use client'
import Link from 'next/link'
import type { PlayerData } from '@/types'
import Avatar from './Avatar'
import LeagueChip from './LeagueChip'
import { slugify } from '@/lib/slugify'
import { shortName } from '@/lib/player-name'
import {
  type PositionTabId,
  COLUMNS_FOR,
  last5Ratings,
  TAB_ACCENT,
} from '@/lib/position-stats'

const LEAGUE_CODE: Record<string, string> = {
  'Premier League': 'EPL', 'La Liga': 'LL', 'LaLiga': 'LL',
  'Bundesliga': 'BL', 'Serie A': 'SA', 'Ligue 1': 'L1',
  'Primeira Liga': 'PT', 'Süper Lig': 'TR', 'Eredivisie': 'NL',
}
const code = (n: string) => LEAGUE_CODE[n] ?? n.slice(0, 3).toUpperCase()

function ratingColor(r: number): string {
  if (r >= 8.5) return 'var(--ts-primary)'
  if (r >= 7.5) return 'var(--ts-teal)'
  if (r >= 6.5) return 'var(--ts-text)'
  return 'var(--ts-muted)'
}

function toneColor(tone?: string): string {
  switch (tone) {
    case 'primary': return 'var(--ts-primary)'
    case 'teal':    return 'var(--ts-teal)'
    case 'muted':   return 'var(--ts-muted)'
    default:        return 'var(--ts-text)'
  }
}

// Last-5 ratings strip: 5 mini chips + average badge.
function Last5Strip({ player, lang }: { player: PlayerData; lang: 'es' | 'en' }) {
  const { ratings, avg } = last5Ratings(player)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
      <div style={{ display: 'flex', gap: 3 }} title={lang === 'en' ? 'Last 5 ratings (est.)' : 'Últimas 5 valoraciones (est.)'}>
        {ratings.map((r, i) => (
          <span
            key={i}
            style={{
              width: 18, height: 18, borderRadius: 4,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
              background: 'var(--ts-card2)', color: ratingColor(r),
              border: '1px solid var(--ts-border)',
            }}
          >
            {r.toFixed(1).replace('.', '·').slice(0, 3)}
          </span>
        ))}
      </div>
      <span
        style={{
          fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16,
          color: ratingColor(avg), fontVariantNumeric: 'tabular-nums', minWidth: 30, textAlign: 'right',
        }}
        title={lang === 'en' ? 'Average (est.)' : 'Media (est.)'}
      >
        {avg.toFixed(1)}
      </span>
    </div>
  )
}

interface Props {
  players: PlayerData[]
  tab: PositionTabId
  lang?: 'es' | 'en'
}

export default function PositionTable({ players, tab, lang = 'es' }: Props) {
  const cols = COLUMNS_FOR[tab]
  const accent = TAB_ACCENT[tab]
  const last5Label = lang === 'en' ? 'Last 5 · avg' : 'Últimos 5 · media'

  // grid: rank · avatar · player(1fr) · club · [cols...] · last5
  const colTemplate = `40px 44px 1.4fr 120px ${cols.map(() => '64px').join(' ')} 180px`

  if (players.length === 0) {
    return (
      <div style={{
        background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10,
        padding: '32px 16px', textAlign: 'center', color: 'var(--ts-muted)', fontSize: 14,
      }}>
        {lang === 'en' ? 'No players in this scope yet.' : 'Aún no hay jugadores en este filtro.'}
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="saas-desktop-table" style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: colTemplate, gap: 12, padding: '12px 16px', alignItems: 'center',
          background: 'var(--ts-card2)', borderBottom: '1px solid var(--ts-border)',
          fontSize: 11, color: 'var(--ts-muted)', letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase',
        }}>
          <span />
          <span />
          <span>{lang === 'en' ? 'Player' : 'Jugador'}</span>
          <span>{lang === 'en' ? 'Team' : 'Equipo'}</span>
          {cols.map(c => <span key={c.key} style={{ textAlign: 'right' }}>{c.label}</span>)}
          <span style={{ textAlign: 'right' }}>{last5Label}</span>
        </div>

        {players.map((p, i) => {
          const rank = i + 1
          const slug = slugify(p.name)
          return (
            <Link
              key={slug + i}
              href={`/${lang}/v2/jugadores/${slug}`}
              style={{
                display: 'grid', gridTemplateColumns: colTemplate, gap: 12, padding: '10px 16px', alignItems: 'center',
                borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: rank <= 3 ? `var(--ts-${accent})` : 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {String(rank).padStart(2, '0')}
              </span>
              <Avatar name={p.name} size={36} photo={p.photo} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.flag ? `${p.flag} ` : ''}{shortName(p)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2 }}>
                  {p.age}{p.position ? ` · ${p.position}` : ''}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ts-text)', minWidth: 0 }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.club}</div>
                <div style={{ marginTop: 2 }}><LeagueChip code={code(p.league)} /></div>
              </div>
              {cols.map(c => (
                <span key={c.key} style={{
                  textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                  fontSize: c.accent ? 15 : 14, fontWeight: c.accent ? 700 : 500,
                  color: toneColor(c.tone), fontFamily: c.accent ? 'Barlow Condensed, sans-serif' : 'inherit',
                }}>
                  {c.value(p)}
                </span>
              ))}
              <Last5Strip player={p} lang={lang} />
            </Link>
          )
        })}
      </div>

      {/* Mobile cards */}
      <div className="saas-mobile-cards" style={{ flexDirection: 'column', gap: 8 }}>
        {players.map((p, i) => {
          const rank = i + 1
          const slug = slugify(p.name)
          const { avg } = last5Ratings(p)
          const primaryCol = cols[0]
          return (
            <Link
              key={slug + i}
              href={`/${lang}/v2/jugadores/${slug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10,
                textDecoration: 'none', color: 'inherit', minHeight: 64,
              }}
            >
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16, width: 22, textAlign: 'right', color: rank <= 3 ? `var(--ts-${accent})` : 'var(--ts-muted)' }}>
                {String(rank).padStart(2, '0')}
              </span>
              <Avatar name={p.name} size={40} photo={p.photo} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {shortName(p)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.club}</span>
                  <LeagueChip code={code(p.league)} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 18, color: `var(--ts-${accent})` }}>
                  {primaryCol.value(p)}
                  <span style={{ fontSize: 10, color: 'var(--ts-muted)', marginLeft: 3 }}>{primaryCol.label}</span>
                </div>
                <div style={{ fontSize: 11, color: ratingColor(avg), fontWeight: 600, marginTop: 2 }}>
                  {avg.toFixed(1)} <span style={{ color: 'var(--ts-faint)' }}>{lang === 'en' ? 'avg' : 'med'}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
