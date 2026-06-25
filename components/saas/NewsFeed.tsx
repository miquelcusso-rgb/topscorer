'use client'
import { useState, useEffect } from 'react'
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
            {g.items.map((it, i) => (
              <NewsCard
                key={i}
                variant="full"
                title={it.title}
                href={it.link}
                external
                image={cardImage(it)}
                source={it.source}
                sourceUrl={it.link}
                meta={fmtTime(it.date, en)}
                lang={lang}
                eyebrow={it.isPriority ? (en ? '★ Featured' : '★ Destacada') : undefined}
                metaPrefix={<LangBadge itemLang={it.lang} siteLang={lang} />}
              />
            ))}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 10, color: 'var(--ts-faint)' }}>
        {en ? 'Headlines via public RSS — tap to read at the source. Photos: official API headshots or our own graphics (no agency images rehosted).' : 'Titulares vía RSS público — pulsa para leer en la fuente. Fotos: cabezas oficiales de la API o gráficos propios (no rehospedamos imágenes de agencia).'}
      </p>
    </div>
  )
}
