'use client'
import Link from 'next/link'
import Avatar from './Avatar'
import { clubLogo } from '@/lib/club-logos'
import { slugify } from '@/lib/slugify'
import type { Standout } from '@/lib/home-insights'
import type { HomeRumor } from '@/lib/home-rumor'

interface NewsLite { title: string; link: string; source: string }

interface Lead { label: string; sub?: string; href: string; external?: boolean; photo?: string; crest?: string; tail?: string }

function Strip({ icon, title, accent, leads, en }: { icon: string; title: string; accent: string; leads: Lead[]; en: boolean }) {
  if (!leads.length) return null
  return (
    <div className="saas-hotstrip" style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden',
    }}>
      <div className="saas-hotstrip-title" style={{
        flexShrink: 0, width: 150, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        borderRight: '1px solid var(--ts-border)', background: `${accent}14`,
      }}>
        <span aria-hidden style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: accent, lineHeight: 1 }}>{title}</span>
      </div>
      <div className="saas-hotstrip-leads" style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {leads.slice(0, 3).map((l, i) => {
          const inner = (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', minWidth: 0, borderLeft: i ? '1px solid var(--ts-hairline)' : 'none', height: '100%' }}>
              {l.photo ? <Avatar name={l.label} photo={l.photo} size={26} />
                : l.crest ? <span style={{ width: 22, flexShrink: 0 }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={l.crest} alt="" width={20} height={20} style={{ width: 20, height: 20, objectFit: 'contain' }} /></span>
                : null}
              <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.label}</span>
                {l.sub && <span style={{ fontSize: 10.5, color: 'var(--ts-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.sub}</span>}
              </span>
              {l.tail && <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: accent, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{l.tail}</span>}
            </span>
          )
          return l.external
            ? <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}>{inner}</a>
            : <Link key={i} href={l.href} style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}>{inner}</Link>
        })}
      </div>
    </div>
  )
}

export default function HotStrips({ news = [], rumors = [], strikers = [], lang }: {
  news?: NewsLite[]; rumors?: HomeRumor[]; strikers?: Standout[]; lang: 'es' | 'en'
}) {
  const en = lang === 'en'
  const newsLeads: Lead[] = news.slice(0, 3).map(n => ({ label: n.title, sub: n.source, href: n.link, external: true }))
  const rumorLeads: Lead[] = rumors.slice(0, 3).map(r => ({
    label: r.headline,
    sub: r.toClub ?? r.fromClub ?? undefined,
    crest: (r.toClub && clubLogo(r.toClub)) || (r.fromClub && clubLogo(r.fromClub)) || undefined,
    tail: r.likelihood != null ? `${r.likelihood}%` : undefined,
    href: r.playerSlug ? `/${lang}/jugadores/${r.playerSlug}` : `/${lang}/rumores`,
  }))
  const wanted = ['scorer', 'assister', 'rating']
  const strikerLeads: Lead[] = wanted.map(k => strikers.find(s => s.key === k)).filter(Boolean).slice(0, 3).map(s => ({
    label: s!.name, sub: s!.club, photo: s!.photo, tail: s!.stat,
    href: `/${lang}/jugadores/${s!.slug || slugify(s!.name)}`,
  }))

  if (!newsLeads.length && !rumorLeads.length && !strikerLeads.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Strip icon="📰" title={en ? 'Hot news' : 'Noticias'} accent="var(--ts-teal)" leads={newsLeads} en={en} />
      <Strip icon="🔄" title={en ? 'Hot rumours' : 'Rumores'} accent="var(--ts-primary)" leads={rumorLeads} en={en} />
      <Strip icon="🔥" title={en ? 'Hot strikers' : 'En racha'} accent="var(--ts-primary)" leads={strikerLeads} en={en} />
    </div>
  )
}
