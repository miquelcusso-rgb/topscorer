'use client'
import Link from 'next/link'
import type { PlayerData } from '@/types'
import Avatar from './Avatar'
import CrestImg from './CrestImg'
import LeagueChip from './LeagueChip'
import { clubLogo } from '@/lib/club-logos'
import { playerSlug } from '@/lib/player-slug'
import { shortName } from '@/lib/player-name'
import { iig } from '@/lib/iig'

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

interface Props {
  players: PlayerData[]
  lang: 'es' | 'en'
}

/**
 * Cross-position Top-20 leaderboard for the "Scouter" programmatic pages.
 * Rows arrive PRE-SORTED by rankScore (IIG when meaningful, else rating·coef)
 * from the page — this component only renders. Shows the rating (nota), the IIG
 * striker-impact index and the real season stats (G · A · MP). Styled purely
 * with --ts-* tokens so it adapts to both themes; mobile collapses to compact
 * cards with no horizontal scroll.
 */
export default function ScouterTable({ players, lang }: Props) {
  const t = {
    player: lang === 'en' ? 'Player' : 'Jugador',
    team: lang === 'en' ? 'Team' : 'Equipo',
    rating: lang === 'en' ? 'Rating' : 'Nota',
    goals: lang === 'en' ? 'G' : 'G',
    assists: lang === 'en' ? 'A' : 'A',
    mp: lang === 'en' ? 'MP' : 'PJ',
  }

  // grid: rank · avatar · player(1fr) · club · nota · IIG · G · A · MP
  const colTemplate =
    '34px 40px minmax(130px,1.4fr) 110px minmax(48px,0.8fr) minmax(48px,0.8fr) minmax(40px,0.6fr) minmax(40px,0.6fr) minmax(40px,0.6fr)'

  if (players.length === 0) {
    return (
      <div style={{
        background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10,
        padding: '32px 16px', textAlign: 'center', color: 'var(--ts-muted)', fontSize: 14,
      }}>
        {lang === 'en' ? 'No tracked players in this league yet.' : 'Aún no hay jugadores en esta liga.'}
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="saas-desktop-table" style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflowX: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: colTemplate, gap: 12, padding: '12px 16px', alignItems: 'center', minWidth: 640,
          background: 'var(--ts-card2)', borderBottom: '1px solid var(--ts-border)',
          fontSize: 11, color: 'var(--ts-muted)', letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase',
        }}>
          <span />
          <span />
          <span>{t.player}</span>
          <span>{t.team}</span>
          <span style={{ textAlign: 'right' }}>{t.rating}</span>
          <span style={{ textAlign: 'right' }}>IIG</span>
          <span style={{ textAlign: 'right' }}>{t.goals}</span>
          <span style={{ textAlign: 'right' }}>{t.assists}</span>
          <span style={{ textAlign: 'right' }}>{t.mp}</span>
        </div>

        {players.map((p, i) => {
          const rank = i + 1
          const slug = playerSlug(p)
          const rt = typeof p.rating === 'number' && p.rating > 0 ? p.rating : null
          return (
            <Link
              key={slug + i}
              href={`/${lang}/jugadores/${slug}`}
              style={{
                display: 'grid', gridTemplateColumns: colTemplate, gap: 12, padding: '10px 16px', alignItems: 'center', minWidth: 640,
                borderBottom: '1px solid var(--ts-divider)', textDecoration: 'none', color: 'inherit', cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: rank <= 3 ? 'var(--ts-primary)' : 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
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
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 600, color: rt ? ratingColor(rt) : 'var(--ts-faint)' }}>
                {rt ? rt.toFixed(2) : '—'}
              </span>
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 16, fontWeight: 700, color: 'var(--ts-primary)', fontFamily: 'Barlow Condensed, sans-serif' }}>
                {iig(p).toFixed(1)}
              </span>
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 500, color: 'var(--ts-text)' }}>{p.goles ?? 0}</span>
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 500, color: 'var(--ts-teal)' }}>{p.asist ?? 0}</span>
              <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 500, color: 'var(--ts-muted)' }}>{p.pj ?? 0}</span>
            </Link>
          )
        })}
      </div>

      {/* Mobile cards — compact rows: rank · avatar · name + club-crest · IIG. */}
      <div className="saas-mobile-cards" style={{ flexDirection: 'column', gap: 0, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, overflow: 'hidden' }}>
        {players.map((p, i) => {
          const rank = i + 1
          const slug = playerSlug(p)
          const crest = clubLogo(p.club)
          return (
            <Link
              key={slug + i}
              href={`/${lang}/jugadores/${slug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px',
                borderTop: i ? '1px solid var(--ts-divider)' : 'none',
                textDecoration: 'none', color: 'inherit', minHeight: 44, cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, width: 18, textAlign: 'right', flexShrink: 0, color: rank <= 3 ? 'var(--ts-primary)' : 'var(--ts-muted)', fontVariantNumeric: 'tabular-nums' }}>
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
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--ts-primary)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {iig(p).toFixed(1)}
                <span style={{ fontSize: 9, color: 'var(--ts-muted)', marginLeft: 3, fontFamily: 'inherit' }}>IIG</span>
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
