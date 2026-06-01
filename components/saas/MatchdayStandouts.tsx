'use client'
import Link from 'next/link'
import Avatar from './Avatar'
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
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)', flexShrink: 0 }}>
            {lang === 'en' ? '🔥 Hot rumour' : '🔥 Rumor del día'}
          </span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {rumor.headline}
          </span>
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
