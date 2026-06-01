'use client'
import Link from 'next/link'
import Avatar from './Avatar'
import { clubLogo } from '@/lib/club-logos'
import type { Standout } from '@/lib/home-insights'
import type { HomeRumor } from '@/lib/home-rumor'

interface Props {
  standouts: Standout[]
  rumor?: HomeRumor | null
  lang: 'es' | 'en'
}

// Editorial "Jugones de la jornada" strip + optional "Rumor del día" card.
export default function MatchdayStandouts({ standouts, rumor, lang }: Props) {
  if (!standouts.length && !rumor) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ts-muted)' }}>
        {lang === 'en' ? 'Matchday standouts' : 'Jugones de la jornada'}
      </div>

      <div className="saas-standouts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        {standouts.map(s => (
          <Link
            key={s.key}
            href={`/${lang}/jugadores/${s.slug}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: 'var(--ts-card)', border: '1px solid var(--ts-border)',
              borderRadius: 12, textDecoration: 'none', color: 'inherit', minWidth: 0,
            }}
          >
            <Avatar name={s.name} size={44} photo={s.photo} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
                {lang === 'en' ? s.labelEn : s.labelEs}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                {s.flag ? `${s.flag} ` : ''}{s.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 2 }}>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--ts-text)', lineHeight: 1 }}>{s.stat}</span>
                <span style={{ fontSize: 10, color: 'var(--ts-muted)' }}>{lang === 'en' ? s.statLabelEn : s.statLabelEs}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {rumor && (
        <Link
          href={`/${lang}/rumores`}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)',
            borderRadius: 12, textDecoration: 'none', color: 'inherit',
          }}
        >
          {/* Player photo (real) — falls back to tinted initials */}
          {rumor.playerName && (
            <span style={{ flexShrink: 0 }}>
              <Avatar name={rumor.playerName} size={36} photo={rumor.playerPhoto ?? undefined} />
            </span>
          )}
          <span style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
              {lang === 'en' ? '🔥 Hot rumour' : '🔥 Rumor del día'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {rumor.headline}
            </span>
          </span>
          {/* Destination club crest */}
          {rumor.toClub && clubLogo(rumor.toClub) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={clubLogo(rumor.toClub)} alt={rumor.toClub} width={22} height={22}
              style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
          )}
          {rumor.likelihood != null && (
            <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {rumor.likelihood}%
            </span>
          )}
        </Link>
      )}
    </div>
  )
}
