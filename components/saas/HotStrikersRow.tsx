'use client'
import Link from 'next/link'
import Avatar from './Avatar'
import type { Standout } from '@/lib/home-insights'

// Three "hot striker" cards on the home, rumor-strip style: absolute top scorer,
// IIG leader, and the MVP (best rating). Each links to the player's profile.
export default function HotStrikersRow({ standouts, lang }: { standouts: Standout[]; lang: 'es' | 'en' }) {
  const en = lang === 'en'
  const by = (k: string) => standouts.find(s => s.key === k)
  const picks = [
    { s: by('scorer'), labEs: 'Máximo goleador', labEn: 'Top scorer' },
    { s: by('iig'),    labEs: 'Líder IIG',       labEn: 'IIG leader' },
    { s: by('rating'), labEs: 'MVP · Mejor nota', labEn: 'MVP · Best rating' },
  ].filter(p => p.s) as { s: Standout; labEs: string; labEn: string }[]
  if (!picks.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
        🔥 {en ? 'Hot strikers' : 'En racha'}
      </div>
      <div className="saas-standouts-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${picks.length}, minmax(0,1fr))`, gap: 12 }}>
        {picks.map(({ s, labEs, labEn }) => (
          <Link key={s.key} href={`/${lang}/jugadores/${s.slug}`}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: 'var(--ts-card)', border: '1px solid var(--ts-border-hot)', borderRadius: 12,
              textDecoration: 'none', color: 'inherit', minWidth: 0, position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--ts-primary-soft) 0%, transparent 55%)', pointerEvents: 'none' }} />
            <span style={{ position: 'relative', flexShrink: 0 }}><Avatar name={s.name} size={52} photo={s.photo} /></span>
            <span style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>{en ? labEn : labEs}</span>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 700, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                {s.flag ? `${s.flag} ` : ''}{s.name}
              </span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--ts-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.club}</span>
            </span>
            <span style={{ position: 'relative', textAlign: 'right', flexShrink: 0 }}>
              <span style={{ display: 'block', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 30, lineHeight: 1, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>{s.stat}</span>
              <span style={{ display: 'block', fontSize: 10, color: 'var(--ts-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{en ? s.statLabelEn : s.statLabelEs}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
