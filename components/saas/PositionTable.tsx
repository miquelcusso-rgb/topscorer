'use client'
import Link from 'next/link'
import type { PlayerData } from '@/types'
import Avatar from './Avatar'
import CrestImg from './CrestImg'
import LeagueChip from './LeagueChip'
import { clubLogo } from '@/lib/club-logos'
import { playerSlug } from '@/lib/player-slug'
import { shortName } from '@/lib/player-name'
import {
  type PositionTabId,
  COLUMNS_FOR,
  EXTRA_STAT_COLUMNS,
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
  sort?: { key: string; dir: 1 | -1 } | null
  onSort?: (key: string) => void
  /** Extra stat columns appended via the "+ Añadir stat" menu. */
  extraStats?: string[]
  /** Remove an appended stat column (receives the extraStats value, e.g. 'kp'). */
  onRemoveStat?: (value: string) => void
}

export default function PositionTable({ players, tab, lang = 'es', sort, onSort, extraStats = [], onRemoveStat }: Props) {
  const cols = [
    ...COLUMNS_FOR[tab],
    ...extraStats.map(k => EXTRA_STAT_COLUMNS[k]).filter(Boolean),
  ]
  const accent = TAB_ACCENT[tab]
  const last5Label = lang === 'en' ? 'Last 5 · avg' : 'Últimos 5 · media'

  // grid: rank · avatar · player(1fr) · club · [cols...] (last5 is a wide col)
  const colTemplate = `34px 40px minmax(130px,1.3fr) 96px ${cols.map(c => c.kind === 'last5' ? 'minmax(150px,1.5fr)' : 'minmax(44px,0.75fr)').join(' ')}`

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
      <div className="saas-desktop-table" style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflowX: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: colTemplate, gap: 12, padding: '12px 16px', alignItems: 'center', minWidth: 720,
          background: 'var(--ts-card2)', borderBottom: '1px solid var(--ts-border)',
          fontSize: 11, color: 'var(--ts-muted)', letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase',
        }}>
          <span />
          <span />
          <span>{lang === 'en' ? 'Player' : 'Jugador'}</span>
          <span>{lang === 'en' ? 'Team' : 'Equipo'}</span>
          {cols.map(c => {
            // Only performance/value columns sort (descending by value). The
            // descriptive columns — Age and Games (PJ) — are not sortable.
            const sortable = !!onSort && c.key !== 'age' && c.key !== 'pj'
            const isSorted = sort?.key === c.key
            // Extra (appended) columns carry an "x_" key prefix and get a small
            // ✕ above the label to remove them.
            const removable = c.key.startsWith('x_') && !!onRemoveStat
            return (
              <span
                key={c.key}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1,
                  textAlign: 'right', color: isSorted ? `var(--ts-${accent})` : undefined, userSelect: 'none',
                }}
              >
                {removable ? (
                  <button
                    type="button"
                    aria-label={lang === 'en' ? `Remove ${c.label}` : `Quitar ${c.label}`}
                    title={lang === 'en' ? 'Remove column' : 'Quitar columna'}
                    onClick={e => { e.preventDefault(); e.stopPropagation(); onRemoveStat!(c.key.replace(/^x_/, '')) }}
                    style={{
                      border: 'none', background: 'none', padding: 0, cursor: 'pointer', lineHeight: 1,
                      fontSize: 11, color: 'var(--ts-faint)',
                    }}
                  >✕</button>
                ) : null}
                <span
                  onClick={sortable ? () => onSort!(c.key) : undefined}
                  style={{ cursor: sortable ? 'pointer' : 'default' }}
                >
                  {c.kind === 'last5' ? last5Label : c.label}{isSorted ? (sort!.dir === -1 ? ' ↓' : ' ↑') : ''}
                </span>
              </span>
            )
          })}
        </div>

        {players.map((p, i) => {
          const rank = i + 1
          const slug = playerSlug(p)
          return (
            <Link
              key={slug + i}
              href={`/${lang}/jugadores/${slug}`}
              style={{
                display: 'grid', gridTemplateColumns: colTemplate, gap: 12, padding: '10px 16px', alignItems: 'center', minWidth: 720,
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
                c.kind === 'last5'
                  ? <Last5Strip key={c.key} player={p} lang={lang} />
                  : (
                    <span key={c.key} style={{
                      textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                      fontSize: c.accent ? 15 : 14, fontWeight: c.accent ? 700 : 500,
                      color: toneColor(c.tone), fontFamily: c.accent ? 'Barlow Condensed, sans-serif' : 'inherit',
                    }}>
                      {c.value(p)}
                    </span>
                  )
              ))}
            </Link>
          )
        })}
      </div>

      {/* Mobile cards — ultra-compact rows: rank · avatar · name + club-crest · stat.
          One tap target ≥44px tall but visually dense, so many fit per screen. */}
      <div className="saas-mobile-cards" style={{ flexDirection: 'column', gap: 0, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
        {players.map((p, i) => {
          const rank = i + 1
          const slug = playerSlug(p)
          const primaryCol = cols.find(c => c.accent && c.kind !== 'last5') ?? cols.find(c => c.kind !== 'last5') ?? cols[0]
          // Secondary chips on mobile: always IIG + Nota (so it's not just goals),
          // plus any columns the user appended via "+ Añadir stat".
          const chipCols = cols.filter(c =>
            c.kind !== 'last5' && c.key !== primaryCol.key &&
            (c.key === 'iig' || c.key === 'rt' || c.key.startsWith('x_')))
          const crest = clubLogo(p.club)
          return (
            <Link
              key={slug + i}
              href={`/${lang}/jugadores/${slug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px',
                borderTop: i ? '1px solid var(--ts-divider)' : 'none',
                textDecoration: 'none', color: 'inherit', minHeight: 44,
              }}
            >
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, width: 18, textAlign: 'right', flexShrink: 0, color: rank <= 3 ? `var(--ts-${accent})` : 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {String(rank).padStart(2, '0')}
              </span>
              <Avatar name={p.name} size={28} photo={p.photo} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                  {p.flag ? `${p.flag} ` : ''}{shortName(p)}
                </span>
                {crest
                  ? <CrestImg src={crest} alt={p.club} title={p.club} size={16} />
                  : <LeagueChip code={code(p.league)} />}
              </div>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexShrink: 0 }}>
                {chipCols.map(c => (
                  <span key={c.key} style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--ts-text)', fontVariantNumeric: 'tabular-nums' }}>
                    {c.value(p)}
                    <span style={{ fontSize: 8, color: 'var(--ts-faint)', marginLeft: 2, fontFamily: 'inherit', textTransform: 'uppercase' }}>{c.label}</span>
                  </span>
                ))}
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16, color: `var(--ts-${accent})`, fontVariantNumeric: 'tabular-nums' }}>
                  {primaryCol.value(p)}
                  <span style={{ fontSize: 9, color: 'var(--ts-muted)', marginLeft: 3, fontFamily: 'inherit' }}>{primaryCol.label}</span>
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
