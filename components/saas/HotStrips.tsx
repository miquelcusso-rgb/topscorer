'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Avatar from './Avatar'
import { clubLogo } from '@/lib/club-logos'
import { slugify } from '@/lib/slugify'
import type { Standout } from '@/lib/home-insights'
import type { HomeRumor } from '@/lib/home-rumor'
import NewsPlaceholder from './NewsPlaceholder'

interface NewsLite { title: string; link: string; source: string; image?: string }

// Mobile-only auto-sliding news carousel (Transfermarkt-style): one card at a
// time with the article image + headline + source, auto-advancing every ~5s,
// swipeable, with dot indicators. Desktop keeps the 3-up Strip below.
function NewsCarousel({ news, en }: { news: NewsLite[]; en: boolean }) {
  const items = news.slice(0, 6)
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const n = items.length

  useEffect(() => {
    if (n < 2 || paused) return
    const t = setInterval(() => setIdx(i => (i + 1) % n), 5000)
    return () => clearInterval(t)
  }, [n, paused])

  if (!n) return null
  const go = (d: number) => setIdx(i => ((i + d) % n + n) % n)

  return (
    <div
      className="saas-news-carousel"
      style={{
        position: 'relative', background: 'var(--ts-card)', border: '1px solid var(--ts-border)',
        borderRadius: 12, overflow: 'hidden',
      }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; setPaused(true) }}
      onTouchEnd={e => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        touchX.current = null
        setPaused(false)
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--ts-teal)14' }}>
        <span aria-hidden style={{ fontSize: 14 }}>📰</span>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 14, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ts-teal)' }}>
          {en ? 'Hot news' : 'Noticias'}
        </span>
        <Link href={en ? '/en/noticias' : '/es/noticias'} style={{ marginLeft: 'auto', color: 'var(--ts-teal)', fontSize: 13, opacity: 0.8, textDecoration: 'none' }} aria-label={en ? 'All news' : 'Todas las noticias'}>→</Link>
      </div>

      {(() => {
        const it = items[idx]
        return (
          <a href={it.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: 'var(--ts-card2)' }}>
              {it.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={it.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <NewsPlaceholder source={it.source} />}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts-text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {it.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ts-muted)', marginTop: 5 }}>{it.source} ↗</div>
            </div>
          </a>
        )
      })()}

      {n > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 0 10px' }} aria-hidden>
          {items.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} aria-label={`${i + 1}`}
              style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer',
                background: i === idx ? 'var(--ts-teal)' : 'var(--ts-border)', transition: 'width 150ms ease' }} />
          ))}
        </div>
      )}
    </div>
  )
}

interface Lead { label: string; sub?: string; href: string; external?: boolean; photo?: string; crest?: string; tail?: string }

function Strip({ icon, title, accent, leads, en, titleHref }: { icon: string; title: string; accent: string; leads: Lead[]; en: boolean; titleHref?: string }) {
  if (!leads.length) return null
  const titleStyle = {
    flexShrink: 0, width: 150, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    borderRight: '1px solid var(--ts-border)', background: `${accent}14`, textDecoration: 'none',
  } as const
  const titleInner = (
    <>
      <span aria-hidden style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: accent, lineHeight: 1.1 }}>{title}</span>
      {titleHref && <span aria-hidden style={{ marginLeft: 'auto', color: accent, fontSize: 13, opacity: 0.75 }}>→</span>}
    </>
  )
  return (
    <div className="saas-hotstrip" style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden',
    }}>
      {titleHref
        ? <Link href={titleHref} className="saas-hotstrip-title" style={titleStyle}>{titleInner}</Link>
        : <div className="saas-hotstrip-title" style={titleStyle}>{titleInner}</div>}
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

  // Compact striker tiles for mobile (square-ish, single row, tight).
  const strikerTiles = strikerLeads.length ? (
    <div className="saas-hotstrikers-mobile" style={{ display: 'none' }}>
      <div style={{ background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--ts-primary)14' }}>
          <span aria-hidden style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 14, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
            {en ? 'Hot strikers' : 'En racha'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${strikerLeads.length}, 1fr)` }}>
          {strikerLeads.map((l, i) => (
            <Link key={i} href={l.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px',
              borderLeft: i ? '1px solid var(--ts-hairline)' : 'none', textDecoration: 'none', color: 'inherit', minWidth: 0,
            }}>
              {l.photo && <Avatar name={l.label} photo={l.photo} size={34} />}
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>{l.label}</span>
              {l.tail && <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--ts-primary)', fontVariantNumeric: 'tabular-nums' }}>{l.tail}</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  ) : null

  if (!newsLeads.length && !rumorLeads.length && !strikerLeads.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Mobile: auto-sliding image carousel; Desktop: 3-up strip (hidden on mobile) */}
      {newsLeads.length > 0 && (
        <div className="saas-news-carousel-wrap" style={{ display: 'none' }}>
          <NewsCarousel news={news} en={en} />
        </div>
      )}
      <div className="saas-news-strip-desktop">
        <Strip icon="📰" title={en ? 'Hot news' : 'Noticias'} accent="var(--ts-teal)" leads={newsLeads} en={en} titleHref={`/${lang}/noticias`} />
      </div>
      <Strip icon="🔄" title={en ? 'Hot rumours' : 'Rumores'} accent="var(--ts-primary)" leads={rumorLeads} en={en} titleHref={`/${lang}/rumores`} />
      {/* Strikers: desktop strip + compact mobile tiles (one shown per breakpoint) */}
      <div className="saas-hotstrikers-desktop">
        <Strip icon="🔥" title={en ? 'Hot strikers' : 'En racha'} accent="var(--ts-primary)" leads={strikerLeads} en={en} />
      </div>
      {strikerTiles}
    </div>
  )
}
