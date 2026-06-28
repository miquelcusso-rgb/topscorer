'use client'
import { useState, useEffect, useRef } from 'react'
import NewsPlaceholder from './NewsPlaceholder'
import LangBadge from './LangBadge'
import NewsCard, { type NewsCardImage } from '@/components/news/NewsCard'
import type { Lang } from '@/lib/i18n'

interface NewsVisual { url: string; license: 'agency' | 'crest'; source?: string }
interface NewsItem { title: string; link: string; source: string; date: string; lang: 'es' | 'en'; isPriority?: boolean; visual?: NewsVisual }

function dayBucket(iso: string, en: boolean): string {
  const d = new Date(iso), now = new Date()
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((day(now) - day(d)) / 86400000)
  if (diff <= 0) return en ? 'Today' : 'Hoy'
  if (diff === 1) return en ? 'Yesterday' : 'Ayer'
  return d.toLocaleDateString(en ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}
const fmtTime = (iso: string, en: boolean) => new Date(iso).toLocaleTimeString(en ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' })

// Build the license-aware image descriptor for a news item. The visual is a
// server-resolved player headshot or club crest — both licensed via our API
// (api-sports), so both map to `agency` (no public credit, source required).
// When nothing resolves we emit no URL → the card renders its branded initials
// placeholder. We NEVER rehost the feed photo and never show a generic scene.
function cardImage(it: NewsItem): NewsCardImage {
  const v = it.visual
  if (v?.url) {
    // Crests must show whole (contain + padding); headshots fill the box (cover).
    return { url: v.url, license: 'agency', source: it.source, sourceUrl: it.link, alt: '', fit: v.license === 'crest' ? 'contain' : 'cover' }
  }
  // Nothing resolved → no image (branded placeholder). Keep embed link-back
  // semantics so the card still carries the "Via {source}" credit.
  return { license: 'embed', source: it.source, sourceUrl: it.link, alt: '' }
}

// Hero image area — reuses the license-aware visual (headshot/CC0), never the
// raw RSS image. Falls back to the branded placeholder.
function HeroImg({ visual, source, h }: { visual?: NewsVisual; source?: string; h: number }) {
  const [broken, setBroken] = useState(false)
  if (!visual?.url || broken) {
    return (
      <div style={{ width: '100%', height: h, overflow: 'hidden' }}>
        <NewsPlaceholder source={source} />
      </div>
    )
  }
  // Crests must never be cropped → contain + padding on a neutral bg. Player
  // headshots ('agency') fill the box with cover.
  const isCrest = visual.license === 'crest'
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={visual.url} alt="" loading="lazy" onError={() => setBroken(true)}
    style={{ width: '100%', height: h, objectFit: isCrest ? 'contain' : 'cover',
      padding: isCrest ? 14 : 0, boxSizing: 'border-box', background: 'var(--ts-card2)' }} />
}

// Full-width breaking-news banner: rotates the top headlines with a LIVE badge.
function BreakingBanner({ items, en }: { items: NewsItem[]; en: boolean }) {
  const top = items.slice(0, 8)
  const [i, setI] = useState(0)
  useEffect(() => {
    if (top.length < 2) return
    const t = setInterval(() => setI(x => (x + 1) % top.length), 4500)
    return () => clearInterval(t)
  }, [top.length])
  if (!top.length) return null
  const cur = top[i]
  return (
    <a href={cur.link} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12,
        background: 'var(--ts-text)', color: 'var(--ts-bg)', textDecoration: 'none', overflow: 'hidden' }}>
      <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
        background: 'var(--ts-primary)', color: '#fff', padding: '3px 8px', borderRadius: 4 }}>
        {en ? 'Breaking' : 'Última hora'}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {cur.title}
      </span>
      <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
        <span className="ts-live-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ts-primary)', display: 'inline-block' }} />
        {en ? 'Live' : 'En directo'}
      </span>
    </a>
  )
}

// Mobile-only news slideshow (owner request): one HORIZONTAL card at a time —
// fixed-size photo on the left + headline/source on the right, all on one line —
// auto-advancing, swipeable, with dot indicators. Replaces the tall hero + the
// stacked grid (whose photo sizes alternated full/compact) on narrow screens, so
// every photo is the SAME size and the section stops eating vertical space.
// Desktop keeps the existing hero + grouped grid.
function MobileNewsCarousel({ items, lang, en }: { items: NewsItem[]; lang: Lang; en: boolean }) {
  const slides = items.slice(0, 8)
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const n = slides.length

  useEffect(() => {
    if (n < 2 || paused) return
    const t = setInterval(() => setIdx(i => (i + 1) % n), 5000)
    return () => clearInterval(t)
  }, [n, paused])

  if (!n) return null
  const go = (d: number) => setIdx(i => ((i + d) % n + n) % n)
  const it = slides[idx]
  const isCrest = it.visual?.license === 'crest'

  return (
    <div
      className="saas-newsfeed-mobile"
      style={{ position: 'relative', background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 12, overflow: 'hidden' }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; setPaused(true) }}
      onTouchEnd={e => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        touchX.current = null
        setPaused(false)
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderBottom: '1px solid var(--ts-border)' }}>
        <span aria-hidden style={{ fontSize: 14 }}>📰</span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
          {en ? 'News' : 'Noticias'}
        </span>
        {n > 1 && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ts-faint)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1}/{n}</span>}
      </div>

      <a href={it.link} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', gap: 12, padding: 10, alignItems: 'center', minHeight: 84, textDecoration: 'none', color: 'inherit' }}>
        {/* Fixed-size image box — identical for every slide. */}
        <div style={{ width: 108, height: 80, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--ts-card2)' }}>
          {it.visual?.url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={it.visual.url} alt="" loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: isCrest ? 'contain' : 'cover', padding: isCrest ? '12%' : 0, boxSizing: 'border-box', display: 'block' }} />
            : <NewsPlaceholder source={it.source} rounded={8} compact />}
        </div>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 4 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ts-text)', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {it.title}
          </span>
          <span style={{ fontSize: 11, color: 'var(--ts-muted)', display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
            <LangBadge itemLang={it.lang} siteLang={lang} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.source}</span>
            <span aria-hidden> · </span>
            <span style={{ whiteSpace: 'nowrap' }}>{fmtTime(it.date, en)}</span>
          </span>
        </span>
      </a>

      {n > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0 0 10px' }} aria-hidden>
          {slides.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} aria-label={`${i + 1}`}
              style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer',
                background: i === idx ? 'var(--ts-primary)' : 'var(--ts-border)', transition: 'width 150ms ease' }} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function NewsFeed({ scope = 'general', lang }: { scope?: 'general' | 'worldcup'; lang: Lang }) {
  const en = lang === 'en'
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancel = false
    fetch(`/api/news?lang=${lang}&scope=${scope}`)
      .then(r => r.json())
      .then(j => { if (!cancel && j.ok) setItems(j.items ?? []) })
      .catch(() => {})
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [lang, scope])

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--ts-faint)' }}>{en ? 'Loading news…' : 'Cargando noticias…'}</div>
  if (!items.length) return <div style={{ padding: '24px 0', fontSize: 13, color: 'var(--ts-muted)' }}>{en ? 'No news right now.' : 'Sin noticias ahora mismo.'}</div>

  // Hero = the freshest priority story, then the rest.
  const hero = items.find(it => it.isPriority) ?? items[0]
  const rest = items.filter(it => it !== hero)

  const groups: { label: string; items: NewsItem[] }[] = []
  for (const it of rest) {
    const label = dayBucket(it.date, en)
    let g = groups.find(x => x.label === label)
    if (!g) { g = { label, items: [] }; groups.push(g) }
    g.items.push(it)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BreakingBanner items={items} en={en} />

      {/* Mobile: one horizontal card at a time, uniform photo, auto-sliding. */}
      <MobileNewsCarousel items={items} lang={lang} en={en} />

      {/* Desktop: the rich hero + grouped grid (hidden on narrow screens). */}
      <div className="saas-newsfeed-desktop" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Hero story — ~2.5× a normal card */}
      <a href={hero.link} target="_blank" rel="noopener noreferrer" className="saas-news-hero"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) 1fr', gap: 0,
          background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 14, overflow: 'hidden', textDecoration: 'none', color: 'inherit', minHeight: 200 }}>
        <HeroImg visual={hero.visual} source={hero.source} h={260} />
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
            {hero.isPriority ? (en ? '★ Top story' : '★ Destacada') : (en ? 'Featured' : 'Destacada')}
          </span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 27, fontWeight: 700, lineHeight: 1.1, color: 'var(--ts-text)' }}>
            {hero.title}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ts-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <LangBadge itemLang={hero.lang} siteLang={lang} />{en ? 'Via' : 'Vía'} {hero.source} · {fmtTime(hero.date, en)}
          </span>
        </div>
      </a>

      {groups.map(g => (
        <div key={g.label}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {g.label}
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {g.items.map((it, i) => {
              const img = cardImage(it)
              // Two-tier sizing (owner request): a card that actually shows a
              // player headshot or club crest keeps the LARGE "premium" layout;
              // a card with no resolvable visual (→ branded placeholder) renders
              // COMPACT (small thumb + headline, text-forward) so it takes less
              // vertical space and never looks like a big empty image box.
              const hasVisual = !!img.url
              return (
                <NewsCard
                  key={i}
                  variant={hasVisual ? 'full' : 'compact'}
                  title={it.title}
                  href={it.link}
                  external
                  image={img}
                  source={it.source}
                  sourceUrl={it.link}
                  meta={fmtTime(it.date, en)}
                  lang={lang}
                  eyebrow={hasVisual && it.isPriority ? (en ? '★ Featured' : '★ Destacada') : undefined}
                  metaPrefix={<LangBadge itemLang={it.lang} siteLang={lang} />}
                />
              )
            })}
          </div>
        </div>
      ))}
      </div>
      <p style={{ fontSize: 10, color: 'var(--ts-faint)' }}>
        {en ? 'Headlines via public RSS — tap to read at the source. Photos: official API headshots or our own graphics (no agency images rehosted).' : 'Titulares vía RSS público — pulsa para leer en la fuente. Fotos: cabezas oficiales de la API o gráficos propios (no rehospedamos imágenes de agencia).'}
      </p>
    </div>
  )
}
