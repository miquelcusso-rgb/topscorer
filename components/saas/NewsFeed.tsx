'use client'
import { useState, useEffect } from 'react'
import NewsPlaceholder from './NewsPlaceholder'

interface NewsItem { title: string; link: string; source: string; date: string; image?: string; isPriority?: boolean }

function dayBucket(iso: string, en: boolean): string {
  const d = new Date(iso), now = new Date()
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((day(now) - day(d)) / 86400000)
  if (diff <= 0) return en ? 'Today' : 'Hoy'
  if (diff === 1) return en ? 'Yesterday' : 'Ayer'
  return d.toLocaleDateString(en ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}
const fmtTime = (iso: string, en: boolean) => new Date(iso).toLocaleTimeString(en ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' })

// News thumbnail: shows the RSS image when present; otherwise (or on load error)
// falls back to a branded, ToS-safe placeholder instead of leaving a blank box.
function NewsImg({ src, w, h, radius = 6, fill, source }: { src?: string; w: number; h: number; radius?: number; fill?: boolean; source?: string }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) {
    return (
      <div style={{ width: fill ? '100%' : w, height: h, borderRadius: radius, flexShrink: 0, overflow: 'hidden' }}>
        <NewsPlaceholder source={source} compact={!fill && w < 120} rounded={radius} />
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" onError={() => setBroken(true)}
    style={{ width: fill ? '100%' : w, height: h, objectFit: 'cover', borderRadius: radius, flexShrink: 0, background: 'var(--ts-card2)' }} />
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

export default function NewsFeed({ scope = 'general', lang }: { scope?: 'general' | 'worldcup'; lang: 'es' | 'en' }) {
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

  // Hero = the freshest priority story (prefer one with an image), then the rest.
  const hero = items.find(it => it.isPriority && it.image) ?? items.find(it => it.image) ?? items[0]
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
        <NewsImg src={hero.image} w={0} h={260} radius={0} fill source={hero.source} />
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ts-primary)' }}>
            {hero.isPriority ? (en ? '★ Top story' : '★ Destacada') : (en ? 'Featured' : 'Destacada')}
          </span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 27, fontWeight: 700, lineHeight: 1.1, color: 'var(--ts-text)' }}>
            {hero.title}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ts-muted)' }}>{hero.source} · {fmtTime(hero.date, en)}</span>
        </div>
      </a>

      {groups.map(g => (
        <div key={g.label}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ts-primary)', marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
            {g.label}
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {g.items.map((it, i) => (
              <a key={i} href={it.link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', gap: 12, padding: 10, background: 'var(--ts-card)', border: '1px solid var(--ts-border)', borderRadius: 10, textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
                <NewsImg src={it.image} w={84} h={64} source={it.source} />
                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts-text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {it.isPriority && <span style={{ color: 'var(--ts-primary)' }}>★ </span>}{it.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ts-muted)' }}>{it.source} · {fmtTime(it.date, en)}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 10, color: 'var(--ts-faint)' }}>
        {en ? 'Headlines via public RSS — tap to read at the source.' : 'Titulares vía RSS público — pulsa para leer en la fuente.'}
      </p>
    </div>
  )
}
