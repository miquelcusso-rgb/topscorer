'use client'
import Link from 'next/link'
import Avatar from './Avatar'
import { clubLogo } from '@/lib/club-logos'
import type { Standout } from '@/lib/home-insights'
import type { HomeRumor } from '@/lib/home-rumor'

interface Props {
  standouts: Standout[]
  rumors?: HomeRumor[]
  lang: 'es' | 'en'
}

// Editorial "Jugones de la jornada" strip + a "Rumores" bar (up to 3 cards).
export default function MatchdayStandouts({ standouts, rumors = [], lang }: Props) {
  if (!standouts.length && !rumors.length) return null
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

      {rumors.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ts-muted)', marginTop: 4 }}>
            {lang === 'en' ? '🔥 Hot rumours' : '🔥 Rumores'}
          </div>
          <div className="saas-rumours-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(rumors.length, 3)}, minmax(0,1fr))`, gap: 12 }}>
            {rumors.slice(0, 3).map(rumor => (
              <Link
                key={rumor.id}
                href={`/${lang}/rumores`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  background: 'var(--ts-primary-soft)', border: '1px solid var(--ts-border-hot)',
                  borderRadius: 12, textDecoration: 'none', color: 'inherit', minWidth: 0,
                }}
              >
                {rumor.playerName && (
                  <span style={{ flexShrink: 0 }}>
                    <Avatar name={rumor.playerName} size={36} photo={rumor.playerPhoto ?? undefined} />
                  </span>
                )}
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rumor.headline}
                  </span>
                  {(() => {
                    const renewal = !rumor.toClub || rumor.fromClub === rumor.toClub
                      || /renu|renew|amplí|extend|contrat|new deal/i.test(rumor.headline)
                    const lk = rumor.likelihood
                    const arrowColor = lk == null ? 'var(--ts-muted)' : lk >= 75 ? 'var(--ts-teal)' : lk < 50 ? 'var(--ts-red)' : 'var(--ts-primary)'
                    const crest = (c?: string | null) => c && clubLogo(c)
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={clubLogo(c)!} alt={c} width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
                      : null
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {renewal ? (
                          <>
                            <span aria-hidden style={{ fontSize: 13 }}>💰</span>
                            {crest(rumor.fromClub ?? rumor.toClub)}
                          </>
                        ) : (
                          <>
                            {crest(rumor.fromClub)}
                            <span aria-hidden style={{ color: arrowColor, fontWeight: 800, fontSize: 13, lineHeight: 1 }}>→</span>
                            {crest(rumor.toClub)}
                          </>
                        )}
                        {lk != null && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: arrowColor, fontVariantNumeric: 'tabular-nums', marginLeft: 2 }}>{lk}%</span>
                        )}
                      </span>
                    )
                  })()}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
