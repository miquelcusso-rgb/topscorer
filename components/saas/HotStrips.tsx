'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Avatar from './Avatar'
import CrestImg from './CrestImg'
import { clubLogo } from '@/lib/club-logos'
import { slugify } from '@/lib/slugify'
import { genericImageFor } from '@/lib/news-images'
import type { Standout } from '@/lib/home-insights'
import type { HomeRumor } from '@/lib/home-rumor'
import NewsPlaceholder from './NewsPlaceholder'
import LangBadge from './LangBadge'

// `visual` is the license-aware image resolved server-side (player headshot →
// `agency`, or a club crest → `crest`; both licensed via our API). We NEVER
// carry the raw RSS/agency photo, and there is no generic-scene fallback — a
// missing visual renders the branded NewsPlaceholder.
interface NewsLite { title: string; link: string; source: string; visual?: { url: string; license: 'agency' | 'crest' | 'flag' | 'league' | 'global' }; lang: 'es' | 'en' }

// Mobile-only auto-sliding news carousel (Transfermarkt-style): one card at a
// time with the article image + headline + source, auto-advancing every ~5s,
// swipeable, with dot indicators. Desktop keeps the 3-up Strip below.
function NewsCarousel({ news, en, lang }: { news: NewsLite[]; en: boolean; lang: 'es' | 'en' }) {
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
          <a href={it.link} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', gap: 12, padding: 10, alignItems: 'center', minHeight: 84, textDecoration: 'none', color: 'inherit' }}>
            {/* Horizontal one-line layout (foto + titular) — fixed photo size on
                every slide so the strip stays compact on narrow (<600px) screens. */}
            <div style={{ width: 104, height: 78, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--ts-card2)' }}>
              {it.visual?.url
                // License-aware visual only (headshot/CC0) — never the raw RSS photo.
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={it.visual.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: it.visual.license === 'agency' ? 'cover' : 'contain', padding: it.visual.license === 'agency' ? 0 : '12%', boxSizing: 'border-box', display: 'block' }} />
                : <NewsPlaceholder source={it.source} rounded={8} compact />}
            </div>
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 4 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ts-text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {it.title}
              </span>
              <span style={{ fontSize: 11, color: 'var(--ts-muted)', display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                <LangBadge itemLang={it.lang} siteLang={lang} /><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.source}</span> ↗
              </span>
            </span>
          </a>
        )
      })()}

      {n > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '0 0 4px' }} aria-hidden>
          {items.map((_, i) => (
            // Hitbox 30×30 (audit móvil 8-jul: los dots de 6px eran intocables);
            // el dot visual vive en el span interior.
            <button key={i} type="button" onClick={() => setIdx(i)} aria-label={`${i + 1}`}
              style={{ width: i === idx ? 42 : 30, height: 30, border: 'none', padding: 0, cursor: 'pointer',
                background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 999, display: 'block',
                background: i === idx ? 'var(--ts-teal)' : 'var(--ts-border)', transition: 'width 150ms ease' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface Lead { label: string; sub?: string; href: string; external?: boolean; photo?: string; crest?: string; tail?: string; badge?: 'es' | 'en'; siteLang?: 'es' | 'en' }

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
                : l.crest ? <CrestImg src={l.crest} alt={l.label} size={22} />
                : null}
              <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ts-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.label}</span>
                {l.sub && <span style={{ fontSize: 10.5, color: 'var(--ts-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {l.badge && l.siteLang && <LangBadge itemLang={l.badge} siteLang={l.siteLang} />}{l.sub}
                </span>}
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
  // News strip thumbs: license-aware visual only — a player headshot renders as
  // a round Avatar (`agency`), a club crest as a small square (`crest`). No
  // visual → no thumb (never the raw RSS image, never a generic scene).
  const newsLeads: Lead[] = news.slice(0, 3).map(n => ({
    label: n.title, sub: n.source, href: n.link, external: true, badge: n.lang, siteLang: lang,
    photo: n.visual?.license === 'agency' ? n.visual.url : undefined,
    crest: n.visual && n.visual.license !== 'agency' ? n.visual.url : undefined,
  }))

  // The home is force-static, so the build-time `rumors` prop always shows the
  // same 3. Refresh client-side from a larger fresh pool and rotate a window of
  // 3 every 6h, so visitors see different rumours through the day. Cron-added
  // transfer rows carry no headline_es/en → synthesize one (player: from → to).
  const [pool, setPool] = useState<HomeRumor[]>(rumors)
  useEffect(() => {
    let cancel = false
    fetch('/api/rumors?limit=18')
      .then(r => r.json())
      .then((j: { data?: Array<Record<string, unknown>> }) => {
        if (cancel || !Array.isArray(j.data) || !j.data.length) return
        const mapped = j.data.map((d): HomeRumor => {
          const hl = (en ? d.headline_en : d.headline_es) || d.headline_es || d.headline_en
          const synth = [d.player_name, [d.from_club, d.to_club].filter(Boolean).join(' → ')].filter(Boolean).join(': ')
          return {
            id: String(d.id),
            headline: String(hl || synth || ''),
            fromClub: (d.from_club as string) ?? null,
            toClub: (d.to_club as string) ?? null,
            likelihood: typeof d.likelihood === 'number' ? d.likelihood : null,
            playerName: (d.player_name as string) ?? null,
            playerSlug: (d.player_slug as string) ?? null,
            playerPhoto: (d.player_photo as string) ?? null,
          }
        }).filter(r => r.headline)
        if (mapped.length) setPool(mapped)
      })
      .catch(() => {})
    return () => { cancel = true }
  }, [en])
  // Window of 3, rotating every 6h (deterministic within a slot).
  const rotated: HomeRumor[] = pool.length <= 3
    ? pool.slice(0, 3)
    : Array.from({ length: 3 }, (_, i) => pool[(Math.floor(Date.now() / 21_600_000) * 3 + i) % pool.length])

  // Rumour thumbs: prefer the player headshot (licensed via our API — round
  // Avatar, tinted-initials fallback). No photo → club crest, else a CC0 generic.
  const rumorLeads: Lead[] = rotated.map(r => ({
    label: r.headline,
    sub: r.toClub ?? r.fromClub ?? undefined,
    photo: r.playerPhoto ?? undefined,
    crest: r.playerPhoto ? undefined
      : (r.toClub && clubLogo(r.toClub)) || (r.fromClub && clubLogo(r.fromClub)) || genericImageFor(r.headline).url,
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
          <NewsCarousel news={news} en={en} lang={lang} />
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
